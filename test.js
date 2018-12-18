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
var old_last_height = 400;
var numberBlocks = 1;


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


setInterval(()=> {
    if ( numberBlocks < old_last_height) {
        console.log(numberBlocks);
        var getAllBlock = "https://komodo.forest.network/block?height=" +numberBlocks;
        axios.get(getAllBlock)
        .then((response) => {

            var txs = response.data.result.block.data.txs;
            if (txs) {
                txs.forEach(each => {
                    
                    var transaction = v1.decode(Buffer.from(each, 'base64'));
                    
                    console.log(transaction);
                
                    const sampleData = firestore.collection("Block")
                    sampleData.doc(transaction.operation).collection(transaction.account).doc().set({
                        transaction: transaction,
                    })
                    .then(() => {
                        numberBlocks++; 
                        console.log(123);
                    })
                    .catch(err => {
                        console.log("Firebase Error - " + err);
                    })
                    
                });   
            
            } else {
                numberBlocks++; 
            }
        })
        .catch(err => {
            console.log("Axios Error -" + err);
        })
    }
},2 *1000)


//  const sampleData = firestore.collection("Block")
// sampleData.doc("sample").collection("account").doc().set({
//     transaction: "Transaction"
// })
// .then(() => {
    
//     console.log(123);
// })

