const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

admin.firestore().settings({timestampsInSnapshots:true});


const firestore = admin.firestore();

module.exports.firestore = firestore