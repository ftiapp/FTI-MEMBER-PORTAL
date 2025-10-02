import { useState, useEffect } from "react";

/**
 * Format comma-separated products into an array
 * @param {string} productsString - Comma-separated product descriptions
 * @returns {Array} - Array of product descriptions
 */
export const formatProductsList = (productsString) => {
  if (!productsString) return [];
  return productsString
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item);
};

/**
 * Get the status label for a TSIC code
 * @param {string} status - Status of the TSIC code (pending, approved, rejected)
 * @returns {string} - Status label in Thai
 */
export const tsicStatusLabel = (status) => {
  switch (status) {
    case "pending":
      return "รอการอนุมัติ";
    case "approved":
      return "อนุมัติแล้ว";
    case "rejected":
      return "ไม่อนุมัติ";
    default:
      return "ไม่ระบุสถานะ";
  }
};

/**
 * Custom hook for debouncing a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - The debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
