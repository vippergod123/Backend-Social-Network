var express = require("express")
var router = express.Router()
var Passport = require("passport")
// Middleware
const {isLoggedin} = require('../Global/Function/middleware');

router.get("/",isLoggedin, (req,res,next) => { 
})



module.exports = router;
