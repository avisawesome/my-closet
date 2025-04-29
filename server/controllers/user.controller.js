// controllers/user.controller.js
const bcrypt = require('bcryptjs');
const db = require('../config/db.config');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Get user details (excluding password)
    const [users] = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get clothing and outfit counts
    const [clothingCount] = await db.query(
      'SELECT COUNT(*) as count FROM clothing_items WHERE user_id = ?',
      [req.user.id]
    );
    
    const [outfitCount] = await db.query(
      'SELECT COUNT(*) as count FROM outfits WHERE user_id = ?',
      [req.user.id]
    );
    
    res.status(200).json({
      success: true,
      data: {
        ...users[0],
        stats: {
          clothingCount: clothingCount[0].count,
          outfitCount: outfitCount[0].count
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const { username, email } = req.body;
  
  try {
    // Check if username or email is already taken by another user
    if (username || email) {
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || '', email || '', req.user.id]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }
    }
    
    // Update user details
    const updateFields = [];
    const updateValues = [];
    
    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, req.user.id]
    );
    
    // Get updated user
    const [users] = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: users[0]
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    // Get current user with password
    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    // Delete user (cascade will delete related data)
    await db.query(
      'DELETE FROM users WHERE id = ?',
      [req.user.id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};