"use client";

import { useState } from "react";
import MultipleFileManager from "../../components/MultipleFileManager";

const MultipleSignatories = ({
  formData,
  setFormData,
  errors,
  selectedFiles,
  setSelectedFiles,
  handleFileChange,
  viewFile,
  editImage,
  hasFile,
  getFileName,
  getFileSize,
  ErrorIcon,
  FileIcon,
  ViewIcon,
  EditIcon,
  DeleteIcon,
  UploadIcon,
  SingleFileUploadZone,
}) => {
  // Initialize signatories array with at least one signatory
  const [signatories, setSignatories] = useState(
    formData.signatories || [
      {
        id: 1,
        prenameTh: "",
        prenameOther: "",
        firstNameTh: "",
        lastNameTh: "",
        positionTh: "",
      },
    ],
  );

  // Add new signatory (max 4)
  const addSignatory = () => {
    if (signatories.length >= 4) return;

    const newSignatory = {
      id: Date.now(),
      prenameTh: "",
      prenameOther: "",
      firstNameTh: "",
      lastNameTh: "",
      positionTh: "",
    };

    const updatedSignatories = [...signatories, newSignatory];
    setSignatories(updatedSignatories);
    setFormData((prev) => ({ ...prev, signatories: updatedSignatories }));
  };

  // Remove signatory (keep at least one)
  const removeSignatory = (id) => {
    if (signatories.length <= 1) return;

    // Find index before filtering
    const indexToRemove = signatories.findIndex((s) => s.id === id);

    const updatedSignatories = signatories.filter((sig) => sig.id !== id);
    setSignatories(updatedSignatories);
    
    // Update signatures array: Remove the file at the same index
    const currentSignatures = [...(selectedFiles.authorizedSignatures || [])];
    // Ensure we don't crash if array is shorter
    if (indexToRemove !== -1 && currentSignatures.length > indexToRemove) {
      currentSignatures.splice(indexToRemove, 1);
    }
    
    // Update both formData fields
    setFormData((prev) => ({ 
      ...prev, 
      signatories: updatedSignatories,
      authorizedSignatures: currentSignatures 
    }));
    
    // Update selectedFiles state
    setSelectedFiles((prev) => ({ 
      ...prev, 
      authorizedSignatures: currentSignatures 
    }));
  };

  // Update signatory field
  const updateSignatory = (id, field, value) => {
    const updatedSignatories = signatories.map((sig) => {
      if (sig.id === id) {
        // Clear prenameOther when switching away from "อื่นๆ"
        if (field === "prenameTh" && value !== "อื่นๆ") {
          return { ...sig, [field]: value, prenameOther: "" };
        }
        return { ...sig, [field]: value };
      }
      return sig;
    });

    setSignatories(updatedSignatories);
    setFormData((prev) => ({ ...prev, signatories: updatedSignatories }));
  };

  // Get error message for specific signatory
  const getSignatoryError = (signatoryIndex, field) => {
    const errorPath = `signatories[${signatoryIndex}].${field}`;
    return errors?.[errorPath];
  };

  // Get signature error for specific signatory
  const getSignatureError = (signatoryIndex) => {
    return errors?.[`authorizedSignature_${signatoryIndex}`];
  };

  // Handle signature file removal for specific signatory
  const removeSignatureFile = (signatoryIndex) => {
    const currentSignatures = [...(selectedFiles.authorizedSignatures || [])];
    currentSignatures[signatoryIndex] = null;
    setSelectedFiles((prev) => ({ ...prev, authorizedSignatures: currentSignatures }));
    setFormData((prev) => ({ ...prev, authorizedSignatures: currentSignatures }));
  };

  // Handle signature file edit for specific signatory
  const editSignatureFile = (signatoryIndex) => {
    if (editImage) {
      editImage("authorizedSignature", signatoryIndex);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            ข้อมูลผู้มีอำนาจลงนาม (สูงสุด 4 ท่าน)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            กรุณาระบุข้อมูลผู้มีอำนาจลงนามในการดำเนินธุรกิจ
          </p>
        </div>
        {signatories.length < 4 && (
          <button
            type="button"
            onClick={addSignatory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            เพิ่มผู้มีอำนาจลงนาม
          </button>
        )}
      </div>

      {signatories.map((signatory, index) => (
        <div
          key={signatory.id ?? index}
          className="border border-gray-200 rounded-lg p-6 bg-gray-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">ผู้มีอำนาจลงนาม คนที่ {index + 1}</h4>
            {signatories.length > 1 && (
              <button
                type="button"
                onClick={() => removeSignatory(signatory.id)}
                className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                ลบ
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* แถวเดียว: คำนำหน้า + ชื่อ + นามสกุล + ตำแหน่ง */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* คำนำหน้า (Thai) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า *</label>
                <select
                  value={signatory.prenameTh}
                  onChange={(e) => updateSignatory(signatory.id, "prenameTh", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                    getSignatoryError(index, "prenameTh")
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                >
                  <option value="">เลือก</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
                {getSignatoryError(index, "prenameTh") && (
                  <p className="mt-1 text-xs text-red-600">
                    {getSignatoryError(index, "prenameTh")}
                  </p>
                )}
              </div>

              {/* คำนำหน้าอื่นๆ (Thai) */}
              {signatory.prenameTh === "อื่นๆ" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ระบุคำนำหน้า *
                  </label>
                  <input
                    type="text"
                    value={signatory.prenameOther}
                    onChange={(e) => updateSignatory(signatory.id, "prenameOther", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                      getSignatoryError(index, "prenameOther")
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                    placeholder="ระบุคำนำหน้าอื่นๆ"
                  />
                  {getSignatoryError(index, "prenameOther") && (
                    <p className="mt-1 text-xs text-red-600">
                      {getSignatoryError(index, "prenameOther")}
                    </p>
                  )}
                </div>
              ) : (
                /* ชื่อ (Thai) */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ *</label>
                  <input
                    type="text"
                    value={signatory.firstNameTh}
                    onChange={(e) => updateSignatory(signatory.id, "firstNameTh", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                      getSignatoryError(index, "firstNameTh")
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                    placeholder="ชื่อภาษาไทย"
                  />
                  {getSignatoryError(index, "firstNameTh") && (
                    <p className="mt-1 text-xs text-red-600">
                      {getSignatoryError(index, "firstNameTh")}
                    </p>
                  )}
                </div>
              )}

              {/* นามสกุล (Thai) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล *</label>
                <input
                  type="text"
                  value={signatory.lastNameTh}
                  onChange={(e) => updateSignatory(signatory.id, "lastNameTh", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                    getSignatoryError(index, "lastNameTh")
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-blue-200"
                  }`}
                  placeholder="นามสกุลภาษาไทย"
                />
                {getSignatoryError(index, "lastNameTh") && (
                  <p className="mt-1 text-xs text-red-600">
                    {getSignatoryError(index, "lastNameTh")}
                  </p>
                )}
              </div>

              {/* ตำแหน่ง (Thai) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                <input
                  type="text"
                  value={signatory.positionTh}
                  onChange={(e) => updateSignatory(signatory.id, "positionTh", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="ตำแหน่งภาษาไทย"
                />
              </div>
            </div>
          </div>

          {/* Signature Upload Section */}
          <div className="mt-6">
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded bg-purple-100">
                  <div className="text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    แนบไฟล์ลายเซ็นผู้มีอำนาจลงนาม คนที่ {index + 1} *
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-600">
                    อัปโหลดรูปลายเซ็นของผู้มีอำนาจลงนามคนที่ {index + 1}
                  </p>
                </div>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
                  getSignatureError(index)
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-purple-400"
                }`}
              >
                {!hasFile(selectedFiles.authorizedSignatures?.[index] || null) ? (
                  <div className="text-center">
                    {UploadIcon}
                    <div className="flex flex-col items-center mt-4">
                      <p className="text-sm text-gray-500">ลากไฟล์มาวางที่นี่ หรือ</p>
                      <label htmlFor={`signature-${index}`} className="mt-2 cursor-pointer">
                        <span className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors duration-200">
                          เลือกไฟล์
                        </span>
                        <input
                          id={`signature-${index}`}
                          name="authorizedSignature"
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, "authorizedSignature", index)}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        รองรับไฟล์ JPG, JPEG, PNG ขนาดไม่เกิน 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {FileIcon}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {getFileName(selectedFiles.authorizedSignatures?.[index] || null)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getFileSize(selectedFiles.authorizedSignatures?.[index] || null)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          viewFile(selectedFiles.authorizedSignatures?.[index] || null)
                        }
                        className="p-2 text-purple-600 bg-purple-100 rounded-full hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        title="ดูไฟล์"
                      >
                        {ViewIcon}
                      </button>
                      <button
                        type="button"
                        onClick={() => editSignatureFile(index)}
                        className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="ปรับแต่งรูปภาพ"
                      >
                        {EditIcon}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSignatureFile(index)}
                        className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="ลบไฟล์"
                      >
                        {DeleteIcon}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error message */}
              {getSignatureError(index) && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  {ErrorIcon}
                  <span className="ml-1">{getSignatureError(index)}</span>
                </p>
              )}

              {/* Success message */}
              {hasFile(selectedFiles.authorizedSignatures?.[index] || null) &&
                !getSignatureError(index) && (
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    ไฟล์ถูกอัพโหลดเรียบร้อยแล้ว
                  </div>
                )}

              {/* Signature guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-xs">
                    <p className="font-medium text-blue-800 mb-2">
                      ขนาดแนะนำ: 120x60 พิกเซล, พื้นหลังโปร่งใส (PNG)
                    </p>
                    <div className="flex gap-4">
                      <a
                        href="/images/FTI-SIGNATUREsample.jpg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        ดูตัวอย่างลายเซ็น
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MultipleSignatories;
