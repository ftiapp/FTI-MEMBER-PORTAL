"use client";

import { useState, useEffect, useRef } from "react";

/**
 * คอมโพเนนต์ dropdown ที่สามารถเลือกได้หลายรายการ
 * @param {Object} props
 * @param {Array} props.options ตัวเลือกทั้งหมด
 * @param {Array} props.selectedIds รายการ ID ที่ถูกเลือก
 * @param {Function} props.onChange ฟังก์ชันที่ถูกเรียกเมื่อมีการเปลี่ยนแปลงค่า
 * @param {string} props.placeholder ข้อความที่แสดงเมื่อไม่มีค่า
 * @param {boolean} props.isLoading กำลังโหลดข้อมูลหรือไม่
 * @param {string} props.error ข้อความแสดงข้อผิดพลาด
 */
export default function MultiSelectDropdown({
  options,
  selectedIds,
  onChange,
  placeholder,
  isLoading,
  error,
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
      if (!options) return;

      if (!searchTerm) {
        setFilteredOptions(options);
      } else {
        const filtered = options.filter((option) =>
          option.name_th.toLowerCase().includes(searchTerm.toLowerCase()),
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

  // Initialize filtered options when options change
  useEffect(() => {
    setFilteredOptions(options || []);
  }, [options]);

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

  // Toggle selection of an option
  const toggleOption = (optionId) => {
    let newSelectedIds;

    if (selectedIds.includes(optionId)) {
      newSelectedIds = selectedIds.filter((id) => id !== optionId);
    } else {
      newSelectedIds = [...selectedIds, optionId];
    }

    onChange(newSelectedIds);
  };

  // Get selected options names for display
  const getSelectedOptionsText = () => {
    // ตรวจสอบว่า selectedIds มีค่าหรือไม่ก่อนเข้าถึง property length
    if (!options || !selectedIds || selectedIds.length === 0) return placeholder;

    if (selectedIds.length === 1) {
      const selected = options.find((opt) => opt.id === selectedIds[0]);
      return selected ? selected.name_th : placeholder;
    }

    return `เลือกแล้ว ${selectedIds.length} รายการ`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`
          flex items-center justify-between w-full px-3 py-2 
          border rounded-md cursor-pointer bg-white
          ${error ? "border-red-300" : "border-gray-300"}
          ${isLoading ? "opacity-75" : ""}
        `}
        onClick={() => !isLoading && setIsOpen(!isOpen)}
      >
        <div className="flex-grow truncate">
          {isLoading ? "กำลังโหลดข้อมูล..." : getSelectedOptionsText()}
        </div>
        <div className="ml-2">
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
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
          ) : (
            <svg
              className={`w-5 h-5 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>

      {isOpen && !isLoading && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหา..."
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    selectedIds.includes(option.id) ? "bg-blue-50" : ""
                  }`}
                  onClick={() => toggleOption(option.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(option.id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">{option.name_th}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">ไม่พบข้อมูล</div>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="p-2 border-t flex justify-between items-center">
              <span className="text-xs text-blue-600">เลือกแล้ว {selectedIds.length} รายการ</span>
              <button
                className="text-xs text-red-600 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                ล้างการเลือก
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
