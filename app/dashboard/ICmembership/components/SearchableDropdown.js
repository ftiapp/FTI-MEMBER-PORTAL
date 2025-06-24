'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiChevronDown, FiX, FiCheck, FiLoader } from 'react-icons/fi';

export default function SearchableDropdown({
  label,
  placeholder = 'ค้นหา...',
  type = 'all', // 'industry', 'province', or 'all'
  value = [],
  onChange,
  multiple = true,
  required = false,
  error = null,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsContainerRef = useRef(null);

  // Fetch options when component mounts or search/page changes
  useEffect(() => {
    if (isOpen || page > 1) {
      fetchOptions();
    }
  }, [search, page, type, isOpen]);
  
  // Update selected options when value changes
  useEffect(() => {
    const fetchSelectedOptions = async () => {
      if (!value || value.length === 0) {
        setSelectedOptions([]);
        return;
      }
      
      try {
        // Fetch selected options data if not already in options
        const selectedIds = Array.isArray(value) ? value : [value];
        const missingIds = selectedIds.filter(id => 
          !options.some(option => option.id === id) && 
          !selectedOptions.some(option => option.id === id)
        );
        
        if (missingIds.length > 0) {
          const url = new URL('/api/member/ic-membership/member-groups', window.location.origin);
          url.searchParams.append('ids', missingIds.join(','));
          url.searchParams.append('type', type);
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.success) {
            const newSelectedOptions = [...selectedOptions];
            
            data.data.forEach(option => {
              if (!newSelectedOptions.some(o => o.id === option.id)) {
                newSelectedOptions.push(option);
              }
            });
            
            setSelectedOptions(newSelectedOptions);
          }
        }
      } catch (error) {
        console.error('Error fetching selected options:', error);
      }
    };
    
    fetchSelectedOptions();
  }, [value, options]);

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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        optionsContainerRef.current &&
        optionsContainerRef.current.scrollTop + optionsContainerRef.current.clientHeight >=
          optionsContainerRef.current.scrollHeight - 20 &&
        !loading &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    const optionsContainer = optionsContainerRef.current;
    if (optionsContainer) {
      optionsContainer.addEventListener('scroll', handleScroll);
      return () => optionsContainer.removeEventListener('scroll', handleScroll);
    }
  }, [loading, hasMore]);

  const fetchOptions = async () => {
    if (!isOpen) return;
    
    try {
      setLoading(true);
      const url = new URL('/api/member/ic-membership/member-groups', window.location.origin);
      url.searchParams.append('search', search);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', 20);
      url.searchParams.append('type', type);

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setOptions(data.data);
        } else {
          setOptions((prevOptions) => [...prevOptions, ...data.data]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
      } else {
        console.error('Error fetching options:', data.message);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      // Reset pagination when opening
      setPage(1);
      setHasMore(true);
      // Fetch options immediately when opening
      fetchOptions();
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
    setOptions([]);
  };

  const handleSelect = (option) => {
    if (multiple) {
      const isSelected = value.includes(option.id);
      if (isSelected) {
        onChange(value.filter(id => id !== option.id));
      } else {
        onChange([...value, option.id]);
      }
    } else {
      onChange([option.id]);
      setIsOpen(false);
    }
    
    // Add to selected options if not already there
    if (!selectedOptions.some(item => item.id === option.id)) {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleRemove = (optionId) => {
    onChange(value.filter(id => id !== optionId));
  };

  const isSelected = (optionId) => {
    return value.includes(optionId);
  };
  
  // Get display options for selected values
  const getSelectedOptionDisplay = () => {
    // Combine options from both sources
    const allOptions = [...options, ...selectedOptions];
    const uniqueOptions = allOptions.filter((option, index, self) => 
      index === self.findIndex(o => o.id === option.id)
    );
    
    return value.map(id => {
      const option = uniqueOptions.find(opt => opt.id === id);
      return option || { id, name: `ID: ${id}` }; // Fallback if option not found
    });
  };

  return (
    <div className={`mb-4 ${className}`}>
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {error && (
          <p className="absolute right-0 top-0 text-sm text-red-500 bg-white px-2 py-1 rounded shadow-sm">{error}</p>
        )}
        {/* Selected items display */}
        <div
          className={`min-h-[42px] px-3 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md flex flex-wrap gap-2 cursor-pointer bg-white`}
          onClick={handleToggleDropdown}
        >
          {value.length > 0 ? (
            getSelectedOptionDisplay().map((item) => (
              <div
                key={item.id}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center"
              >
                <span>{item.name}</span>
                <button
                  type="button"
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.id);
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <div className="ml-auto flex items-center">
            <FiChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200 flex items-center">
              <FiSearch size={18} className="text-gray-400 mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="พิมพ์เพื่อค้นหา..."
                className="w-full outline-none text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list */}
            <div
              ref={optionsContainerRef}
              className="max-h-60 overflow-y-auto py-1"
            >
              {options.length > 0 ? (
                options.map((option) => (
                  <div
                    key={option.id}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                      isSelected(option.id)
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <span className="text-sm">{option.name}</span>
                    {isSelected(option.id) && <FiCheck size={16} className="text-blue-600" />}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  {loading ? 'กำลังโหลด...' : 'ไม่พบข้อมูล'}
                </div>
              )}
              {loading && page > 1 && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">กำลังโหลดเพิ่มเติม...</div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
