"use client";

/**
 * คอมโพเนนต์สำหรับอัพโหลดไฟล์ในฟอร์มสมัครสมาชิก
 * @param {Object} props
 * @param {string} props.label ชื่อฟิลด์
 * @param {string} props.description คำอธิบายเพิ่มเติม (optional)
 * @param {string} props.name ชื่อฟิลด์สำหรับ form
 * @param {boolean} props.required บังคับกรอกหรือไม่
 * @param {File} props.value ไฟล์ที่อัพโหลด
 * @param {Function} props.onChange ฟังก์ชันเมื่อมีการเปลี่ยนแปลงไฟล์
 * @param {Function} props.onRemove ฟังก์ชันเมื่อต้องการลบไฟล์
 * @param {Function} props.onView ฟังก์ชันเมื่อต้องการดูไฟล์
 * @param {string} props.error ข้อความแสดงข้อผิดพลาด
 * @param {string} props.accept ประเภทไฟล์ที่ยอมรับ
 * @param {boolean} props.multiple อนุญาตให้อัพโหลดหลายไฟล์หรือไม่
 */
export default function FileUploadInput({
  label,
  description,
  name,
  required = false,
  value,
  onChange,
  onRemove,
  onView,
  error,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = false,
}) {
  return (
    <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-5">
      <div>
        <label htmlFor={name} className="block text-base font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>

      <div className="relative">
        <input
          type="file"
          id={name}
          name={name}
          onChange={onChange}
          accept={accept}
          required={required && !value}
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
      </div>

      {value && (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center gap-2 truncate max-w-[70%]">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                clipRule="evenodd"
              />
            </svg>
            {value.name}
          </p>
          <div className="flex gap-2">
            {onView && (
              <button
                type="button"
                onClick={onView}
                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md transition-all duration-200"
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
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md transition-all duration-200"
                title="ลบไฟล์"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
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
