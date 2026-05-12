# Google Drive Integration Deployment Guide

This guide will help you deploy the Google Drive integration to your Vercel (frontend) and Railway (backend) deployments.

## Railway Backend Deployment

### 1. Environment Variables Setup

Add these environment variables to your Railway project:

#### Required Variables:
```env
# Google Drive Configuration
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials/service-account-key.json
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id

# Existing variables (ensure they're set)
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_SECRET=your-jwt-secret
CLIENT_URLS=https://your-vercel-app.vercel.app
```

### 2. Service Account Key Setup

Since Railway doesn't persist uploaded files between deployments, we need to handle the service account key differently:

#### Option A: Base64 Encoded Key (Recommended)

1. **Encode your service account key:**
   ```bash
   base64 -i service-account-key.json
   ```

2. **Add to Railway environment variables:**
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=your-base64-encoded-key
   ```

3. **Update the Google Drive config to handle this:**
   (I'll provide the updated code below)

#### Option B: Railway Volume (Advanced)

1. Create a Railway volume for persistent storage
2. Upload the service account key to the volume
3. Use the original file path approach

### 3. Deployment Steps

1. **Push your changes to Git:**
   ```bash
   git add .
   git commit -m "Add Google Drive integration"
   git push origin main
   ```

2. **Railway will automatically deploy** the new changes

3. **Configure environment variables** in Railway dashboard

## Vercel Frontend Updates

### 1. Update API Calls

Your frontend needs to support the new Google Drive upload option:

```javascript
// Example upload function with Google Drive option
const uploadFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.courseId) {
    formData.append('courseId', options.courseId);
  }
  
  if (options.useGoogleDrive) {
    formData.append('useGoogleDrive', 'true');
  }

  const response = await fetch('/api/uploads/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

### 2. Add Google Drive Toggle Component

```jsx
// FileUploadToggle.jsx
import React, { useState } from 'react';

const FileUploadToggle = ({ onUpload }) => {
  const [useGoogleDrive, setUseGoogleDrive] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="googleDrive"
          checked={useGoogleDrive}
          onChange={(e) => setUseGoogleDrive(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="googleDrive" className="text-sm font-medium">
          Use Google Drive for cloud storage
        </label>
      </div>
      
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            onUpload(file, { useGoogleDrive });
          }
        }}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
    </div>
  );
};

export default FileUploadToggle;
```

## Updated Google Drive Configuration for Railway

Since Railway doesn't persist files, I'll create an updated configuration that handles base64-encoded service account keys:

### Update `server/config/googleDrive.js`:

```javascript
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class GoogleDriveConfig {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.initializeAuth();
  }

  initializeAuth() {
    try {
      let credentials;

      // Try base64 encoded key first (for Railway)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
        const keyData = Buffer.from(
          process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 
          'base64'
        ).toString('utf8');
        credentials = JSON.parse(keyData);
      } 
      // Fallback to file path (for local development)
      else {
        const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || 
          path.join(__dirname, '../credentials/service-account-key.json');
        
        if (!fs.existsSync(keyPath)) {
          console.warn('Google Drive service account key not found');
          return;
        }
        
        credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      }

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      console.log('Google Drive authentication initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Drive authentication:', error.message);
    }
  }

  // ... rest of the methods remain the same
}

module.exports = new GoogleDriveConfig();
```

## Verification Steps

### 1. Test Backend Configuration

```bash
# Test the Google Drive endpoint
curl -X GET https://eduhub-production-c198.up.railway.app/api/google-drive/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test File Upload

```bash
# Test upload with Google Drive
curl -X POST https://eduhub-production-c198.up.railway.app/api/uploads/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test-file.pdf" \
  -F "useGoogleDrive=true"
```

### 3. Monitor Railway Logs

Check Railway logs for any authentication errors or configuration issues.

## Troubleshooting

### Common Issues:

1. **"Google Drive is not configured" error**
   - Check that environment variables are set correctly in Railway
   - Verify the base64 encoding of your service account key

2. **Permission denied errors**
   - Ensure the service account has access to the specified Google Drive folder
   - Check that the Google Drive API is enabled in your Google Cloud project

3. **File upload failures**
   - Check Railway logs for detailed error messages
   - Verify file size is under 100MB limit

### Debug Mode

Enable debug logging in Railway:
```env
DEBUG=google-drive:*
```

## Security Considerations

1. **Never commit service account keys** to version control
2. **Use Railway's encrypted environment variables** for sensitive data
3. **Regular key rotation** - Consider rotating your service account keys periodically
4. **Monitor API usage** - Set up alerts for unusual activity

## Performance Notes

- Google Drive uploads are typically faster for large files
- Consider using Google Drive for files > 10MB
- Local storage is still available as a fallback
- Implement client-side file size validation before upload

## Next Steps

1. Follow this guide to deploy the changes
2. Test the integration thoroughly
3. Monitor performance and costs
4. Consider implementing file migration from local to Google Drive for existing files
