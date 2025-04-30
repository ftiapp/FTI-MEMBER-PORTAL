'use client';

import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

/**
 * MemberSearch component for searching members by member code
 * @param {Object} props Component properties
 * @param {Function} props.onSearch Callback function when search is submitted
 */
export default function MemberSearch({ onSearch }) {
  const [memberCode, setMemberCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (memberCode.trim()) {
      setIsSearching(true);
      onSearch(memberCode.trim());
      setTimeout(() => setIsSearching(false), 1000); // Reset searching state after 1 second
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">ค้นหาข้อมูลสมาชิก</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="ระบุรหัสสมาชิก"
            value={memberCode}
            onChange={(e) => setMemberCode(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || !memberCode.trim()}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isSearching || !memberCode.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
        >
          {isSearching ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังค้นหา...
            </span>
          ) : (
            'ค้นหา'
          )}
        </button>
      </form>
    </div>
  );
}
