const admin = require("../config/firebase_admin");
const crypto = require("crypto");

const bucket = admin.storage().bucket();

exports.uploadFileToFirebase = async (file) => {
  if (!file) return null;

  const fileName = `materials/${crypto.randomUUID()}_${file.originalname}`;
  const fileRef = bucket.file(fileName);

  await fileRef.save(file.buffer, {
    contentType: file.mimetype,
  });

  const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

  return fileUrl;
};
