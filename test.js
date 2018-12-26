// const v1 = require('./Global/Function/transaction/v1');
// const axios = require('axios');
// var express = require('express');
// const {firestore} = require('./config/firebaseConfig');


// const Block_Dat = firestore.collection("Block_Dat")
// const FirestoreAccount = firestore.collection("Account")

// var last_block_height = 20000;
// var blockchainTransaction = new Array();
// var semaphore = 0;



// Block_Dat.doc("block").get().then( (snapshot) => { 
//     var data = snapshot.data()
//     last_block_height = data.last_block_height
//     currentBlock = data.currentBlock
//     blockchainTransaction = data.block
// })


// var accountLastBlock = 9999;
// var accountCurrentBlock= -1;
// FirestoreAccount.doc("AccountStatus").get().then( (snapshot) => { 
//     var data = snapshot.data()
//     accountLastBlock = data.last_block_height
//     accountCurrentBlock = data.currentBlock
    
//     console.log(accountLastBlock);
//     console.log(accountCurrentBlock);
    
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

// // function IntervalGetHeightBlock(){
//     setInterval( () => { 
//         var getLastHeightBlock = "https://komodo.forest.network/abci_info"
//         axios.get(getLastHeightBlock)
//         .then((response) => {
            
            
//             var new_last_height = parseInt(response.data.result.response.last_block_height);
//             if (new_last_height > last_block_height) {
//                 last_block_height = accountLastBlock =  new_last_height;
//             }
//         })
//         .catch(err => {
//             console.log("Last Block Error - " +err);
//         })
        
//     },2 * 1000)
// // }


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

// var accountForest = new Object();
// function PushAccountToFirebase (block) {
//     return new Promise((resolve, reject) => {     
//         if(block.header.num_txs === '0') {
//             reject("txs is NULL");
//         }
//         else {
//             blockchainTransaction.push(block);
//             var txs = block.txs;
//             txs.forEach( each => {
//                 var decode = v1.decode(Buffer.from(each, 'base64'));
//                 var account = decode.account
//                 var address = decode.params.address
                
//                 console.log(decode);
                
//                 if (!accountForest[account]) { 
//                     accountForest[account] = new Array();
//                 }
//                 else {
//                     accountForest[account].push(decode);
//                 }
    
//                 FirestoreAccount.doc(account).set({
//                     transaction: accountForest[account],
//                 })
//                 .then(() => {
//                     resolve("push Account to firebase SUCCESS");
//                 })
//                 .catch(err => {
//                     console.log("Firebase Error - " + err);
//                     reject("cannot push Account to firebase");
//                 })
                
//                 if (address) {      
//                     if (!accountForest[address]) { 
//                         accountForest[address] = new Array();
//                     }
//                     else {
//                         accountForest[address].push(decode);
//                     } 
//                     FirestoreAccount.doc(address).set({
//                         transaction: accountForest[address],
//                     })
//                     .then(() => {
//                         resolve("push Account to firebase SUCCESS");
//                     })
//                     .catch(err => {
//                         console.log("Firebase Error - " + err);
//                         reject("cannot push Account to firebase");
//                     })
//                     console.log(decode.params.address);
                    
//                 }
                
//             })
            
            
            
//         }
//     })
// }

// // function IntervalGetAllBlock() {
//     // setInterval(() => {
//     //     if ( currentBlock < last_block_height && semaphore === 0 && currentBlock > 0 ) {
//     //         semaphore++;
//     //         console.log("CurrentBlock: " + currentBlock+ "- Semaphore: "+ semaphore + "- Block lenght: "  + blockchainTransaction.length);
//     //         var getAllBlock = "https://komodo.forest.network/block?height=" +currentBlock;
//     //         axios.get(getAllBlock)
//     //         .then((response) => {    
//     //             var block = {
//     //                 header: response.data.result.block.header,
//     //                 txs: response.data.result.block.data.txs ? response.data.result.block.data.txs: '0',
//     //             }
//     //             PushAccountToFirebase(block)
//     //             .then((response) => {
//     //                 console.log(response)
//     //                 currentBlock++;
//     //                 UpdateLastBlockAndCurrent2Firebase(last_block_height,currentBlock);
//     //                 semaphore--;
//     //             })
//     //             .catch(err => {
//     //                 console.log(err)
//     //                 currentBlock++;
//     //                 UpdateLastBlockAndCurrent2Firebase(last_block_height,currentBlock);
//     //                 semaphore--;
//     //             })
//     //         })
//     //         .catch(err => {
//     //             console.log("Axios Error -" + err);
//     //         })
//     //     }
//     // },3 *1000)

