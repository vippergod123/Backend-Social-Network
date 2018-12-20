const express = require('express');
const router = express.Router();
const axios = require('axios');
const window = require('window');
var Base64 = require('js-base64').Base64;

const handleTransaction = require('../lib/handleTransaction');
const blockchainKey = require('../config/blockchainKey');

router.post('/update_name', function(req, res, next) {
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx=";
    var updateNameParams = new Buffer.from(req.body.name);
    handleTransaction.encodeUpdateAccountTransaction(blockchainKey.public_key, "name", updateNameParams, blockchainKey.private_key)
    .then((response)=>{
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
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx=";
    var picture = req.body.picture;
    var updateParams = new Buffer.from(convertBase64ToBinary(picture));
    handleTransaction.encodeUpdateAccountTransaction(blockchainKey.public_key, "picture", updateParams, blockchainKey.private_key)
    .then((response)=>{
        axios.get(broadcastRequest+response).then((resp)=>{
            res.status(200).json({
                message: "update piture success",
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
