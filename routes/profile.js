const express = require('express');
const router = express.Router();
const axios = require('axios');
const transaction = require('../lib/handleTransaction');
const {publicDomain } = require('../Global/Variable/PublicNodeDomain');

// Middleware
const {isLoggedin} = require('../Global/Function/middleware');
const buf = require("buffer")
const vstruct = require('varstruct');
const base32 = require('base32.js')

function isJson(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}
const PlainTextContent = vstruct([
  { name: 'type', type: vstruct.UInt8 },
  { name: 'text', type: vstruct.VarString(vstruct.UInt16BE) },
]);
const ReactContent = vstruct([
  { name: 'type', type: vstruct.UInt8 },
  { name: 'reaction', type: vstruct.UInt8 },
]);
const Followings = vstruct([
  { name: 'addresses', type: vstruct.VarArray(vstruct.UInt16BE, vstruct.Buffer(35)) },
]);

router.post('/',isLoggedin, function(req, res, next) {
  var TransactionFromPublicNode =  publicDomain + "/tx_search?query=%22account=%27"+req.body.account+"%27%22&page=1&per_page=100";
  axios.get(TransactionFromPublicNode)
  .then((response) => {
    if (response.data.result.txs.length === 0) {
      res.status(201).json({
        message: 'get info failed',
        status: 201,
      });
    }

    const data = response.data.result.txs.map((each) => {
      each.tx = transaction.decodeTransaction(each.tx);
      each.tx.memo = each.tx.memo.toString();
      each.tx.signature = each.tx.signature.toString('hex');
      if(each.tx.params.content && each.tx.params.key === 'post') {    
        try{
          var content = PlainTextContent.decode(each.tx.params.content);
          each.tx.params.content = content;
        }
        catch(err) {
          console.log("loi tai content sai cau truc");
        }
      }
      if(each.tx.params.value && each.tx.params.key === 'name') { 
        each.tx.params.value = each.tx.params.value.toString();
      } else if(each.tx.params.value && each.tx.params.key === 'picture') { 
        each.tx.params.value = each.tx.params.value.toString('base64');
      } else if(each.tx.params.value && each.tx.params.key === 'followings') {
        try{
          var following = Followings.decode(each.tx.params.value);
          if(following.addresses.length !== 0) {
            each.tx.params.value = following.addresses.map(address => base32.encode(address));
          }
        }
        catch(err) {
          console.log("loi tai following sai cau truc");
        }
      }
      return each;
    })
    
    res.status(200).json({
      message: 'get info success',
      status: 200,
      data: data,
    });
  })
  .catch(error => {
    console.log(error);
  });
});

module.exports = router;
