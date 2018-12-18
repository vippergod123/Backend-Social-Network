// const { Keypair } = require('stellar-base');

// var pubKey = "GCXEQNLGRDKEPUPLCZRGXYKAUQSI4Y56OHJPM4N35ZYZGH4LXMVUK5SD"
// var priKey = "SBPFHJYPXKTN57UFHXM72UGOFREECEM2TAKFVSZDFBTKMQ5VFDYKWH5W"

// var key1 = Keypair.fromSecret(priKey)
// var key2 = Keypair.fromPublicKey(pubKey)

// var publicKey = key1.publicKey()


// console.log(publicKey);
// console.log(pubKey);

const transaction = require('./function/transaction');
const v1 = require('./function/transaction/v1');
const axios = require('axios');

const {firestore} = require('./config/firebaseConfig');


const decodeTransaction = (data) => {  
    var transaction = v1.decode(Buffer.from(data, 'base64'));
    return transaction;
}
var old_last_height = 20000;
var numberBlocks = 1;

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

var createAccountBlock = new Array();
var paymentBlock = new Array();
var postBlock = new Array();
var updateBlock = new Array();

function PushBlockToFirebase (block) {
    return new Promise((resolve, reject) => {     
        if(block.header.num_txs === '0') {
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

var semaphore = 0;

function IntervalGetAllBlock() {
    setInterval(() => {
        if ( numberBlocks < old_last_height && semaphore === 0) {
            semaphore++;
            console.log(numberBlocks+ " "+ semaphore);
            var getAllBlock = "https://komodo.forest.network/block?height=" +numberBlocks;
            axios.get(getAllBlock)
            .then((response) => {    
                var block = {
                    header: response.data.result.block.header,
                    txs: response.data.result.block.data.txs ? response.data.result.block.data.txs: '0',
                }
                PushBlockToFirebase(block)
                .then((response) => {
                    console.log(response)
                    numberBlocks++;
                    semaphore--;
                })
                .catch(err => {
                    console.log(err)
                    numberBlocks++;
                    semaphore--;
                })
            })
            .catch(err => {
                console.log("Axios Error -" + err);
            })
        }
    },2 *1000)
}

module.exports.IntervalGetHeightBlock = IntervalGetHeightBlock;
module.exports.IntervalGetAllBlock = IntervalGetAllBlock;
