const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const base32 = require('base32.js')
const request = require('request');
const vstruct = require('varstruct');


const handleTransaction = require('../lib/handleTransaction');
const blockchainKey = require('../config/blockchainKey');

router.post('/update_name', function(req, res, next) {
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx=";
    var updateNameParams = new Buffer.from(req.body.name);
    handleTransaction.encodeUpdateNameTransaction(blockchainKey.public_key, updateNameParams, blockchainKey.private_key)
    .then((response) => {
        axios.get(broadcastRequest+response).then((resp)=>{
            res.status(200).json({
                message: "update name success",
            })
        })
    })
    .catch((err) => {
        res.status(400).json({
            message: err
        })
    })

});

router.post('/update_picture', function(req, res, next) {
    var picture = fs.readFileSync('./routes/cap.jpg');
    var updateParams = new Buffer.from(picture);

    handleTransaction.encodeUpdatePictureTransaction(blockchainKey.public_key, updateParams, blockchainKey.private_key)
    .then((response) => {
        var headers = {
            'User-Agent': 'Super Agent/0.0.1',
            'Content-Type': 'application/json-rpc',
            'Accept': 'application/json-rpc'
        };
        var option = { 
            url: "https://komodo.forest.network/",
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'broadcast_tx_commit',
                params: [response],
                id: 1,
            })
        };
        request(option, (error, response) => {
            var body = JSON.parse(response.body);
            if(body.result.height != "0") {
                res.status(200).json({
                    message: "update piture success",
                })
            } else {
                console.log(error);
                res.status(200).json({
                    message: "update piture failed",
                })
            }
        });
    })
    .catch((err) => {
        res.status(400).json({
            message: err
        })
    })
});

const Followings = vstruct([
    { name: 'addresses', type: vstruct.VarArray(vstruct.UInt16BE, vstruct.Buffer(35)) },
]);

router.post('/update_followings', function(req, res, next) {
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx=";
    var f1 = "GBFNM2W3QNSPR4KGY4FNEF6YUF7STM5LF5VOARFCCQCSLPZMSEQTZ4MU";
    var f2 = "GCXEQNLGRDKEPUPLCZRGXYKAUQSI4Y56OHJPM4N35ZYZGH4LXMVUK5SD";
    var follwing= {
        addresses: [ base32.decode(f1), base32.decode(f2), ]
    }
    var updateParams = Buffer.from(Followings.encode(follwing));
    handleTransaction.encodeUpdateFollowingsTransaction(blockchainKey.public_key, updateParams, blockchainKey.private_key)
    .then((response) => {
        axios.get(broadcastRequest+response).then((resp)=>{
            console.log(resp.data.result);
            res.status(200).json({
                message: "update followings success",
            })
        })
    })
    .catch((err) => {
        res.status(400).json({
            message: err
        })
    })

});



module.exports = router;
