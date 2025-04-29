// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user (protected route)
router.get('/me', authenticate, getCurrentUser);

module.exports = router;