const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket:
      process.env.STORAGE_BUCKET || "eduhub-26.firebasestorage.app",
  });
}

module.exports = admin;
