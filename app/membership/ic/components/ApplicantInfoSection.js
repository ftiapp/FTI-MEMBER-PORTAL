"use client";

import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import SearchableAddressDropdown from "./SearchableAddressDropdown";
import AddressSection from "./AddressSection";
import IndustrialGroupSection from "./IndustrialGroupSection";
import { validateThaiIDCard } from "./ICFormValidation";

// Add custom CSS for animations
const customStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

// Inject styles into document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

export default function ApplicantInfoSection({
  formData,
  setFormData,
  errors,
  industrialGroups,
  provincialChapters,
  isLoading,
}) {
  const [subDistricts, setSubDistricts] = useState([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Debug: เพิ่ม useEffect เพื่อ debug formData
  useEffect(() => {
    console.log("=== DEBUG ApplicantInfoSection formData ===");
    console.log("idCardDocument:", formData.idCardDocument);
    console.log("All formData:", formData);
  }, [formData]);

  const [idCardValidation, setIdCardValidation] = useState({
    isChecking: false,
    exists: null,
    isValid: null,
    message: "",
    status: null,
  });

  // Mapping Thai prename to English prename
  const prenameMapping = {
    นาย: "Mr.",
    นาง: "Mrs.",
    นางสาว: "Miss",
    อื่นๆ: "Other",
  };

  // ฟังก์ชันตรวจสอบเลขบัตรประชาชน
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

  // เพิ่มฟังก์ชัน handleIdCardBlur ที่หายไป
  const handleIdCardBlur = (e) => {
    const value = e.target.value;
    if (value && value.length === 13) {
      // ตรวจ checksum ทันที ถ้าไม่ผ่านให้แจ้งและไม่ต้องเรียก API
      if (!validateThaiIDCard(value)) {
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
      checkIdCardNumber(value);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special validation for ID card number - only allow digits
    if (name === "idCardNumber") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 13);
      setFormData((prev) => ({ ...prev, [name]: onlyDigits }));

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
      return;
    }

    // Handle prename Thai change and auto-update English prename
    if (name === "prenameTh") {
      const englishPrename = prenameMapping[value] || "";
      setFormData((prev) => ({
        ...prev,
        prenameTh: value,
        prenameEn: englishPrename,
        // ล้างค่า prenameOther เมื่อเปลี่ยนค่า prenameTh ที่ไม่ใช่ 'อื่นๆ'
        prenameOther: value === "อื่นๆ" ? prev.prenameOther : "",
        // ล้างค่า prenameOtherEn เมื่อเปลี่ยนค่า prenameTh ที่ไม่ใช่ 'อื่นๆ'
        prenameOtherEn: value === "อื่นๆ" ? prev.prenameOtherEn : "",
      }));
      return;
    }

    // Handle prename English change
    if (name === "prenameEn") {
      setFormData((prev) => ({
        ...prev,
        prenameEn: value,
        // ล้างค่า prenameOtherEn เมื่อเปลี่ยนค่า prenameEn ที่ไม่ใช่ 'Other'
        prenameOtherEn: value === "Other" ? prev.prenameOtherEn : "",
      }));
      return;
    }

    // Thai language validation
    if (name === "firstNameThai" || name === "lastNameThai" || name === "prenameOther") {
      const thaiPattern = /^[ก-๙\s\.]*$/;
      if (!thaiPattern.test(value) && value !== "") {
        // Allow input but don't update state
        return;
      }
    }

    // English language validation
    if (
      name === "firstNameEng" ||
      name === "lastNameEng" ||
      name === "prenameEn" ||
      name === "prenameOtherEn"
    ) {
      const engPattern = /^[a-zA-Z\s\.]*$/;
      if (!engPattern.test(value) && value !== "") {
        // Allow input but don't update state
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch address data when subDistrict changes
  useEffect(() => {
    const fetchAddressData = async () => {
      if (!formData.subDistrict || formData.subDistrict.length < 2) {
        return;
      }

      setIsLoadingAddress(true);
      try {
        const response = await fetch(
          `/api/address?subDistrict=${encodeURIComponent(formData.subDistrict)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setSubDistricts(data);

          // If only one result, auto-fill district, province, and postal code
          if (data.length === 1) {
            setFormData((prev) => ({
              ...prev,
              district: data[0].district,
              province: data[0].province,
              postalCode: data[0].postalCode,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching address data:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddressData();
  }, [formData.subDistrict, setFormData]);

  // ฟังก์ชันสำหรับแสดงสถานะการตรวจสอบเลขบัตรประชาชน
  const renderIdCardValidationMessage = () => {
    if (idCardValidation.isChecking) {
      return (
        <p className="text-sm text-blue-600 flex items-center gap-2">
          <svg
            className="animate-spin w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          กำลังตรวจสอบเลขบัตรประชาชน...
        </p>
      );
    }

    // ✅ แก้ไขเงื่อนไขให้ถูกต้อง - ตรวจสอบ isValid แทน exists
    if (idCardValidation.isValid === false) {
      // ใช้ไม่ได้
      return (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {idCardValidation.message}
          {idCardValidation.status && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              สถานะ: {idCardValidation.status}
            </span>
          )}
        </p>
      );
    }

    if (idCardValidation.isValid === true) {
      // ใช้ได้
      return (
        <p className="text-sm text-green-600 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          สามารถใช้เลขบัตรประชาชนนี้ได้
        </p>
      );
    }

    if (idCardValidation.message && idCardValidation.isValid === null) {
      return (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {idCardValidation.message}
        </p>
      );
    }

    return null;
  };

  // แก้ไข CSS class สำหรับ input field
  const getInputClassName = () => {
    let className = `
      w-full px-4 py-3 text-sm
      border rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      bg-white
    `;

    if (errors?.idCardNumber) {
      className += " border-red-300 bg-red-50";
    } else if (idCardValidation.isValid === false) {
      className += " border-red-300 bg-red-50";
    } else if (idCardValidation.isValid === true) {
      className += " border-green-300 bg-green-50";
    } else {
      className += " border-gray-300 hover:border-gray-400";
    }

    return className;
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

  return (
    <div
      data-section="applicant"
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10"
    >
      {/* Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">ข้อมูลผู้สมัคร</h2>
        <p className="text-blue-100 text-sm mt-1">ข้อมูลส่วนตัวและที่อยู่</p>
      </div>

      {/* Content */}
      <div className="px-8 py-8 space-y-8">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            ข้อมูลส่วนตัว
          </h4>

          {/* ID Card Number - Full Width */}
          <div className="mb-6">
            <div className="space-y-2">
              <label htmlFor="idCardNumber" className="block text-sm font-medium text-gray-900">
                เลขบัตรประชาชน
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="idCardNumber"
                name="idCardNumber"
                value={formData.idCardNumber || ""}
                onChange={handleInputChange}
                onBlur={handleIdCardBlur}
                maxLength="13"
                className={getInputClassName()}
                placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
              />

              {/* แสดงข้อความตรวจสอบเลขบัตรประชาชน */}
              {renderIdCardValidationMessage()}

              {/* แสดง error จาก validation ปกติ */}
              {errors?.idCardNumber && !idCardValidation.message && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.idCardNumber}
                </p>
              )}
            </div>
          </div>

          {/* ชื่อ (ภาษาไทย) - คำนำหน้า + ชื่อ + นามสกุล */}
          <div className="space-y-4 mb-6">
            <h5 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
              ชื่อ-นามสกุล (ภาษาไทย)
            </h5>

            {/* Thai Name Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Prename Thai - Select */}
              <div className="lg:col-span-3 space-y-2">
                <label htmlFor="prenameTh" className="block text-sm font-medium text-gray-900">
                  คำนำหน้า <span className="text-red-500">*</span>
                </label>
                <select
                  id="prenameTh"
                  name="prenameTh"
                  value={formData.prenameTh || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.prenameTh || errors?.prename_th ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
                >
                  <option value="">-- เลือกคำนำหน้า --</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
                {(errors?.prenameTh || errors?.prename_th) && (
                  <p className="text-sm text-red-600">{errors.prenameTh || errors.prename_th}</p>
                )}
              </div>

              {/* Thai First Name */}
              <div className="lg:col-span-4 space-y-2">
                <label htmlFor="firstNameThai" className="block text-sm font-medium text-gray-900">
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstNameThai"
                  name="firstNameThai"
                  value={formData.firstNameThai || ""}
                  onChange={handleInputChange}
                  placeholder="กรอกชื่อภาษาไทย"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.firstNameThai ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
                />
                {errors?.firstNameThai && (
                  <p className="text-sm text-red-600">{errors.firstNameThai}</p>
                )}
              </div>

              {/* Thai Last Name */}
              <div className="lg:col-span-5 space-y-2">
                <label htmlFor="lastNameThai" className="block text-sm font-medium text-gray-900">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastNameThai"
                  name="lastNameThai"
                  value={formData.lastNameThai || ""}
                  onChange={handleInputChange}
                  placeholder="กรอกนามสกุลภาษาไทย"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.lastNameThai ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
                />
                {errors?.lastNameThai && (
                  <p className="text-sm text-red-600">{errors.lastNameThai}</p>
                )}
              </div>
            </div>

            {/* Thai Other Prename - show only when "อื่นๆ" selected */}
            {formData.prenameTh === "อื่นๆ" && (
              <div className="animate-fadeIn bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label
                  htmlFor="prenameOther"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  ระบุคำนำหน้า (ภาษาไทย) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="prenameOther"
                  name="prenameOther"
                  value={formData.prenameOther || ""}
                  onChange={handleInputChange}
                  placeholder="เช่น ศ.ดร., รศ.ดร., พล.อ., ดร., ผศ."
                  disabled={isLoading}
                  className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.prenameOther || errors?.prename_other ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
                />
                {(errors?.prenameOther || errors?.prename_other) && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.prenameOther || errors.prename_other}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  กรุณากรอกคำนำหน้าที่ต้องการใช้ เช่น ตำแหน่งทางวิชาการ หรือยศทหาร
                </p>
              </div>
            )}
          </div>

          {/* ชื่อ (ภาษาอังกฤษ) - คำนำหน้า + ชื่อ + นามสกุล */}
          <div className="space-y-4 mb-6">
            <h5 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
              ชื่อ-นามสกุล (ภาษาอังกฤษ)
            </h5>

            {/* English Name Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Prename English - Auto-filled based on Thai selection */}
              <div className="lg:col-span-3 space-y-2">
                <label htmlFor="prenameEn" className="block text-sm font-medium text-gray-900">
                  คำนำหน้า <span className="text-red-500">*</span>
                </label>
                <select
                  id="prenameEn"
                  name="prenameEn"
                  data-field="prenameEn"
                  value={formData.prenameEn || ""}
                  onChange={handleInputChange}
                  disabled={isLoading || (formData.prenameTh && formData.prenameTh !== "อื่นๆ")}
                  className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.prenameEn || errors?.prename_en ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} ${formData.prenameTh && formData.prenameTh !== "อื่นๆ" ? "bg-gray-50" : "bg-white"}`}
                >
                  <option value="">-- Select Title --</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss">Miss</option>
                  <option value="Other">Other</option>
                </select>
                {(errors?.prenameEn || errors?.prename_en) && (
                  <p className="text-sm text-red-600">{errors.prenameEn || errors.prename_en}</p>
                )}
              </div>

              {/* English First Name */}
              <div className="lg:col-span-4 space-y-2">
                <label htmlFor="firstNameEng" className="block text-sm font-medium text-gray-900">
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstNameEng"
                  name="firstNameEng"
                  value={formData.firstNameEng || ""}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.firstNameEng ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
                />
                {errors?.firstNameEng && (
                  <p className="text-sm text-red-600">{errors.firstNameEng}</p>
                )}
              </div>

              {/* English Last Name */}
              <div className="lg:col-span-5 space-y-2">
                <label htmlFor="lastNameEng" className="block text-sm font-medium text-gray-900">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastNameEng"
                  name="lastNameEng"
                  value={formData.lastNameEng || ""}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.lastNameEng ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
                />
                {errors?.lastNameEng && (
                  <p className="text-sm text-red-600">{errors.lastNameEng}</p>
                )}
              </div>
            </div>

            {/* English Other Prename - show when "Other" is selected */}
            {(String(formData.prenameEn || "").toLowerCase() === "other" ||
              formData.prenameTh === "อื่นๆ") && (
              <div className="animate-fadeIn bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label
                  htmlFor="prenameOtherEn"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  ระบุคำนำหน้า (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="prenameOtherEn"
                  name="prenameOtherEn"
                  data-field="prename_other_en"
                  value={formData.prenameOtherEn || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., Dr., Prof."
                  disabled={isLoading}
                  className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.prenameOtherEn || errors?.prename_other_en ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
                  ref={(el) => {
                    // เลื่อนไปยังช่องกรอกข้อมูลถ้ามี error
                    if ((errors?.prenameOtherEn || errors?.prename_other_en) && el) {
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                      el.focus();
                    }
                  }}
                />
                {(errors?.prenameOtherEn || errors?.prename_other_en) && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.prenameOtherEn || errors.prename_other_en}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  อนุญาตเฉพาะตัวอักษรภาษาอังกฤษ ช่องว่าง และจุด (.) เช่น ตำแหน่งทางวิชาการ
                  หรือยศทหาร
                </p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                เบอร์โทรศัพท์
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  placeholder="02-123-4567"
                  disabled={isLoading}
                  className={`
                    flex-1 px-4 py-3 text-sm
                    border rounded-lg
                    bg-white
                    placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${
                      errors?.phone
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }
                  `}
                />
                <input
                  type="text"
                  name="phoneExtension"
                  value={formData.phoneExtension || ""}
                  onChange={handleInputChange}
                  placeholder="ต่อ (ถ้ามี)"
                  disabled={isLoading}
                  className="w-24 px-3 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 hover:border-gray-400"
                />
              </div>
              {errors?.phone && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                อีเมล
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                placeholder="กรอกอีเมล"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${
                    errors?.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }
                `}
              />
              {errors?.email && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <AddressSection
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          isLoading={isLoading}
        />

        {/* Industrial Group and Provincial Chapter */}
        <IndustrialGroupSection
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

ApplicantInfoSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
  industrialGroups: PropTypes.array,
  provincialChapters: PropTypes.array,
  isLoading: PropTypes.bool,
};

ApplicantInfoSection.defaultProps = {
  errors: {},
  industrialGroups: [],
  provincialChapters: [],
  isLoading: false,
};
