// Add custom CSS for animations
const customStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

// Inject styles into document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

export default function ThaiNameFields({
  formData,
  errors,
  handleInputChange,
  handlePrenameThaiChange,
  isLoading
}) {
  return (
    <div className="space-y-4 mb-6">
      <h5 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
        ชื่อ-นามสกุล (ภาษาไทย)
      </h5>

      {/* Thai Name Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Prename Thai - Select */}
        <div className="lg:col-span-3 space-y-2">
          <label htmlFor="prename_th" className="block text-sm font-medium text-gray-900">
            คำนำหน้า <span className="text-red-500">*</span>
          </label>
          <select
            id="prename_th"
            name="prename_th"
            value={formData.prename_th || ""}
            onChange={(e) => handlePrenameThaiChange(e.target.value)}
            disabled={isLoading}
            className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.prename_th ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
          >
            <option value="">-- เลือกคำนำหน้า --</option>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
          {errors?.prename_th && <p className="text-sm text-red-600">{errors.prename_th}</p>}
        </div>

        {/* Thai First Name */}
        <div className="lg:col-span-4 space-y-2">
          <label htmlFor="firstNameThai" className="block text-sm font-medium text-gray-900">
            ชื่อ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstNameThai"
            name="firstNameThai"
            value={formData.firstNameThai || ""}
            onChange={handleInputChange}
            placeholder="กรอกชื่อภาษาไทย"
            disabled={isLoading}
            className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.firstNameThai ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
          />
          {errors?.firstNameThai && (
            <p className="text-sm text-red-600">{errors.firstNameThai}</p>
          )}
        </div>

        {/* Thai Last Name */}
        <div className="lg:col-span-5 space-y-2">
          <label htmlFor="lastNameThai" className="block text-sm font-medium text-gray-900">
            นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastNameThai"
            name="lastNameThai"
            value={formData.lastNameThai || ""}
            onChange={handleInputChange}
            placeholder="กรอกนามสกุลภาษาไทย"
            disabled={isLoading}
            className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.lastNameThai ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
          />
          {errors?.lastNameThai && (
            <p className="text-sm text-red-600">{errors.lastNameThai}</p>
          )}
        </div>
      </div>

      {/* Thai Other Prename - show only when "อื่นๆ" selected */}
      {formData.prename_th === "อื่นๆ" && (
        <div className="animate-fadeIn bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label
            htmlFor="prename_other"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            ระบุคำนำหน้า (ภาษาไทย) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="prename_other"
            name="prename_other"
            value={formData.prename_other || ""}
            onChange={handleInputChange}
            placeholder="เช่น ศ.ดร., รศ.ดร., พล.อ., ดร., ผศ."
            disabled={isLoading}
            className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.prename_other ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"} bg-white`}
          />
          {errors?.prename_other && (
            <p className="text-sm text-red-600 mt-1">{errors.prename_other}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            กรุณากรอกคำนำหน้าที่ต้องการใช้ เช่น ตำแหน่งทางวิชาการ หรือยศทหาร
          </p>
        </div>
      )}
    </div>
  );
}
