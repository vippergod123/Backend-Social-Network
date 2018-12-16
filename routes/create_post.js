var express = require('express');
var router = express.Router();
const axios = require('axios');
const base32 = require('base32.js');

const blockchainKey = require('../config/blockchainKey');
const handleTransaction = require('../lib/handleTransaction');



router.post('/', function (req, res, next) { 
    var a = new Buffer.from(req.body.content, 'utf8')
    
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx="
    handleTransaction.encodePostTransaction(blockchainKey.public_key, a, blockchainKey.private_key)
    .then((response) => {
        axios.get(broadcastRequest + response).then((resp) => {
            console.log(resp);
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
    // res.status(200).json({
    //     message: "post success",
    // });
});

module.exports = router;