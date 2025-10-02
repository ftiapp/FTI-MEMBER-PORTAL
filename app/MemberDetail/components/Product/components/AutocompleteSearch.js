"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaSpinner, FaTimes } from "react-icons/fa";

export default function AutocompleteSearch({
  placeholder,
  fetchSuggestions,
  value,
  onChange,
  getOptionLabel,
  disabled,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Load all categories on mount
  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      try {
        const results = await fetchSuggestions();
        setCategories(results);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [fetchSuggestions]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="w-full border px-3 py-2 rounded flex justify-between items-center cursor-pointer"
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
      >
        <div className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? getOptionLabel(value) : placeholder}
        </div>
        <div className="flex items-center">
          {loading ? (
            <FaSpinner className="animate-spin text-gray-400" />
          ) : value ? (
            <button
              className="text-gray-400 hover:text-gray-600 mr-2"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              disabled={disabled}
            >
              <FaTimes />
            </button>
          ) : null}
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={showDropdown ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            ></path>
          </svg>
        </div>
      </div>

      {showDropdown && categories.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
          {categories.map((category, index) => (
            <li
              key={index}
              className={`px-3 py-2 cursor-pointer ${value && value.category_code === category.category_code ? "bg-blue-100" : "hover:bg-blue-50"}`}
              onClick={() => {
                onChange(category);
                setShowDropdown(false);
              }}
            >
              {getOptionLabel(category)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
