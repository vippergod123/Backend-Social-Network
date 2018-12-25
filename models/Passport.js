
var Passport = require("passport")
var LocalStrategy = require("passport-local").Strategy
var crypto = require('crypto-js')

const {firestore} = require('../config/firebaseConfig');
const FirestoreAccount = firestore.collection("Account");


//sua
Passport.use(new LocalStrategy(
  (username, password, done) => {
    // var accounts = Object.keys(accountForest);    
    // var exist = accounts.find(each => each === username)
    FirestoreAccount.doc(username).get().then((snapshot) => {
        var exist = snapshot.data();
        if ( exist) 
            return done(null,username = { 
                public_key: username,
                transaction: exist.transaction
            })
        else  
            return done(null,false)
    })
    .catch(err=> { 
        
        console.log(err);
        return done(null,false)
    })
   
  }
)) // MongoClient


Passport.serializeUser((user, done) => {
  done(null, user)
})
Passport.deserializeUser((id,done) => {
    // Ma hoa private key here 
//   var myVar = "ID";
//   var params = {};
//   params[myVar] = id;
//   MongoClient.connect(uri, function(err, db) {
//     if (err) throw err;
//     if (id[0] != 's') {
//       var dbo = db.db("3dwebsite");
//       dbo.collection("customer").find(params).toArray(function(err, result) {
//         var bytes = crypto.AES.decrypt(result[0].password,'dudada');
//         pass = bytes.toString(crypto.enc.Utf8);
//         result[0].password = pass;
//         pass = null;
//         done(err, result[0]);
//       });
//     } else if (id[0] == 's') {
//       var dbo = db.db("3dwebsite");
//       dbo.collection("staff").find(params).toArray(function(err, result) {
//         var bytes = crypto.AES.decrypt(result[0].password,'dudada');
//         pass = bytes.toString(crypto.enc.Utf8);
//         result[0].password = pass;
//         pass = null;
//         done(err, result[0]);

//       });
//     }
//     db.close();
//   });

    done(null,id)
});


module.exports = Passport;
