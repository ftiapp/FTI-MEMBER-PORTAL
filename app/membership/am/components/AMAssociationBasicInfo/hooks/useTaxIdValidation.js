import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

export function useTaxIdValidation(formData, setFormData, errors, setErrors) {
  const [validationStatus, setValidationStatus] = useState({
    status: "idle",
    message: ""
  });
  const taxIdTimeoutRef = useRef(null);

  const checkTaxIdUniqueness = async (taxId) => {
    if (!taxId || taxId.length !== 13) {
      setValidationStatus({ status: "idle", message: "" });
      return false;
    }

    setValidationStatus({
      status: "checking",
      message: "กำลังตรวจสอบเลขประจำตัวผู้เสียภาษี..."
    });

    try {
      const response = await fetch(`/api/member/am-membership/check-tax-id?taxId=${taxId}`);

      if (!response.headers.get("Content-Type")?.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await response.json();

      if (response.ok || response.status === 409) {
        if (data.exists) {
          setErrors((prev) => ({ ...prev, taxId: data.message }));
          setValidationStatus({ status: "invalid", message: data.message });
          toast.error(data.message);
          return false;
        }

        setErrors((prev) => ({ ...prev, taxId: undefined }));
        setValidationStatus({
          status: "valid",
          message: "เลขประจำตัวผู้เสียภาษีสามารถใช้สมัครสมาชิกได้",
        });
        toast.success("เลขประจำตัวผู้เสียภาษีสามารถใช้สมัครสมาชิกได้");
        return true;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error("Error checking tax ID uniqueness:", error);
      const errorMessage = "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี";
      setErrors((prev) => ({ ...prev, taxId: errorMessage }));
      setValidationStatus({ status: "invalid", message: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const handleTaxIdChange = (e) => {
    const { value } = e.target;
    const numericValue = value.replace(/\D/g, "").slice(0, 13);

    setFormData((prev) => ({ ...prev, taxId: numericValue }));
    setValidationStatus({ status: "idle", message: "" });

    if (errors.taxId) {
      setErrors((prev) => ({ ...prev, taxId: undefined }));
    }

    if (taxIdTimeoutRef.current) {
      clearTimeout(taxIdTimeoutRef.current);
    }

    if (numericValue.length === 13) {
      taxIdTimeoutRef.current = setTimeout(() => {
        checkTaxIdUniqueness(numericValue);
      }, 500);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (taxIdTimeoutRef.current) {
        clearTimeout(taxIdTimeoutRef.current);
      }
    };
  }, []);

  return {
    validationStatus,
    setValidationStatus,
    handleTaxIdChange,
    checkTaxIdUniqueness,
  };
}
