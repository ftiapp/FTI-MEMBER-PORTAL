import React, { useState, useRef, useEffect } from "react";

/**
 * Multi-select dropdown component for admin editing
 * Similar to the one used in membership forms
 */
const MultiSelectDropdown = ({
  options = [],
  selectedItems = [],
  onChange,
  placeholder = "เลือกรายการ",
  label = "รายการ",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggle = (option) => {
    const isSelected = selectedItems.some((item) => item.id === option.id);

    if (isSelected) {
      onChange(selectedItems.filter((item) => item.id !== option.id));
    } else {
      onChange([...selectedItems, option]);
    }
  };

  const handleRemove = (optionId) => {
    onChange(selectedItems.filter((item) => item.id !== optionId));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>

      {/* Selected items display */}
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedItems.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            {item.name}
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              className="hover:bg-blue-200 rounded-full p-0.5"
              disabled={disabled}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
      </div>

      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            {selectedItems.length > 0 ? `เลือกแล้ว ${selectedItems.length} รายการ` : placeholder}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-blue-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search box */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหา..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">ไม่พบรายการ</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedItems.some((item) => item.id === option.id);
                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(option)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="flex-1 text-gray-900">{option.name}</span>
                    {option.code && <span className="text-sm text-gray-500">{option.code}</span>}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
