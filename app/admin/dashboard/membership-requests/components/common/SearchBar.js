import React from "react";

const SearchBar = ({ value, onChange, onSubmit, placeholder = "ค้นหา..." }) => {
  return (
    <form onSubmit={onSubmit} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 sm:px-4 py-2 pr-10 text-sm sm:text-base border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;
