export default function IdCardField({
  formData,
  errors,
  idCardValidation,
  handleIdCardChange,
  handleIdCardBlur,
  isLoading,
  isEditMode,
}) {
  // แก้ไข CSS class สำหรับ input field
  const getInputClassName = () => {
    let className = `
      w-full px-4 py-3 text-sm
      border rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      bg-white
    `;

    if (errors?.idCardNumber) {
      className += " border-red-300 bg-red-50";
    } else if (idCardValidation.isValid === false) {
      className += " border-red-300 bg-red-50";
    } else if (idCardValidation.isValid === true) {
      className += " border-green-300 bg-green-50";
    } else {
      className += " border-gray-300 hover:border-gray-400";
    }

    return className;
  };

  // ฟังก์ชันสำหรับแสดงสถานะการตรวจสอบเลขบัตรประชาชน
  const renderIdCardValidationMessage = () => {
    if (idCardValidation.isChecking) {
      return (
        <p className="text-sm text-blue-600 flex items-center gap-2">
          <svg
            className="animate-spin w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          กำลังตรวจสอบเลขบัตรประชาชน...
        </p>
      );
    }

    // ✅ แก้ไขเงื่อนไขให้ถูกต้อง - ตรวจสอบ isValid แทน exists
    if (idCardValidation.isValid === false) {
      // ใช้ไม่ได้
      return (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {idCardValidation.message}
          {idCardValidation.status && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              สถานะ: {idCardValidation.status}
            </span>
          )}
        </p>
      );
    }

    if (idCardValidation.isValid === true) {
      // ใช้ได้
      return (
        <p className="text-sm text-green-600 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          สามารถใช้เลขบัตรประชาชนนี้ได้
        </p>
      );
    }

    if (idCardValidation.message && idCardValidation.isValid === null) {
      return (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {idCardValidation.message}
        </p>
      );
    }

    return null;
  };

  return (
    <div className="mb-6">
      <div className="space-y-2">
        <label htmlFor="idCardNumber" className="block text-sm font-medium text-gray-900">
          เลขบัตรประชาชน
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="idCardNumber"
          name="idCardNumber"
          value={formData.idCardNumber || ""}
          onChange={(e) => {
            if (isEditMode) return;
            handleIdCardChange(e.target.value, errors);
          }}
          onBlur={(e) => {
            if (isEditMode) return;
            handleIdCardBlur(e.target.value);
          }}
          maxLength="13"
          disabled={isLoading || isEditMode}
          className={getInputClassName()}
          placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
        />

        {/* แสดงข้อความตรวจสอบเลขบัตรประชาชน */}
        {renderIdCardValidationMessage()}

        {/* แสดง error จาก validation ปกติ */}
        {errors?.idCardNumber && !idCardValidation.message && (
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.idCardNumber}
          </p>
        )}
      </div>
    </div>
  );
}
