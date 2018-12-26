// const v1 = require('../Global/Function/transaction/v1');
// const axios = require('axios');
// var express = require('express');
// var router = express.Router();
// const {firestore} = require('../config/firebaseConfig');

// const decodeTransaction = (data) => {  
//     var transaction = v1.decode(Buffer.from(data, 'base64'));
//     return transaction;
// }
// const Block_Dat = firestore.collection("Block_Dat")
// const FirebaseAccount = firestore.collection("Account")

// var last_block_height = 20000;
// var currentBlock = -1;
// var createAccountBlock = new Array();
// var paymentBlock = new Array();
// var postBlock = new Array();
// var updateBlock = new Array();
// var blockchainTransaction = new Array();
// var semaphore = 0;

// Block_Dat.doc("block").get().then( (snapshot) => { 
//     var data = snapshot.data()
//     last_block_height = data.last_block_height
//     currentBlock = data.currentBlock
//     blockchainTransaction = data.block
// })

// function UpdateLastBlockAndCurrent2Firebase( last_block_height, currentBlock) { 
//     Block_Dat.doc("block")
//     .update({
//         last_block_height: last_block_height,
//         currentBlock: currentBlock,
//     })
//     .then(() => { 
//         console.log("Update current and last block\n");
//     })
//     .catch((err) => {
//         console.log(err);
//     })
// }

// function IntervalGetHeightBlock(){
//     setInterval( () => { 
//         var getLastHeightBlock = "https://komodo.forest.network/abci_info"
//         axios.get(getLastHeightBlock)
//         .then((response) => {
//             var new_last_height = parseInt(response.data.result.response.last_block_height);
//             if (new_last_height > last_block_height) {
//                 last_block_height = new_last_height;
//             }
//         })
//         .catch(err => {
//             console.log("Last Block Error - " +err);
//         })
        
//     },2 * 1000)
// }

// function PushBlockToFirebase (block) {
//     return new Promise((resolve, reject) => {     
//         if(block.header.num_txs === '0') {
//             reject("txs is NULL");
//         }
//         else {
//             blockchainTransaction.push(block);
//             Block_Dat.doc("block").update({
//                 block: blockchainTransaction,
//             })
//             .then(() => {
//                 resolve("push to firebase SUCCESS");
//             })
//             .catch(err => {
//                 console.log("Firebase Error - " + err);
//                 reject("cannot push to firebase");
//             })
//         }
//     })
// }

// function PushAccountToFirebase (block) {
//     return new Promise((resolve, reject) => {     
//         if(block.header.num_txs === '0') {
//             reject("txs is NULL");
//         }
//         else {
//             blockchainTransaction.push(block);
//             FirebaseAccount.doc("block").update({
//                 block: blockchainTransaction,
//             })
//             .then(() => {
//                 resolve("push Account to firebase SUCCESS");
//             })
//             .catch(err => {
//                 console.log("Firebase Error - " + err);
//                 reject("cannot push Account to firebase");
//             })
//         }
//     })
// }

// function IntervalGetAllBlock() {
//     setInterval(() => {
//         if ( currentBlock < last_block_height && semaphore === 0 && currentBlock > 0 ) {
//             semaphore++;
//             console.log("CurrentBlock: " + currentBlock+ "- Semaphore: "+ semaphore + "- Block lenght: "  + blockchainTransaction.length);
//             var getAllBlock = "https://komodo.forest.network/block?height=" +currentBlock;
//             axios.get(getAllBlock)
//             .then((response) => {    
//                 var block = {
//                     header: response.data.result.block.header,
//                     txs: response.data.result.block.data.txs ? response.data.result.block.data.txs: '0',
//                 }
//                 PushBlockToFirebase(block)
//                 .then((response) => {
//                     console.log(response)
//                     currentBlock++;
//                     UpdateLastBlockAndCurrent2Firebase(last_block_height,currentBlock);
//                     semaphore--;
//                 })
//                 .catch(err => {
//                     console.log(err)
//                     currentBlock++;
//                     UpdateLastBlockAndCurrent2Firebase(last_block_height,currentBlock);
//                     semaphore--;
//                 })
//             })
//             .catch(err => {
//                 console.log("Axios Error -" + err);
//             })
//         }
//     },3 *1000)
// }

// module.exports.IntervalGetHeightBlock = IntervalGetHeightBlock;
// module.exports.IntervalGetAllBlock = IntervalGetAllBlock;
