const transaction = require('../function/transaction');
const v1 = require('../function/transaction/v1');

const encodeTransaction = (operationType) => { 
        
    const tx = {
        version: 1, 
        operation: operationType,
        params: {
            address: public_key_Dat,
            amount: 100
        },
        account: public_key_Duy,
        sequence: 1,
        memo: Buffer.alloc(0),
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

module.exports.encodeTransaction = encodeTransaction
module.exports.decodeTransaction = decodeTransaction