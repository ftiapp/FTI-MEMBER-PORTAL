'use client';

import { useRef } from 'react';

export default function SearchableInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  errorMessage,
  isSearching,
  searchResults,
  onSelectResult,
  resultRenderer,
  disabled,
  readOnly
}) {
  const dropdownRef = useRef(null);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500' : ''} text-gray-900 ${disabled ? 'bg-gray-100' : ''}`}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          readOnly={readOnly}
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {searchResults && searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                onClick={() => onSelectResult(result)}
              >
                {resultRenderer ? resultRenderer(result) : result.name}
              </div>
            ))}
          </div>
        )}
        {error && errorMessage && (
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
