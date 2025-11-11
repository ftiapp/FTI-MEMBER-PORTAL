export default function InputField({
  id,
  name,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "",
  error = null,
  required = false,
  showAutoFillNote = false,
  type = "text",
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 text-sm
          border rounded-lg
          transition-all duration-200
          ${
            disabled
              ? "bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
              : "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          }
          ${
            error
              ? "border-red-300 bg-red-50"
              : disabled
                ? "border-gray-200"
                : "border-gray-300 hover:border-gray-400 bg-white"
          }
        `}
      />

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {showAutoFillNote && (
        <p className="text-xs text-gray-500 flex items-center gap-2">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          ฟิลด์นี้จะถูกดึงข้อมูลอัตโนมัติ
        </p>
      )}
    </div>
  );
}
