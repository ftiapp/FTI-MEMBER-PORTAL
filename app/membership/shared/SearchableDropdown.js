"use client";

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * Searchable Dropdown Component
 * คอมโพเนนต์ dropdown ที่สามารถค้นหาได้ พร้อม debounce และ loading state
 */
export default function SearchableDropdown({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  fetchOptions,
  isRequired,
  isReadOnly,
  disabled,
  error,
  className,
  autoFillNote,
  containerProps,
  showLoading,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);
  const fetchOptionsRef = useRef(fetchOptions);

  // Update fetchOptions ref when fetchOptions changes
  useEffect(() => {
    fetchOptionsRef.current = fetchOptions;
  }, [fetchOptions]);

  // Debounce search term
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);

  // Fetch options when debounced search term changes
  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setOptions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await fetchOptionsRef.current(debouncedSearchTerm);
        // ตรวจสอบว่า results เป็น array และทุก option มี text property
        const validResults = Array.isArray(results)
          ? results.filter((opt) => opt && opt.text !== undefined && opt.text !== null)
          : [];
        if (validResults.length < (results || []).length) {
          console.warn("Some options were filtered out due to missing text property");
        }
        setOptions(validResults);
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isDisabled = !!disabled || !!isReadOnly;

  // Handle input change
  const handleInputChange = (e) => {
    if (isDisabled) return;
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    if (newValue.trim() === "") {
      setOptions([]);
    } else {
      setIsOpen(true);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (isDisabled) return;
    if (!option || option.text === undefined || option.text === null) {
      console.warn("Invalid option selected:", option);
      return;
    }
    setSearchTerm(option.text);
    onChange(option.text);
    if (onSelect) {
      onSelect(option);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} {...containerProps}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label} {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={`relative ${className || ""}`}>
        <input
          type="text"
          value={value || ""}
          onChange={handleInputChange}
          onFocus={() => {
            if (isDisabled) return;
            if (searchTerm.length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder || ""}
          className={`
            w-full px-4 py-3 text-sm border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}
            ${isReadOnly || disabled ? "bg-gray-100 cursor-not-allowed opacity-90" : "bg-white"}
          `}
          readOnly={!!isReadOnly}
          disabled={!!disabled}
          required={isRequired}
        />

        {isLoading && showLoading && (
          <div className="absolute right-3 top-3">
            <svg
              className="animate-spin h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {autoFillNote && value && <p className="text-xs text-blue-600 mt-2">{autoFillNote}</p>}

      {isOpen && options.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleOptionSelect(option)}
            >
              {option && option.text ? option.text : "ไม่ระบุ"}
              {option && option.subText && (
                <span className="text-xs text-gray-500 block">{option.subText}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && debouncedSearchTerm && options.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
          ไม่พบข้อมูล
        </div>
      )}
    </div>
  );
}

SearchableDropdown.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
  fetchOptions: PropTypes.func.isRequired,
  isRequired: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  autoFillNote: PropTypes.string,
  containerProps: PropTypes.object,
  showLoading: PropTypes.bool,
};

SearchableDropdown.defaultProps = {
  label: "",
  placeholder: "",
  value: "",
  onSelect: null,
  isRequired: false,
  isReadOnly: false,
  disabled: false,
  error: "",
  className: "",
  autoFillNote: "",
  containerProps: {},
  showLoading: true,
};
