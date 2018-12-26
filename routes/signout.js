var express = require("express")
var router = express.Router()
var Passport = require("passport")
// Middleware

router.get("/", (req,res,next) => { 
    req.logOut();

    return res.json({
        message: "Log out success!",
        redirect: "/signin"
    })
})

module.exports = router;
