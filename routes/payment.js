var express = require('express');
var router = express.Router();
const axios = require('axios');
const blockchainKey = require('../config/blockchainKey');
/* GET users listing. */
router.post('/', function(req, res, next) {

  console.log(req.query.public_key);
  axios.get(getTransactionFromPublicNode)
  .then(resp => {
      console.log(resp);
      
    res.json(
      resp.data
    )
  })
  .catch(error => {
    console.log(error);
  });
   
});

module.exports = router;
