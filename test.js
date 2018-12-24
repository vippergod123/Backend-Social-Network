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


const vstruct = require('varstruct');


const Followings = vstruct([
    { name: 'addresses', type: vstruct.VarArray(vstruct.UInt16BE, vstruct.Buffer(35)) },
]);


var followings = {
    addresses: [
        "GCXEQNLGRDKEPUPLCZRGXYKAUQSI4Y56OHJPM4N35ZYZGH4LXMVUK5SD",
        "GB2DOWKNWFB67473X5EBUEEIVSEWQ3PFMHMXEWIUAP3J2XYTBDGTTLTS",
    ] 
}
var tx = [
    0,
    2,
    48,
    47,
    85,
    225,
    52,
    195,
    71,
    232,
    40,
    199,
    87,
    10,
    102,
    115,
    151,
    86,
    233,
    255,
    169,
    56,
    239,
    43,
    58,
    37,
    168,
    116,
    112,
    9,
    58,
    142,
    61,
    157,
    237,
    195,
    240,
    48,
    73,
    223,
    131,
    193,
    134,
    201,
    52,
    152,
    145,
    46,
    74,
    46,
    155,
    192,
    128,
    4,
    40,
    166,
    240,
    87,
    131,
    27,
    39,
    93,
    224,
    13,
    19,
    137,
    173,
    208,
    27,
    120,
    32,
    75
]

const base32 = require("base32.js"); 
const address = vstruct([
    { name: "name", type: vstruct.Buffer(35) },
  ]);
        
  var data = Followings.decode(Buffer.from(tx))
  data.addresses.map( each => { 
    var decode = base32.encode(each)
    console.log(decode)   
  })
console.log(data);
