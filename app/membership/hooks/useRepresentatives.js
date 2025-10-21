/**
 * Custom Hook for Managing Representatives
 * Handles state management, validation, and synchronization
 */

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  checkDuplicateNames,
  mapThaiPrenameToEnglish,
  mapEnglishPrenameToThai,
  findFirstErrorField,
} from "../utils/representativeValidation";

/**
 * Create default representative object
 * @param {number} index - Representative index
 * @param {string} mode - 'single' or 'multiple'
 * @param {object} fieldNames - Custom field name mappings
 */
const createDefaultRepresentative = (index = 0, mode = "multiple", fieldNames = {}) => {
  const base = {
    id: `rep_${Date.now()}_${index}`,
    prenameTh: "",
    prenameEn: "",
    prenameOther: "",
    prenameOtherEn: "",
    email: "",
    phone: "",
    phoneExtension: "",
  };

  // Add name fields based on field name configuration
  const nameFields = {
    [fieldNames.firstNameTh || "firstNameTh"]: "",
    [fieldNames.lastNameTh || "lastNameTh"]: "",
    [fieldNames.firstNameEn || "firstNameEn"]: "",
    [fieldNames.lastNameEn || "lastNameEn"]: "",
  };

  // Add position for multiple mode
  if (mode === "multiple") {
    base.position = "";
    base.isPrimary = index === 0;
  }

  return { ...base, ...nameFields };
};

/**
 * Normalize loaded representative data
 */
const normalizeRepresentative = (rep, index, fieldNames) => {
  return {
    id: rep.id || `rep_${Date.now()}_${index}`,
    prenameTh: rep.prenameTh ?? rep.prename_th ?? "",
    prenameEn: rep.prenameEn ?? rep.prename_en ?? "",
    prenameOther: rep.prenameOther ?? rep.prename_other ?? "",
    prenameOtherEn: rep.prenameOtherEn ?? rep.prename_other_en ?? "",
    [fieldNames.firstNameTh]:
      rep[fieldNames.firstNameTh] || rep.firstNameTh || rep.firstNameThai || "",
    [fieldNames.lastNameTh]: rep[fieldNames.lastNameTh] || rep.lastNameTh || rep.lastNameThai || "",
    [fieldNames.firstNameEn]:
      rep[fieldNames.firstNameEn] ||
      rep.firstNameEn ||
      rep.firstNameEng ||
      rep.firstNameEnglish ||
      "",
    [fieldNames.lastNameEn]:
      rep[fieldNames.lastNameEn] || rep.lastNameEn || rep.lastNameEng || rep.lastNameEnglish || "",
    position: rep.position || "",
    email: rep.email || "",
    phone: rep.phone || "",
    phoneExtension: rep.phoneExtension || rep.phone_extension || "",
    isPrimary: false,
  };
};

/**
 * Custom hook for managing representatives
 * @param {object} config - Configuration object
 * @param {string} config.mode - 'single' or 'multiple'
 * @param {object} config.formData - Form data object
 * @param {function} config.setFormData - Form data setter
 * @param {object} config.errors - Validation errors
 * @param {object} config.fieldNames - Custom field name mappings
 * @param {number} config.maxRepresentatives - Maximum number of representatives (default: 3)
 * @param {string} config.toastId - Unique toast ID for error messages
 */
