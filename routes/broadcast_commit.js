const express = require('express');
const router = express.Router();
const axios = require('axios');
const Domain = require('../config/nodePublic');

// Middleware
const {isLoggedin} = require('../Global/Function/middleware');

router.post('/', isLoggedin, function(req, res, next) {
  var broadcastRequest = Domain.komodoDomain + "broadcast_tx_commit?tx=" + req.body.enCodeTransaction;
  axios.get(broadcastRequest)
    .then((response) => {
        res.status(200).json({
            message:"broadcast commit success",
            status: 200,
        })
  })
  .catch((err) => {
    res.status(400).json({
      error: err
    })
  })
});

module.exports = router;
