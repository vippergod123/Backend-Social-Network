const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
var request = require('request');
const handleTransaction = require('../lib/handleTransaction');
const blockchainKey = require('../config/blockchainKey');

//Middelware
const {isLoggedin} = require('../Global/Function/middleware');


router.post('/update_name', isLoggedin , function(req, res, next) {
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

router.post('/update_followings', function(req, res, next) {
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx=";
    var follwing= {
            addresses: [
                "GBFNM2W3QNSPR4KGY4FNEF6YUF7STM5LF5VOARFCCQCSLPZMSEQTZ4MU",
                "GCXEQNLGRDKEPUPLCZRGXYKAUQSI4Y56OHJPM4N35ZYZGH4LXMVUK5SD",
            ]
        }

    var Followings = new Buffer.from(JSON.stringify(follwing));
    handleTransaction.encodeUpdateFollowingsTransaction(blockchainKey.public_key, Followings, blockchainKey.private_key)
    .then((response) => {
        axios.get(broadcastRequest+response).then((resp)=>{
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
