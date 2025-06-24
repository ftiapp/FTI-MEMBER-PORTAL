'use client';

import { useRef, useEffect } from 'react';

/**
 * Custom hook สำหรับจัดการข้อผิดพลาดในฟอร์มและการเลื่อนไปยังข้อผิดพลาดแรกโดยอัตโนมัติ
 * @param {Object} errors - Object ที่มี key เป็นชื่อฟิลด์และ value เป็นข้อความข้อผิดพลาด
 * @param {boolean} shouldScroll - Boolean ที่ระบุว่าควรเลื่อนไปยังข้อผิดพลาดแรกหรือไม่
 */
export default function useFormErrors(errors, shouldScroll = true) {
  const firstErrorRef = useRef(null);
  const errorKeys = Object.keys(errors);
  const hasErrors = errorKeys.length > 0;

  // เลื่อนไปยังข้อผิดพลาดแรกเมื่อมีข้อผิดพลาดและควรเลื่อน
  useEffect(() => {
    if (hasErrors && shouldScroll && firstErrorRef.current) {
      // เลื่อนไปยังอิลิเมนต์ที่มีข้อผิดพลาดแรกพร้อมกับ offset เล็กน้อยเพื่อให้เห็นชัดเจน
      firstErrorRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
      
      // เน้นฟิลด์ที่มีข้อผิดพลาด
      const inputElement = firstErrorRef.current.querySelector('input, select, textarea');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [errors, hasErrors, shouldScroll]);

  /**
   * ฟังก์ชันสำหรับกำหนด ref ให้กับอิลิเมนต์ที่มีข้อผิดพลาดแรก
   * @param {string} fieldName - ชื่อฟิลด์
   * @returns {Object|null} - ref object หากเป็นฟิลด์แรกที่มีข้อผิดพลาด, null หากไม่ใช่
   */
  const getErrorRef = (fieldName) => {
    if (errorKeys.length > 0 && errorKeys[0] === fieldName) {
      return firstErrorRef;
    }
    return null;
  };

  return {
    hasErrors,
    getErrorRef
  };
}
