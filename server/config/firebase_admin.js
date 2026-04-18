const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = require("./serviceAccountKey.json");
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "eduhub-26.firebasestorage.app" 
  });
}

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };