var express = require('express');
var router = express.Router();
const axios = require('axios');
const transaction = require('../lib/handleTransaction');

const blockchainKey = require('../config/blockchainKey');
const Domain = require('../config/nodePublic');

function calculateAmount(data, public_key) {
    let amount = 0;
    for(const block of data)
    {
        if (block.tx.operation === "payment")
        {
            if(block.tx.account === public_key)
                amount -= block.tx.params.amount;
            else 
                amount += block.tx.params.amount;
        }
    }
    return amount;
}

router.post('/calculate_amount', function(req, res, next) {
    var TransactionFromPublicNode = Domain.komodoDomain + "tx_search?query=%22account=%27" + req.body.public_key + "%27%22";
    axios.get(TransactionFromPublicNode)
    .then(response => {
        const data = response.data.result.txs.map((each) => {
            each.tx = transaction.decodeTransaction(each.tx);
            each.tx.memo = each.tx.memo.toString();
            each.tx.signature = each.tx.signature.toString('hex');
            return each;
        })
        res.status(200).json({
            message: 'calculate amount success',
            status: 200,
            amount: calculateAmount(data),
            data: data,
        });
    })
    .catch(error => {
        console.log(error);
    });
});

function findSequenceAvailable(data, public_key) {
    data.reverse();
    for(const block of data)
    {
        if(block.tx.account === public_key)
            return block.tx.sequence + 1;
    }
    return 1;
}

router.post('/sequence_available', function(req, res, next) {
    var TransactionFromPublicNode = Domain.komodoDomain + "tx_search?query=%22account=%27" + req.body.public_key + "%27%22";
    axios.get(TransactionFromPublicNode)
    .then(response => {
        const data = response.data.result.txs.map((each) => {
            each.tx = transaction.decodeTransaction(each.tx);
            each.tx.memo = each.tx.memo.toString();
            each.tx.signature = each.tx.signature.toString('hex');
            return each;
        })
        res.status(200).json({
            message: 'sequence success',
            status: 200,
            amount: findSequenceAvailable(data),
        });
    })
    .catch(error => {
        console.log(error);
    });
});

module.exports = router;