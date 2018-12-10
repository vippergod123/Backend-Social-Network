var express = require('express');
var router = express.Router();
var profile = require('../lib/handleTransaction');

const { Keypair } = require('stellar-base');


/* GET home page. */
router.post('/', function(req, res, next) {
//   var id = res.query.id;
//   var operation = res.query.operation;

  console.log("Tao 1 transaction moi: " + req.query.id + req.query.operation);
  
  res.json({
      message: "success",
      method: "share",
  })
});

module.exports = router;
