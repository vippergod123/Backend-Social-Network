var express = require('express');
var router = express.Router();
const axios = require('axios');


const handleTransaction = require('../lib/handleTransaction');
/* GET users listing. */

router.post('/', function(req, res, next) {
    var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx="

    handleTransaction
    .encodePaymentTransaction(req.body.send_public_key, req.body.receive_public_key, req.body.amount, req.body.send_private_key)
    .then((response)=>{
    axios.get(broadcastRequest+response).then((resp)=>{
        res.status(200).json({
        message: "create success",
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
