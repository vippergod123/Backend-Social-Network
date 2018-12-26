const express = require('express');
const router = express.Router();
const axios = require('axios');
const Domain = require('../config/nodePublic');
const {publicDomain} = require('../Global/Variable/PublicNodeDomain');
// Middleware
const {isLoggedin} = require('../Global/Function/middleware');

router.post('/', isLoggedin, function(req, res, next) {
  
  
  var broadcastRequest = publicDomain + "/broadcast_tx_commit?tx=" + req.body.enCodeTransaction;
  console.log(broadcastRequest);
  
  axios.get(broadcastRequest)
    .then((response) => {
      if (response.data.result.height != '0') {
        res.status(200).json({
          message:"broadcast commit success",
          status: 200,
        })
      } else {
        res.status(201).json({
          message:"broadcast commit failed",
          status: 201,
        })
      }     
  })
  .catch((err) => {
    res.status(400).json({
      error: err,
      status: 400,
    })
  })
});

module.exports = router;
