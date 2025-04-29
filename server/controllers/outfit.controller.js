// controllers/outfit.controller.js
const db = require('../config/db.config');

// Get all outfits for a user
exports.getAllOutfits = async (req, res) => {
  try {
    // Get all outfits for the authenticated user
    const [outfits] = await db.query(
      `SELECT id, name, created_at 
       FROM outfits 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    
    // Get all outfit items and organize by outfit
    const outfitItems = [];
    
    for (const outfit of outfits) {
      // Get items associated with this outfit
      const [items] = await db.query(
        `SELECT c.id, c.description, c.icon, c.color, c.is_clean, cat.name as category
         FROM outfit_items oi
         JOIN clothing_items c ON oi.clothing_item_id = c.id
         JOIN categories cat ON c.category_id = cat.id
         WHERE oi.outfit_id = ?
         ORDER BY cat.name`,
        [outfit.id]
      );
      
      // Organize items by category
      const organizedItems = {
        tops: [],
        bottoms: [],
        accessories: [],
        shoes: []
      };
      
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
      
      outfitItems.push({
        id: outfit.id,
        name: outfit.name || `Outfit ${outfit.id}`,
        items: organizedItems,
        createdAt: outfit.created_at
      });
    }
    
    res.status(200).json({
      success: true,
      data: outfitItems
    });
  } catch (error) {
    console.error('Get all outfits error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching outfits',
      error: error.message
    });
  }
};

// Create a new outfit
exports.createOutfit = async (req, res) => {
  const { name, items } = req.body;
  
  // Validate input
  if (!items || Object.keys(items).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one clothing item is required'
    });
  }
  
  // Start a transaction
  let connection;
  
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    
    // Insert outfit
    const [outfitResult] = await connection.query(
      'INSERT INTO outfits (user_id, name) VALUES (?, ?)',
      [req.user.id, name || null]
    );
    
    const outfitId = outfitResult.insertId;
    
    // Insert outfit items
    for (const category in items) {
      if (Array.isArray(items[category])) {
        for (const itemData of items[category]) {
          // Check if item exists and belongs to user
          const [existingItems] = await connection.query(
            'SELECT id FROM clothing_items WHERE id = ? AND user_id = ?',
            [itemData.id, req.user.id]
          );
          
          if (existingItems.length > 0) {
            await connection.query(
              'INSERT INTO outfit_items (outfit_id, clothing_item_id) VALUES (?, ?)',
              [outfitId, existingItems[0].id]
            );
          }
        }
      }
    }
    
    // Commit transaction
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Outfit created successfully',
      data: {
        id: outfitId,
        name: name || `Outfit ${outfitId}`,
        items
      }
    });
  } catch (error) {
    // Rollback transaction on error
    if (connection) {
      await connection.rollback();
    }
    
    console.error('Create outfit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating outfit',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Get a random clean outfit
exports.getRandomOutfit = async (req, res) => {
  try {
    // Get all outfits for the authenticated user
    const [outfits] = await db.query(
      `SELECT id FROM outfits WHERE user_id = ?`,
      [req.user.id]
    );
    
    if (outfits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No outfits found'
      });
    }
    
    // Filter for outfits with only clean clothes
    const cleanOutfits = [];
    
    for (const outfit of outfits) {
      // Check if all items in this outfit are clean
      const [dirtyItems] = await db.query(
        `SELECT COUNT(*) as count
         FROM outfit_items oi
         JOIN clothing_items c ON oi.clothing_item_id = c.id
         WHERE oi.outfit_id = ? AND c.is_clean = false`,
        [outfit.id]
      );
      
      if (dirtyItems[0].count === 0) {
        cleanOutfits.push(outfit.id);
      }
    }
    
    if (cleanOutfits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No clean outfits available'
      });
    }
    
    // Select a random clean outfit
    const randomIndex = Math.floor(Math.random() * cleanOutfits.length);
    const randomOutfitId = cleanOutfits[randomIndex];
    
    // Get details of the random outfit
    const [outfitDetails] = await db.query(
      `SELECT id, name, created_at FROM outfits WHERE id = ?`,
      [randomOutfitId]
    );
    
    // Get items for this outfit
    const [items] = await db.query(
      `SELECT c.id, c.description, c.icon, c.color, c.is_clean, cat.name as category
       FROM outfit_items oi
       JOIN clothing_items c ON oi.clothing_item_id = c.id
       JOIN categories cat ON c.category_id = cat.id
       WHERE oi.outfit_id = ?
       ORDER BY cat.name`,
      [randomOutfitId]
    );
    
    // Organize items by category
    const organizedItems = {
      tops: [],
      bottoms: [],
      accessories: [],
      shoes: []
    };
    
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
      data: {
        id: outfitDetails[0].id,
        name: outfitDetails[0].name || `Outfit ${outfitDetails[0].id}`,
        items: organizedItems,
        createdAt: outfitDetails[0].created_at
      }
    });
  } catch (error) {
    console.error('Get random outfit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching random outfit',
      error: error.message
    });
  }
};

// Delete an outfit
exports.deleteOutfit = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if outfit exists and belongs to the user
    const [outfits] = await db.query(
      'SELECT * FROM outfits WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (outfits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found or not authorized'
      });
    }
    
    // Delete outfit (cascade will delete outfit_items)
    await db.query(
      'DELETE FROM outfits WHERE id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Outfit deleted successfully'
    });
  } catch (error) {
    console.error('Delete outfit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting outfit',
      error: error.message
    });
  }
};