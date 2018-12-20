var express = require('express');
var router = express.Router();
const axios = require('axios');

const handleTransaction = require('../lib/handleTransaction');
const blockchainKey = require('../config/blockchainKey');

router.post('/', function(req, res, next) {
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx=";

    var UpdateNameParams =  Buffer.from(JSON.stringify(req.body.name));

    handleTransaction.encodeUpdateAccountTransaction(blockchainKey.public_key, UpdateNameParams, blockchainKey.private_key)
    .then((response)=>{
    axios.get(broadcastRequest+response).then((resp)=>{
        res.status(200).json({
            message: "update success",
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
