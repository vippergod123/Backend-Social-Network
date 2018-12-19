const v1 = require('../../function/transaction/v1');
const axios = require('axios');
var express = require('express');
var router = express.Router();
const {firestore} = require('../../config/firebaseConfig');
var iGetHeightBlock = require('./IntervalGetHeightBlock');


var currentBlock = -1;
var last_block_height = 9999;
var blockchainTransaction = new Array();
var semaphore = 0;
var accountForest = new Object();
const FirestoreAccount = firestore.collection("Account")


setInterval( () => { 
    iGetHeightBlock(last_block_height)
    .then((response) => {
         last_block_height = parseInt(response);
    })
    .catch(err => {
        console.log(err)
    })
},2 * 1000)



FirestoreAccount.doc("AccountStatus").get().then( (snapshot) => { 
    var data = snapshot.data()
    currentBlock = data.currentBlock
})

FirestoreAccount.get().then((snapshot) => { 
    snapshot.forEach(doc => {
        accountForest[doc.id] = doc.data();     
    });
})



function UpdateLastBlockAndCurrent2Firebase( last_block_height, currentBlock) { 
    FirestoreAccount.doc("AccountStatus")
    .update({
        last_block_height: last_block_height,
        currentBlock: currentBlock,
    })
    .then(() => { 
        console.log("Update current and last ACCOUNT\n");
    })
    .catch((err) => {
        console.log(err);
    })
}



function PushAccountToFirebase (block) {
    return new Promise((resolve, reject) => {     
        if(block.header.num_txs === '0') {
            reject("txs is NULL");
        }
        else {
            var txs = block.txs;
            
            
            txs.forEach( each => {
                var decode = v1.decode(Buffer.from(each, 'base64'));
                var account = decode.account
                var address = decode.params.address
                
                if (!accountForest[account]) { 
                    accountForest[account] = new Array();
                }
                else {
                    if (accountForest[account].transaction) {
                        accountForest[account] = accountForest[account].transaction
                    }

                }

                decode.header = block.header
                accountForest[address].push(decode);
    
                FirestoreAccount.doc(account).set({
                    header: block.header,
                    transaction: accountForest[account],
                })
                .then(() => {
                    resolve("push Account to firebase SUCCESS");
                })
                .catch(err => {
                    console.log("Firebase Error in Account - " + err);
                    reject("cannot push Account to firebase");
                })
                
                if (address) {      
                    if (!accountForest[address]) { 
                        accountForest[address] = new Array();
                    }
                    else if (accountForest[address].transaction) {
                        if (accountForest[address].transaction.length === 0) 
                            accountForest[address] = new Array();
                        else
                            accountForest[address] = accountForest[address].transaction
                    }
                    
                    if (accountForest[address].length === 0)
                        accountForest[address] = new Array()
                    
                    decode.header = block.header
                    accountForest[address].push(decode);
                    
                    FirestoreAccount.doc(address).set({
                        
                        transaction: accountForest[address],
                    })
                    .then(() => {
                        resolve("Push Account to firebase SUCCESS");
                    })
                    .catch(err => {
                        console.log("Firebase Error - " + err);
                        reject("cannot push Account to firebase");
                    })   
                }
            })
            
            
            
        }
    })
}


function IntervalGetAccount () { 
    setInterval(() => {
        if ( currentBlock < last_block_height && semaphore === 0 && currentBlock > 0 ) {
            semaphore++;
            console.log("CurrentBlock: " + currentBlock+ "- Semaphore: "+ semaphore );
            var getAllBlock = "https://komodo.forest.network/block?height=" +currentBlock;
            axios.get(getAllBlock)
            .then((response) => {    
                var block = {
                    header: response.data.result.block.header,
                    txs: response.data.result.block.data.txs ? response.data.result.block.data.txs: '0',
                }
                PushAccountToFirebase(block)
                .then((response) => {
                    console.log(response)
                    currentBlock++;
                    UpdateLastBlockAndCurrent2Firebase(last_block_height,currentBlock);
                    semaphore--;
                })
                .catch(err => {
                    console.log(err)
                    currentBlock++;
                    UpdateLastBlockAndCurrent2Firebase(last_block_height,currentBlock);
                    semaphore--;
                })
            })
            .catch(err => {
                console.log("Axios Error -" + err);
            })
        }
    },3 *1000)
}

module.exports = IntervalGetAccount