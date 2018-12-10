var express = require('express');
var router = express.Router();
const axios = require('axios');
const blockchainKey = require('../config/blockchainKey');
/* GET users listing. */
router.get('/', function(req, res, next) {

  var getTransactionFromPublicNode = "https://komodo.forest.network/tx_search?query=%22account=%27"+blockchainKey.public_key+"%27%22"
  console.log(getTransactionFromPublicNode);
  
  axios.get(getTransactionFromPublicNode)
  .then(resp => {
    res.json(
      resp.data
    )
  })
  .catch(error => {
    console.log(error);
  });
});

module.exports = router;
