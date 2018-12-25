const v1 = require('../../function/transaction/v1');
const axios = require('axios');
var express = require('express');
const {firestore} = require('../../config/firebaseConfig');
var iGetHeightBlock = require('./IntervalGetHeightBlock');
const vstruct = require('varstruct');
const base32 = require('base32.js')

const PlainTextContent = vstruct([
    { name: 'type', type: vstruct.UInt8 },
    { name: 'text', type: vstruct.VarString(vstruct.UInt16BE) },
  ]);

var currentBlock = -1;
var lastBlock = 20000;
var semaphore = 0;
var accountForest = new Object();
const FirestorePost = firestore.collection("Block_Post")

setInterval( () => { 
    iGetHeightBlock(lastBlock)
    .then((response) => {
        lastBlock = parseInt(response);
    })
    .catch(err => {
        console.log(err)
    })
},2 * 1000)

FirestorePost.doc("BlockStatus").get().then( (snapshot) => { 
    var data = snapshot.data()
    currentBlock = data.currentBlock
})

function UpdateLastBlockAndCurrent2Firebase( lastBlock, currentBlock) { 
    FirestorePost.doc("BlockStatus")
    .update({
        lastBlock: lastBlock,
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
                var tx = v1.decode(Buffer.from(each, 'base64'));
                var account = tx.account
                if(tx.operation !== 'post') {
                    reject("khong phai block post: " + tx.operation);
                } else {
                    try{
                        var content = PlainTextContent.decode(tx.params.content);
                        tx.params.content = content;
                    }
                    catch(err) {
                        reject("loi tai post sai cau truc");
                    }
                    if (!accountForest[account]) { 
                        accountForest[account] = new Array();
                    }
                    else if (accountForest[account].transaction) {
                        if (accountForest[account].transaction.length === 0) 
                            accountForest[account] = new Array();
                        else
                            accountForest[account] = accountForest[account].transaction
                    }
                    
                    if (accountForest[account].length === 0)
                        accountForest[account] = new Array()
    
                    tx["header"] = JSON.stringify(block.header);
                    accountForest[account].push(tx);                
                    FirestorePost.doc(account).set({
                        transaction: accountForest[account],
                    })
                    .then(() => {
                        resolve("push Account to firebase success");
                    })
                    .catch(err => {
                        console.log("Firebase Error in Account - " + err);
                        reject("cannot push Account to firebase");
                    })
                }
            })
        }
    })
}


function IntervalGetBlockPost () { 
    setInterval(() => {
        if ( currentBlock < lastBlock && semaphore === 0 && currentBlock > 0 ) {
            semaphore++;
            console.log("CurrentBlock: " + currentBlock+ " - Semaphore: " + semaphore );
            var getBlock = "https://komodo.forest.network/block?height=" +currentBlock;
            axios.get(getBlock)
            .then((response) => {    
                var block = {
                    header: response.data.result.block.header,
                    txs: response.data.result.block.data.txs ? response.data.result.block.data.txs: '0',
                }
                PushAccountToFirebase(block)
                .then((response) => {
                    console.log(response)
                    currentBlock++;
                    UpdateLastBlockAndCurrent2Firebase(lastBlock, currentBlock);
                    semaphore--;
                })
                .catch(err => {
                    console.log(err)
                    currentBlock++;
                    UpdateLastBlockAndCurrent2Firebase(lastBlock, currentBlock);
                    semaphore--;
                })
            })
            .catch(err => {
                console.log("Axios Error -" + err);
            })
        }
    },3 *1000)
}

module.exports = IntervalGetBlockPost
