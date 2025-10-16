"use client";

import { forwardRef } from "react";
import PropTypes from "prop-types";
import { useFormIcons } from "./Icons";

/**
 * Employee Count Field Component
 * Reusable component for employee count input
 */
const EmployeeCountField = forwardRef(({ 
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
        ข้อมูลพนักงาน / Employee Information
      </h4>
      <div className="space-y-2">
        <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-900">
          จำนวนพนักงาน (ราย) / Number of Employees<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="numberOfEmployees"
          name="numberOfEmployees"
          value={formData.numberOfEmployees || ""}
          onChange={handleNumericChange}
          onFocus={handleNumericFocus}
          onBlur={handleNumericBlur}
          placeholder="0"
          className={`w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.numberOfEmployees
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        />
        {errors.numberOfEmployees && (
          <p className="text-sm text-red-600 flex items-center gap-2">
            {ErrorIcon}
            {String(errors.numberOfEmployees)}
          </p>
        )}
      </div>
    </div>
  );
});

EmployeeCountField.displayName = "EmployeeCountField";

EmployeeCountField.propTypes = {
  formData: PropTypes.shape({
    numberOfEmployees: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  errors: PropTypes.shape({
    numberOfEmployees: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }).isRequired,
  handleNumericChange: PropTypes.func.isRequired,
  handleNumericFocus: PropTypes.func.isRequired,
  handleNumericBlur: PropTypes.func.isRequired,
};

export default EmployeeCountField;
