import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { validateThaiIDCard } from "../../ICFormValidation";

export function useIdCardValidation(formData, setFormData) {
  const [idCardValidation, setIdCardValidation] = useState({
    isChecking: false,
    exists: null,
    isValid: null,
    message: "",
    status: null,
  });

  const checkIdCardNumber = async (idCardNumber) => {
    if (idCardNumber.length !== 13) {
      setIdCardValidation({
        isChecking: false,
        exists: null,
        isValid: false,
        message: "เลขบัตรประชาชนต้องมี 13 หลัก",
      });
      return;
    }

    setIdCardValidation({ isChecking: true, exists: null, isValid: null, message: "" });

    try {
      const response = await fetch("/api/member/ic-membership/check-id-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idCardNumber }),
      });

      const result = await response.json();

      // ใช้ field ใหม่ที่ standardized
      const validationResult = {
        isChecking: false,
        exists: result.exists,
        isValid: result.valid,
        status: result.status,
        message: result.message,
      };

      setIdCardValidation(validationResult);

      // ส่งผลการตรวจสอบไปยัง parent component
      if (setFormData) {
        setFormData((prev) => ({
          ...prev,
          _idCardValidation: validationResult,
          idCardNumber: idCardNumber, // บันทึก idCardNumber ใน draft
        }));
      }
    } catch (error) {
      console.error("Error checking ID card:", error);
      setIdCardValidation({
        isChecking: false,
        exists: null,
        isValid: true, // ถ้า API ล้มเหลว ให้ผ่านไปก่อน
        message: "ไม่สามารถตรวจสอบเลขบัตรประชาชนได้ กรุณาลองใหม่",
      });
    }
  };

  const handleIdCardBlur = (idCardNumber) => {
    if (idCardNumber && idCardNumber.length === 13) {
      // ตรวจสอบ checksum ทันที ถ้าไม่ผ่านให้แจ้งและไม่ต้องเรียก API
      if (!validateThaiIDCard(idCardNumber)) {
        setIdCardValidation({
          isChecking: false,
          exists: null,
          isValid: false,
          status: null,
          message: "เลขบัตรประชาชนไม่ถูกต้อง",
        });
        return;
      }
      // ผ่าน checksum ค่อยเรียกตรวจซ้ำซ้อนกับระบบ
      checkIdCardNumber(idCardNumber);
    }
  };

  const handleIdCardChange = (value, errors) => {
    const onlyDigits = value.replace(/\D/g, "").slice(0, 13);

    setFormData((prev) => ({ ...prev, idCardNumber: onlyDigits }));

    // ตรวจสอบเลขบัตรประชาชนแบบทันที
    if (onlyDigits.length === 13) {
      // ถ้า checksum ไม่ถูกต้อง แสดงผลทันทีและไม่เรียก API
      if (!validateThaiIDCard(onlyDigits)) {
        setIdCardValidation({
          isChecking: false,
          exists: null,
          isValid: false,
          status: null,
          message: "เลขบัตรประชาชนไม่ถูกต้อง",
        });
        return;
      }
      // checksum ถูกต้อง → เรียก API ตรวจซ้ำซ้อน
      checkIdCardNumber(onlyDigits);
    } else {
      setIdCardValidation({
        isChecking: false,
        exists: null,
        isValid: null,
        message: "",
        status: null,
      });
    }
  };

  const getIdCardValidationStatus = () => {
    return {
      isChecking: idCardValidation.isChecking,
      isValid: idCardValidation.isValid,
      exists: idCardValidation.exists,
      message: idCardValidation.message,
    };
  };

  // ส่ง function นี้ไปให้ parent component ใช้
  useEffect(() => {
    if (typeof setFormData === "function") {
      setFormData((prev) => ({
        ...prev,
        _idCardValidation: getIdCardValidationStatus(), // เพิ่ม validation status
      }));
    }
  }, [idCardValidation, setFormData]);

  return {
    idCardValidation,
    handleIdCardChange,
    handleIdCardBlur,
    getIdCardValidationStatus,
  };
}
