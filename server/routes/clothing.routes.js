// routes/clothing.routes.js
const express = require('express');
const router = express.Router();
const { 
  getAllClothing, 
  addClothing, 
  deleteClothing, 
  updateClothingStatus,
  cleanAllClothing 
} = require('../controllers/clothing.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all clothing items for current user
router.get('/', getAllClothing);

// Add a new clothing item
router.post('/', addClothing);

// Delete a clothing item
router.delete('/:id', deleteClothing);

// Update clothing status (clean/dirty)
router.patch('/:id/status', updateClothingStatus);

// Mark all clothing as clean
router.patch('/clean-all', cleanAllClothing);

module.exports = router;