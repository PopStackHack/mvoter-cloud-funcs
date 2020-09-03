const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { firebaseConfig } = require('firebase-functions');
const serviceAccount = require('./serviceAccount.json');

const databaseURL = firebaseConfig().databaseURL;
const storageBucket = firebaseConfig().storageBucket;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL,
  storageBucket,
});

const deploy = require('./deploy');
const update = require('./update');

exports.deploy = functions.https.onRequest(deploy);
exports.update = functions.https.onRequest(update);
