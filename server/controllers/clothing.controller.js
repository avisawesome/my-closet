// controllers/clothing.controller.js
const db = require('../config/db.config');

// Get all clothing items for a user
exports.getAllClothing = async (req, res) => {
  try {
    // Get all clothing items for the authenticated user
    const [items] = await db.query(
      `SELECT c.id, c.description, c.icon, c.color, c.is_clean, cat.name as category
       FROM clothing_items c
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.user_id = ?
       ORDER BY cat.name, c.created_at DESC`,
      [req.user.id]
    );
    
    // Organize items by category
    const organizedItems = {
      tops: [],
      bottoms: [],
      accessories: [],
      shoes: []
    };
    
    // Map database items to frontend format
    items.forEach(item => {
      if (organizedItems[item.category]) {
        organizedItems[item.category].push({
          id: item.id,
          description: item.description,
          icon: item.icon,
          color: item.color,
          clean: item.is_clean
        });
      }
    });
    
    res.status(200).json({
      success: true,
      data: organizedItems
    });
  } catch (error) {
    console.error('Get all clothing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clothing items',
      error: error.message
    });
  }
};

// Add a new clothing item
exports.addClothing = async (req, res) => {
  const { categoryName, description, icon, color } = req.body;
  
  try {
    // Get category ID
    const [categories] = await db.query(
      'SELECT id FROM categories WHERE name = ?',
      [categoryName]
    );
    
    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    const categoryId = categories[0].id;
    
    // Insert clothing item
    const [result] = await db.query(
      `INSERT INTO clothing_items 
       (user_id, category_id, description, icon, color, is_clean)
       VALUES (?, ?, ?, ?, ?, true)`,
      [req.user.id, categoryId, description, icon, color]
    );
    
    // Get the created item
    const [newItems] = await db.query(
      `SELECT c.id, c.description, c.icon, c.color, c.is_clean, cat.name as category
       FROM clothing_items c
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = ?`,
      [result.insertId]
    );
    
    if (newItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Error retrieving created item'
      });
    }
    
    const newItem = {
      id: newItems[0].id,
      description: newItems[0].description,
      icon: newItems[0].icon,
      color: newItems[0].color,
      clean: newItems[0].is_clean,
      category: newItems[0].category
    };
    
    res.status(201).json({
      success: true,
      message: 'Clothing item added successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Add clothing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding clothing item',
      error: error.message
    });
  }
};

// Delete a clothing item
exports.deleteClothing = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if item exists and belongs to the user
    const [items] = await db.query(
      'SELECT * FROM clothing_items WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found or not authorized'
      });
    }
    
    // Delete item
    await db.query(
      'DELETE FROM clothing_items WHERE id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Clothing item deleted successfully'
    });
  } catch (error) {
    console.error('Delete clothing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting clothing item',
      error: error.message
    });
  }
};

// Update clothing status (clean/dirty)
exports.updateClothingStatus = async (req, res) => {
  const { id } = req.params;
  const { isClean } = req.body;
  
  try {
    // Check if item exists and belongs to the user
    const [items] = await db.query(
      'SELECT * FROM clothing_items WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Clothing item not found or not authorized'
      });
    }
    
    // Update item status
    await db.query(
      'UPDATE clothing_items SET is_clean = ? WHERE id = ?',
      [isClean, id]
    );
    
    res.status(200).json({
      success: true,
      message: `Clothing item marked as ${isClean ? 'clean' : 'dirty'}`
    });
  } catch (error) {
    console.error('Update clothing status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating clothing status',
      error: error.message
    });
  }
};

// Mark all clothing as clean
exports.cleanAllClothing = async (req, res) => {
  try {
    // Update all items for this user
    await db.query(
      'UPDATE clothing_items SET is_clean = true WHERE user_id = ?',
      [req.user.id]
    );
    
    res.status(200).json({
      success: true,
      message: 'All clothing items marked as clean'
    });
  } catch (error) {
    console.error('Clean all clothing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning all clothing',
      error: error.message
    });
  }
};