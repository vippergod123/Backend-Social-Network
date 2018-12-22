const express = require('express');
const router = express.Router();
const axios = require('axios');
const transaction = require('../lib/handleTransaction');
const moment  = require('moment');

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


function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
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
        const sequence = FindSequenceAvailable(data, req.body.public_key);
        var displayName = "Account";
        var picture = null;
        var followings;
        var count = 3;
        var temp = [1, 1, 1];
        for(const block of data) {
            if(block.tx.operation === "update_account" && block.tx.params.key === "name" && temp[0] === 1) {
                displayName = block.tx.params.value.toString();
                count--;
                temp[0]--;
            }
            if(block.tx.operation === "update_account" && block.tx.params.key === "picture" && temp[1] === 1) {
                picture = block.tx.params.value.toString('base64');
                count--;
                temp[1]--;
            }
            if(block.tx.operation === "update_account" && block.tx.params.key === "followings" && temp[2] === 1) {
                const value = block.tx.params.value.toString();
                // isJson(value) ? followings = JSON.parse(value) : followings = value;
                if(isJson(value)) {
                    followings = JSON.parse(value); 
                } else {
                    followings = value;
                }
                count--;
                temp[2]--;
            }
            if(count === 0)
                break;
        }

        res.status(200).json({
            message: 'calculate success',
            status: 200,
            displayName: displayName,
            followings: followings,
            amount: CalculateAmount(data, req.body.public_key),
            sequence: sequence,
            picture: picture,
            
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
            response[0].energy = 0;
            response[1].energy = Math.ceil(response[1].amount * NETWORK_BANDWIDTH / MAX_CELLULOSE);
            var diff = response[0].time;
            var bandwidthLimit = 0;
            var bandwidth = 0;
            var energyrecovery = 0;
            for(let i = 2; i < response.length; i++) {
                diff = response[i].time - response[i-1].time;
                bandwidthLimitprev = Math.ceil(response[i-1].amount * NETWORK_BANDWIDTH / MAX_CELLULOSE);
                bandwidthLimit = Math.ceil(response[i].amount * NETWORK_BANDWIDTH / MAX_CELLULOSE);
                bandwidth = Math.ceil((response[i].tx.length*3/4));          
                energyrecovery = Math.ceil(diff * bandwidthLimitprev / BANDWIDTH_PERIOD);
                response[i].energy = response[i-1].energy+energyrecovery<bandwidthLimit ? response[i-1].energy+energyrecovery : bandwidthLimit;
                if(response[i].account === req.body.public_key) {
                    response[i].energy -= bandwidth;
                }
                console.log(diff + ' ' + bandwidth + " " +  response[i].energy + " " + energyrecovery);
            } 
            energyrecovery = Math.ceil((now - response[response.length-1].time) * bandwidthLimit / BANDWIDTH_PERIOD);
            var energy = response[response.length-1].energy + energyrecovery<bandwidthLimit ? response[response.length-1].energy+energyrecovery : bandwidthLimit;
            console.log(energy);
            res.status(200).json({
                message: 'calculate energy success',
                status: 200,
                energy: energy,
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