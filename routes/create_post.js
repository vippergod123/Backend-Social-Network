const express = require('express');
const router = express.Router();
const axios = require('axios');
const base32 = require('base32.js');
const vstruct = require('varstruct');

const blockchainKey = require('../config/blockchainKey');
const handleTransaction = require('../lib/handleTransaction');
const PlainTextContent = vstruct([
    { name: 'type', type: vstruct.UInt8 },
    { name: 'text', type: vstruct.VarString(vstruct.UInt16BE) },
]);
const ReactContent = vstruct([
    { name: 'type', type: vstruct.UInt8 },
    { name: 'reaction', type: vstruct.UInt8 },
  ]);
router.post('/', function (req, res, next) {
    var post = { 
        type: 1, 
        text: req.body.content, 
    }
    var content = new Buffer.from(PlainTextContent.encode(post));
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx="
    handleTransaction.encodePostTransaction(blockchainKey.public_key, content, blockchainKey.private_key)
    .then((response) => {
        axios.get(broadcastRequest + response).then((resp) => {
            res.status(200).json({
                message: "post success",
            })
        })
    })
    .catch((err) => {
        res.status(400).json({
            error: err
        })
    })
});

router.post('/comment', function (req, res, next) {
    var hash = "DF828E91D9A81CAA848860BB02F2B4F2ADE7D2B8ACB3E80A5238FF74982F2C97";
    var comment = { 
        type: 1, 
        text: req.body.comment, 
    }
    var content = new Buffer.from(PlainTextContent.encode(comment));
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx="
    handleTransaction.encodeInteractTransaction(blockchainKey.public_key, hash, content, blockchainKey.private_key)
    .then((response) => {
        axios.get(broadcastRequest + response).then((resp) => {
            res.status(200).json({
                message: "comment success",
            })
        })
    })
    .catch((err) => {
        res.status(400).json({
            error: err
        })
    })
});

router.post('/reaction', function (req, res, next) {
    var hash = "DF828E91D9A81CAA848860BB02F2B4F2ADE7D2B8ACB3E80A5238FF74982F2C97";
    var react = { 
        type: 2, 
        reaction: parseInt(req.body.reaction),
    }
    var content = new Buffer.from(ReactContent.encode(react));
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx="
    handleTransaction.encodeInteractTransaction(blockchainKey.public_key, hash, content, blockchainKey.private_key)
    .then((response) => {
        axios.get(broadcastRequest + response).then((resp) => {
            console.log(resp.data);
            res.status(200).json({
                message: "react success",
            })
        })
    })
    .catch((err) => {
        res.status(400).json({
            error: err
        })
    })
});


module.exports = router;