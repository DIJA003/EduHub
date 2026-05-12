const googleDriveService = require('../../../services/googleDriveService');
const { success, badRequest, notFound } = require('../../shared/response');
const { logAction } = require('../../shared/logger');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return badRequest(res, 'No file provided');
    }

    const { courseId } = req.body;
    const userId = req.user?.id;

    const uploadResult = await googleDriveService.uploadFile({
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      buffer: req.file.buffer
    }, {
      userId,
      courseId
    });

    await logAction({
      action: 'UPLOAD',
      entity: 'GoogleDriveFile',
      entityId: uploadResult.fileId,
      entityName: uploadResult.fileName,
      performedBy: req.user,
      req,
      details: { 
        courseId, 
        fileSize: uploadResult.size,
        mimeType: uploadResult.mimeType
      }
    });

    return success(res, uploadResult, 201);
  } catch (err) {
    next(err);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return badRequest(res, 'File ID is required');
    }

    const downloadResult = await googleDriveService.downloadFile(fileId);

    // Set appropriate headers
    res.setHeader('Content-Type', downloadResult.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadResult.fileName}"`);
    if (downloadResult.size) {
      res.setHeader('Content-Length', downloadResult.size);
    }

    // Pipe the stream to response
    downloadResult.stream.pipe(res);

    await logAction({
      action: 'DOWNLOAD',
      entity: 'GoogleDriveFile',
      entityId: fileId,
      entityName: downloadResult.fileName,
      performedBy: req.user,
      req,
      details: { fileSize: downloadResult.size }
    });

  } catch (err) {
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return badRequest(res, 'File ID is required');
    }

    // Get file metadata before deletion for logging
    const fileMetadata = await googleDriveService.getFileMetadata(fileId);
    
    const deleteResult = await googleDriveService.deleteFile(fileId);

    await logAction({
      action: 'DELETE',
      entity: 'GoogleDriveFile',
      entityId: fileId,
      entityName: fileMetadata.name,
      performedBy: req.user,
      req,
      details: { 
        fileSize: fileMetadata.size,
        mimeType: fileMetadata.mimeType
      }
    });

    return success(res, deleteResult);
  } catch (err) {
    next(err);
  }
};

const listFiles = async (req, res, next) => {
  try {
    const { folderId, search } = req.query;
    
    let query = '';
    if (search) {
      query = `and name contains '${search}'`;
    }

    const files = await googleDriveService.listFiles(folderId, query);

    return success(res, { files });
  } catch (err) {
    next(err);
  }
};

const getFileMetadata = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return badRequest(res, 'File ID is required');
    }

    const metadata = await googleDriveService.getFileMetadata(fileId);

    return success(res, metadata);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadFile,
  downloadFile,
  deleteFile,
  listFiles,
  getFileMetadata
};
