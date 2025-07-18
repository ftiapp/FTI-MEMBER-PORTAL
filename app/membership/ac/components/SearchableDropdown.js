'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * SearchableDropdown ที่แก้ไขปัญหา cursor หลุดแล้ว (Version สำหรับ OC)
 */
export default function SearchableDropdown({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  fetchOptions,
  isRequired,
  isReadOnly,
  error,
  className,
  autoFillNote
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeout = useRef(null);
  const isInternalUpdate = useRef(false);

  // 🔧 FIX: Sync searchTerm with value prop changes (เหมือน AC)
  useEffect(() => {
    if (!isInternalUpdate.current) {
      setSearchTerm(value || '');
    }
    isInternalUpdate.current = false;
  }, [value]);

  // Debounce search term
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  // 🔧 FIX: Memoize fetchData
  const fetchData = useCallback(async () => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await fetchOptions(debouncedSearchTerm);
      const validResults = Array.isArray(results) 
        ? results.filter(opt => opt && (opt.text !== undefined && opt.text !== null)) 
        : [];
      if (validResults.length < (results || []).length) {
        console.warn('Some options were filtered out due to missing text property');
      }
      setOptions(validResults);
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, fetchOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 🔧 FIX: Memoize handlers
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    isInternalUpdate.current = true;
    setSearchTerm(newValue);
    onChange(newValue);
    
    if (newValue.trim() === '') {
      setOptions([]);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [onChange]);

  const handleFocus = useCallback(() => {
    if (searchTerm.length >= 2) {
      setIsOpen(true);
    }
  }, [searchTerm.length]);

  const handleOptionSelect = useCallback((option) => {
    if (!option || option.text === undefined || option.text === null) {
      console.warn('Invalid option selected:', option);
      return;
    }
    
    isInternalUpdate.current = true;
    setSearchTerm(option.text);
    onChange(option.text);
    
    if (onSelect) {
      onSelect(option);
    }
    
    setIsOpen(false);
    
    // 🔧 FIX: Restore focus after selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, [onChange, onSelect]);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className={`relative ${className || ''}`}>
        <input
          ref={inputRef} // 🔧 FIX: Add ref
          type="text"
          value={searchTerm} // 🔧 FIX: ใช้ searchTerm แทน value
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder || ''}
          className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'} ${isReadOnly ? 'bg-gray-100' : ''}`}
          readOnly={isReadOnly}
          required={isRequired}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-2">
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      
      {error && <p className="text-red-500 text-xs mt-1 error-message">{error}</p>}
      
      {autoFillNote && value && (
        <p className="text-xs text-blue-600 mt-1">{autoFillNote}</p>
      )}
      
      {isOpen && options.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleOptionSelect(option)}
            >
              {option && option.text ? option.text : 'ไม่ระบุ'}
              {option && option.subText && (
                <span className="text-xs text-gray-500 block">{option.subText}</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {isOpen && debouncedSearchTerm && options.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
          ไม่พบข้อมูล
        </div>
      )}
    </div>
  );
}