//     setInterval(() => {
//         if ( accountCurrentBlock < accountLastBlock && semaphore === 0 && accountCurrentBlock > 0 ) {
//             semaphore++;
//             console.log("CurrentBlock: " + accountCurrentBlock+ "- Semaphore: "+ semaphore );
//             var getAllBlock = "https://komodo.forest.network/block?height=" +accountCurrentBlock;
//             axios.get(getAllBlock)
//             .then((response) => {    
//                 var block = {
//                     header: response.data.result.block.header,
//                     txs: response.data.result.block.data.txs ? response.data.result.block.data.txs: '0',
//                 }
//                 PushAccountToFirebase(block)
//                 .then((response) => {
//                     console.log(response)
//                     accountCurrentBlock++;
//                     // UpdateLastBlockAndCurrent2Firebase(last_block_height,currentBlock);
//                     semaphore--;
//                 })
//                 .catch(err => {
//                     console.log(err)
//                     accountCurrentBlock++;
//                     // UpdateLastBlockAndCurrent2Firebase(last_block_height,currentBlock);
//                     semaphore--;
//                 })
//             })
//             .catch(err => {
//                 console.log("Axios Error -" + err);
//             })
//         }
//     },3 *1000)
// // // }

// // module.exports.IntervalGetHeightBlock = IntervalGetHeightBlock;
// // module.exports.IntervalGetAllBlock = IntervalGetAllBlock;


// const {firestore} = require('./config/firebaseConfig');
// const FirestorePost= firestore.collection("Post")
// const moment = require('moment');
// var transaction = { 
//     version: 1,
//     account: 'GCXEQNLGRDKEPUPLCZRGXYKAUQSI4Y56OHJPM4N35ZYZGH4LXMVUK5SD',
//     operation: "post",
//     sequence: 69,
//     params: {
//         content: {
//             type:1,
//             text: "Chao ngay moi"
//         },
//         key: [],
//     },
//     header: { 
//         time: "2018-12-24T17:40:48.351479818Z",
//         data_hash: "82C0113305A966A293F7C130F9E3F475715F976A51FA3E81E789F454BBD84397",
//     },
// }

// // const PushPostToFirebase = () => { 
// //     var operation = transaction.operation
// //     if ( operation === "post" ){
            
// //             FirestorePost.doc().set({
// //                 post: transaction,
// //                 like: new Array(),
// //                 comment: new Array(),
// //             }).then(() => { 
// //                 console.log(123);
// //             })
// //             .catch(err => {
// //                 console.log(err);
                
// //             })
// //     }
    
// //  } 

// var time = transaction.header.time
// var date = new Date(time)
// date = date.getTime()
// var second = moment(date).fromNow()
// console.log(second);
  
function Payment () { 
            const tx = {
                version: 1, 
                operation: "payment",
                params: {
                    address: address,
                    amount: amount,
                },
                account: "GCXEQNLGRDKEPUPLCZRGXYKAUQSI4Y56OHJPM4N35ZYZGH4LXMVUK5SD",
                sequence: sequence,
                memo: Buffer.alloc(0),
            }
            transaction.sign(tx, private_key);
            const txEncode =  "0x" + transaction.encode(tx).toString('hex')
         
}

Payment()

//  PushPostToFirebase()