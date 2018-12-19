const express = require('express');
const router = express.Router();
const axios = require('axios');
const transaction = require('../lib/handleTransaction');
const moment  = require('moment');

const blockchainKey = require('../config/blockchainKey');
const Domain = require('../config/nodePublic');

function CalculateAmount(data, public_key) {
    let amount = 0;
    for(const block of data) {
        if (block.tx.operation === "payment") {
            if (block.tx.account === public_key)
                amount -= block.tx.params.amount;
            else 
                amount += block.tx.params.amount;
        }
    }
    return amount;
}
function FindSequenceAvailable(data, public_key) {
    data.reverse();
    for(const block of data) {
        if(block.tx.account === public_key)
            return block.tx.sequence + 1;
    }
    return 1;
}

router.post('/', function(req, res, next) {
    var TransactionFromPublicNode = Domain.komodoDomain + "tx_search?query=%22account=%27" + req.body.public_key + "%27%22";
    axios.get(TransactionFromPublicNode)
    .then((response) => {
        const data = response.data.result.txs.map((each) => {
            each.tx = transaction.decodeTransaction(each.tx);
            each.tx.memo = each.tx.memo.toString();
            each.tx.signature = each.tx.signature.toString('hex');
            return each;
        })
        res.status(200).json({
            message: 'calculate success',
            status: 200,
            amount: CalculateAmount(data, req.body.public_key),
            sequence: FindSequenceAvailable(data, req.body.public_key),
            data: data,
        });
    })
    .catch(error => {
        console.log(error);
        res.status(201).json({
            message: 'calculate error',
            status: 201,
        });
    });
});

const BANDWIDTH_PERIOD = 86400;
const MAX_BLOCK_SIZE = 22020096;
const RESERVE_RATIO = 1;
const MAX_CELLULOSE = Number.MAX_SAFE_INTEGER;
const NETWORK_BANDWIDTH = RESERVE_RATIO * MAX_BLOCK_SIZE * BANDWIDTH_PERIOD;
// const bandwidthLimit = account.balance / MAX_CELLULOSE * NETWORK_BANDWIDTH;

function SetAmountForBlock(data, public_key) {
    let amount = 0;
    data.forEach((block) => {
        const tx = transaction.decodeTransaction(block.tx);
        if (tx.operation === "payment") {
            if (tx.account === public_key) {
                amount -= tx.params.amount;
                block.amount = amount;
                block.account = public_key;
            }
            else  {
                amount += tx.params.amount;
                block.amount = amount;
                block.account = '0';
            }
        } else {
            if (tx.account === public_key) {
                block.amount = amount;
                block.account = public_key;
            }
            else {
                block.amount = amount;
                block.account = '0';
            }
        }
    })
}
function SetTimeForBlock(data) {
    var count = 0;
    return new Promise((resolve, reject) => {
        data.forEach((block) => {
            var GetBlock = Domain.komodoDomain + "block?height=" + block.height;
            axios.get(GetBlock)
            .then(res => {
                block.time = res.data.result.block.header.time;
                block.time = moment(block.time).unix();
                count++;
                if(count >= data.length)
                    resolve(data);
            })
        })
        
    })
}

router.post('/calculate_energy', function(req, res, next) {
    var TransactionFromPublicNode = Domain.komodoDomain + "tx_search?query=%22account=%27" + req.body.public_key + "%27%22";
    axios.get(TransactionFromPublicNode)
    .then((response) => {
        const now = moment(Date.now()).unix();
        const data = response.data.result.txs;
        SetAmountForBlock(data, req.body.public_key);
        SetTimeForBlock(data)
        .then((response)=>{
            var energy = 0;
            var diff = response[0].time;
            var bandwidthLimit = 0;
            var bandwidth = 0;
            for(let i = 0; i<response.length; i++) {
                if(response[i].account === req.body.public_key) {
                    diff = response[i].time - response[i-1].time;
                    bandwidthLimit = response[i].amount * NETWORK_BANDWIDTH / MAX_CELLULOSE;
                    bandwidth = Math.ceil(Math.max(0, (BANDWIDTH_PERIOD - diff) / BANDWIDTH_PERIOD) * response.amount + response[i].tx.length);
                    energy = bandwidthLimit - bandwidth;
                    energy += bandwidthLimit / BANDWIDTH_PERIOD;
                    response[i].energy = energy;
                }
            } 
            
            console.log(bandwidthLimit);
            res.status(200).json({
                message: 'calculate energy success',
                status: 200,
                data: response,
            })
        })
    })
    .catch(error => {
        console.log(error);
        res.status(201).json({
            message: 'calculate energy error',
            status: 201,
        });
    });
});

module.exports = router;