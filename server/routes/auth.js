const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/verify-email', authController.verifyEmailExistence);

module.exports = router;