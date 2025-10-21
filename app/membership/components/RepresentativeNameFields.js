"use client";

import React from "react";
import { sanitizeThai, sanitizeEnglish } from "../utils/representativeValidation";

/**
 * Representative Name Fields Component
 * Handles Thai and English name inputs with prename selection
 */
export default function RepresentativeNameFields({
  representative,
  index = 0,
  isRequired = false,
  errors = {},
  duplicateErrors = {},
  fieldNames = {
    firstNameTh: "firstNameTh",
    lastNameTh: "lastNameTh",
    firstNameEn: "firstNameEn",
    lastNameEn: "lastNameEn",
  },
  onUpdate,
  refs = {},
}) {
  const getFieldError = (field) => {
    return errors[field] || duplicateErrors[field] || "";
  };

  const handleThaiInput = (field, value) => {
    const sanitized = sanitizeThai(value);
    onUpdate(field, sanitized);
  };

  const handleEnglishInput = (field, value) => {
    const sanitized = sanitizeEnglish(value);
    onUpdate(field, sanitized);
  };

  return (
    <div className="space-y-8">
      {/* Thai Name Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            ชื่อภาษาไทย
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Prename Thai */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              คำนำหน้า {isRequired && <span className="text-red-500">*</span>}
            </label>
            <select
              ref={(el) => refs.prenameThRefs && (refs.prenameThRefs.current[index] = el)}
              value={representative.prenameTh || ""}
              onChange={(e) => onUpdate("prenameTh", e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-gray-300 bg-white hover:border-gray-400"
            >
              <option value="">เลือกคำนำหน้า</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
            {errors.prename_th && <p className="text-sm text-red-600 mt-2">{errors.prename_th}</p>}
            {/* Other Prename Thai */}
            {representative.prenameTh === "อื่นๆ" && (
              <input
                ref={(el) => refs.prenameOtherRefs && (refs.prenameOtherRefs.current[index] = el)}
                type="text"
                value={representative.prenameOther || ""}
                onChange={(e) => handleThaiInput("prenameOther", e.target.value)}
                placeholder="ระบุคำนำหน้า เช่น ผศ.ดร."
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-gray-300 bg-white hover:border-gray-400 mt-2"
              />
            )}
          </div>

          {/* First Name Thai */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              ชื่อ {isRequired && <span className="text-red-500">*</span>}
              <span className="text-xs text-gray-500 ml-2">(ไม่ต้องใส่คำนำหน้า)</span>
            </label>
            <input
              ref={(el) => refs.firstNameThRefs && (refs.firstNameThRefs.current[index] = el)}
              type="text"
              value={representative[fieldNames.firstNameTh] || ""}
              onChange={(e) => handleThaiInput(fieldNames.firstNameTh, e.target.value)}
              placeholder="ชื่อภาษาไทย"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                getFieldError(fieldNames.firstNameTh)
                  ? "border-red-300 bg-red-50 focus:ring-red-500"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            />
            {getFieldError(fieldNames.firstNameTh) && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {getFieldError(fieldNames.firstNameTh)}
              </p>
            )}
          </div>

          {/* Last Name Thai */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              นามสกุล {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              ref={(el) => refs.lastNameThRefs && (refs.lastNameThRefs.current[index] = el)}
              type="text"
              value={representative[fieldNames.lastNameTh] || ""}
              onChange={(e) => handleThaiInput(fieldNames.lastNameTh, e.target.value)}
              placeholder="นามสกุลภาษาไทย"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                getFieldError(fieldNames.lastNameTh)
                  ? "border-red-300 bg-red-50 focus:ring-red-500"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            />
            {getFieldError(fieldNames.lastNameTh) && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {getFieldError(fieldNames.lastNameTh)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* English Name Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-green-500 rounded-full"></div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            ชื่อภาษาอังกฤษ
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Prename English */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Prename {isRequired && <span className="text-red-500">*</span>}
            </label>
            <select
              ref={(el) => refs.prenameEnRefs && (refs.prenameEnRefs.current[index] = el)}
              value={representative.prenameEn || ""}
              onChange={(e) => onUpdate("prenameEn", e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-gray-300 bg-white hover:border-gray-400"
            >
              <option value="">Select Prename</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Other">Other</option>
            </select>
            {errors.prename_en && <p className="text-sm text-red-600 mt-2">{errors.prename_en}</p>}
            {/* Other Prename English */}
            {String(representative.prenameEn || "").toLowerCase() === "other" && (
              <input
                type="text"
                value={representative.prenameOtherEn || ""}
                onChange={(e) => handleEnglishInput("prenameOtherEn", e.target.value)}
                placeholder="e.g., Assoc. Prof., Dr."
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-gray-300 bg-white hover:border-gray-400 mt-2"
              />
            )}
          </div>

          {/* First Name English */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              ชื่อ <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(ไม่ต้องใส่คำนำหน้า)</span>
            </label>
            <input
              ref={(el) => refs.firstNameEnRefs && (refs.firstNameEnRefs.current[index] = el)}
              type="text"
              value={representative[fieldNames.firstNameEn] || ""}
              onChange={(e) => handleEnglishInput(fieldNames.firstNameEn, e.target.value)}
              placeholder="First Name"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                getFieldError(fieldNames.firstNameEn)
                  ? "border-red-300 bg-red-50 focus:ring-red-500"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            />
            {getFieldError(fieldNames.firstNameEn) && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {getFieldError(fieldNames.firstNameEn)}
              </p>
            )}
          </div>

          {/* Last Name English */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              ref={(el) => refs.lastNameEnRefs && (refs.lastNameEnRefs.current[index] = el)}
              type="text"
              value={representative[fieldNames.lastNameEn] || ""}
              onChange={(e) => handleEnglishInput(fieldNames.lastNameEn, e.target.value)}
              placeholder="Last Name"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                getFieldError(fieldNames.lastNameEn)
                  ? "border-red-300 bg-red-50 focus:ring-red-500"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            />
            {getFieldError(fieldNames.lastNameEn) && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {getFieldError(fieldNames.lastNameEn)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
