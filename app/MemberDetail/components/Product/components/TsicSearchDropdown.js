'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaSpinner, FaInfoCircle } from 'react-icons/fa';

/**
 * Dropdown component for searching and selecting TSIC codes
 * with built-in category validation
 */
const TsicSearchDropdown = ({ 
  placeholder = 'ค้นหา TSIC CODE หรือคำอธิบาย...', 
  fetchSuggestions, 
  onSelect, 
  disabled = false,
  categoryCode = null // Add categoryCode prop to ensure TSIC codes match their categories
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch suggestions when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      handleSearch(searchTerm);
    }
  }, [isOpen, searchTerm]);
  
  const handleSearch = async (query) => {
    if (disabled) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Pass the categoryCode to ensure we only get TSIC codes for this category
      const results = await fetchSuggestions(query, categoryCode);
      
      // Verify that all results have the correct category_code
      const validResults = results.filter(item => {
        // If no categoryCode is provided, accept all results
        if (!categoryCode) return true;
        
        // Otherwise, ensure the item's category matches
        const itemCategoryCode = item.category_code || item.categoryCode;
        return itemCategoryCode === categoryCode;
      });
      
      if (validResults.length < results.length) {
        console.warn(`Filtered out ${results.length - validResults.length} TSIC codes with incorrect categories`);
      }
      
      setSuggestions(validResults || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSelectItem = (item) => {
    // Ensure the item has the correct category information
    const enrichedItem = {
      ...item,
      // Ensure consistent property naming
      tsic_code: item.tsic_code || item.code,
      tsic_description: item.tsic_description || item.description,
      category_code: categoryCode || item.category_code,
    };
    
    onSelect(enrichedItem);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`flex items-center border rounded p-2 cursor-pointer ${disabled ? 'bg-gray-100 text-gray-500' : 'hover:border-blue-500'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <FaSearch className="text-gray-400 mr-2" />
        <input 
          type="text" 
          className={`w-full outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => !disabled && setIsOpen(true)}
          disabled={disabled}
        />
      </div>
      
      {isOpen && (
        <div className="fixed z-[9999] w-full bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto" 
          style={{ 
            width: dropdownRef.current ? dropdownRef.current.offsetWidth + 'px' : '100%',
            left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left + 'px' : '0',
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 5 + 'px' : '0'
          }}>
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <FaSpinner className="animate-spin inline mr-2" />
              กำลังโหลด...
            </div>
          ) : error ? (
            <div className="p-3 text-center text-red-500">
              {error}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              {searchTerm.length > 0 ? 'ไม่พบผลลัพธ์' : 'พิมพ์เพื่อค้นหาหรือเลือกจากรายการ'}
            </div>
          ) : (
            <>
              {categoryCode && (
                <div className="p-2 bg-blue-50 text-blue-700 text-sm flex items-center">
                  <FaInfoCircle className="mr-1" />
                  <span>แสดงเฉพาะรหัส TSIC ที่อยู่ในหมวดหมู่ {categoryCode} เท่านั้น</span>
                </div>
              )}
              <ul className="max-h-80 overflow-y-auto">
                {suggestions.map((item, index) => (
                  <li 
                    key={index} 
                    className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="font-medium">{item.tsic_code || item.code}</div>
                    <div className="text-sm text-gray-600">{item.tsic_description || item.description}</div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TsicSearchDropdown;
