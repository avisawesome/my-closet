// src/contexts/ClosetContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Create context
const ClosetContext = createContext();

// Provider component
export const ClosetProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  
  // State for clothing items
  const [closet, setCloset] = useState({
    tops: [],
    bottoms: [],
    accessories: [],
    shoes: []
  });
  
  // State for outfits
  const [outfits, setOutfits] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentOutfit, setCurrentOutfit] = useState(null);
  
  // Load clothing data on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllClothing();
      fetchAllOutfits();
    } else {
      // Reset state when logged out
      setCloset({
        tops: [],
        bottoms: [],
        accessories: [],
        shoes: []
      });
      setOutfits([]);
      setCurrentOutfit(null);
    }
  }, [isAuthenticated]);
  
  // Fetch all clothing items
  const fetchAllClothing = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/clothing');
      setCloset(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch clothing items');
      console.error('Error fetching clothing:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all outfits
  const fetchAllOutfits = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/outfits');
      setOutfits(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch outfits');
      console.error('Error fetching outfits:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add clothing item
  const addClothing = async (categoryName, description, icon, color) => {
    try {
      setLoading(true);
      const response = await axios.post('/clothing', {
        categoryName,
        description,
        icon,
        color
      });
      
      const newItem = response.data.data;
      
      // Update closet state
      setCloset(prevCloset => ({
        ...prevCloset,
        [categoryName]: [...prevCloset[categoryName], {
          id: newItem.id,
          description: newItem.description,
          icon: newItem.icon,
          color: newItem.color,
          clean: newItem.clean
        }]
      }));
      
      setError(null);
      return { success: true, data: newItem };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add clothing item');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to add clothing item' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Remove clothing item
  const removeClothing = async (id, category) => {
    try {
      setLoading(true);
      await axios.delete(`/clothing/${id}`);
      
      // Update closet state
      setCloset(prevCloset => ({
        ...prevCloset,
        [category]: prevCloset[category].filter(item => item.id !== id)
      }));
      
      setError(null);
      return { success: true, message: 'Clothing item removed successfully' };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove clothing item');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to remove clothing item' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Update clothing status (clean/dirty)
  const updateClothingStatus = async (id, category, isClean) => {
    try {
      setLoading(true);
      await axios.patch(`/clothing/${id}/status`, { isClean });
      
      // Update closet state
      setCloset(prevCloset => ({
        ...prevCloset,
        [category]: prevCloset[category].map(item => 
          item.id === id ? { ...item, clean: isClean } : item
        )
      }));
      
      setError(null);
      return { 
        success: true, 
        message: `Item marked as ${isClean ? 'clean' : 'dirty'}` 
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update clothing status');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update clothing status' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Mark all clothing as clean
  const cleanAllClothing = async () => {
    try {
      setLoading(true);
      await axios.patch('/clothing/clean-all');
      
      // Update closet state
      setCloset(prevCloset => {
        const updatedCloset = {};
        Object.keys(prevCloset).forEach(category => {
          updatedCloset[category] = prevCloset[category].map(item => ({
            ...item,
            clean: true
          }));
        });
        return updatedCloset;
      });
      
      setError(null);
      return { success: true, message: 'All clothing marked as clean' };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clean all clothing');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to clean all clothing' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new outfit
  const createOutfit = async (name, items) => {
    try {
      setLoading(true);
      const response = await axios.post('/outfits', { name, items });
      
      // Add to outfits state
      setOutfits(prevOutfits => [...prevOutfits, response.data.data]);
      
      setError(null);
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create outfit');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to create outfit' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Delete an outfit
  const deleteOutfit = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/outfits/${id}`);
      
      // Update outfits state
      setOutfits(prevOutfits => prevOutfits.filter(outfit => outfit.id !== id));
      
      setError(null);
      return { success: true, message: 'Outfit deleted successfully' };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete outfit');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to delete outfit' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Get a random outfit
  const getRandomOutfit = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/outfits/random');
      setCurrentOutfit(response.data.data);
      setError(null);
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get random outfit');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to get random outfit' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    closet,
    outfits,
    currentOutfit,
    loading,
    error,
    setCurrentOutfit,
    fetchAllClothing,
    fetchAllOutfits,
    addClothing,
    removeClothing,
    updateClothingStatus,
    cleanAllClothing,
    createOutfit,
    deleteOutfit,
    getRandomOutfit
  };
  
  return <ClosetContext.Provider value={value}>{children}</ClosetContext.Provider>;
};

// Custom hook to use the closet context
export const useCloset = () => {
  const context = useContext(ClosetContext);
  if (!context) {
    throw new Error('useCloset must be used within a ClosetProvider');
  }
  return context;
};

export default ClosetContext;