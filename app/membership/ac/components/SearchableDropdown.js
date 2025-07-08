'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * คอมโพเนนต์ dropdown ที่สามารถค้นหาได้
 * @param {Object} props
 * @param {string} props.id ID ของ input
 * @param {string} props.name ชื่อของ input
 * @param {string} props.value ค่าปัจจุบันของ input
 * @param {Function} props.onChange ฟังก์ชันที่ถูกเรียกเมื่อมีการเปลี่ยนแปลงค่า
 * @param {Function} props.fetchOptions ฟังก์ชันสำหรับค้นหาตัวเลือก
 * @param {string} props.placeholder ข้อความที่แสดงเมื่อไม่มีค่า
 * @param {string} props.error ข้อความแสดงข้อผิดพลาด
 * @param {boolean} props.disabled ปิดการใช้งานหรือไม่
 * @param {string} props.label ข้อความแสดงชื่อฟิลด์
 * @param {Function} props.onSelect ฟังก์ชันที่ถูกเรียกเมื่อเลือกตัวเลือก
 * @param {boolean} props.isRequired ฟิลด์จำเป็นหรือไม่
 * @param {boolean} props.isReadOnly อ่านได้อย่างเดียวหรือไม่
 * @param {string} props.autoFillNote ข้อความแสดงหมายเหตุการกรอกอัตโนมัติ
 */
export default function SearchableDropdown({
  id,
  name,
  value,
  onChange,
  fetchOptions,
  placeholder = 'ค้นหา...',
  error,
  disabled = false,
  label,
  onSelect,
  isRequired = false,
  isReadOnly = false,
  autoFillNote
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);

  // ตั้งค่า searchTerm เริ่มต้นจาก value
  useEffect(() => {
    if (value) {
      setSearchTerm(value);
    }
  }, [value]);

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
        const results = await fetchOptions(debouncedSearchTerm);
        // ตรวจสอบว่า results เป็น array และทุก option มี name property
        const validResults = Array.isArray(results) ? results.filter(opt => opt && opt.name) : [];
        setOptions(validResults);
      } catch (error) {
        console.error('Error fetching options:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!disabled) {
      fetchData();
    }
  }, [debouncedSearchTerm, fetchOptions, disabled]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    if (newValue.trim() === '') {
      setOptions([]);
    } else {
      setIsOpen(true);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (!option || !option.name) {
      console.warn('Invalid option selected:', option);
      return;
    }
    
    setSearchTerm(option.name);
    onChange(option.name);
    
    // Call onSelect if provided
    if (onSelect && typeof onSelect === 'function') {
      onSelect(option);
    }
    
    setIsOpen(false);
    setOptions([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {error && (
          <div className="absolute top-0 right-0 -mt-6 text-sm text-red-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}
        
        <input
          type="text"
          id={id}
          name={name}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => !disabled && !isReadOnly && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled || isReadOnly}
          readOnly={isReadOnly}
          className={`
            block w-full px-3 py-2 pr-10
            border ${error ? 'border-red-300' : 'border-gray-300'}
            rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-blue-500 focus:border-blue-500
            ${disabled || isReadOnly ? 'bg-gray-100 text-gray-500' : ''}
          `}
        />
        
        {/* Loading indicator - ปรับตำแหน่งให้อยู่ใน input field */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {autoFillNote && (
          <div className="text-xs text-blue-600 mt-1">{autoFillNote}</div>
        )}
      </div>
      
      {isOpen && options.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options.map((option, index) => (
            <div
              key={index}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
              onClick={() => handleOptionSelect(option)}
            >
              <span className="block truncate">{option.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {isOpen && searchTerm.length >= 2 && options.length === 0 && !isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 sm:text-sm">
          <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
            ไม่พบข้อมูล
          </div>
        </div>
      )}
    </div>
  );
}