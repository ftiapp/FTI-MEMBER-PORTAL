'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaSpinner, FaTimes, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { useDebounce } from './utils';

export default function AutocompleteMultiSearch({ 
  placeholder, 
  fetchSuggestions, 
  value, 
  onChange, 
  getOptionLabel, 
  maxSelections 
}) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  
  const debouncedInputValue = useDebounce(inputValue, 300);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  // Fetch suggestions when input changes or when dropdown is opened
  useEffect(() => {
    async function fetchData() {
      // Always fetch suggestions when showSuggestions is true, even if input is empty
      if (!showSuggestions) {
        return;
      }
      
      // Only apply length check if we're typing (not on initial click)
      if (debouncedInputValue.length < 2 && inputValue !== '' && inputValue.length > 0) {
        return;
      }

      setLoading(true);
      try {
        // Always pass empty string when dropdown is first opened (to get all results)
        const query = showSuggestions && inputValue === '' ? '' : debouncedInputValue;
        const results = await fetchSuggestions(query);
        
        // Check if we got results
        if (!results || results.length === 0) {
          console.log('No results returned from fetchSuggestions');
          setSuggestions([]);
          setLoading(false);
          return;
        }
        
        // Filter out already selected items
        const filteredResults = results.filter(
          (item) => !value.some((v) => 
            (v.tsic_code && item.tsic_code && v.tsic_code === item.tsic_code) || 
            (v.id && item.id && v.id === item.id) || 
            (v.category_code && item.category_code && v.category_code === item.category_code)
          )
        );
        
        console.log(`Filtered ${results.length} results to ${filteredResults.length} items`);
        setSuggestions(filteredResults);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [debouncedInputValue, fetchSuggestions, value, showSuggestions, inputValue]);

  const handleRemoveItem = (index) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleAddItem = (item) => {
    if (value.length < maxSelections) {
      onChange([...value, item]);
      setInputValue('');
      setSuggestions([]);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Selected items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((item, index) => (
            <div 
              key={index} 
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center text-sm"
            >
              <span className="mr-1">{getOptionLabel(item)}</span>
              <button 
                className="text-blue-600 hover:text-blue-800"
                onClick={() => handleRemoveItem(index)}
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder={value.length >= maxSelections ? `จำกัดสูงสุด ${maxSelections} รายการ` : placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          disabled={value.length >= maxSelections}
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <FaSpinner className="animate-spin text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
          {loading ? (
            <li className="px-3 py-2 text-center">
              <FaSpinner className="animate-spin text-gray-400 inline-block mr-2" />
              กำลังโหลดข้อมูล...
            </li>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                onClick={() => {
                  handleAddItem(suggestion);
                  setShowSuggestions(false);
                }}
              >
                <span>{getOptionLabel(suggestion)}</span>
                <FaPlus className="text-blue-500" />
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500 text-center">
              {value.length >= maxSelections 
                ? `คุณได้เลือกจำนวนสูงสุดที่อนุญาตแล้ว (${maxSelections} รายการ)` 
                : 'ไม่พบข้อมูลที่ตรงกับการค้นหา'}
            </li>
          )}
        </ul>
      )}

      {/* Max selections warning */}
      {value.length >= maxSelections && (
        <p className="text-yellow-600 text-xs mt-1 flex items-center">
          <FaExclamationTriangle className="mr-1" />
          คุณได้เลือกจำนวนสูงสุดที่อนุญาตแล้ว ({maxSelections} รายการ)
        </p>
      )}
    </div>
  );
}