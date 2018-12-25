const express = require('express');
const router = express.Router();
const transaction = require('../lib/handleTransaction');


router.post('/', function(req, res, next) {
  var tx = req.body.tx;
  tx = transaction.decodeTransaction(tx);
  res.json(tx);
});

module.exports = router;
