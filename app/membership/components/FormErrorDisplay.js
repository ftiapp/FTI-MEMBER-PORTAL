/**
 * Shared error display component for membership forms
 */

import { getErrorMessage } from "../utils/errorFieldHelpers";

/**
 * Display validation errors in a styled box
 */
export const FormErrorBox = ({ errors, excludeKeys = ["representativeErrors"] }) => {
  const errorKeys = Object.keys(errors).filter(
    (key) => errors[key] && errors[key] !== "" && !excludeKeys.includes(key),
  );

  if (errorKeys.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-xl" role="alert">
      <strong className="font-bold text-lg">กรุณาแก้ไขข้อมูลให้ถูกต้อง:</strong>
      <ul className="mt-4 list-disc list-inside space-y-2">
        {errorKeys.map((key, index) => (
          <li key={`${key}-${index}`} className="text-base">
            {getErrorMessage(errors[key], key)}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Inline field error message
 */
export const FieldError = ({ error }) => {
  if (!error) return null;

  return (
    <p className="mt-1 text-sm text-red-600">
      {typeof error === "string" ? error : getErrorMessage(error)}
    </p>
  );
};

/**
 * Error summary badge
 */
export const ErrorSummaryBadge = ({ errorCount }) => {
  if (errorCount === 0) return null;

  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      {errorCount} ข้อผิดพลาด
    </div>
  );
};
