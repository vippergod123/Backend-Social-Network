const transaction = require('../function/transaction');
const v1 = require('../function/transaction/v1');

const encodePaymentTransaction = (account, address, amount, sequence) => {   
    const tx = {
        version: 1, 
        account: account,
        sequence: sequence,
        memo: Buffer.alloc(0),
        operation: 'payment',
        params: {
            address: address,
            amount: amount
        },
    }
    transaction.sign(tx, private_key);

    const txEncode = transaction.encode(tx).toString('hex')
    console.log("0x"+txEncode);
    return txEncode;
}

const decodeTransaction = (data) => {  
    var transaction = v1.decode(Buffer.from(data, 'base64'));
    return transaction;
}

module.exports.encodePaymentTransaction = encodePaymentTransaction
module.exports.decodeTransaction = decodeTransaction