import { useState, useCallback, useRef } from "react";

/**
 * Custom Hook สำหรับตรวจสอบ tax_id หรือ id_card แบบ real-time
 *
 * @param {string} memberType - ประเภทสมาชิก (am, ac, oc, ic)
 * @param {number} debounceMs - เวลา debounce (default: 800ms)
 * @returns {Object} - { checkUniqueId, validationState, clearValidation }
 *
 * @example
 * const { checkUniqueId, validationState, clearValidation } = useUniqueIdValidation('am');
 *
 * // ใช้ใน onChange
 * const handleTaxIdChange = (e) => {
 *   const value = e.target.value;
 *   setTaxId(value);
 *
 *   if (value.length === 13) {
 *     checkUniqueId(value);
 *   } else {
 *     clearValidation();
 *   }
 * };
 *
 * // แสดงผลตาม validationState
 * {validationState.status === 'checking' && <Spinner />}
 * {validationState.status === 'error' && <ErrorMessage>{validationState.message}</ErrorMessage>}
 * {validationState.status === 'success' && <SuccessMessage>{validationState.message}</SuccessMessage>}
 */
export function useUniqueIdValidation(memberType, debounceMs = 800) {
  const [validationState, setValidationState] = useState({
    status: "idle", // idle | checking | success | error | warning
    available: null,
    reason: null,
    message: "",
    details: null,
  });

  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  /**
   * ฟังก์ชันตรวจสอบ uniqueId
   */
  const checkUniqueId = useCallback(
    (uniqueId) => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Validate input
      if (!uniqueId || uniqueId.trim() === "") {
        setValidationState({
          status: "idle",
          available: null,
          reason: null,
          message: "",
          details: null,
        });
        return;
      }

      // Validate length
      const expectedLength = memberType === "ic" ? 13 : 13; // Both are 13 digits
      if (uniqueId.length !== expectedLength) {
        setValidationState({
          status: "idle",
          available: null,
          reason: null,
          message: "",
          details: null,
        });
        return;
      }

      // Set checking state immediately
      setValidationState({
        status: "checking",
        available: null,
        reason: null,
        message: "กำลังตรวจสอบ...",
        details: null,
      });

      // Debounce the API call
      debounceTimerRef.current = setTimeout(async () => {
        abortControllerRef.current = new AbortController();

        try {
          const response = await fetch(
            `/api/membership/check-unique-id?uniqueId=${encodeURIComponent(uniqueId)}&memberType=${memberType}`,
            {
              signal: abortControllerRef.current.signal,
            },
          );

          const data = await response.json();

          if (data.success) {
            if (data.available) {
              // ✅ สามารถใช้ได้
              setValidationState({
                status: "success",
                available: true,
                reason: null,
                message: data.message,
                details: data.details,
              });
            } else {
              // ❌ ไม่สามารถใช้ได้
              const status = data.reason === "draft" ? "warning" : "error";
              setValidationState({
                status: status,
                available: false,
                reason: data.reason,
                message: data.message,
                details: data.details,
              });
            }
          } else {
            // API error
            setValidationState({
              status: "error",
              available: false,
              reason: "api_error",
              message: data.message || "เกิดข้อผิดพลาดในการตรวจสอบ",
              details: null,
            });
          }
        } catch (error) {
          if (error.name === "AbortError") {
            // Request was cancelled
            return;
          }

          console.error("Error checking unique ID:", error);
          setValidationState({
            status: "error",
            available: false,
            reason: "network_error",
            message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
            details: null,
          });
        }
      }, debounceMs);
    },
    [memberType, debounceMs],
  );

  /**
   * ฟังก์ชันล้างสถานะ validation
   */
  const clearValidation = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setValidationState({
      status: "idle",
      available: null,
      reason: null,
      message: "",
      details: null,
    });
  }, []);

  return {
    checkUniqueId,
    validationState,
    clearValidation,
  };
}
