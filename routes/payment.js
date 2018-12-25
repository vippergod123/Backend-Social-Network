const express = require('express');
const router = express.Router();
const axios = require('axios');

const Domain = require('../config/nodePublic');
const handleTransaction = require('../lib/handleTransaction');

router.post('/', function(req, res, next) {
    var broadcastRequest = Domain.dragonflyDomain + "broadcast_tx_commit?tx="
    var account = req.body.send_public_key;
    var address = req.body.receive_public_key;
    var amount = parseInt(req.body.amount);
    var private_key = req.body.send_private_key;
    handleTransaction.encodePaymentTransaction(account, address, amount, private_key)
    .then((response)=>{
    axios.get(broadcastRequest+response).then((resp)=>{
        console.log(resp.data);
        res.status(200).json({
        message: "payment success",
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
