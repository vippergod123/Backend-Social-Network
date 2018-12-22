const express = require('express');
const router = express.Router();
const axios = require('axios');
const transaction = require('../lib/handleTransaction');

// Middleware
const {isLoggedin} = require('../Global/Function/middleware');

function isJson(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

router.post('/',isLoggedin, function(req, res, next) {
  var TransactionFromPublicNode = "https://komodo.forest.network/tx_search?query=%22account=%27"+req.body.account+"%27%22";
  axios.get(TransactionFromPublicNode)
  .then((response) => {
    const data = response.data.result.txs.map((each) => {
      each.tx = transaction.decodeTransaction(each.tx);
      each.tx.memo = each.tx.memo.toString();
      each.tx.signature = each.tx.signature.toString('hex');
      if(each.tx.params.content) {
        const content = each.tx.params.content.toString();
        if(isJson(content))
          each.tx.params.content = JSON.parse(content);
        else
          each.tx.params.content = content;
      }
      if(each.tx.params.value && each.tx.params.key === 'name') { 
        each.tx.params.value = each.tx.params.value.toString();
      }
      if(each.tx.params.value && each.tx.params.key === 'picture') { 
        each.tx.params.value = each.tx.params.value.toString('base64');
      }

      return each;
    })
    res.status(200).json({
      message: 'get info success',
      data: data,
    });
  })
  .catch(error => {
    console.log(error);
  });
});

module.exports = router;
