import React, { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, Loader2, Info } from "lucide-react";

/**
 * Component to display draft availability status
 * Shows real-time feedback when user enters Tax ID or ID Card
 *
 * @param {object} props - Component props
 * @param {boolean} props.isChecking - Whether check is in progress
 * @param {object} props.availabilityStatus - Availability check result
 * @param {boolean} props.isBlocked - Whether form should be blocked
 */
export const DraftAvailabilityIndicator = ({ isChecking, availabilityStatus, isBlocked }) => {
  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>กำลังตรวจสอบ...</span>
      </div>
    );
  }

  if (!availabilityStatus) {
    return null;
  }

  if (isBlocked) {
    return (
      <div className="flex items-start gap-2 text-sm text-red-600 mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{availabilityStatus.message}</span>
      </div>
    );
  }

  if (availabilityStatus.reason === "draft_exists_same_user") {
    return (
      <div className="flex items-start gap-2 text-sm text-blue-600 mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{availabilityStatus.message}</span>
      </div>
    );
  }

  if (availabilityStatus.available) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
        <CheckCircle className="w-4 h-4" />
        <span>สามารถใช้หมายเลขนี้ได้</span>
      </div>
    );
  }

  return null;
};

/**
 * Higher-order component to add draft availability checking to input fields
 * Automatically checks when user stops typing (debounced)
 *
 * @param {object} props - Component props
 * @param {string} props.value - Current input value
 * @param {function} props.onChange - Input change handler
 * @param {function} props.checkAvailability - Function to check availability
 * @param {number} props.debounceMs - Debounce delay in milliseconds (default: 800)
 * @param {React.Component} props.children - Input component to wrap
 */
export const WithDraftAvailabilityCheck = ({
  value,
  onChange,
  checkAvailability,
  debounceMs = 800,
  children,
}) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only check if value has 13 digits
    if (value && String(value).length === 13) {
      timeoutRef.current = setTimeout(() => {
        checkAvailability(value);
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, checkAvailability, debounceMs]);

  return children;
};

/**
 * Wrapper component that blocks form submission when ID is not available
 *
 * @param {object} props - Component props
 * @param {boolean} props.isBlocked - Whether form should be blocked
 * @param {React.ReactNode} props.children - Form content
 */
export const DraftAvailabilityBlocker = ({ isBlocked, children }) => {
  return (
    <div className="relative">
      {children}
      {isBlocked && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 cursor-not-allowed" />
      )}
    </div>
  );
};
