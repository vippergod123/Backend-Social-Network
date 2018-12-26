const v1 = require('../../Global/Function/transaction/v1');
const axios = require('axios');
var express = require('express');
var router = express.Router();
const {firestore} = require('../../config/firebaseConfig');
var iGetHeightBlock = require('./IntervalGetHeightBlock');
const vstruct = require('varstruct');
var currentBlock = 20000;
var last_block_height = 30000;
var semaphore = 0;
var accountForest = new Object();
const FirestoreAccount = firestore.collection("Account")
const FirestorePost= firestore.collection("Post")

const {publicDomain} = require('../../Global/Variable/PublicNodeDomain');

const PlainTextContent = vstruct([
    { name: 'type', type: vstruct.UInt8 },
    { name: 'text', type: vstruct.VarString(vstruct.UInt16BE) },
]);
  const ReactContent = vstruct([
    { name: 'type', type: vstruct.UInt8 },
    { name: 'reaction', type: vstruct.UInt8 },
]);

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
        console.log("Update current and last account\n");
    })
    .catch((err) => {
        console.log(err);
    })
}
function PushPostToFirebase (transaction) { 
    var operation = transaction.operation
    return new Promise((resolve,reject) => {
        if ( operation === "post" ) {
            transaction.params.content = PlainTextContent.decode(transaction.params.content);
            var time = transaction.header.time
            var date = new Date(time)
            date = date.getTime()

            FirestorePost.doc(transaction.header.data_hash).set({
                post: JSON.stringify(transaction),
                like: new Array(),
                comments: new Array(),
                createTime: parseInt(date),
            }).then(() => { 
                resolve("Push to Post to Firebase success");
            })
            .catch(err => {
                reject("Cannot push  Post" + err)
            })
        } else if ( operation === "interact") { 
            try{
                const type = vstruct([
                  { name: 'type', type: vstruct.UInt8 },
                ])
                
                var content = type.decode(transaction.params.content).type === 1
                 ? PlainTextContent.decode(transaction.params.content) : ReactContent.decode(transaction.params.content);
                transaction.params.content = content;
                
                FirestorePost.doc(transaction.params.object).get()
                .then( snapshot=> {
                    var data = snapshot.data()
                    var interact = transaction.params.content.type;
                    switch (interact) {
                        case 1:
                            var historyComments = data.comments ?  data.comments : []
                            var newComment = { 
                                publicKey: transaction.account,
                                text: transaction.params.content.text
                            }
                            console.log(newComment);
                            FirestorePost.doc(transaction.params.object).update ({
                                comments: [...historyComments, JSON.stringify(newComment)],
                            }).then(() => {
                                resolve("Push comment success")
                            }).catch(err => {
                                reject(err)
                            })
                            break;
                        case 2:                        
                            var historyLike = data.like ?  data.like : []
                            var newLike = { 
                                publicKey: transaction.account,
                                reaction: transaction.params.content.reaction
                            }
                            var kt = false;
                            var newArrayLike = new Array()
                            if(historyLike.length > 0) {
                                newArrayLike = historyLike.map(each => {
                                    var like = JSON.parse(each)
                                    if(newLike.publicKey === like.publicKey && kt === false) {
                                        like.reaction = newLike.reaction
                                        kt = true;
                                        each = JSON.stringify(like);
                                    }
                                    return each
                                });
                            }
                            console.log(newLike);
                            FirestorePost.doc(transaction.params.object).update ({
                                like: kt ? [...newArrayLike] : [...newArrayLike, JSON.stringify(newLike)],
                            }).then(() => {
                                resolve("Push like success")
                            }).catch(err => {
                                reject(err)
                            })
                            break;
                        default: reject("khong tim duoc loai interact")
                    }
                })
                .catch (err => {
                    reject(err)
                })
            }
            catch(err) {
                console.log("loi tai interact sai cau truc");
                reject("loi tai interact sai cau truc")
            }
        }
        else {
            reject("Not operation Post")
        }
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
                    if(decode.operation === "interact" || decode.operation === "post") {
                        PushPostToFirebase(decode).then( response => { 
                            console.log(response);
                            resolve("push post or interact to firebase success");
                        }).catch( err=> { 
                            resolve("Post error - " + err);
                        }) 
                    } else {
                        resolve("push block to firebase success");
                    }     
                })
                .catch(err => {
                    console.log("Firebase Error in Account - " + err);
                    reject("cannot push block to firebase");
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
                        resolve("Push block to firebase success");
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
