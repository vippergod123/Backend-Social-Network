const v1 = require('./function/transaction/v1');
const axios = require('axios');
var express = require('express');
var router = express.Router();
const {firestore} = require('./config/firebaseConfig');


const decodeTransaction = (data) => {  
    var transaction = v1.decode(Buffer.from(data, 'base64'));
    return transaction;
}
var old_last_height = 20000;
var numberBlocks = 1;
var newBlock =[];

function IntervalGetHeightBlock(){
    setInterval( () => { 
        var getLastHeightBlock = "https://komodo.forest.network/abci_info"
        axios.get(getLastHeightBlock)
        .then((response) => {
            var new_last_height = response.data.result.response.last_block_height;
            if (new_last_height > old_last_height) {
                old_last_height = new_last_height;
                console.log(old_last_height);
                
            }
        })
        .catch(err => {
            console.log("Last Block Error - " +err);
        })
        
    },2 * 1000)
}

function PushBlockToFirebase (block) {
    return new Promise((resolve, reject) => {     
        if(block.num_txs === '0') {
            reject("txs is null");
        }
        else {
            block.txs.forEach(each => {
                var transaction = v1.decode(Buffer.from(each, 'base64'));
                console.log(transaction);
                const sampleData = firestore.collection("Block_Dat")
                sampleData.doc(transaction.operation).set({
                    block: block,
                })
                .then(() => {
                    resolve("push to firebase success");
                })
                .catch(err => {
                    console.log("Firebase Error - " + err);
                    reject("cannot push to firebase");
                })
            });
        }
    })
}

function IntervalGetAllBlock() {
    setInterval(()=> {
        if ( numberBlocks < old_last_height) {
            console.log(numberBlocks);
            var getAllBlock = "https://komodo.forest.network/block?height=" +numberBlocks;
            axios.get(getAllBlock)
            .then((response) => {    
                var block = {
                    chain_id: response.data.result.block.header.chain_id,
                    height:response.data.result.block.header.height,
                    time: response.data.result.block.header.time,
                    num_txs: response.data.result.block.header.num_txs,
                    total_txs: response.data.result.block.header.total_txs,
                    txs: response.data.result.block.data.txs ? response.data.result.block.data.txs: '0',
                }
                PushBlockToFirebase(block)
                .then((response) => {
                    console.log(response)
                    numberBlocks++;
                })
                .catch(err => {
                    console.log(err)
                    numberBlocks++;
                })
            })
            .catch(err => {
                console.log("Axios Error -" + err);
            })
        }
    },2 *1000)
}

module.exports.IntervalGetHeightBlock = IntervalGetHeightBlock;
// module.exports.IntervalGetAllBlock = IntervalGetAllBlock;

