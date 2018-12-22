
var Passport = require("passport")
var LocalStrategy = require("passport-local").Strategy
var crypto = require('crypto-js')

const {firestore} = require('../config/firebaseConfig');
const FirestoreAccount = firestore.collection("Account");

var accountForest = new Object();
FirestoreAccount.get().then((snapshot) => { 
    snapshot.forEach(doc => {
        
        if ( doc.id !== "AccountStatus") {
            var data = JSON.parse(doc.data().transaction)
            accountForest[doc.id] = data;
        }

    });

    console.log("Fetch Data from database success");
    
}).catch(err => {
    console.log("Error when fetching Data from database");
})

//sua
Passport.use(new LocalStrategy(
  (username, password, done) => {
    var accounts = Object.keys(accountForest);    
    var exist = accounts.find(each => each === username)

    if ( exist) 
        return done(null,exist)
    else  
        return done(null,false)
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
    console.log(id);

});


module.exports = Passport;
