// App.js (Frontend Application)
import React, { useState, useEffect } from 'react';
import './App.css';

// Import SVG icons
import beanie from './assets/icons/beanie.svg';
import buttonsleeve from './assets/icons/buttonsleeve.svg';
import buttontee from './assets/icons/buttontee.svg';
import cap from './assets/icons/cap.svg';
import coat from './assets/icons/coat.svg';
import hat from './assets/icons/hat.svg';
import hoodie from './assets/icons/hoodie.svg';
import jacket from './assets/icons/jacket.svg';
import longsleeve from './assets/icons/longsleeve.svg';
import necklace from './assets/icons/necklace.svg';
import pants from './assets/icons/pants.svg';
import puffer from './assets/icons/puffer.svg';
import scarf from './assets/icons/scarf.svg';
import shoes from './assets/icons/shoes.svg';
import shorts from './assets/icons/shorts.svg';
import suit from './assets/icons/suit.svg';
import sunglasses from './assets/icons/sunglasses.svg';
import sweater from './assets/icons/sweater.svg';
import tank from './assets/icons/tank.svg';
import trousers from './assets/icons/trousers.svg';
import tshirt from './assets/icons/tshirt.svg';
import zipper from './assets/icons/zipper.svg';
import hanger from './assets/icons/hanger.svg';

