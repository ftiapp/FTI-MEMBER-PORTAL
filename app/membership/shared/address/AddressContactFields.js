"use client";

import PropTypes from "prop-types";

/**
 * คอมโพเนนต์สำหรับแสดงฟิลด์ติดต่อ
 * (โทรศัพท์, อีเมล, เว็บไซต์)
 */
export default function AddressContactFields({
  currentAddress,
  onInputChange,
  errors,
  isLoading,
  activeTab,
  showEmail = true,
  showWebsite = true,
}) {
  return (
    <>
      {/* Company Phone */}
      <div className="lg:col-span-2 space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
          โทรศัพท์ / โทรศัพท์มือถือ
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <input
              type="tel"
              id={`phone-${activeTab}`}
              name={`phone-${activeTab}`}
              value={currentAddress?.[`phone-${activeTab}`] || currentAddress?.phone || ""}
              onChange={(e) => onInputChange(`phone-${activeTab}`, e.target.value)}
              placeholder="02-123-4567"
              disabled={isLoading}
              className={`
                w-full px-4 py-3 text-sm
                border rounded-lg
                bg-white
                placeholder-gray-400
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${
                  errors?.[`addresses.${activeTab}.phone-${activeTab}`] ||
                  errors?.[`addresses.${activeTab}.phone`] ||
                  errors?.addresses?.[activeTab]?.phone
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
            />
          </div>
          <div>
            <input
              type="text"
              id={`phoneExtension-${activeTab}`}
              name={`phoneExtension-${activeTab}`}
              value={
                currentAddress?.[`phoneExtension-${activeTab}`] ||
                currentAddress?.phoneExtension ||
                ""
              }
              onChange={(e) => onInputChange(`phoneExtension-${activeTab}`, e.target.value)}
              placeholder="ต่อ (ถ้ามี)"
              disabled={isLoading}
              className="w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 hover:border-gray-400"
            />
          </div>
        </div>
        {(errors?.[`addresses.${activeTab}.phone-${activeTab}`] ||
          errors?.[`addresses.${activeTab}.phone`] ||
          errors?.addresses?.[activeTab]?.phone) && (
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors[`addresses.${activeTab}.phone-${activeTab}`] ||
              errors[`addresses.${activeTab}.phone`] ||
              errors.addresses?.[activeTab]?.phone}
          </p>
        )}
      </div>

      {/* Company Email */}
      {showEmail && (
        <div className="space-y-2">
          <label
            htmlFor={`email-${activeTab}`}
            className="block text-sm font-medium text-gray-900"
          >
            อีเมล {activeTab === "1" ? "(ถ้ามี)" : ""}
          </label>
          <input
            type="email"
            id={`email-${activeTab}`}
            name={`email-${activeTab}`}
            value={currentAddress?.[`email-${activeTab}`] || currentAddress?.email || ""}
            onChange={(e) => onInputChange(`email-${activeTab}`, e.target.value)}
            placeholder="company@example.com"
            disabled={isLoading}
            className={`
              w-full px-4 py-3 text-sm
              border rounded-lg
              bg-white
              placeholder-gray-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${
                errors?.[`addresses.${activeTab}.email-${activeTab}`] ||
                errors?.[`addresses.${activeTab}.email`] ||
                errors?.addresses?.[activeTab]?.email
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
          />
          {(errors?.[`addresses.${activeTab}.email-${activeTab}`] ||
            errors?.[`addresses.${activeTab}.email`] ||
            errors?.addresses?.[activeTab]?.email) && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors[`addresses.${activeTab}.email-${activeTab}`] ||
                errors[`addresses.${activeTab}.email`] ||
                errors.addresses?.[activeTab]?.email}
            </p>
          )}
        </div>
      )}

      {/* Company Website */}
      {showWebsite && (
        <div className="space-y-2">
          <label
            htmlFor={`website-${activeTab}`}
            className="block text-sm font-medium text-gray-900"
          >
            เว็บไซต์
          </label>
          <input
            type="url"
            id={`website-${activeTab}`}
            name={`website-${activeTab}`}
            value={currentAddress?.[`website-${activeTab}`] || currentAddress?.website || ""}
            onChange={(e) => onInputChange(`website-${activeTab}`, e.target.value)}
            placeholder="https://www.example.com"
            disabled={isLoading}
            className={`
              w-full px-4 py-3 text-sm
              border rounded-lg
              bg-white
              placeholder-gray-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${
                errors?.[`addresses.${activeTab}.website-${activeTab}`] ||
                errors?.[`addresses.${activeTab}.website`] ||
                errors?.addresses?.[activeTab]?.website
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
          />
          {(errors?.[`addresses.${activeTab}.website-${activeTab}`] ||
            errors?.[`addresses.${activeTab}.website`] ||
            errors?.addresses?.[activeTab]?.website) && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors[`addresses.${activeTab}.website-${activeTab}`] ||
                errors[`addresses.${activeTab}.website`] ||
                errors.addresses?.[activeTab]?.website}
            </p>
          )}
        </div>
      )}
    </>
  );
}

AddressContactFields.propTypes = {
  currentAddress: PropTypes.object,
  onInputChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isLoading: PropTypes.bool,
  activeTab: PropTypes.string.isRequired,
  showEmail: PropTypes.bool,
  showWebsite: PropTypes.bool,
};

AddressContactFields.defaultProps = {
  currentAddress: {},
  errors: {},
  isLoading: false,
  showEmail: true,
  showWebsite: true,
};
