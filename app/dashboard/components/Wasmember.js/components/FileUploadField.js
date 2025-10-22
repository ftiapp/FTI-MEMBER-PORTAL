"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { FaFile, FaUpload, FaTimesCircle } from "react-icons/fa";

export default function FileUploadField({
  label,
  name,
  accept = ".pdf,.jpg,.jpeg,.png",
  value,
  onChange,
  hasError,
  errorMessage = "กรุณาอัพโหลดไฟล์เอกสาร",
  helpText = "รองรับไฟล์ PDF, JPG, JPEG, PNG ขนาดไม่เกิน 5MB",
}) {
  const [fileName, setFileName] = useState("");
  const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);
  const [sizeErrorMessage, setSizeErrorMessage] = useState("");

  // Sync fileName with value prop from parent (reset filename when parent reset)
  useEffect(() => {
    if (!value) {
      setFileName("");
    } else if (value && value.name) {
      // If value is a File object, show its name
      setFileName(value.name);
    } else if (typeof value === "string") {
      // If value is a string (like a filename), show it directly
      setFileName(value);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB) -> show modal instead of alert
      if (file.size > 5 * 1024 * 1024) {
        setSizeErrorMessage("ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB");
        setShowSizeErrorModal(true);
        e.target.value = null;
        return;
      }

      // Check file type
      const fileExt = file.name.split(".").pop().toLowerCase();
      const allowedTypes = accept.split(",").map((type) => type.trim().replace(".", ""));

      if (!allowedTypes.includes(fileExt)) {
        alert(
          `ไฟล์ประเภท ${fileExt} ไม่ได้รับการสนับสนุน กรุณาอัพโหลดไฟล์ประเภท ${allowedTypes.join(", ")}`,
        );
        e.target.value = null;
        return;
      }

      setFileName(file.name);
      onChange(name, file);
    }
  };

  const clearFile = () => {
    setFileName("");
    onChange(name, null);
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

        {!fileName ? (
          <div
            className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center ${hasError ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-blue-400"}`}
          >
            <input
              type="file"
              id={name}
              name={name}
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor={name}
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <FaUpload className="text-gray-400 text-xl sm:text-2xl mb-2" />
              <span className="text-xs sm:text-sm text-gray-500 mb-1">คลิกเพื่ออัพโหลดเอกสาร</span>
              <span className="text-xs text-gray-400">{helpText}</span>
            </label>
          </div>
        ) : (
          <div className="border rounded-lg p-2.5 sm:p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <FaFile className="text-blue-500 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 truncate">{fileName}</span>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="text-gray-400 hover:text-red-500"
              >
                <FaTimesCircle />
              </button>
            </div>
          </div>
        )}

        {hasError && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
      </div>

      {/* Oversize File Error Modal */}
      {showSizeErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 sm:mx-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">ไฟล์มีขนาดใหญ่เกินกำหนด</h3>
              <button
                type="button"
                onClick={() => setShowSizeErrorModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="ปิด"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700">
                {sizeErrorMessage || "กรุณาอัปโหลดไฟล์ที่มีขนาดไม่เกิน 5MB"}
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                type="button"
                onClick={() => setShowSizeErrorModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
