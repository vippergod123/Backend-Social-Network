
const axios = require('axios');
var express = require('express');
var router = express.Router();
const {firestore} = require('../../config/firebaseConfig');



function IntervalGetHeightBlock(){
    return new Promise((resolve, reject) => {  
 
        var getLastHeightBlock = "https://komodo.forest.network/abci_info"
        axios.get(getLastHeightBlock)
        .then((response)  => {
            var last_block_height = parseInt(response.data.result.response.last_block_height);
            resolve(last_block_height);
        })
        .catch(err => {
            reject("Last Block Error - " +err);
        })        
    })
}




module.exports = IntervalGetHeightBlock