export const useRepresentatives = ({
  mode = "multiple",
  formData = {},
  setFormData = () => {},
  errors = {},
  fieldNames = {
    firstNameTh: "firstNameTh",
    lastNameTh: "lastNameTh",
    firstNameEn: "firstNameEn",
    lastNameEn: "lastNameEn",
  },
  maxRepresentatives = 3,
  toastId = "representative-errors",
}) => {
  const isInitialized = useRef(false);
  const lastScrolledErrorRef = useRef(null);

  // State
  const [representatives, setRepresentatives] = useState([
    createDefaultRepresentative(0, mode, fieldNames),
  ]);
  const [duplicateErrors, setDuplicateErrors] = useState([]);
  const [touchedPhones, setTouchedPhones] = useState({});

  // Refs for scrolling to errors
  const prenameThRefs = useRef([]);
  const prenameEnRefs = useRef([]);
  const prenameOtherRefs = useRef([]);
  const firstNameThRefs = useRef([]);
  const lastNameThRefs = useRef([]);
  const firstNameEnRefs = useRef([]);
  const lastNameEnRefs = useRef([]);

  const representativeErrors = errors?.representativeErrors || (mode === "single" ? {} : []);

  // Load initial data
  useEffect(() => {
    if (mode === "single") {
      // Single representative mode (IC)
      if (formData.representative && !isInitialized.current) {
        const normalized = normalizeRepresentative(formData.representative, 0, fieldNames);
        setRepresentatives([normalized]);
        isInitialized.current = true;
      }
    } else {
      // Multiple representatives mode (AC, AM, OC)
      if (!isInitialized.current && formData.representatives?.length > 0) {
        const loadedReps = formData.representatives
          .map((rep, index) => normalizeRepresentative(rep, index, fieldNames))
          .map((r, i) => ({ ...r, isPrimary: i === 0 }));
        setRepresentatives(loadedReps);
        isInitialized.current = true;
      }
    }
  }, [mode, formData.representative, formData.representatives, fieldNames]);

  // Sync with formData
  useEffect(() => {
    if (mode === "single") {
      if (isInitialized.current || !formData.representative) {
        setFormData((prev) => ({ ...prev, representative: representatives[0] }));
      }
    } else {
      if (isInitialized.current || !formData.representatives?.length) {
        setFormData((prev) => ({ ...prev, representatives }));
      }
    }
  }, [representatives, setFormData, mode]);

  // Check for duplicate names (multiple mode only)
  useEffect(() => {
    if (mode === "multiple" && representatives.length > 1) {
      const errors = checkDuplicateNames(representatives);
      setDuplicateErrors(errors);
    } else {
      setDuplicateErrors([]);
    }
  }, [representatives, mode]);

  // Handle errors and scroll to first error
  useEffect(() => {
    if (mode === "single") {
      // Single mode - show toast and scroll to first error field
      if (representativeErrors && Object.keys(representativeErrors).length > 0) {
        const firstErrorField = findFirstErrorField(representativeErrors);
        if (firstErrorField) {
          const errorKey = `rep0:${firstErrorField}`;
          if (errorKey !== lastScrolledErrorRef.current) {
            lastScrolledErrorRef.current = errorKey;
            const errorMessage = representativeErrors[firstErrorField];

            // Show toast
            toast.error(`ข้อมูลผู้แทน: ${errorMessage}`, {
              duration: 5000,
              id: toastId,
            });

            // Scroll to error field
            setTimeout(() => {
              const index = 0; // Single mode always uses index 0
              if (firstErrorField === "prename_th" && prenameThRefs.current[index]) {
                prenameThRefs.current[index].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              } else if (firstErrorField === "prename_en" && prenameEnRefs.current[index]) {
                prenameEnRefs.current[index].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              } else if (firstErrorField === "prename_other" && prenameOtherRefs.current[index]) {
                prenameOtherRefs.current[index].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              } else if (
                (firstErrorField === "firstNameTh" || firstErrorField === "firstNameThai") &&
                firstNameThRefs.current[index]
              ) {
                firstNameThRefs.current[index].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              } else if (
                (firstErrorField === "lastNameTh" || firstErrorField === "lastNameThai") &&
                lastNameThRefs.current[index]
              ) {
                lastNameThRefs.current[index].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              } else if (
                (firstErrorField === "firstNameEn" ||
                  firstErrorField === "firstNameEng" ||
                  firstErrorField === "firstNameEnglish") &&
                firstNameEnRefs.current[index]
              ) {
                firstNameEnRefs.current[index].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              } else if (
                (firstErrorField === "lastNameEn" ||
                  firstErrorField === "lastNameEng" ||
                  firstErrorField === "lastNameEnglish") &&
                lastNameEnRefs.current[index]
              ) {
                lastNameEnRefs.current[index].scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              } else {
                const repCard = document.querySelector(`[data-rep-index="0"]`);
                if (repCard) {
                  repCard.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }
            }, 100);
          }
        }
      } else {
        lastScrolledErrorRef.current = null;
      }
    } else {
      // Multiple mode - find first representative with error
      if (representativeErrors.length > 0) {
        const errorIndex = representativeErrors.findIndex(
          (err) => err && Object.keys(err).length > 0,
        );

        if (errorIndex !== -1) {
          const errors = representativeErrors[errorIndex];
          const firstErrorField = findFirstErrorField(errors);

          if (firstErrorField) {
            const errorKey = `rep${errorIndex}:${firstErrorField}`;

            if (errorKey !== lastScrolledErrorRef.current) {
              lastScrolledErrorRef.current = errorKey;
              const errorMessage = errors[firstErrorField];

              toast.error(`ผู้แทนคนที่ ${errorIndex + 1}: ${errorMessage}`, {
                duration: 5000,
                id: toastId,
              });

              // Scroll to error field
              setTimeout(() => {
                if (firstErrorField === "prename_th" && prenameThRefs.current[errorIndex]) {
                  prenameThRefs.current[errorIndex].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                } else if (firstErrorField === "prename_en" && prenameEnRefs.current[errorIndex]) {
                  prenameEnRefs.current[errorIndex].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                } else if (
                  firstErrorField === "prename_other" &&
                  prenameOtherRefs.current[errorIndex]
                ) {
                  prenameOtherRefs.current[errorIndex].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                } else if (
                  (firstErrorField === "firstNameTh" || firstErrorField === "firstNameThai") &&
                  firstNameThRefs.current[errorIndex]
                ) {
                  firstNameThRefs.current[errorIndex].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                } else if (
                  (firstErrorField === "lastNameTh" || firstErrorField === "lastNameThai") &&
                  lastNameThRefs.current[errorIndex]
                ) {
                  lastNameThRefs.current[errorIndex].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                } else if (
                  (firstErrorField === "firstNameEn" ||
                    firstErrorField === "firstNameEng" ||
                    firstErrorField === "firstNameEnglish") &&
                  firstNameEnRefs.current[errorIndex]
                ) {
                  firstNameEnRefs.current[errorIndex].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                } else if (
                  (firstErrorField === "lastNameEn" ||
                    firstErrorField === "lastNameEng" ||
                    firstErrorField === "lastNameEnglish") &&
                  lastNameEnRefs.current[errorIndex]
                ) {
                  lastNameEnRefs.current[errorIndex].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                } else {
                  const repCard = document.querySelector(`[data-rep-index="${errorIndex}"]`);
                  if (repCard) {
                    repCard.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }
              }, 100);
            }
          }
        }
      } else {
        lastScrolledErrorRef.current = null;
      }
    }
  }, [representativeErrors, mode, toastId]);

  // Add representative
  const addRepresentative = () => {
    if (mode === "single") return; // Cannot add in single mode

    if (representatives.length < maxRepresentatives) {
      setRepresentatives((prev) => {
        const newRep = createDefaultRepresentative(prev.length, mode, fieldNames);
        const next = [...prev, newRep];
        return next.map((r, i) => ({ ...r, isPrimary: i === 0 }));
      });
    }
  };

  // Remove representative
  const removeRepresentative = (id) => {
    if (mode === "single") return; // Cannot remove in single mode

    if (representatives.length > 1) {
      setRepresentatives((prev) => {
        const filtered = prev.filter((rep) => rep.id !== id);
        return filtered.map((r, i) => ({ ...r, isPrimary: i === 0 }));
      });
    }
  };

  // Update representative field
  const updateRepresentative = (idOrIndex, field, value) => {
    setRepresentatives((prev) =>
      prev.map((rep, index) => {
        const shouldUpdate = mode === "single" ? index === 0 : rep.id === idOrIndex;

        if (shouldUpdate) {
          const updatedRep = { ...rep, [field]: value };

          // Auto-sync prenames and clear prenameOther when not "อื่นๆ"/"Other"
          if (field === "prenameTh") {
            const englishEquivalent = mapThaiPrenameToEnglish(value);
            if (!updatedRep.prenameEn || mapThaiPrenameToEnglish(value) !== updatedRep.prenameEn) {
              updatedRep.prenameEn = englishEquivalent;
            }
            // Clear prenameOther if not "อื่นๆ"
            if (value !== "อื่นๆ") {
              updatedRep.prenameOther = "";
              updatedRep.prenameOtherEn = "";
            }
          } else if (field === "prenameEn") {
            const thaiEquivalent = mapEnglishPrenameToThai(value);
            if (!updatedRep.prenameTh || mapEnglishPrenameToThai(value) !== updatedRep.prenameTh) {
              updatedRep.prenameTh = thaiEquivalent;
            }
            // Clear prenameOther fields if not "Other"
            if (value.toLowerCase() !== "other") {
              updatedRep.prenameOther = "";
              updatedRep.prenameOtherEn = "";
            }
          }

          return updatedRep;
        }
        return rep;
      }),
    );
  };

  // Mark phone as touched
  const markPhoneTouched = (id) => {
    setTouchedPhones((prev) => ({ ...prev, [id]: true }));
  };

  return {
    representatives,
    duplicateErrors,
    touchedPhones,
    addRepresentative,
    removeRepresentative,
    updateRepresentative,
    markPhoneTouched,
    refs: {
      prenameThRefs,
      prenameEnRefs,
      prenameOtherRefs,
      firstNameThRefs,
      lastNameThRefs,
      firstNameEnRefs,
      lastNameEnRefs,
    },
  };
};