function App() {
  // State for clothing items in the closet
  const [closet, setCloset] = useState({
    tops: [],
    bottoms: [],
    accessories: [],
    shoes: []
  });

  // State for dropdown visibility
  const [showDropdowns, setShowDropdowns] = useState({
    tops: false,
    bottoms: false,
    accessories: false,
    shoes: false
  });

  // State for the add clothing menu
  const [showAddClothingMenu, setShowAddClothingMenu] = useState(false);
  const [clothingType, setClothingType] = useState("tops");
  const [clothingColor, setClothingColor] = useState("");
  const [clothingDescription, setClothingDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(null);
  
  // State for clothing management modes
  const [removeMode, setRemoveMode] = useState(false);
  const [makeDirtyMode, setMakeDirtyMode] = useState(false);
  const [selectingOutfit, setSelectingOutfit] = useState(false);
  
  // State for outfit management
  const [outfits, setOutfits] = useState([]);
  const [currentOutfit, setCurrentOutfit] = useState({
    tops: [],
    bottoms: [],
    accessories: [],
    shoes: []
  });
  const [displayedOutfit, setDisplayedOutfit] = useState(null);

  // Function to add clothing item to the closet
  const handleAddClothing = () => {
    if (!clothingColor || !clothingDescription || !selectedIcon) {
      alert("Please fill out all fields to add clothing");
      return;
    }
    
    const newClothing = {
      icon: selectedIcon,
      color: clothingColor,
      description: clothingDescription,
      clean: true // Default to clean when added
    };
    
    setCloset((prevCloset) => ({
      ...prevCloset,
      [clothingType]: [...prevCloset[clothingType], newClothing],
    }));
    
    // Reset form fields
    setClothingColor('');
    setClothingDescription('');
    setSelectedIcon(null);
  };

  // Function to handle selection of items for an outfit
  const handleSelectOutfitItem = (category, index) => {
    if (!selectingOutfit) return; // Only allow selection in outfit mode
    
    const selectedItem = closet[category][index];
    
    // Check if item is already in the outfit
    const isAlreadySelected = currentOutfit[category].some(
      item => item.description === selectedItem.description && item.color === selectedItem.color
    );
    
    if (isAlreadySelected) {
      // If already selected, remove it
      setCurrentOutfit(prevOutfit => ({
        ...prevOutfit,
        [category]: prevOutfit[category].filter(
          item => !(item.description === selectedItem.description && item.color === selectedItem.color)
        )
      }));
    } else {
      // Add to outfit
      setCurrentOutfit(prevOutfit => ({
        ...prevOutfit,
        [category]: [...prevOutfit[category], selectedItem]
      }));
    }
  };
  
  // Function to remove clothing item
  const handleRemoveClothing = (category, index) => {
    if (!removeMode) return;
    
    setCloset(prevCloset => {
      const updatedCategory = prevCloset[category].filter((_, i) => i !== index);
      return { ...prevCloset, [category]: updatedCategory };
    });
  };

  // Function to mark clothing as dirty
  const handleMakeClothingDirty = (category, index) => {
    if (!makeDirtyMode) return; 
    
    setCloset(prevCloset => {
      const updatedCategory = prevCloset[category].map((item, i) =>
        i === index ? { ...item, clean: false } : item
      );
      return { ...prevCloset, [category]: updatedCategory };
    });
  };

  // Function to clean all clothes
  const makeAllClothesClean = () => {
    setCloset(prevCloset => {
      const updatedCloset = {};
      Object.keys(prevCloset).forEach(category => {
        updatedCloset[category] = prevCloset[category].map(item => ({ ...item, clean: true }));
      });
      return updatedCloset;
    });
  };

  // Function to get a random outfit from saved outfits
  const getRandomOutfit = () => {
    if (outfits.length === 0) {
      alert("No outfits saved yet! Create and save outfits first.");
      return;
    }
    
    // Filter for outfits with only clean clothes
    const cleanOutfits = outfits.filter(outfit =>
      Object.keys(outfit).every(category =>
        outfit[category].every(item => item.clean)
      )
    );
  
    if (cleanOutfits.length === 0) {
      alert("No clean outfits available! Try cleaning your clothes first.");
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * cleanOutfits.length);
    setDisplayedOutfit(cleanOutfits[randomIndex]);
  };  

  // Function to save the current outfit
  const saveOutfit = () => {
    // Check if outfit has at least one item
    const hasItems = Object.values(currentOutfit).some(category => category.length > 0);
    
    if (!hasItems) {
      alert("Please select at least one item for your outfit");
      return;
    }
    
    setOutfits(prevOutfits => [...prevOutfits, {...currentOutfit}]);
    setCurrentOutfit({
      tops: [],
      bottoms: [],
      accessories: [],
      shoes: []
    });
    setSelectingOutfit(false);
    alert("Outfit saved successfully!");
  };

  // Function to render clothing items for a category
  const renderClothingItems = (category, isClean) => {
    const items = closet[category].filter(item => item.clean === isClean);
    
    if (items.length === 0) {
      return <p>No {isClean ? "clean" : "dirty"} items available</p>;
    }
    
    return (
      <div className="dropdown-content">
        {items.map((item, index) => {
          // Get actual index in the full category array
          const actualIndex = closet[category].findIndex(
            clothingItem => 
              clothingItem.description === item.description && 
              clothingItem.color === item.color && 
              clothingItem.clean === isClean
          );
          
          // Check if item is in current outfit
          const isSelected = selectingOutfit && currentOutfit[category].some(
            outfitItem => 
              outfitItem.description === item.description && 
              outfitItem.color === item.color
          );
          
          return (
            <div
              key={index}
              className={`clothing-item 
                ${selectingOutfit ? "selecting-outfit" : ""} 
                ${removeMode ? "remove-mode" : ""} 
                ${makeDirtyMode ? "dirty-mode" : ""}
                ${isSelected ? "selected" : ""}`
              }
              onClick={() => {
                if (selectingOutfit) {
                  handleSelectOutfitItem(category, actualIndex);
                } else if (removeMode) {
                  handleRemoveClothing(category, actualIndex);
                } else if (makeDirtyMode) {
                  handleMakeClothingDirty(category, actualIndex);
                }
              }}
              style={{ 
                position: "relative", 
                cursor: selectingOutfit || makeDirtyMode || removeMode ? "pointer" : "default",
                border: isSelected ? "2px solid blue" : undefined
              }}
              onMouseEnter={e => e.currentTarget.querySelector(".description").style.display = "block"}
              onMouseLeave={e => e.currentTarget.querySelector(".description").style.display = "none"}
            >
              <div
                className="icon"
                style={{
                  backgroundColor: item.color,
                  maskImage: `url(${item.icon})`,
                  WebkitMaskImage: `url(${item.icon})`,
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  width: '50px',
                  height: '50px'
                }}
              ></div>
              <p
                className="description"
                style={{
                  display: "none",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "5px",
                  borderRadius: "5px",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  // Function to render icon options
  const renderIconOptions = (categoryIcons) => (
    <div className="icon-options">
      {categoryIcons.map((icon, index) => (
        <img
          key={index}
          src={icon}
          alt={`icon-${index}`}
          style={{
            width: "50px",
            height: "50px",
            margin: "5px",
            cursor: "pointer",
            border: selectedIcon === icon ? "2px solid blue" : "2px solid transparent"
          }}
          onClick={() => setSelectedIcon(icon)}
        />
      ))}
    </div>
  );

  // Function to toggle dropdown visibility
  const toggleDropdown = (type) => {
    setShowDropdowns(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="container">
      {/* User Details Section */}
      <div className="user-details">
        <div className="user-info-box">
          <p>User: Abhiram Voleti</p>
          <br />
          <button className="logout-button" onClick={() => alert('Logging out...')}>Log Out</button>
        </div>
        
        <div className="feature-buttons">
          {/* Add Clothing Button */}
          <button onClick={() => setShowAddClothingMenu(!showAddClothingMenu)}>
            {showAddClothingMenu ? "Hide Add Menu" : "Add Clothing"}
          </button>
          
          {/* Add Clothing Menu */}
          {showAddClothingMenu && (
            <div className="add-clothing-menu">
              <label>
                Type:
                <select
                  value={clothingType}
                  onChange={(e) => setClothingType(e.target.value)}
                >
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="accessories">Accessories</option>
                  <option value="shoes">Shoes</option>
                </select>
              </label>
              <br />
              
              <label>
                Color:
                <div className="color-options">
                  {["red", "blue", "green", "yellow", "black", "white", "orange", "purple", "pink", "gray", "saddlebrown", "skyblue", "tan"].map((color) => (
                    <div
                      key={color}
                      className="color-swatch"
                      style={{
                        backgroundColor: color,
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        border: clothingColor === color ? "4px solid blue" : "2px solid black",
                        display: "inline-block",
                        margin: "5px",
                        cursor: "pointer",
                      }}
                      onClick={() => setClothingColor(color)}
                    />
                  ))}
                </div>
              </label>
              <br />
              
              <label>
                Icon:
                {renderIconOptions(
                  clothingType === "tops"
                    ? [tshirt, longsleeve, buttontee, buttonsleeve, tank, jacket, hoodie, sweater, zipper, puffer, coat, suit]
                    : clothingType === "bottoms"
                    ? [pants, trousers, shorts]
                    : clothingType === "accessories"
                    ? [beanie, cap, hat, necklace, scarf, sunglasses]
                    : [shoes]
                )}
              </label>
              <br />
              
              <label>
                Description:
                <input
                  type="text"
                  placeholder="Brand or other details"
                  value={clothingDescription}
                  onChange={(e) => setClothingDescription(e.target.value)}
                  style={{ marginLeft: "10px" }}
                />
              </label>
              <br />
              
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={handleAddClothing} style={{ width: "50%" }}>Add</button>
              </div>
            </div>
          )}
          
          {/* Remove Clothing Button */}
          <button onClick={() => {
              setRemoveMode(!removeMode);
              if (!removeMode) {
                setMakeDirtyMode(false);
                setSelectingOutfit(false);
              }
            }}
          >
            {removeMode ? "Done Removing" : "Remove Clothing"}
          </button>
          
          {/* Outfit Selection Button */}
          <button 
            onClick={() => {
              setSelectingOutfit(!selectingOutfit);
              if (!selectingOutfit) {
                setRemoveMode(false);
                setMakeDirtyMode(false);
              } else {
                // Reset current outfit when entering selection mode
                setCurrentOutfit({
                  tops: [],
                  bottoms: [],
                  accessories: [],
                  shoes: []
                });
              }
            }}
          >
            {selectingOutfit ? "Cancel Selection" : "Select Matching Outfit"}
          </button>
          
          {/* Save Outfit Button */}
          {selectingOutfit && (
            <button
              style={{ width: "150px", margin: "10px auto", display: "block" }}
              onClick={saveOutfit}
            >
              Save Outfit
            </button>
          )}
          
          {/* Random Outfit Button */}
          <button onClick={getRandomOutfit}>What Should I Wear Today?</button>
          
          {/* Mark Clothes Dirty Button */}
          <button onClick={() => {
              setMakeDirtyMode(!makeDirtyMode);
              if (!makeDirtyMode) {
                setRemoveMode(false);
                setSelectingOutfit(false);
              }
            }}
          >
            {makeDirtyMode ? "Done Marking" : "Mark Clothes Dirty"}
          </button>
          
          {/* Clean All Clothes Button */}
          <button onClick={makeAllClothesClean}>Clean All Clothes</button>
        </div>
        
        {/* Display Selected Outfit */}
        {displayedOutfit && (
          <div className="selected-outfit">
            <h3>Your Outfit for Today</h3>
            {Object.keys(displayedOutfit).map((category) => {
              if (displayedOutfit[category].length === 0) return null;
              
              return (
                <div key={category} className="outfit-category">
                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                  <div className="outfit-items">
                    {displayedOutfit[category].map((item, index) => (
                      <div key={index} className="clothing-item">
                        <div
                          className="icon"
                          style={{
                            backgroundColor: item.color,
                            maskImage: `url(${item.icon})`,
                            WebkitMaskImage: `url(${item.icon})`,
                            maskSize: "contain",
                            WebkitMaskSize: "contain",
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            width: "50px",
                            height: "50px",
                          }}
                        ></div>
                        <p>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Digital Closet Section */}
      <div className="closet">
        <div className="closet-title">
          {[...Array(5)].map((_, index) => (
            <img key={index} src={hanger} alt="hanger" style={{ width: "30px", marginRight: "5px" }} />
          ))}
          <span style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', color: 'black', display: 'inline-block' }}>My Closet</span>
          {[...Array(5)].map((_, index) => (
            <img key={index} src={hanger} alt="hanger" style={{ width: "30px", marginLeft: "5px" }} />
          ))}
        </div>
        
        {/* Closet Sections */}
        <div className="dropdown">
          <button onClick={() => toggleDropdown('tops')}>Tops</button>
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
          <button onClick={() => toggleDropdown('bottoms')}>Bottoms</button>
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
          <button onClick={() => toggleDropdown('accessories')}>Accessories</button>
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
          <button onClick={() => toggleDropdown('shoes')}>Shoes</button>
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
}

export default App;