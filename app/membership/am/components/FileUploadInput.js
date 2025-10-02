// components/FileUploadInput.js
"use client";

export default function FileUploadInput({
  label,
  name,
  required = false,
  file,
  onChange,
  onView,
  error,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = false,
}) {
  return (
    <div className="space-y-3">
      <label htmlFor={name} className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="file"
          id={name}
          name={name}
          onChange={onChange}
          accept={accept}
          required={required}
          multiple={multiple}
          className={`
            w-full px-4 py-3 text-sm
            border rounded-lg
            bg-white
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}
          `}
        />
        {file && onView && (
          <button
            type="button"
            onClick={() => onView(file)}
            className="absolute right-2 top-2 p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all duration-200"
            title="ดูไฟล์"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      {file && (
        <p className="text-sm text-green-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {file.name}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {String(error)}
        </p>
      )}
    </div>
  );
}
