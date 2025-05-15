'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { fetchTsicSuggestions } from './api';

/**
 * Component for searching TSIC codes by description
 */
const TsicSearchInput = ({ categoryCode, onSelect, disabled }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!categoryCode || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await fetchTsicSuggestions(query, categoryCode);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error('Error fetching TSIC suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, categoryCode]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSelectSuggestion = (suggestion) => {
    onSelect(suggestion);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full border px-3 py-2 pr-10 rounded"
          placeholder="พิมพ์เพื่อค้นหา TSIC code..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          disabled={disabled}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <FaSpinner className="animate-spin text-gray-400" />
          ) : (
            <FaSearch className="text-gray-400" />
          )}
        </div>
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <div className="font-medium">{suggestion.tsic_code}</div>
              <div className="text-sm text-gray-600">{suggestion.description}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TsicSearchInput;