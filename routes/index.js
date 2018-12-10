var express = require('express');
var router = express.Router();

const { Keypair } = require('stellar-base');


/* GET home page. */
router.get('/', function(req, res, next) {
  const key = Keypair.random();
  console.log(key.secret());
  console.log(key.publicKey());
  res.json({
    public_key: key.publicKey().toString(),
    private_key: key.secret().toString(),
  })
});

module.exports = router;
