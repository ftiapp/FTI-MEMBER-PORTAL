export default function ContactFields({ formData, errors, handleInputChange, isLoading }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
          เบอร์โทรศัพท์
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            placeholder="02-123-4567"
            disabled={isLoading}
            className={`
              flex-1 px-4 py-3 text-sm
              border rounded-lg
              bg-white
              placeholder-gray-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${
                errors?.phone ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
              }
            `}
          />
          <input
            type="text"
            name="phoneExtension"
            value={formData.phoneExtension || ""}
            onChange={handleInputChange}
            placeholder="ต่อ (ถ้ามี)"
            disabled={isLoading}
            className="w-24 px-3 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 hover:border-gray-400"
          />
        </div>
        {errors?.phone && (
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.phone}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-900">
          อีเมล
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email || ""}
          onChange={handleInputChange}
          placeholder="กรอกอีเมล"
          disabled={isLoading}
          className={`
            w-full px-4 py-3 text-sm
            border rounded-lg
            bg-white
            placeholder-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors?.email ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}
          `}
        />
        {errors?.email && (
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.email}
          </p>
        )}
      </div>
    </div>
  );
}
