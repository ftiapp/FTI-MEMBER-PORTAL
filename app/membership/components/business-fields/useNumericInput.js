import { useCallback } from "react";

/**
 * Custom hook for handling numeric input with comma formatting
 * @returns {Object} Handlers and utilities for numeric inputs
 */
export function useNumericInput(formData, setFormData) {
  const sanitizeNumberInput = useCallback((val) => {
    if (val === null || val === undefined) return "";
    const s = String(val).replace(/,/g, "");
    const cleaned = s.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 1) return cleaned;
    return parts[0] + "." + parts.slice(1).join("");
  }, []);

  const formatWithCommas = useCallback((val) => {
    if (val === null || val === undefined || val === "") return "";
    const s = String(val).replace(/,/g, "");
    if (s === "" || isNaN(Number(s))) return String(val);
    const [intPart, decPart] = s.split(".");
    const intFmt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? `${intFmt}.${decPart}` : intFmt;
  }, []);

  const handleNumericChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      let raw = sanitizeNumberInput(value);

      // จำกัดจำนวนสมาชิกสมาคมไม่เกิน 7 หลัก
      if (name === "memberCount" && raw.length > 7) {
        raw = raw.slice(0, 7);
      }

      setFormData((prev) => ({ ...prev, [name]: raw }));
    },
    [sanitizeNumberInput, setFormData],
  );

  const handlePercentageChange = useCallback(
    (e, pairFieldName) => {
      const { name, value } = e.target;
      let raw = sanitizeNumberInput(value);

      // จำกัดไม่เกิน 100
      const numValue = parseFloat(raw);
      if (!isNaN(numValue) && numValue > 100) {
        raw = "100";
      }

      // คำนวณค่าคู่อัตโนมัติ
      const pairValue = raw && !isNaN(parseFloat(raw)) ? String(100 - parseFloat(raw)) : "";

      setFormData((prev) => ({
        ...prev,
        [name]: raw,
        [pairFieldName]: pairValue,
      }));
    },
    [sanitizeNumberInput, setFormData],
  );

  const handleNumericFocus = useCallback(
    (e) => {
      const { name } = e.target;
      const current = formData?.[name];
      if (current !== undefined && current !== null) {
        const raw = String(current).replace(/,/g, "");
        if (raw !== String(current)) {
          setFormData((prev) => ({ ...prev, [name]: raw }));
        }
      }
    },
    [formData, setFormData],
  );

  const handleNumericBlur = useCallback(
    (e) => {
      const { name } = e.target;
      const current = formData?.[name];
      const formatted = formatWithCommas(current);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    },
    [formData, formatWithCommas, setFormData],
  );

  return {
    sanitizeNumberInput,
    formatWithCommas,
    handleNumericChange,
    handlePercentageChange,
    handleNumericFocus,
    handleNumericBlur,
  };
}
