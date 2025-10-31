"use client";

import { useRef } from "react";
import { 
  hasFile, 
  getFileName, 
  getFileSize, 
  viewFile 
} from "./fileUtils";
import {
  ErrorIcon,
  FileIcon,
  ViewIcon,
  EditIcon,
  DeleteIcon,
  UploadIcon,
  SuccessIcon
} from "./IconComponents";

/**
 * Reusable Single File Upload Zone Component
 * 
 * @param {Object} props
 * @param {string} props.title - Document title
 * @param {string} props.description - Document description
 * @param {string} props.name - Document field name
 * @param {Object|File|null} props.file - Current file
 * @param {JSX.Element} props.icon - Custom icon (optional)
 * @param {string} props.iconColor - Icon color class
 * @param {string} props.bgColor - Background color class
 * @param {string} props.error - Error message
 * @param {boolean} props.isImageRequired - If true, only images allowed
 * @param {boolean} props.disabled - If true, upload is disabled
 * @param {Function} props.onFileChange - File change handler
 * @param {Function} props.onRemoveFile - File remove handler
 * @param {Function} props.onEditImage - Image edit handler (for images)
 * @param {boolean} props.compact - Use compact layout (like OC)
 * @param {string} props.maxSizeMB - Maximum file size in MB (default: 5)
 */
const SingleFileUploadZone = ({
  title,
  description,
  name,
  file,
  icon,
  iconColor = "text-blue-600",
  bgColor = "bg-blue-100",
  error,
  isImageRequired = false,
  disabled = false,
  onFileChange,
  onRemoveFile,
  onEditImage,
  compact = false,
  maxSizeMB = 5,
}) => {
  const fileInputRef = useRef(null);

  const handleFileInputChange = (e) => {
    if (onFileChange) {
      onFileChange(e, name);
    }
  };

  const removeFile = () => {
    if (onRemoveFile) {
      onRemoveFile(name);
    }
    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const handleEditImage = () => {
    if (onEditImage) {
      onEditImage(name);
    }
  };

  const hasUploadedFile = hasFile(file);

  // Compact layout (OC style)
  if (compact) {
    return (
      <div className="max-w-2xl mx-auto mb-8">
        {/* Header: show document title/description */}
        <div className="flex items-start mb-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded ${bgColor}`}
          >
            <div className={`${iconColor}`}>
              {icon || DocumentIcon}
            </div>
          </div>
          <div className="ml-3">
            {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-gray-600">{description}</p>}
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
            disabled
              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
              : error
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-blue-400"
          }`}
        >
          {!hasUploadedFile ? (
            <div className="text-center">
              <UploadIcon />
              <div className="flex flex-col items-center mt-4">
                <p className={`text-sm ${disabled ? "text-gray-400" : "text-gray-500"}`}>
                  {disabled
                    ? "ไม่สามารถอัปโหลดได้ (กรุณาลบไฟล์อีกตัวเลือกก่อน)"
                    : "ลากไฟล์มาวางที่นี่ หรือ"}
                </p>
                {!disabled && (
                  <>
                    <label htmlFor={name} className="mt-2 cursor-pointer">
                      <span
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${
                          isImageRequired
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        เลือกไฟล์
                      </span>
                      <input
                        ref={fileInputRef}
                        id={name}
                        name={name}
                        type="file"
                        accept={isImageRequired ? ".jpg,.jpeg,.png" : ".pdf,.jpg,.jpeg,.png"}
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      {isImageRequired
                        ? "รองรับไฟล์ JPG, JPEG, PNG ขนาดไม่เกิน 5MB"
                        : "รองรับไฟล์: PDF, JPG, PNG (ขนาดไม่เกิน 10MB)"}
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {FileIcon}
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {getFileName(file)}
                  </p>
                  <p className="text-xs text-gray-500">{getFileSize(file)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => viewFile(file)}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isImageRequired
                      ? "text-purple-600 bg-purple-100 hover:bg-purple-200 focus:ring-purple-500"
                      : "text-blue-600 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500"
                  } focus:outline-none focus:ring-2`}
                  title="ดูไฟล์"
                >
                  {ViewIcon}
                </button>
                {isImageRequired &&
                  file &&
                  (file.type?.startsWith("image/") || file instanceof File) &&
                  onEditImage && (
                    <button
                      type="button"
                      onClick={handleEditImage}
                      className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      title="ปรับแต่งรูปภาพ"
                    >
                      {EditIcon}
                    </button>
                  )}
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  title="ลบไฟล์"
                >
                  {DeleteIcon}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            {ErrorIcon}
            <span className="ml-1">{error}</span>
          </p>
        )}

        {/* Success message */}
        {hasUploadedFile && !error && (
          <div className="mt-2 flex items-center text-sm text-green-600">
            {SuccessIcon}
            ไฟล์ถูกอัพโหลดเรียบร้อยแล้ว
          </div>
        )}
      </div>
    );
  }

  // Full layout (AM, IC, AC style)
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
          error ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-blue-400 bg-white"
        }`}
      >
        {/* Document header: icon, title, description */}
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            {icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">{description}</p>
        </div>

        {!hasUploadedFile ? (
          <div className="text-center">
            <UploadIcon />
            <div className="flex flex-col items-center mt-4">
              <p className="text-sm text-gray-500">ลากไฟล์มาวางที่นี่ หรือ</p>
              <label htmlFor={name} className="mt-2 cursor-pointer">
                <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200">
                  เลือกไฟล์
                </span>
                <input
                  ref={fileInputRef}
                  id={name}
                  name={name}
                  type="file"
                  accept={isImageRequired ? ".jpg,.jpeg,.png" : ".pdf,.jpg,.jpeg,.png"}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">
                {isImageRequired
                  ? "รองรับไฟล์ JPG, JPEG, PNG ขนาดไม่เกิน 5MB"
                  : "รองรับไฟล์: PDF, JPG, PNG (ขนาดไม่เกิน 5MB)"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base">{getFileName(file)}</p>
                <p className="text-sm text-gray-500">{getFileSize(file)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => viewFile(file)}
                className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                title="ดูไฟล์"
              >
                {ViewIcon}
                ดู
              </button>
              {isImageRequired &&
                file &&
                (file.type?.startsWith("image/") || file instanceof File) &&
                onEditImage && (
                  <button
                    type="button"
                    onClick={handleEditImage}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                    title="ปรับแต่งรูปภาพ"
                  >
                    {EditIcon}
                    ปรับแต่ง
                  </button>
                )}
              <button
                type="button"
                onClick={removeFile}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                title="ลบไฟล์"
              >
                {DeleteIcon}
                ลบ
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <div className="flex items-center gap-3">
              {ErrorIcon}
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Success message */}
        {hasUploadedFile && !error && (
          <div className="mt-4 flex items-center text-sm text-blue-600">
            {SuccessIcon}
            ไฟล์ถูกอัพโหลดเรียบร้อยแล้ว
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleFileUploadZone;
