"use client";

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * Multi-Select Dropdown Component
 * A reusable dropdown with search and multi-selection capabilities
 */
export default function MultiSelectDropdown({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "เลือกรายการ",
  isLoading = false,
  label = "",
  searchPlaceholder = "ค้นหา...",
  noDataText = "ไม่พบข้อมูล",
  loadingText = "กำลังโหลดข้อมูล...",
  clearText = "ล้างการเลือก",
  selectedCountText = "เลือกแล้ว",
  itemsText = "รายการ",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);

  // Filter options based on search term with debounce
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (!options || !Array.isArray(options)) {
        setFilteredOptions([]);
        return;
      }

      if (!searchTerm) {
        setFilteredOptions(options);
      } else {
        const filtered = options.filter((option) =>
          option.name_th?.toLowerCase().includes(searchTerm.toLowerCase()),
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
        setSearchTerm(""); // Reset search when closing
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle selection of an option
  const toggleOption = (optionId) => {
    // Ensure selectedValues is always an array before processing
    const currentSelected = Array.isArray(selectedValues) ? selectedValues : [];
    let newSelectedValues;

    if (currentSelected.includes(optionId)) {
      // If the option is already selected, remove it
      newSelectedValues = currentSelected.filter((id) => id !== optionId);
    } else {
      // If the option is not selected, add it
      newSelectedValues = [...currentSelected, optionId];
    }

    // Pass the entire new array to the parent
    onChange(newSelectedValues);
  };

  // Get selected options names for display
  const getSelectedOptionsText = () => {
    if (!options || !Array.isArray(options) || selectedValues.length === 0) {
      return placeholder;
    }

    if (selectedValues.length === 1) {
      const selected = options.find((opt) => opt.id === selectedValues[0]);
      return selected ? selected.name_th : placeholder;
    }

    return `${selectedCountText} ${selectedValues.length} ${itemsText}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      <div
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white hover:border-gray-400 transition-colors duration-200"
        onClick={() => !isLoading && setIsOpen(!isOpen)}
      >
        <div className="flex-grow truncate text-sm">
          {isLoading ? loadingText : getSelectedOptionsText()}
        </div>
        <div className="ml-2">
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-150 ${
                    selectedValues.includes(option.id) ? "bg-blue-50" : ""
                  }`}
                  onClick={() => toggleOption(option.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm">{option.name_th}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">{noDataText}</div>
            )}
          </div>

          {/* Footer with selected count and clear button */}
          {selectedValues.length > 0 && (
            <div className="p-2 border-t flex justify-between items-center bg-gray-50">
              <span className="text-xs text-blue-600 font-medium">
                {selectedCountText} {selectedValues.length} {itemsText}
              </span>
              <button
                className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                {clearText}
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
      name_th: PropTypes.string.isRequired,
    }),
  ),
  selectedValues: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isLoading: PropTypes.bool,
  label: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  noDataText: PropTypes.string,
  loadingText: PropTypes.string,
  clearText: PropTypes.string,
  selectedCountText: PropTypes.string,
  itemsText: PropTypes.string,
};
