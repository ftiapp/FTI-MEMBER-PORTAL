"use client";

import { forwardRef } from "react";
import PropTypes from "prop-types";
import { useFormIcons } from "./Icons";

/**
 * Member Count Field Component (for AM membership type)
 * Reusable component for association member count input
 */
const MemberCountField = forwardRef(({ 
  formData, 
  errors,
  handleNumericChange,
  handleNumericFocus,
  handleNumericBlur
}, ref) => {
  const { ErrorIcon } = useFormIcons();

  return (
    <div ref={ref} className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
        ข้อมูลสมาชิกสมาคม / Association Members Information
      </h4>
      <div className="space-y-2">
        <label htmlFor="memberCount" className="block text-sm font-medium text-gray-900">
          จำนวนสมาชิกสมาคม (ราย) / Number of Association Members<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="memberCount"
          name="memberCount"
          value={formData.memberCount || ""}
          onChange={handleNumericChange}
          onFocus={handleNumericFocus}
          onBlur={handleNumericBlur}
          placeholder="0"
          maxLength={7}
          className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.memberCount
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        />
 
        {errors.memberCount && (
          <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
            {ErrorIcon}
            {String(errors.memberCount)}
          </p>
        )}
      </div>
    </div>
  );
});

MemberCountField.displayName = "MemberCountField";

MemberCountField.propTypes = {
  formData: PropTypes.shape({
    memberCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  errors: PropTypes.shape({
    memberCount: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  handleNumericChange: PropTypes.func.isRequired,
  handleNumericFocus: PropTypes.func.isRequired,
  handleNumericBlur: PropTypes.func.isRequired,
};

export default MemberCountField;
