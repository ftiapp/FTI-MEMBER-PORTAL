"use client";

import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import { ADDRESS_TYPES, copyAddress } from "./addressUtils";

/**
 * คอมโพเนนต์สำหรับแสดงแท็บเลือกประเภทที่อยู่
 */
export default function AddressTabNavigation({
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  showCopyButton = true,
}) {
  // Copy address from office address (type 1) to other types
  const handleCopyAddress = (targetType) => {
    const officeAddress = formData.addresses?.["1"];
    if (!officeAddress) {
      toast.error("กรุณากรอกที่อยู่สำนักงานก่อน");
      return;
    }

    const copiedAddress = copyAddress(officeAddress, targetType);
    if (!copiedAddress) {
      toast.error("ไม่สามารถคัดลอกที่อยู่ได้");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [targetType]: copiedAddress,
      },
    }));

    toast.success(`คัดลอกที่อยู่ไปยัง${ADDRESS_TYPES[targetType].label}สำเร็จ`);
  };

  return (
    <div className="space-y-4">
      {/* Warning Message */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800">หมายเหตุสำคัญ</h4>
            <div className="mt-1 text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  บังคับ: กรุณากรอกที่อยู่ให้ครบทั้ง <strong>ทั้ง 3 ประเภท</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Address Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {["1", "2", "3"].map((type) => {
          const config = ADDRESS_TYPES[type];
          const isActive = activeTab === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveTab(type)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? `bg-${config.color}-600 text-white shadow-sm`
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }
              `}
            >
              <span>{config.label}</span>
              {type === "1" && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-1">
                  หลัก
                </span>
              )}
              {type === "2" && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-1 font-semibold">
                  สำคัญ
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Copy Address Button */}
      {showCopyButton && (activeTab === "2" || activeTab === "3") && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium text-green-800">
                คัดลอกที่อยู่จากที่อยู่สำนักงาน
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyAddress(activeTab)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>คัดลอกที่อยู่</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

AddressTabNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  showCopyButton: PropTypes.bool,
};

AddressTabNavigation.defaultProps = {
  showCopyButton: true,
};
