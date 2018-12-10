var express = require('express');
var router = express.Router();
const axios = require('axios');

const blockchainKey = require('../config/blockchainKey');
const handleTransaction = require('../lib/handleTransaction');
/* GET users listing. */
router.post('/', function(req, res, next) {

    console.log(req.query.public_key);

  var encodeCreateAccount = handleTransaction.encodeCreateAccountTransaction(blockchainKey.public_key,public_key);
  var encodePayment = handleTransaction.encodePaymentTransaction(blockchainKey.public_key,public_key,100);

  console.log(encodeCreateAccount);
  console.log(encodePayment);
  
  var broadcastRequest = "https://komodo.forest.network/broadcast_tx_commit?tx="
  

  axios.get(broadcastRequest+encodeCreateAccount)
  .then(response => {
      axios.get(broadcastRequest+encodePayment)
      console.log(response.data);
      res.json(response.data)
  })
  .then(response => { console.log(response.data); res.json(response.data)})
  .catch(error => {
    console.log(error);
  });
   
});

module.exports = router;
