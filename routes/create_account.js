var express = require('express');
var router = express.Router();
const axios = require('axios');

const blockchainKey = require('../config/blockchainKey');
const handleTransaction = require('../lib/handleTransaction');
/* GET users listing. */

router.post('/', function(req, res, next) {
  console.log(req.query.public_key);
  console.log(blockchainKey.public_key);
  var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx="

  handleTransaction.encodeCreateAccountTransaction(blockchainKey.public_key,req.query.public_key,blockchainKey.private_key)
  .then((response)=>{ 
    console.log(response);
    axios.get(broadcastRequest+response).then((resp) => {
      console.log(resp.data);
      handleTransaction.encodePaymentTransaction(blockchainKey.public_key, req.query.public_key, 100, blockchainKey.private_key)
      .then((response)=>{
        console.log(response);
        axios.get(broadcastRequest+response).then((resp)=>{
          console.log(resp.data);
          res.status(200).json({
            message: "create success",
          })
        })
      })
    })
  })

  .catch((err)=> {
    res.status(400).json({
      error: err
    })
  })

});

module.exports = router;
