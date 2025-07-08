'use client';

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export default function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder,
  isLoading,
  label,
  error
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);

  // Initialize filtered options when component mounts or options change
  useEffect(() => {
    if (Array.isArray(options)) {
      setFilteredOptions(options);
    }
  }, [options]);

  // Filter options based on search term with debounce
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (!Array.isArray(options)) return;
      
      if (!searchTerm) {
        setFilteredOptions(options);
      } else {
        const filtered = options.filter(option => 
          option.name_th?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, options]);

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

  // Toggle selection of an option
  const toggleOption = (optionId) => {
    let newSelectedValues;
    
    if (selectedValues.includes(optionId)) {
      newSelectedValues = selectedValues.filter(id => id !== optionId);
    } else {
      newSelectedValues = [...selectedValues, optionId];
    }
    
    onChange(newSelectedValues);
  };

  // Get selected options names for display
  const getSelectedOptionsText = () => {
    if (!Array.isArray(options) || selectedValues.length === 0) return placeholder;
    
    if (selectedValues.length === 1) {
      const selected = options.find(opt => opt.id === selectedValues[0]);
      return selected ? selected.name_th : placeholder;
    }
    
    return `เลือกแล้ว ${selectedValues.length} รายการ`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div 
        className={`flex items-center justify-between w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md cursor-pointer bg-white`}
        onClick={() => !isLoading && setIsOpen(!isOpen)}
      >
        <div className="flex-grow truncate">
          {isLoading ? 'กำลังโหลดข้อมูล...' : getSelectedOptionsText()}
        </div>
        <div className="ml-2">
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg 
              className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหา..."
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div 
                  key={option.id} 
                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    selectedValues.includes(option.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleOption(option.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">{option.name_th}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">ไม่พบข้อมูล</div>
            )}
          </div>
          
          {selectedValues.length > 0 && (
            <div className="p-2 border-t flex justify-between items-center">
              <span className="text-xs text-blue-600">เลือกแล้ว {selectedValues.length} รายการ</span>
              <button
                className="text-xs text-red-600 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                ล้างการเลือก
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

MultiSelectDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name_th: PropTypes.string.isRequired
    })
  ),
  selectedValues: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isLoading: PropTypes.bool,
  label: PropTypes.string,
  error: PropTypes.string
};

MultiSelectDropdown.defaultProps = {
  placeholder: 'เลือกรายการ',
  isLoading: false,
  selectedValues: [],
  options: []
};
