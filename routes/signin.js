var express = require("express")
var router = express.Router()
var Passport = require("passport")


router.get('/', function(req, res) {
    res.redirect("http://localhost:3001")
});

// router.post('/', Passport.authenticate('local', {
//   // failureRedirect: '/loginFailed',
//   successRedirect: '/login_success',
//   // successRedirect: '/loggedin',
//   failureRedirect: '/login_failed', // see text

// }));



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
            res.json({
                message: "Login Success!",
                redirect: "/",
            })
           
        }
        else { 
            res.json({
                error: "Invalid public key",
                redirect: "/signin",
            })
            res.end();
        }
    })(req, res, next);
  });



module.exports = router;
