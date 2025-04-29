// src/components/Closet/Closet.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCloset } from '../../contexts/ClosetContext';
import Sidebar from '../Layout/Sidebar';
import ClothingItem from './ClothingItem';
import AddClothingForm from './AddClothingForm';
import OutfitDisplay from './OutfitDisplay';

const Closet = () => {
  const { user } = useAuth();
  const { 
    closet, 
    currentOutfit, 
    loading, 
    error, 
    fetchAllClothing, 
    removeClothing, 
    updateClothingStatus, 
    cleanAllClothing,
    getRandomOutfit
  } = useCloset();
  
  // UI state
  const [showDropdowns, setShowDropdowns] = useState({
    tops: false,
    bottoms: false,
    accessories: false,
    shoes: false
  });
  const [showAddClothingForm, setShowAddClothingForm] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [makeDirtyMode, setMakeDirtyMode] = useState(false);
  const [selectingOutfit, setSelectingOutfit] = useState(false);
  const [selectedItems, setSelectedItems] = useState({
    tops: [],
    bottoms: [],
    accessories: [],
    shoes: []
  });
  
  // Load data on component mount
  useEffect(() => {
    fetchAllClothing();
  }, [fetchAllClothing]);
  
  // Toggle dropdowns
  const toggleDropdown = (category) => {
    setShowDropdowns(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Handle clothing selection for outfits
  const handleSelectItem = (item, category) => {
    if (!selectingOutfit) return;
    
    // Check if item is already selected
    const isSelected = selectedItems[category].some(
      selectedItem => selectedItem.id === item.id
    );
    
    if (isSelected) {
      // Remove item from selection
      setSelectedItems(prev => ({
        ...prev,
        [category]: prev[category].filter(
          selectedItem => selectedItem.id !== item.id
        )
      }));
    } else {
      // Add item to selection
      setSelectedItems(prev => ({
        ...prev,
        [category]: [...prev[category], item]
      }));
    }
  };
  
  // Handle clothing removal
  const handleRemoveItem = async (id, category) => {
    if (!removeMode) return;
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeClothing(id, category);
    }
  };
  
  // Handle marking item as dirty
  const handleMarkDirty = async (id, category) => {
    if (!makeDirtyMode) return;
    await updateClothingStatus(id, category, false);
  };
  
  // Render clothing items
  const renderClothingItems = (category, isClean) => {
    const items = closet[category].filter(item => item.clean === isClean);
    
    if (items.length === 0) {
      return (
        <p className="empty-message">
          No {isClean ? 'clean' : 'dirty'} {category} found
        </p>
      );
    }
    
    return (
      <div className="dropdown-content">
        {items.map(item => (
          <ClothingItem
            key={item.id}
            item={item}
            category={category}
            isSelected={
              selectingOutfit && 
              selectedItems[category].some(selectedItem => selectedItem.id === item.id)
            }
            removeMode={removeMode}
            dirtyMode={makeDirtyMode}
            selectingMode={selectingOutfit}
            onSelect={() => handleSelectItem(item, category)}
            onRemove={() => handleRemoveItem(item.id, category)}
            onMarkDirty={() => handleMarkDirty(item.id, category)}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="container">
      {/* Sidebar */}
      <Sidebar
        username={user?.username}
        showAddClothingForm={showAddClothingForm}
        setShowAddClothingForm={setShowAddClothingForm}
        removeMode={removeMode}
        setRemoveMode={setRemoveMode}
        makeDirtyMode={makeDirtyMode}
        setMakeDirtyMode={setMakeDirtyMode}
        selectingOutfit={selectingOutfit}
        setSelectingOutfit={setSelectingOutfit}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        cleanAllClothing={cleanAllClothing}
        getRandomOutfit={getRandomOutfit}
      />
      
      {/* Add Clothing Form */}
      {showAddClothingForm && (
        <AddClothingForm 
          onClose={() => setShowAddClothingForm(false)} 
        />
      )}
      
      {/* Main Closet Area */}
      <div className="closet">
        <div className="closet-title">
          <span>My Digital Closet</span>
        </div>
        
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading your closet...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchAllClothing}>Retry</button>
          </div>
        )}
        
        {/* Outfit Display */}
        {currentOutfit && (
          <OutfitDisplay 
            outfit={currentOutfit} 
            onClose={() => setCurrentOutfit(null)} 
          />
        )}
        
        {/* Clothing Categories */}
        <div className="dropdown">
          <button onClick={() => toggleDropdown('tops')}>
            Tops {showDropdowns.tops ? '▲' : '▼'}
          </button>
          {showDropdowns.tops && (
            <>
              <h3>Clean</h3>
              {renderClothingItems('tops', true)}
              <h3>Dirty</h3>
              {renderClothingItems('tops', false)}
            </>
          )}
        </div>
        
        <div className="dropdown">
          <button onClick={() => toggleDropdown('bottoms')}>
            Bottoms {showDropdowns.bottoms ? '▲' : '▼'}
          </button>
          {showDropdowns.bottoms && (
            <>
              <h3>Clean</h3>
              {renderClothingItems('bottoms', true)}
              <h3>Dirty</h3>
              {renderClothingItems('bottoms', false)}
            </>
          )}
        </div>
        
        <div className="dropdown">
          <button onClick={() => toggleDropdown('accessories')}>
            Accessories {showDropdowns.accessories ? '▲' : '▼'}
          </button>
          {showDropdowns.accessories && (
            <>
              <h3>Clean</h3>
              {renderClothingItems('accessories', true)}
              <h3>Dirty</h3>
              {renderClothingItems('accessories', false)}
            </>
          )}
        </div>
        
        <div className="dropdown">
          <button onClick={() => toggleDropdown('shoes')}>
            Shoes {showDropdowns.shoes ? '▲' : '▼'}
          </button>
          {showDropdowns.shoes && (
            <>
              <h3>Clean</h3>
              {renderClothingItems('shoes', true)}
              <h3>Dirty</h3>
              {renderClothingItems('shoes', false)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Closet;