import ValidationStatusBadge from "./ValidationStatusBadge";

export default function TaxIdField({
  formData,
  isLoading,
  validationStatus,
  handleTaxIdChange,
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="taxId" className="block text-sm font-medium text-gray-900">
        เลขประจำตัวผู้เสียภาษี / Tax ID
        <span className="text-red-500 ml-1">*</span>
      </label>

      <div className="relative">
        <input
          type="text"
          id="taxId"
          name="taxId"
          value={formData.taxId || ""}
          onChange={handleTaxIdChange}
          maxLength={13}
          required
          placeholder="0000000000000"
          className={`
            w-full px-4 py-3 text-sm
            border rounded-lg
            bg-white
            placeholder-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${
              validationStatus.status === "invalid"
                ? "border-red-300 bg-red-50"
                : validationStatus.status === "valid"
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
            }
            ${validationStatus.status === "checking" ? "pr-28" : ""}
          `}
          disabled={validationStatus.status === "checking"}
        />

        {/* Status Badge - Only show one at a time */}
        <ValidationStatusBadge status={validationStatus.status} />
      </div>

      {/* Status Messages */}
      {validationStatus.message && (
        <p
          className={`mt-1 text-sm flex items-center gap-2 ${
            validationStatus.status === "invalid"
              ? "text-red-600"
              : validationStatus.status === "valid"
                ? "text-green-600"
                : "text-blue-600"
          }`}
        >
          {validationStatus.status === "checking" && (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {validationStatus.status === "valid" && (
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {validationStatus.status === "invalid" && (
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {validationStatus.message}
        </p>
      )}
    </div>
  );
}
