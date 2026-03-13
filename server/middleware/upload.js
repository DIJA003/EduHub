const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "uploads/materials");
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);

    cb(null, uniqueName + ext);
  }

});

// File type filter
const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "video/mp4",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, ZIP, Slides, or Video files are allowed"), false);
  }
};

// Multer upload instance
const uploadMaterial = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 200 // 200MB
  }
});

module.exports = uploadMaterial;