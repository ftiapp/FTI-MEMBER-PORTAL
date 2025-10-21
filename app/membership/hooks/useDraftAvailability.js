import { useState, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

/**
 * Custom hook to check if a Tax ID or ID Card is available for draft creation
 * Prevents users from using IDs that are already in use by other users
 *
 * @param {string} memberType - Member type (ac, oc, ic, am)
 * @returns {object} - Hook state and methods
 */
export const useDraftAvailability = (memberType) => {
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const abortControllerRef = useRef(null);

  /**
   * Check if the ID is available for draft creation
   * @param {string} uniqueId - Tax ID or ID Card number
   * @returns {Promise<object>} - Availability result
   */
  const checkAvailability = useCallback(
    async (uniqueId) => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Reset state
      setIsBlocked(false);
      setAvailabilityStatus(null);

      // Validate input
      if (!uniqueId || String(uniqueId).trim() === "") {
        return { available: true, message: "" };
      }

      // Basic format validation
      if (String(uniqueId).length !== 13 || !/^\d{13}$/.test(String(uniqueId))) {
        const result = {
          available: false,
          message: "รูปแบบไม่ถูกต้อง ต้องเป็นตัวเลข 13 หลัก",
          reason: "invalid_format",
        };
        setAvailabilityStatus(result);
        setIsBlocked(true);
        return result;
      }

      setIsChecking(true);
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/membership/check-draft-availability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberType,
            uniqueId,
          }),
          signal: abortControllerRef.current.signal,
        });

        const result = await response.json();

        if (result.success) {
          setAvailabilityStatus(result);

          // Block form if not available and not owned by current user
          if (!result.available) {
            setIsBlocked(true);
            toast.error(result.message, { duration: 5000 });
          } else if (result.reason === "draft_exists_same_user") {
            // User has existing draft - show info message
            toast.success(result.message, { duration: 4000 });
          }

          return result;
        } else {
          const errorResult = {
            available: false,
            message: result.message || "ไม่สามารถตรวจสอบได้",
            reason: "error",
          };
          setAvailabilityStatus(errorResult);
          setIsBlocked(true);
          toast.error(errorResult.message);
          return errorResult;
        }
      } catch (error) {
        if (error.name === "AbortError") {
          // Request was cancelled, ignore
          return { available: true, message: "" };
        }

        console.error("Error checking draft availability:", error);
        const errorResult = {
          available: false,
          message: "เกิดข้อผิดพลาดในการตรวจสอบ",
          reason: "error",
        };
        setAvailabilityStatus(errorResult);
        toast.error(errorResult.message);
        return errorResult;
      } finally {
        setIsChecking(false);
        abortControllerRef.current = null;
      }
    },
    [memberType],
  );

  /**
   * Reset the availability check state
   */
  const resetAvailability = useCallback(() => {
    setIsBlocked(false);
    setAvailabilityStatus(null);
    setIsChecking(false);
  }, []);

  return {
    checkAvailability,
    resetAvailability,
    isChecking,
    availabilityStatus,
    isBlocked,
  };
};
