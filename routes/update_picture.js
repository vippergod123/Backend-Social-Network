const express = require('express');
const router = express.Router();
const request = require('request');
const {publicDomain} = require('../Global/Variable/PublicNodeDomain');

router.post('/', function(req, res, next) {
    var encodePictureTransaction = req.body.encodePictureTransaction;
    console.log(encodePictureTransaction);
    
    var headers = {
        'User-Agent': 'Super Agent/0.0.1',
        'Content-Type': 'application/json-rpc',
        'Accept': 'application/json-rpc'
    };
    var option = { 
        url: publicDomain,
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'broadcast_tx_commit',
            params: [encodePictureTransaction],
            id: 1,
        })
    };
    request(option, (error, response) => {
        
        try{
        var body = JSON.parse(response.body);
        console.log(body);
        
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
        }
        catch(err) { 
            res.json({
                error:err,
            })
        }
    });
});

module.exports = router;
