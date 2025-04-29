'use client';

import { FaSearch } from 'react-icons/fa';

/**
 * SearchBar component for filtering data
 * @param {Object} props Component properties
 * @param {string} props.searchTerm Current search term
 * @param {Function} props.onSearchChange Callback for search term changes
 * @param {string} props.placeholder Placeholder text
 */
export default function SearchBar({ 
  searchTerm = '', 
  onSearchChange, 
  placeholder = 'ค้นหาชื่อบริษัท...' 
}) {
  return (
    <div className="mb-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}