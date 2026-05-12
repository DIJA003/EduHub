const express = require('express');
const { verifyToken } = require('../../middleware/auth.middleware');
const { checkGoogleDriveConfig } = require('../../middleware/googleDrive.middleware');
const multer = require('multer');
const {
  uploadFile,
  downloadFile,
  deleteFile,
  listFiles,
  getFileMetadata
} = require('./googleDrive.controller');

const router = express.Router();

// Configure multer for memory storage (for Google Drive uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Apply Google Drive configuration check to all routes
router.use(checkGoogleDriveConfig);

// Upload file to Google Drive
router.post('/upload', verifyToken, upload.single('file'), uploadFile);

// Download file from Google Drive
router.get('/download/:fileId', verifyToken, downloadFile);

// Delete file from Google Drive
router.delete('/:fileId', verifyToken, deleteFile);

// List files (with optional folder and search)
router.get('/', verifyToken, listFiles);

// Get file metadata
router.get('/:fileId/metadata', verifyToken, getFileMetadata);

module.exports = router;
