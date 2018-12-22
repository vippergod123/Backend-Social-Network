function isLoggedin(req, res, next) {
    console.log(req.user);
  
    if (!req.user) {
      res.json({
        error: "You not sign in yet!",
        redirect: "/signin",
      })
    }  
    else {
      return next()
    }
    
 }

 module.exports.isLoggedin = isLoggedin