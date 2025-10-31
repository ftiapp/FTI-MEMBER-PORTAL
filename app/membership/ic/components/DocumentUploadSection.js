"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ImageEditor from "../../components/DocumentUpload/ImageEditor";
import SingleFileUploadZone from "../../components/DocumentUpload/SingleFileUploadZone";
import {
  createFileObject,
  validateFileSize,
  validateFileType,
  getImageEditorTitle,
  viewFile,
} from "../../components/DocumentUpload/fileUtils";
import {
  DocumentIcon,
  BuildingIcon,
  ShieldIcon,
  PhotoIcon,
} from "../../components/DocumentUpload/IconComponents";

export default function DocumentUploadSection({ formData, setFormData, errors }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [showSignatureEditor, setShowSignatureEditor] = useState(false);
  const [editingSignature, setEditingSignature] = useState(null);


  const handleAuthorizedPrenameChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev };

      if (field === "authorizedSignatoryPrenameTh") {
        const THAI_TO_ENGLISH_PRENAME = {
          นาย: "Mr.",
          นาง: "Mrs.",
          นางสาว: "Miss",
          อื่นๆ: "Other",
        };
        next.authorizedSignatoryPrenameTh = value;
        next.authorizedSignatoryPrenameEn = THAI_TO_ENGLISH_PRENAME[value] || "";
        if (value !== "อื่นๆ") {
          next.authorizedSignatoryPrenameOther = "";
          next.authorizedSignatoryPrenameOtherEn = "";
        }
      } else if (field === "authorizedSignatoryPrenameEn") {
        const ENGLISH_TO_THAI_PRENAME = {
          "Mr.": "นาย",
          "Mrs.": "นาง",
          Miss: "นางสาว",
          Other: "อื่นๆ",
        };
        next.authorizedSignatoryPrenameEn = value;
        next.authorizedSignatoryPrenameTh = ENGLISH_TO_THAI_PRENAME[value] || "";
        if (value !== "Other") {
          next.authorizedSignatoryPrenameOtherEn = "";
        }
        if ((ENGLISH_TO_THAI_PRENAME[value] || "") !== "อื่นๆ") {
          next.authorizedSignatoryPrenameOther = "";
        }
      }

      return next;
    });
  };

  useEffect(() => {
    if (formData.idCardDocument) {
      setSelectedFile(formData.idCardDocument);
    }
    if (formData.authorizedSignature) {
      setSelectedSignature(formData.authorizedSignature);
    }
    if (formData.attachmentDocument) {
      setSelectedAttachment(formData.attachmentDocument);
    }
  }, [formData.idCardDocument, formData.authorizedSignature, formData.attachmentDocument]);

  const handleFileChange = (e, documentType) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      if (!validateFileSize(file)) {
        alert("ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB");
        return;
      }

      if (documentType === "authorizedSignature") {
        if (!validateFileType(file, ["image/jpeg", "image/jpg", "image/png"])) {
          alert("ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ภาพเท่านั้น (JPG, JPEG หรือ PNG)");
          return;
        }
        setEditingSignature(file);
        setShowSignatureEditor(true);
      } else if (documentType === "idCardDocument") {
        if (!validateFileType(file, ["image/jpeg", "image/jpg", "image/png", "application/pdf"])) {
          alert("ประเภทไฟล์ไม่ถูกต้อง สำเนาบัตรประชาชนรองรับไฟล์ภาพ (JPG, JPEG, PNG) หรือ PDF");
          return;
        }
        const fileObj = createFileObject(file);
        setSelectedFile(fileObj);
        setFormData((prev) => ({ ...prev, [documentType]: fileObj }));
      } else if (documentType === "attachmentDocument") {
        if (!validateFileType(file, ["image/jpeg", "image/jpg", "image/png", "application/pdf"])) {
          alert("ประเภทไฟล์ไม่ถูกต้อง เอกสารแนบรองรับไฟล์ภาพ (JPG, JPEG, PNG) หรือ PDF");
          return;
        }
        const fileObj = createFileObject(file);
        setSelectedAttachment(fileObj);
        setFormData((prev) => ({ ...prev, [documentType]: fileObj }));
      }
    }
  };

  const handleSignatureSave = (blob) => {
    const file = new File([blob], "signature.png", { type: "image/png" });
    const fileObj = createFileObject(file);
    setSelectedSignature(fileObj);
    setFormData((prev) => ({ ...prev, authorizedSignature: fileObj }));
    setShowSignatureEditor(false);
    setEditingSignature(null);
  };

  const editSignature = () => {
    if (selectedSignature) {
      setEditingSignature(selectedSignature);
      setShowSignatureEditor(true);
    }
  };

  const removeFile = (documentType) => {
    if (documentType === "idCardDocument") {
      setSelectedFile(null);
    } else if (documentType === "authorizedSignature") {
      setSelectedSignature(null);
    } else if (documentType === "attachmentDocument") {
      setSelectedAttachment(null);
    }

    setFormData((prev) => ({ ...prev, [documentType]: null }));

    const fileInput = document.getElementById(documentType);
    if (fileInput) {
      fileInput.value = "";
    }
  };


  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10"
        data-section="documents"
      >
        <div className="bg-blue-600 px-8 py-6">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            เอกสารแนบ / Attached Documents
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            อัพโหลดสำเนาบัตรประชาชนและลายเซ็น / Upload ID card copy and signature
          </p>
        </div>

        <div className="px-8 py-8">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 10h6M7 14h3"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14a3 3 0 100-6 3 3 0 000 6z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">สำเนาบัตรประชาชน</h3>
              <p className="text-sm text-gray-600">
                กรุณาอัพโหลดสำเนาบัตรประชาชนพร้อมลายเซ็นรับรองสำเนาถูกต้อง
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    รายการเอกสารที่ท่านต้องเตรียม
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>บัตรประจำตัวประชาชน พร้อมลายเซ็นสำเนาถูกต้อง</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="idCardUpload"
              data-field="idCardDocument"
              className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
                errors?.idCardDocument
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <SingleFileUploadZone
                title=""
                description=""
                name="idCardDocument"
                file={selectedFile}
                icon={DocumentIcon}
                error={errors?.idCardDocument}
                onFileChange={(e) => handleFileChange(e, "idCardDocument")}
                onRemoveFile={() => removeFile("idCardDocument")}
                onViewFile={() => viewFile(selectedFile)}
                onEditImage={null}
                disabled={selectedFile !== null}
                accept=".jpg,.jpeg,.png,.pdf"
                isImageRequired={false}
              />
            </div>

            {errors?.idCardDocument && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1">{errors.idCardDocument}</span>
              </p>
            )}

            {selectedFile && !errors?.idCardDocument && (
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
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="mx-auto h-10 w-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ลายเซ็นผู้มีอำนาจลงนาม</h3>
              <p className="text-sm text-gray-600">
                กรุณาอัพโหลดรูปลายเซ็นของผู้มีอำนาจลงนาม (จำเป็น)
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-2">ข้อมูลผู้มีอำนาจลงนาม</h4>
              <p className="text-sm text-gray-600 mb-4">
                กรุณากรอกชื่อ-นามสกุล และตำแหน่งของผู้มีอำนาจลงนามทั้งภาษาไทยและอังกฤษ
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* แถวที่ 1: ภาษาไทย */}
                {/* คำนำหน้า (ไทย) */}
                <div>
                  <label
                    htmlFor="authorizedSignatoryPrenameTh"
                    className="block text-sm font-medium text-gray-700"
                  >
                    คำนำหน้า (ไทย) <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="authorizedSignatoryPrenameTh"
                    name="authorizedSignatoryPrenameTh"
                    value={formData.authorizedSignatoryPrenameTh || ""}
                    onChange={(e) =>
                      handleAuthorizedPrenameChange("authorizedSignatoryPrenameTh", e.target.value)
                    }
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPrenameTh ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                  >
                    <option value="">เลือก</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                  {formData.authorizedSignatoryPrenameTh === "อื่นๆ" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="authorizedSignatoryPrenameOther"
                        value={formData.authorizedSignatoryPrenameOther || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            authorizedSignatoryPrenameOther: e.target.value,
                          }))
                        }
                        placeholder="ระบุคำนำหน้า เช่น ผศ.ดร."
                        className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPrenameOther ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                      />
                      {errors?.authorizedSignatoryPrenameOther && (
                        <p className="mt-1 text-xs text-red-600 flex items-center">
                          <span className="mr-1">*</span>
                          {errors.authorizedSignatoryPrenameOther}
                        </p>
                      )}
                    </div>
                  )}
                  {errors?.authorizedSignatoryPrenameTh && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.authorizedSignatoryPrenameTh}
                    </p>
                  )}
                </div>

                {/* ชื่อ (ไทย) */}
                <div>
                  <label
                    htmlFor="authorizedSignatoryFirstNameTh"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ชื่อ (ภาษาไทย) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="authorizedSignatoryFirstNameTh"
                    name="authorizedSignatoryFirstNameTh"
                    data-field="authorizedSignatoryFirstNameTh"
                    type="text"
                    value={formData.authorizedSignatoryFirstNameTh || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryFirstNameTh: e.target.value,
                      }))
                    }
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryFirstNameTh ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                    placeholder="เช่น สมชาย"
                  />
                  {errors?.authorizedSignatoryFirstNameTh && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.authorizedSignatoryFirstNameTh}
                    </p>
                  )}
                </div>

                {/* นามสกุล (ไทย) */}
                <div>
                  <label
                    htmlFor="authorizedSignatoryLastNameTh"
                    className="block text-sm font-medium text-gray-700"
                  >
                    นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="authorizedSignatoryLastNameTh"
                    name="authorizedSignatoryLastNameTh"
                    data-field="authorizedSignatoryLastNameTh"
                    type="text"
                    value={formData.authorizedSignatoryLastNameTh || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryLastNameTh: e.target.value,
                      }))
                    }
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryLastNameTh ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                    placeholder="เช่น ใจดี"
                  />
                  {errors?.authorizedSignatoryLastNameTh && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.authorizedSignatoryLastNameTh}
                    </p>
                  )}
                </div>

                {/* ตำแหน่ง (ไทย) */}
                <div>
                  <label
                    htmlFor="authorizedSignatoryPositionTh"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ตำแหน่ง (ภาษาไทย)
                  </label>
                  <input
                    id="authorizedSignatoryPositionTh"
                    name="authorizedSignatoryPositionTh"
                    type="text"
                    value={formData.authorizedSignatoryPositionTh || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryPositionTh: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="เช่น กรรมการผู้จัดการ"
                  />
                </div>

                {/* แถวที่ 2: ภาษาอังกฤษ - Hidden */}
                {/* Prename (EN) - Hidden */}
                <div className="hidden">
                  <label
                    htmlFor="authorizedSignatoryPrenameEn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Prename (EN)
                  </label>
                  <select
                    id="authorizedSignatoryPrenameEn"
                    name="authorizedSignatoryPrenameEn"
                    value={formData.authorizedSignatoryPrenameEn || ""}
                    onChange={(e) =>
                      handleAuthorizedPrenameChange("authorizedSignatoryPrenameEn", e.target.value)
                    }
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPrenameEn ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                  >
                    <option value="">Select</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Miss">Miss</option>
                    <option value="Other">Other</option>
                  </select>
                  {formData.authorizedSignatoryPrenameEn === "Other" && (
                    <input
                      type="text"
                      name="authorizedSignatoryPrenameOtherEn"
                      value={formData.authorizedSignatoryPrenameOtherEn || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          authorizedSignatoryPrenameOtherEn: e.target.value,
                        }))
                      }
                      placeholder="e.g., Assoc. Prof., Dr."
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  )}
                  {errors?.authorizedSignatoryPrenameEn && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.authorizedSignatoryPrenameEn}
                    </p>
                  )}
                </div>

                {/* First Name (EN) - Hidden */}
                <div className="hidden">
                  <label
                    htmlFor="authorizedSignatoryFirstNameEn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="authorizedSignatoryFirstNameEn"
                    name="authorizedSignatoryFirstNameEn"
                    data-field="authorizedSignatoryFirstNameEn"
                    type="text"
                    value={formData.authorizedSignatoryFirstNameEn || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryFirstNameEn: e.target.value,
                      }))
                    }
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryFirstNameEn ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                    placeholder="e.g. Somchai"
                  />
                  {errors?.authorizedSignatoryFirstNameEn && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.authorizedSignatoryFirstNameEn}
                    </p>
                  )}
                </div>

                {/* Last Name (EN) - Hidden */}
                <div className="hidden">
                  <label
                    htmlFor="authorizedSignatoryLastNameEn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="authorizedSignatoryLastNameEn"
                    name="authorizedSignatoryLastNameEn"
                    data-field="authorizedSignatoryLastNameEn"
                    type="text"
                    value={formData.authorizedSignatoryLastNameEn || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryLastNameEn: e.target.value,
                      }))
                    }
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryLastNameEn ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                    placeholder="e.g. Jaidee"
                  />
                  {errors?.authorizedSignatoryLastNameEn && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.authorizedSignatoryLastNameEn}
                    </p>
                  )}
                </div>

                {/* Position (EN) - Hidden */}
                <div className="hidden">
                  <label
                    htmlFor="authorizedSignatoryPositionEn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Position (EN)
                  </label>
                  <input
                    id="authorizedSignatoryPositionEn"
                    name="authorizedSignatoryPositionEn"
                    type="text"
                    value={formData.authorizedSignatoryPositionEn || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryPositionEn: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g. Managing Director"
                  />
                </div>
              </div>
            </div>

            <div
              className="bg-white border border-gray-200 rounded-xl p-6 mb-6"
              style={{ display: "none" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="authorizedSignatoryPositionTh"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ตำแหน่ง (ภาษาไทย)
                  </label>
                  <input
                    id="authorizedSignatoryPositionTh"
                    name="authorizedSignatoryPositionTh"
                    type="text"
                    value={formData.authorizedSignatoryPositionTh || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryPositionTh: e.target.value,
                      }))
                    }
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPositionTh ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                    placeholder="เช่น กรรมการผู้จัดการ"
                  />
                  {errors?.authorizedSignatoryPositionTh && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.authorizedSignatoryPositionTh}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="authorizedSignatoryPositionEn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ตำแหน่ง (อังกฤษ)
                  </label>
                  <input
                    id="authorizedSignatoryPositionEn"
                    name="authorizedSignatoryPositionEn"
                    type="text"
                    value={formData.authorizedSignatoryPositionEn || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryPositionEn: e.target.value,
                      }))
                    }
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPositionEn ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                    placeholder="e.g. Managing Director"
                  />
                  {errors?.authorizedSignatoryPositionEn && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.authorizedSignatoryPositionEn}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
              id="authorizedSignatureUpload"
              data-field="authorizedSignature"
              className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
                errors?.authorizedSignature
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <SingleFileUploadZone
                title=""
                description=""
                name="authorizedSignature"
                file={selectedSignature}
                icon={PhotoIcon}
                error={errors?.authorizedSignature}
                onFileChange={(e) => handleFileChange(e, "authorizedSignature")}
                onRemoveFile={() => removeFile("authorizedSignature")}
                onViewFile={() => viewFile(selectedSignature)}
                onEditImage={editSignature}
                disabled={selectedSignature !== null}
                accept=".jpg,.jpeg,.png"
                isImageRequired={true}
              />
            </div>

            {errors?.authorizedSignature && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1">{errors.authorizedSignature}</span>
              </p>
            )}

            {selectedSignature && !errors?.authorizedSignature && (
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

        <div className="px-8 pb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">เอกสารแนบ</h3>
              <p className="text-sm text-gray-600">
                หมายเหตุ : โปรดลงนาม และประทับตราทุกหน้า
              </p>
            </div>

            <div
              id="attachmentUpload"
              data-field="attachmentDocument"
              className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
                errors?.attachmentDocument
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <SingleFileUploadZone
                title=""
                description=""
                name="attachmentDocument"
                file={selectedAttachment}
                icon={DocumentIcon}
                error={errors?.attachmentDocument}
                onFileChange={(e) => handleFileChange(e, "attachmentDocument")}
                onRemoveFile={() => removeFile("attachmentDocument")}
                onViewFile={() => viewFile(selectedAttachment)}
                onEditImage={null}
                disabled={selectedAttachment !== null}
                accept=".jpg,.jpeg,.png,.pdf"
                isImageRequired={false}
              />
            </div>

            {errors?.attachmentDocument && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1">{errors.attachmentDocument}</span>
              </p>
            )}

            {selectedAttachment && !errors?.attachmentDocument && (
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
          </div>
        </div>
      </div>

      <ImageEditor
        isOpen={showSignatureEditor}
        onClose={() => {
          setShowSignatureEditor(false);
          setEditingSignature(null);
        }}
        onSave={handleSignatureSave}
        initialImage={editingSignature}
        title="ปรับแต่งลายเซ็น"
      />
    </>
  );
}

DocumentUploadSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
};

DocumentUploadSection.defaultProps = {
  errors: {},
};
