const driveConfig = require('../../config/googleDrive');
const { AppError } = require('./error.middleware');

const checkGoogleDriveConfig = (req, res, next) => {
  if (!driveConfig.isConfigured()) {
    return next(new AppError('Google Drive is not configured. Please check your service account credentials.', 503));
  }
  next();
};

const optionalGoogleDriveCheck = (req, res, next) => {
  req.googleDriveAvailable = driveConfig.isConfigured();
  next();
};

module.exports = {
  checkGoogleDriveConfig,
  optionalGoogleDriveCheck
};
