'use client';

import { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { FaSearch, FaSpinner } from 'react-icons/fa';

export default function MemberSearchField({
  value,
  onChange,
  onSelectResult,
  hasError,
  errorMessage = 'กรุณาค้นหาสมาชิก'
}) {
  const [searchTerm, setSearchTerm] = useState(value || '');

  // Sync searchTerm with value prop from parent (reset input when parent reset)
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Handle outside click to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  // Debounced search function using real API
  const debouncedSearch = useRef(
    debounce(async (term) => {
      if (!term || term.length < 2) { // Match the original 2 character minimum
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const response = await fetch(`/api/member-search?term=${encodeURIComponent(term)}`);
        const data = await response.json();

        if (data.success && data.data && data.data.companies) {
          console.log('Search results:', data.data.companies);
          setSearchResults(data.data.companies);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching members:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onChange('memberSearch', term);
    
    if (term.length >= 2) { // Match the original 2 character minimum
      setIsSearching(true);
      setShowResults(true);
      debouncedSearch(term);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectResult = (result) => {
    setSearchTerm(`${result.MEMBER_CODE || ''} - ${result.COMPANY_NAME || ''}`);
    setShowResults(false);
    onSelectResult(result);
    console.log('Selected result:', result);
  };

  return (
    <div className="mb-4 relative" ref={searchRef}>
      <label htmlFor="memberSearch" className="block text-sm font-medium text-gray-700 mb-1">
        ค้นหาสมาชิกเดิม
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <FaSpinner className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <FaSearch className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          id="memberSearch"
          name="memberSearch"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          className={`block w-full pl-10 pr-3 py-2 border text-black ${hasError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          placeholder="รหัสสมาชิก หรือชื่อบริษัท (อย่างน้อย 2 ตัวอักษร)"
        />
      </div>
      
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
      
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
          <ul className="py-1">
            {searchResults.map((result, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  onClick={() => handleSelectResult(result)}
                >
                  <div className="font-medium">{result.COMPANY_NAME || 'ไม่ระบุชื่อ'}</div>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>รหัสสมาชิก: {result.MEMBER_CODE || 'ไม่ระบุ'}</span>
                    <span>ประเภท: {result.MEMBER_TYPE || 'ไม่ระบุ'}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {showResults && searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">ไม่พบข้อมูลสมาชิกที่ตรงกับคำค้นหา</p>
        </div>
      )}
    </div>
  );
}