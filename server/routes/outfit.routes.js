// routes/outfit.routes.js
const express = require('express');
const router = express.Router();
const { 
  getAllOutfits, 
  createOutfit, 
  getRandomOutfit, 
  deleteOutfit 
} = require('../controllers/outfit.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all outfits for current user
router.get('/', getAllOutfits);

// Create a new outfit
router.post('/', createOutfit);

// Get a random clean outfit
router.get('/random', getRandomOutfit);

// Delete an outfit
router.delete('/:id', deleteOutfit);

module.exports = router;