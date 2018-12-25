const express = require('express');
const router = express.Router();
const axios = require('axios');
const moment  = require('moment');
const vstruct = require('varstruct');
const base32 = require('base32.js')
const transaction = require('../lib/handleTransaction');
const Domain = require('../config/nodePublic');

const BANDWIDTH_PERIOD = 86400;
const MAX_BLOCK_SIZE = 22020096;
const RESERVE_RATIO = 1;
const MAX_CELLULOSE = Number.MAX_SAFE_INTEGER;
const NETWORK_BANDWIDTH = RESERVE_RATIO * MAX_BLOCK_SIZE * BANDWIDTH_PERIOD;

const Followings = vstruct([
    { name: 'addresses', type: vstruct.VarArray(vstruct.UInt16BE, vstruct.Buffer(35)) },
]);

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

function GetOnePage(public_key, page){
    return new Promise((resolve, reject) => { 
        var GetTransaction = Domain.dragonflyDomain + "tx_search?query=%22account=%27" + public_key + "%27%22&page=" + page + "&per_page=30";
        axios.get(GetTransaction)
        .then((response) => {
            resolve(response.data.result.txs);
        })
        .catch(error => {
            reject(error);
        });
    })
}

function LoadAllBlock(public_key) {
    return new Promise((resolve, reject) => { 
        var TransactionFromPublicNode = Domain.dragonflyDomain + "tx_search?query=%22account=%27" + public_key + "%27%22&page=1&per_page=30";
        axios.get(TransactionFromPublicNode)
        .then((response) => { 
            if(response.data.result.txs.length === 0) {
                reject("txs is null");
            }
            var page = Math.floor(response.data.result.total_count/30) + 1;
            var foo = [];
            for (var i = 2; i <= page; i++) {
                foo.push(i);
            }
            Promise.all(foo.map(each => GetOnePage(public_key, each)))
            .then((arrayOfResults) => {
                var results = response.data.result.txs;
                for (var i = 0; i < arrayOfResults.length; i++)
                    results = [...results, ...arrayOfResults[i]];
                resolve(results);
            }) 
        })
        .catch(error => {
            reject(error);
        });
    })
}

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
            var GetBlock = Domain.dragonflyDomain + "block?height=" + block.height;
            axios.get(GetBlock)
            .then(res => {
                block.time = res.data.result.block.header.time;
                block.time = moment(block.time).unix();
                count++;
                if(count >= data.length)
                    resolve(data);
            })
            .catch(err => {
                reject(err)
            })
        })
        
    })
}

function CalculateEnergy(txs, public_key) {
    return new Promise((resolve, reject) => {
        if (txs.length <= 0) {
            reject("txs null in calculate energy")
        }
        const now = moment(Date.now()).unix();
        SetAmountForBlock(txs, public_key);
        SetTimeForBlock(txs)
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
                bandwidth = Math.ceil(response[i].tx.length*3/4);          
                energyrecovery = Math.ceil(diff * bandwidthLimitprev / BANDWIDTH_PERIOD);
                response[i].energy = response[i-1].energy+energyrecovery<bandwidthLimit ? response[i-1].energy+energyrecovery : bandwidthLimit;
                if (response[i].account === public_key) {
                    response[i].energy -= bandwidth;
                }
                const tx = transaction.decodeTransaction(response[i].tx);
                if (tx.operation === "payment") {
                    response[i].energy = bandwidthLimit;
                }
                console.log(bandwidth + " " + diff + ' ' + energyrecovery + " " +  response[i].energy);
            } 
            energyrecovery = Math.ceil((now - response[response.length-1].time) * bandwidthLimit / BANDWIDTH_PERIOD);
            var energy = response[response.length-1].energy + energyrecovery<bandwidthLimit ? response[response.length-1].energy+energyrecovery : bandwidthLimit;
            response[response.length-1].energy = energy;
            console.log(energyrecovery + " " + energy);
            resolve(response);
        })
    })
}

router.post('/', function(req, res, next) {
    var amount = 0;
    var sequence = 0;
    var displayName = "Account";
    var picture = null;
    var followings;
    var TransactionFromPublicNode = Domain.dragonflyDomain + "tx_search?query=%22account=%27" + req.body.public_key + "%27%22&page=1&per_page=100";
    axios.get(TransactionFromPublicNode)
    .then((resp) => {
        var response = resp.data.result.txs;
        CalculateEnergy(response, req.body.public_key)
        .then((response) => {  
            const data = response.map((each) => {
                each.tx = transaction.decodeTransaction(each.tx);
                each.tx.memo = each.tx.memo.toString();
                each.tx.signature = each.tx.signature.toString('hex');
                return each;
            })
            amount = CalculateAmount(data, req.body.public_key);
            sequence = FindSequenceAvailable(data, req.body.public_key);
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
                    try{
                        var follow = Followings.decode(block.tx.params.value);
                        if(follow.addresses.length !== 0) {
                            followings = follow.addresses.map(address => base32.encode(address));
                        }
                        count--;
                        temp[2]--;
                      }
                    catch(err) {
                        console.log("loi tai following sai cau truc");
                    }
                }
                if(count === 0)
                    break;
            }         
            res.status(200).json({
                message: 'get account success',
                status: 200,
                displayName: displayName,
                followings: followings,
                amount: amount,
                energy: response[response.length-1].energy,
                sequence: sequence,
                picture: picture,
            });
        })
        .catch(error => {
            res.status(400).json({
                error: error,
                message: 'calculate error',
                status: 400,
            });
        });
    })
    .catch(error => {
        // console.log(error);
        res.status(400).json({
            error: error,
            message: 'calculate error',
            status: 400,
        });
    });
});

module.exports = router;
