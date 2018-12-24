const v1 = require('../../Global/Function/transaction/v1');
const axios = require('axios');
var express = require('express');
var router = express.Router();
const {firestore} = require('../../config/firebaseConfig');
var iGetHeightBlock = require('./IntervalGetHeightBlock');

var currentBlock = -1;
var last_block_height = 9999;
var semaphore = 0;
var accountForest = new Object();
const FirestoreAccount = firestore.collection("Account")

const {publicDomain} = require('../../Global/Variable/PublicNodeDomain');

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
        
        if ( doc.id !== "AccountStatus") {
            var data = JSON.parse(doc.data().transaction)
            accountForest[doc.id] = data;
        }
        
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
                
                if (accountForest[account].length === 0)
                    accountForest[account] = new Array()

                decode["header"] = block.header;
                accountForest[account] = [...accountForest[account], decode]
    
                FirestoreAccount.doc(account).set({
                    transaction: JSON.stringify(accountForest[account]),
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

                    if (accountForest[address].length === 0)
                        accountForest[address] = new Array()

                    decode["header"] = block.header;
                        
                    accountForest[address] = [...accountForest[address], decode]
                    
                    FirestoreAccount.doc(address).set({
                        transaction: JSON.stringify(accountForest[address]),
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
            var getAllBlock = publicDomain  + "/block?height=" +currentBlock;
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
