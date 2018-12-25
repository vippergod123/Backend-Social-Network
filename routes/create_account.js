const express = require('express');
const router = express.Router();
const axios = require('axios');

const blockchainKey = require('../config/blockchainKey');
const handleTransaction = require('../lib/handleTransaction');
const Domain = require('../config/nodePublic');

router.post('/', function(req, res, next) {
  var broadcastRequest = Domain.dragonflyDomain + "broadcast_tx_commit?tx="

  handleTransaction.encodeCreateAccountTransaction(blockchainKey.public_key,req.query.public_key,blockchainKey.private_key)
  .then((response)=>{ 
    axios.get(broadcastRequest+response).then((resp) => {
      handleTransaction.encodePaymentTransaction(blockchainKey.public_key, req.query.public_key, 100, blockchainKey.private_key)
      .then((response)=>{
        axios.get(broadcastRequest+response).then((resp)=>{
          res.status(200).json({
            message: "create success",
          })
        })
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
