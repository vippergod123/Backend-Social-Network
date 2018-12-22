const express = require('express');
const router = express.Router();
const axios = require('axios');
const Domain = require('../config/nodePublic');

router.post('/', function(req, res, next) {
  var broadcastRequest = Domain.komodoDomain + "broadcast_tx_commit?tx=" + req.body.enCodeTransaction;
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
