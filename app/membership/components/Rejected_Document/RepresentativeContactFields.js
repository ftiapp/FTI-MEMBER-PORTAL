"use client";

import React from "react";
import { sanitizePhone } from "../../utils/representativeValidation";

/**
 * Representative Contact Fields Component
 * Handles position, email, and phone inputs
 */
export default function RepresentativeContactFields({
  representative,
  errors = {},
  showPosition = true,
  positionPlaceholder = "ตำแหน่ง",
  positionRequired = true,
  phoneTouched = false,
  onUpdate,
  onPhoneBlur,
}) {
  const handlePhoneInput = (value) => {
    const sanitized = sanitizePhone(value);
    onUpdate("phone", sanitized);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          ข้อมูลติดต่อ
        </h4>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-${showPosition ? "3" : "2"} gap-6`}>
        {/* Position (optional for some modes) */}
        {showPosition && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              ตำแหน่ง {positionRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={representative.position || ""}
              onChange={(e) => onUpdate("position", e.target.value)}
              placeholder={positionPlaceholder}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                errors.position
                  ? "border-red-300 bg-red-50 focus:ring-red-500"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }`}
            />
            {errors.position && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.position}
              </p>
            )}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            อีเมล <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={representative.email || ""}
            onChange={(e) => onUpdate("email", e.target.value)}
            placeholder="example@company.com"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
              errors.email
                ? "border-red-300 bg-red-50 focus:ring-red-500"
                : "border-gray-300 bg-white hover:border-gray-400"
            }`}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Phone */}
        <div className={showPosition ? "md:col-span-2" : "md:col-span-2"}>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            เบอร์โทรศัพท์ <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <input
                type="tel"
                value={representative.phone || ""}
                onChange={(e) => handlePhoneInput(e.target.value)}
                onBlur={onPhoneBlur}
                placeholder="เช่น 081-234-5678, 02-345-1075 หรือ 0812345678"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  phoneTouched && (!representative.phone || representative.phone.trim() === "")
                    ? "border-red-300 bg-red-50 focus:ring-red-500"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              />
            </div>
            <div>
              <input
                type="text"
                value={representative.phoneExtension || ""}
                onChange={(e) => onUpdate("phoneExtension", e.target.value)}
                placeholder="ต่อ (ถ้ามี)"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-gray-300 bg-white hover:border-gray-400"
              />
            </div>
          </div>
          {phoneTouched && (!representative.phone || representative.phone.trim() === "") && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {"กรุณากรอกเบอร์โทรศัพท์"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
