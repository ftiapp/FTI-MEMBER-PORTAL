"use client";

import PropTypes from "prop-types";

/**
 * คอมโพเนนต์สำหรับแสดงฟิลด์พื้นฐานของที่อยู่
 * (เลขที่, อาคาร/หมู่บ้าน, หมู่, ซอย, ถนน)
 */
export default function AddressFields({
  currentAddress,
  onInputChange,
  errors,
  isAutofill,
  isLoading,
  activeTab,
}) {
  return (
    <>
      {/* Address Number */}
      <div className="space-y-2">
        <label htmlFor="addressNumber" className="block text-sm font-medium text-gray-900">
          เลขที่
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="addressNumber"
          name="addressNumber"
          value={currentAddress?.addressNumber || ""}
          onChange={(e) => onInputChange("addressNumber", e.target.value)}
          placeholder="เลขที่"
          disabled={isLoading}
          className={`
            w-full px-4 py-3 text-sm
            border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${
              errors?.[`addresses.${activeTab}.addressNumber`] ||
              errors?.addresses?.[activeTab]?.addressNumber
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${
              isAutofill && currentAddress?.addressNumber
                ? "bg-blue-50 text-gray-700 cursor-default border-blue-200"
                : "bg-white"
            }
          `}
        />
        {(errors?.[`addresses.${activeTab}.addressNumber`] ||
          errors?.addresses?.[activeTab]?.addressNumber) && (
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors[`addresses.${activeTab}.addressNumber`] ||
              errors.addresses[activeTab].addressNumber}
          </p>
        )}
        {isAutofill && currentAddress?.addressNumber && (
          <p className="text-xs text-blue-600 flex items-center gap-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            ข้อมูลถูกดึงอัตโนมัติ
          </p>
        )}
      </div>

      {/* Building */}
      <div className="space-y-2">
        <label htmlFor="building" className="block text-sm font-medium text-gray-900">
          อาคาร/หมู่บ้าน
        </label>
        <input
          type="text"
          id="building"
          name="building"
          value={currentAddress?.building || ""}
          onChange={(e) => onInputChange("building", e.target.value)}
          placeholder="ชื่ออาคาร หรือ หมู่บ้าน"
          disabled={isLoading}
          className={`
            w-full px-4 py-3 text-sm
            border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            border-gray-300 hover:border-gray-400
            ${
              isAutofill && currentAddress?.building
                ? "bg-blue-50 text-gray-700 cursor-default border-blue-200"
                : "bg-white"
            }
          `}
        />
        {isAutofill && currentAddress?.building && (
          <p className="text-xs text-blue-600 flex items-center gap-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            ข้อมูลถูกดึงอัตโนมัติ
          </p>
        )}
      </div>

      {/* Moo */}
      <div className="space-y-2">
        <label htmlFor="moo" className="block text-sm font-medium text-gray-900">
          หมู่
        </label>
        <input
          type="text"
          id="moo"
          name="moo"
          value={currentAddress?.moo || ""}
          onChange={(e) => onInputChange("moo", e.target.value)}
          placeholder="หมู่ที่"
          disabled={isLoading}
          className={`
            w-full px-4 py-3 text-sm
            border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            border-gray-300 hover:border-gray-400
            ${
              isAutofill && currentAddress?.moo
                ? "bg-blue-50 text-gray-700 cursor-default border-blue-200"
                : "bg-white"
            }
          `}
        />
        {isAutofill && currentAddress?.moo && (
          <p className="text-xs text-blue-600 flex items-center gap-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            ข้อมูลถูกดึงอัตโนมัติ
          </p>
        )}
      </div>

      {/* Soi */}
      <div className="space-y-2">
        <label htmlFor="soi" className="block text-sm font-medium text-gray-900">
          ซอย
        </label>
        <input
          type="text"
          id="soi"
          name="soi"
          value={currentAddress?.soi || ""}
          onChange={(e) => onInputChange("soi", e.target.value)}
          placeholder="ซอย"
          disabled={isLoading}
          className={`
            w-full px-4 py-3 text-sm
            border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            border-gray-300 hover:border-gray-400
            ${
              isAutofill && currentAddress?.soi
                ? "bg-blue-50 text-gray-700 cursor-default border-blue-200"
                : "bg-white"
            }
          `}
        />
        {isAutofill && currentAddress?.soi && (
          <p className="text-xs text-blue-600 flex items-center gap-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            ข้อมูลถูกดึงอัตโนมัติ
          </p>
        )}
      </div>

      {/* Street/Road */}
      <div className="space-y-2">
        <label htmlFor="street" className="block text-sm font-medium text-gray-900">
          ถนน
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={currentAddress?.street || currentAddress?.road || ""}
          onChange={(e) => onInputChange("street", e.target.value)}
          placeholder="ถนน"
          disabled={isLoading}
          className={`
            w-full px-4 py-3 text-sm
            border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            border-gray-300 hover:border-gray-400
            ${
              isAutofill && (currentAddress?.street || currentAddress?.road)
                ? "bg-blue-50 text-gray-700 cursor-default border-blue-200"
                : "bg-white"
            }
          `}
        />
        {isAutofill && (currentAddress?.street || currentAddress?.road) && (
          <p className="text-xs text-blue-600 flex items-center gap-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            ข้อมูลถูกดึงอัตโนมัติ
          </p>
        )}
      </div>
    </>
  );
}

AddressFields.propTypes = {
  currentAddress: PropTypes.object,
  onInputChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isAutofill: PropTypes.bool,
  isLoading: PropTypes.bool,
  activeTab: PropTypes.string.isRequired,
};

AddressFields.defaultProps = {
  currentAddress: {},
  errors: {},
  isAutofill: false,
  isLoading: false,
};
