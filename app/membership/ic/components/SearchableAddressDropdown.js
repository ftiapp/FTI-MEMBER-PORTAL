'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * คอมโพเนนต์ dropdown สำหรับค้นหาที่อยู่ (ตำบล) และ auto-fill ข้อมูลที่เกี่ยวข้อง
 * @param {Object} props
 * @param {string} props.value ค่าที่เลือก
 * @param {Function} props.onChange ฟังก์ชันที่ถูกเรียกเมื่อมีการเปลี่ยนแปลงค่า
 * @param {Function} props.onAddressSelect ฟังก์ชันที่ถูกเรียกเมื่อเลือกที่อยู่
 * @param {string} props.placeholder ข้อความที่แสดงเมื่อไม่มีค่า
 * @param {boolean} props.isLoading กำลังโหลดข้อมูลหรือไม่
 * @param {string} props.error ข้อความแสดงข้อผิดพลาด
 */
export default function SearchableAddressDropdown({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'ค้นหาตำบล/แขวง',
  isLoading = false,
  error
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);

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

  // Search function without debounce
  const searchAddresses = async (searchValue) => {
    if (!searchValue || searchValue.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/address?subDistrict=${encodeURIComponent(searchValue)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data || []);
        setIsOpen(data && data.length > 0);
      } else {
        console.error('Error fetching address data');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching address data:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Effect to search when value changes (without debounce)
  useEffect(() => {
    if (!value || value.length < 2) {
      setSearchResults([]);
      return;
    }

    // Search immediately without debounce
    searchAddresses(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    onChange(address.subdistrict);
    onAddressSelect(address);
    setIsOpen(false);
  };

  // Lazy load results only when dropdown is open
  const renderResults = () => {
    if (!isOpen) return null;
    
    if (isSearching) {
      return (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center">
          <div className="flex justify-center items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>กำลังค้นหา...</span>
          </div>
        </div>
      );
    }
    
    if (value && value.length >= 2 && searchResults.length === 0) {
      return (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          ไม่พบข้อมูลที่อยู่
        </div>
      );
    }
    
    if (searchResults.length > 0) {
      return (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((address, index) => (
            <div
              key={`${address.subdistrict}-${address.district}-${address.province}-${address.postalCode}-${index}`}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleAddressSelect(address)}
            >
              <div className="font-medium">{address.subdistrict}</div>
              <div className="text-sm text-gray-600">
                {address.district}, {address.province} {address.postalCode}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          onFocus={() => value && value.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-lg focus:ring-blue-500 focus:border-blue-500`}
          disabled={isLoading}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Lazy loaded dropdown results */}
      {renderResults()}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

SearchableAddressDropdown.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onAddressSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};
