// routes/user.routes.js
const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  deleteAccount 
} = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get user profile
router.get('/profile', getUserProfile);

// Update user profile
router.put('/profile', updateUserProfile);

// Change password
router.put('/change-password', changePassword);

// Delete account
router.delete('/', deleteAccount);

module.exports = router;