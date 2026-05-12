# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for your EduHub application.

## Prerequisites

1. Google Cloud Project with Google Drive API enabled
2. Service Account with appropriate permissions
3. Google Drive folder to store files (optional but recommended)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `EduHub Drive Service`
   - Description: `Service account for EduHub file storage`
4. Click "Create and Continue"
5. Skip granting roles (or grant basic roles if needed)
6. Click "Done"

## Step 3: Generate Service Account Key

1. Find your service account in the credentials list
2. Click on the service account name
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Select "JSON" as the key type
6. Click "Create"
7. The JSON key file will be downloaded automatically

## Step 4: Set Up Google Drive Folder

1. Create a new folder in your Google Drive (e.g., "EduHub Files")
2. Share the folder with your service account:
   - Right-click the folder > "Share"
   - Add the service account email (found in your JSON key file)
   - Give it "Editor" permissions
3. Copy the folder ID from the URL:
   - The URL looks like: `https://drive.google.com/drive/folders/FOLDER_ID`
   - Copy the `FOLDER_ID` part

## Step 5: Configure Your Application

1. Create a `credentials` folder in your server directory:
   ```bash
   mkdir server/credentials
   ```

2. Move your service account JSON key to the credentials folder:
   ```bash
   mv /path/to/your-key.json server/credentials/service-account-key.json
   ```

3. Add the following environment variables to your `.env` file:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials/service-account-key.json
   GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
   ```

## Step 6: Test the Integration

Your Google Drive integration is now ready! Here are the available endpoints:

### API Endpoints

All endpoints require authentication (`Bearer token` in Authorization header).

#### Upload File
```
POST /api/google-drive/upload
Content-Type: multipart/form-data

Body:
- file: (required) The file to upload
- courseId: (optional) Course ID for organization
```

#### Download File
```
GET /api/google-drive/download/:fileId
```

#### Delete File
```
DELETE /api/google-drive/:fileId
```

#### List Files
```
GET /api/google-drive/
Query Parameters:
- folderId: (optional) Folder ID to list files from
- search: (optional) Search term to filter files
```

#### Get File Metadata
```
GET /api/google-drive/:fileId/metadata
```

### Example Usage

#### Upload a file using curl:
```bash
curl -X POST http://localhost:5000/api/google-drive/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "courseId=course123"
```

#### Download a file using curl:
```bash
curl -X GET http://localhost:5000/api/google-drive/download/FILE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o downloaded_file.pdf
```

## Security Considerations

1. **Keep your service account key secure** - Never commit it to version control
2. **Use environment variables** - Don't hardcode credentials in your code
3. **Regular key rotation** - Consider rotating your service account keys periodically
4. **Access control** - Only give necessary permissions to your service account

## Features

- ✅ File upload to Google Drive
- ✅ File download from Google Drive
- ✅ File deletion from Google Drive
- ✅ File listing with search capabilities
- ✅ Automatic folder organization by course
- ✅ File metadata retrieval
- ✅ Audit logging for all operations
- ✅ Error handling and validation

## Troubleshooting

### Common Issues

1. **"Google Drive is not configured" error**
   - Check that your service account key file exists at the correct path
   - Verify the environment variables are set correctly

2. **Permission denied errors**
   - Ensure the service account has access to the specified folder
   - Check that the Google Drive API is enabled in your Google Cloud project

3. **File upload failures**
   - Verify file size is under 100MB limit
   - Check that the file type is supported

### Debug Mode

To enable debug logging, set the following environment variable:
```env
DEBUG=google-drive:*
```

## Integration with Existing System

The Google Drive service is designed to work alongside your existing Firebase and local file storage. You can:

1. Use Google Drive for large files or when you need cloud storage
2. Keep using Firebase for user avatars and small files
3. Use local storage for temporary files or development

The system automatically detects if Google Drive is configured and will gracefully handle cases where it's not available.
