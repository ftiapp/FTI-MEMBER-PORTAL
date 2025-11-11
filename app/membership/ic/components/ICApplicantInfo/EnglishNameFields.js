export default function EnglishNameFields({
  formData,
  errors,
  handleInputChange,
  handlePrenameEnglishChange,
  isLoading
}) {
  return (
    <div className="space-y-4 mb-6">
      <h5 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
        ชื่อ-นามสกุล (ภาษาอังกฤษ)
      </h5>

      {/* English Name Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Prename English - Auto-filled based on Thai selection */}
        <div className="lg:col-span-3 space-y-2">
          <label htmlFor="prename_en" className="block text-sm font-medium text-gray-900">
            คำนำหน้า <span className="text-red-500">*</span>
          </label>
          <select
            id="prename_en"
            name="prename_en"
            data-field="prename_en"
            value={formData.prename_en || ""}
            onChange={(e) => handlePrenameEnglishChange(e.target.value)}
            disabled={isLoading || (formData.prename_th && formData.prename_th !== "อื่นๆ")}
            className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.prename_en ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} ${formData.prename_th && formData.prename_th !== "อื่นๆ" ? "bg-gray-50" : "bg-white"}`}
          >
            <option value="">-- Select Title --</option>
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Miss">Miss</option>
            <option value="Other">Other</option>
          </select>
          {errors?.prename_en && <p className="text-sm text-red-600">{errors.prename_en}</p>}
        </div>

        {/* English First Name */}
        <div className="lg:col-span-4 space-y-2">
          <label htmlFor="firstNameEng" className="block text-sm font-medium text-gray-900">
            ชื่อ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstNameEng"
            name="firstNameEng"
            value={formData.firstNameEng || ""}
            onChange={handleInputChange}
            placeholder="Enter first name"
            disabled={isLoading}
            className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.firstNameEng ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
          />
          {errors?.firstNameEng && (
            <p className="text-sm text-red-600">{errors.firstNameEng}</p>
          )}
        </div>

        {/* English Last Name */}
        <div className="lg:col-span-5 space-y-2">
          <label htmlFor="lastNameEng" className="block text-sm font-medium text-gray-900">
            นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastNameEng"
            name="lastNameEng"
            value={formData.lastNameEng || ""}
            onChange={handleInputChange}
            placeholder="Enter last name"
            disabled={isLoading}
            className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.lastNameEng ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
          />
          {errors?.lastNameEng && (
            <p className="text-sm text-red-600">{errors.lastNameEng}</p>
          )}
        </div>
      </div>

      {/* English Other Prename - show when "Other" is selected */}
      {(String(formData.prename_en || "").toLowerCase() === "other" ||
        formData.prename_th === "อื่นๆ") && (
        <div className="animate-fadeIn bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label
            htmlFor="prename_other_en"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            ระบุคำนำหน้า (ภาษาอังกฤษ) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="prename_other_en"
            name="prename_other_en"
            data-field="prename_other_en"
            value={formData.prename_other_en || ""}
            onChange={handleInputChange}
            placeholder="e.g., Dr., Prof."
            disabled={isLoading}
            className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.prename_other_en ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
            ref={(el) => {
              // เลื่อนไปยังช่องกรอกข้อมูลถ้ามี error
              if (errors?.prename_other_en && el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.focus();
              }
            }}
          />
          {errors?.prename_other_en && (
            <p className="text-sm text-red-600 mt-1">{errors.prename_other_en}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Please specify the title you wish to use, e.g., academic or military rank
          </p>
        </div>
      )}
    </div>
  );
}
