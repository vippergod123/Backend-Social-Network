const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
var request = require('request');
const Base64 = require('js-base64').Base64;

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

function convertBase64ToBinary(input) {
    var raw = input;
    var rawLength = input.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));
  
    for(i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
}

router.post('/update_picture', function(req, res, next) {
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit";
    var picture = fs.readFileSync('./routes/images.jpg');
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
            if(response.body.result.height != "0") {
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

module.exports = router;
