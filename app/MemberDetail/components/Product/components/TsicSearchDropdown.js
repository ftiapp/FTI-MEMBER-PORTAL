'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';

/**
 * Dropdown search component for TSIC codes
 * Allows searching and selecting TSIC codes from a dropdown
 */
const TsicSearchDropdown = ({ 
  placeholder = 'ค้นหา TSIC CODE หรือคำอธิบาย...',
  onSelect,
  fetchSuggestions,
  initialValue = '',
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  // Load suggestions when dropdown is opened
  const loadSuggestions = async (query = '') => {
    if (disabled) return;
    
    setLoading(true);
    try {
      const results = await fetchSuggestions(query);
      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search input change
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputValue(value);
    loadSuggestions(value);
  };

  // Handle selecting an item from dropdown
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setInputValue(item.label || item.name || item.code || '');
    setShowDropdown(false);
    if (onSelect) {
      onSelect(item);
    }
  };

  // Clear selected item
  const handleClear = () => {
    setSelectedItem(null);
    setInputValue('');
    if (onSelect) {
      onSelect(null);
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    if (!disabled) {
      const newDropdownState = !showDropdown;
      setShowDropdown(newDropdownState);
      if (newDropdownState) {
        // Load all suggestions when dropdown is opened
        loadSuggestions(inputValue);
      }
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <div className="flex items-center border rounded-md overflow-hidden">
          <div 
            className={`flex-grow flex items-center px-3 py-2 ${disabled ? 'bg-gray-100' : 'bg-white'}`}
            onClick={toggleDropdown}
          >
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              className={`w-full outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => {
                setShowDropdown(true);
                loadSuggestions(inputValue);
              }}
              disabled={disabled}
            />
          </div>
          {inputValue && (
            <button
              className="px-2 text-gray-400 hover:text-gray-600"
              onClick={handleClear}
              disabled={disabled}
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        {loading && (
          <div className="absolute right-10 top-2.5">
            <FaSpinner className="animate-spin text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Dropdown menu */}
      {showDropdown && (
        <div className="fixed z-[9999] w-full mt-1 bg-white border rounded-md shadow-lg overflow-auto" 
          style={{ 
            maxHeight: '400px', 
            width: wrapperRef.current ? wrapperRef.current.offsetWidth + 'px' : '100%',
            left: wrapperRef.current ? wrapperRef.current.getBoundingClientRect().left + 'px' : '0',
            top: wrapperRef.current ? wrapperRef.current.getBoundingClientRect().bottom + 5 + 'px' : '0'
          }}>
          {suggestions.length > 0 ? (
            suggestions.map((item, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                onClick={() => handleSelectItem(item)}
              >
                <div className="font-medium">{item.tsic_code || item.code}</div>
                <div className="text-sm text-gray-600">{item.tsic_description || item.description}</div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">
              {inputValue.length >= 2 ? 'ไม่พบข้อมูลที่ตรงกับการค้นหา' : 'พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TsicSearchDropdown;
