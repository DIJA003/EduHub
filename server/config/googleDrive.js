const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Google Drive folder ID where files will be stored
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

class GoogleDriveConfig {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.initializeAuth();
  }

  initializeAuth() {
    try {
      let credentials;

      // Try base64 encoded key first (for Railway deployment)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
        const keyData = Buffer.from(
          process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 
          'base64'
        ).toString('utf8');
        credentials = JSON.parse(keyData);
        console.log('Using base64-encoded Google Drive service account key');
      } 
      // Fallback to file path (for local development)
      else {
        const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || 
          path.join(__dirname, '../credentials/service-account-key.json');
        
        if (!fs.existsSync(keyPath)) {
          console.warn('Google Drive service account key file not found at:', keyPath);
          console.warn('Please set GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 for Railway deployment');
          return;
        }
        
        credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        console.log('Using file-based Google Drive service account key');
      }

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      console.log('Google Drive authentication initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Drive authentication:', error.message);
      if (process.env.NODE_ENV === 'production') {
        console.error('Please check your Railway environment variables');
      }
    }
  }

  getDriveService() {
    if (!this.drive) {
      throw new Error('Google Drive service not initialized. Check your credentials.');
    }
    return this.drive;
  }

  getFolderId() {
    return DRIVE_FOLDER_ID;
  }

  isConfigured() {
    return this.drive !== null;
  }
}

module.exports = new GoogleDriveConfig();
