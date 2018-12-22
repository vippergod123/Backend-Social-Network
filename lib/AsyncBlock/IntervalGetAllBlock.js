const axios = require('axios');
var express = require('express');
var router = express.Router();
const {firestore} = require('../../config/firebaseConfig');
var iGetHeightBlock = require('./IntervalGetHeightBlock');


var currentBlock = -1;
var last_block_height = 9999;
var blockchainTransaction = new Array();
var semaphore = 0;

const FirestoreBlock = firestore.collection("Block")


setInterval( () => { 
    iGetHeightBlock(last_block_height)
    .then((response) => {
         last_block_height = parseInt(response);
    })
    .catch(err => {
        console.log(err)
    })
},2 * 1000)



FirestoreBlock.doc("block").get().then( (snapshot) => { 
    var data = snapshot.data()
    last_block_height = data.last_block_height
    currentBlock = data.currentBlock
    blockchainTransaction = data.block
})



function UpdateLastBlockAndCurrent2Firebase( last_block_height, currentBlock) { 
    FirestoreBlock.doc("block")
    .update({
        last_block_height: last_block_height,
        currentBlock: currentBlock,
    })
    .then(() => { 
        console.log("Update current and last BLOCK \n");
    })
    .catch((err) => {
        console.log(err);
    })
}


function PushBlockToFirebase (block) {
    return new Promise((resolve, reject) => {     
        if(block.header.num_txs === '0') {
            reject("txs is NULL");
        }
        else {
            blockchainTransaction.push(block);
            FirestoreBlock.doc("block").update({
                block: blockchainTransaction,
            })
            .then(() => {
                resolve("Push Block to firebase SUCCESS");
            })
            .catch(err => {
                console.log("Firebase Error in Block - " + err);
                reject("cannot push Block to firebase");
            })
        }
    })
}



function IntervalGetAllBlock() {
    setInterval(() => {
        if ( currentBlock < last_block_height && semaphore === 0 && currentBlock > 0 ) {
            semaphore++;
            console.log("CurrentBlock: " + currentBlock+ "- Semaphore: "+ semaphore + "- Block lenght: "  + blockchainTransaction.length);
            var getAllBlock = "https://komodo.forest.network/block?height=" +currentBlock;
            axios.get(getAllBlock)
            .then((response) => {    
                var block = {
                    header: response.data.result.block.header,
                    txs: response.data.result.block.data.txs ? response.data.result.block.data.txs: '0',
                }
                PushBlockToFirebase(block)
                .then((response) => {
                    console.log(response);
                    
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

module.exports = IntervalGetAllBlock