const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { AppError } = require('../src/middleware/error.middleware');
const driveConfig = require('../config/googleDrive');

class GoogleDriveService {
  constructor() {
    this.drive = driveConfig.getDriveService();
    this.folderId = driveConfig.getFolderId();
  }

  async uploadFile(fileData, options = {}) {
    try {
      if (!driveConfig.isConfigured()) {
        throw new AppError('Google Drive is not properly configured', 500);
      }

      const { fileName, mimeType, buffer, folderPath = '' } = fileData;
      const { userId, courseId } = options;

      // Create folder structure if needed
      let parentFolderId = this.folderId;
      if (folderPath) {
        parentFolderId = await this.ensureFolderExists(folderPath, parentFolderId);
      } else if (courseId) {
        parentFolderId = await this.ensureFolderExists(`course-${courseId}`, parentFolderId);
      }

      // Prepare file metadata
      const fileMetadata = {
        name: fileName,
        parents: parentFolderId ? [parentFolderId] : undefined
      };

      // Add custom properties for better organization
      if (userId) {
        fileMetadata.appProperties = {
          uploadedBy: userId,
          uploadDate: new Date().toISOString()
        };
      }

      // Create media object from buffer
      const media = {
        mimeType: mimeType,
        body: require('stream').Readable.from(buffer)
      };

      // Upload file
      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size, webViewLink, webContentLink'
      });

      // Make file publicly accessible (optional)
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        mimeType: response.data.mimeType,
        size: response.data.size,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        downloadUrl: response.data.webContentLink
      };
    } catch (error) {
      console.error('Google Drive upload error:', error);
      throw new AppError(`Failed to upload file to Google Drive: ${error.message}`, 500);
    }
  }

  async downloadFile(fileId) {
    try {
      if (!driveConfig.isConfigured()) {
        throw new AppError('Google Drive is not properly configured', 500);
      }

      // Get file metadata first
      const fileMetadata = await this.drive.files.get({
        fileId: fileId,
        fields: 'name, mimeType, size'
      });

      // Download file content
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, {
        responseType: 'stream'
      });

      return {
        fileName: fileMetadata.data.name,
        mimeType: fileMetadata.data.mimeType,
        size: fileMetadata.data.size,
        stream: response.data
      };
    } catch (error) {
      console.error('Google Drive download error:', error);
      throw new AppError(`Failed to download file from Google Drive: ${error.message}`, 500);
    }
  }

  async deleteFile(fileId) {
    try {
      if (!driveConfig.isConfigured()) {
        throw new AppError('Google Drive is not properly configured', 500);
      }

      await this.drive.files.delete({
        fileId: fileId
      });

      return { deleted: true, fileId };
    } catch (error) {
      console.error('Google Drive delete error:', error);
      throw new AppError(`Failed to delete file from Google Drive: ${error.message}`, 500);
    }
  }

  async listFiles(folderId = null, query = '') {
    try {
      if (!driveConfig.isConfigured()) {
        throw new AppError('Google Drive is not properly configured', 500);
      }

      const searchQuery = folderId 
        ? `'${folderId}' in parents and trashed=false ${query}`
        : `trashed=false ${query}`;

      const response = await this.drive.files.list({
        q: searchQuery.trim(),
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink)',
        pageSize: 100
      });

      return response.data.files;
    } catch (error) {
      console.error('Google Drive list error:', error);
      throw new AppError(`Failed to list files from Google Drive: ${error.message}`, 500);
    }
  }

  async ensureFolderExists(folderName, parentId = null) {
    try {
      // Search for existing folder
      const query = parentId 
        ? `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)'
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create new folder if it doesn't exist
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined
      };

      const createResponse = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      return createResponse.data.id;
    } catch (error) {
      console.error('Error ensuring folder exists:', error);
      throw new AppError(`Failed to create/find folder: ${error.message}`, 500);
    }
  }

  async getFileMetadata(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink'
      });

      return response.data;
    } catch (error) {
      console.error('Google Drive get metadata error:', error);
      throw new AppError(`Failed to get file metadata: ${error.message}`, 500);
    }
  }
}

module.exports = new GoogleDriveService();
