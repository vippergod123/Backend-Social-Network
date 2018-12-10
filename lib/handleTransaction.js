const transaction = require('../function/transaction');
const v1 = require('../function/transaction/v1');
const axios = require('axios');


const encodePaymentTransaction = (account, address, amount) => { 

    var req = "https://komodo.forest.network/tx_search?query=%22account=%27"+account+"%27%22"
    axios.get(req)
    .then(response => {
        var length = response.data.result.txs.length;
        const tx = {
            version: 1, 
            operation: "payment",
            params: {
                address: address,
                amount: amount
            },
            account: account,
            sequence:  length-1,
            memo: Buffer.alloc(0),
        }
        transaction.sign(tx, private_key);

        const txEncode =  "0x" + transaction.encode(tx).toString('hex')
        
        return txEncode;
    })
    .catch(error => {
        console.log(error);
    });
}


const encodeCreateAccountTransaction = (account, address) => { 

    var req = "https://komodo.forest.network/tx_search?query=%22account=%27"+account+"%27%22"
    axios.get(req)
    .then(response => {
        var length = response.data.result.txs.length;
        const tx = {
            version: 1, 
            operation: "create_account",
            params: {
                address: address,
            },
            account: account,
            sequence: length - 1,
            memo: Buffer.alloc(0),
        }
        transaction.sign(tx, private_key);
    
        const txEncode = "0x" + transaction.encode(tx).toString('hex')
        
        return txEncode;
    })
    .catch(error => {
        console.log(error);
    });
        
    
}



const decodeTransaction = (data) => {  
    var transaction = v1.decode(Buffer.from(data, 'base64'));

    return transaction;
}

module.exports.encodePaymentTransaction = encodePaymentTransaction
module.exports.encodeCreateAccountTransaction = encodeCreateAccountTransaction


module.exports.decodeTransaction = decodeTransaction