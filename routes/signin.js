var express = require("express")
var router = express.Router()
var Passport = require("passport")

// Middleware
const {isLoggedin} = require('../Global/Function/middleware');

router.post('/', function(req, res, next) {
/* look at the 2nd parameter to the below call */
    Passport.authenticate('local', function(err, user, info) {
    
        var isValid = false
        isValid = user?true:false
        isValid = err?false:true

        req.logIn(user, function (err) { 
            isValid= user?true:false
        })
        if (isValid) { 
            return res.status(200).json({
                message: "Login Success!",
                redirect: "/",
            })
        }
        else { 
            return res.json({
                error: "Invalid public key",
                redirect: "/signin",
            })
        }

    })(req, res, next);
});

module.exports = router;
