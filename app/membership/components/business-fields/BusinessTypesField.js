"use client";

import { useCallback, forwardRef } from "react";
import PropTypes from "prop-types";
import { useFormIcons } from "./Icons";

/**
 * Business Types Field Component
 * Reusable component for selecting business types with optional "other" detail field
 */
const BusinessTypesField = forwardRef(({ 
  formData, 
  setFormData, 
  errors, 
  businessTypes,
  otherFieldRef 
}, ref) => {
  const { ErrorIcon } = useFormIcons();

  // Default business types
  const BUSINESS_TYPES = businessTypes && businessTypes.length > 0
    ? businessTypes
    : [
        { id: "manufacturer", nameTh: "ผู้ผลิต" },
        { id: "distributor", nameTh: "ผู้จัดจำหน่าย" },
        { id: "importer", nameTh: "ผู้นำเข้า" },
        { id: "exporter", nameTh: "ผู้ส่งออก" },
        { id: "service", nameTh: "ผู้ให้บริการ" },
        { id: "other", nameTh: "อื่นๆ" },
      ];

  const handleCheckboxChange = useCallback(
    (e) => {
      const { name, checked } = e.target;
      setFormData((prev) => {
        const updatedBusinessTypes = { ...prev.businessTypes };

        if (checked) {
          updatedBusinessTypes[name] = true;
        } else {
          delete updatedBusinessTypes[name];
        }

        return { ...prev, businessTypes: updatedBusinessTypes };
      });
    },
    [setFormData],
  );

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [setFormData],
  );

  return (
    <div ref={ref} className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-2">
          ประเภทธุรกิจ<span className="text-red-500 ml-1">*</span>
        </h3>
        <p className="text-sm text-gray-600">
          เลือกประเภทธุรกิจที่เกี่ยวข้อง (เลือกได้มากกว่า 1 ข้อ)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUSINESS_TYPES.map((type) => (
          <label
            key={type.id}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
          >
            <input
              type="checkbox"
              name={type.id}
              checked={formData.businessTypes?.[type.id] || false}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">{type.nameTh}</span>
          </label>
        ))}
      </div>

      {formData.businessTypes?.other && (
        <div ref={otherFieldRef} className="mt-6 pt-6 border-t border-gray-100">
          <label
            htmlFor="otherBusinessTypeDetail"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            โปรดระบุประเภทธุรกิจอื่นๆ<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="otherBusinessTypeDetail"
            name="otherBusinessTypeDetail"
            value={formData.otherBusinessTypeDetail || ""}
            onChange={handleInputChange}
            placeholder="ระบุประเภทธุรกิจ..."
            className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.otherBusinessTypeDetail
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          />
          {errors.otherBusinessTypeDetail && (
            <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
              {ErrorIcon}
              {String(errors.otherBusinessTypeDetail)}
            </p>
          )}
        </div>
      )}

      {errors.businessTypes && (
        <p className="text-sm text-red-600 flex items-center gap-2 mt-4">
          {ErrorIcon}
          {String(errors.businessTypes)}
        </p>
      )}
    </div>
  );
});

BusinessTypesField.displayName = "BusinessTypesField";

BusinessTypesField.propTypes = {
  formData: PropTypes.shape({
    businessTypes: PropTypes.object,
    otherBusinessTypeDetail: PropTypes.string,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    businessTypes: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    otherBusinessTypeDetail: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  businessTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nameTh: PropTypes.string.isRequired,
    })
  ),
  otherFieldRef: PropTypes.object,
};

export default BusinessTypesField;
