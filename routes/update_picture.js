const express = require('express');
const router = express.Router();
const request = require('request');

router.post('/', function(req, res, next) {
    var encodePictureTransaction = req.body.encodePictureTransaction;
    var headers = {
        'User-Agent': 'Super Agent/0.0.1',
        'Content-Type': 'application/json-rpc',
        'Accept': 'application/json-rpc'
    };
    var option = { 
        url: "https://komodo.forest.network/",
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'broadcast_tx_commit',
            params: [encodePictureTransaction],
            id: "",
        })
    };
    request(option, (error, response) => {
        var body = JSON.parse(response.body);
        if(body.result.height != "0") {
            res.status(200).json({
                message: "update piture success",
                status: 200,
            })
        } else {
            console.log(error);
            res.status(201).json({
                message: "update piture failed",
                status: 201,
            })
        }
    });
});

module.exports = router;
