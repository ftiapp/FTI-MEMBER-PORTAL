"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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

/**
 * คอมโพเนนต์สำหรับอัพโหลดเอกสารในฟอร์มสมัครสมาชิกประเภท AC (สมทบ-นิติบุคคล)
 * @param {Object} props
 * @param {Object} props.formData ข้อมูลฟอร์มทั้งหมด
 * @param {Function} props.setFormData ฟังก์ชันสำหรับอัพเดทข้อมูลฟอร์ม
 * @param {Object} props.errors ข้อผิดพลาดของฟอร์ม
 */
export default function DocumentUploadSection({ formData, setFormData, errors, setErrors }) {
  // ใช้ useMemo เพื่อกำหนดค่าเริ่มต้นจาก formData เพียงครั้งเดียว
  const initialFiles = useMemo(
    () => ({
      companyRegistration: formData.companyRegistration || null,
      companyStamp: formData.companyStamp || null,
      authorizedSignature: formData.authorizedSignature || null,
      attachmentDocument: formData.attachmentDocument || null,
    }),
    [],
  ); // Empty deps - calculate only once

  const [selectedFiles, setSelectedFiles] = useState(initialFiles);

  // Image editor states
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editingType, setEditingType] = useState(""); // 'companyStamp' or 'authorizedSignature'

  // Clear errors when files are uploaded
  useEffect(() => {
    if (setErrors && errors) {
      const newErrors = { ...errors };
      let hasChanges = false;

      // Clear companyStamp error if file exists
      if (
        formData.companyStamp &&
        (formData.companyStamp.file ||
          formData.companyStamp.url ||
          formData.companyStamp instanceof File) &&
        errors.companyStamp
      ) {
        delete newErrors.companyStamp;
        hasChanges = true;
      }

      // Clear authorizedSignature error if file exists
      if (
        formData.authorizedSignature &&
        (formData.authorizedSignature.file ||
          formData.authorizedSignature.url ||
          formData.authorizedSignature instanceof File) &&
        errors.authorizedSignature
      ) {
        delete newErrors.authorizedSignature;
        hasChanges = true;
      }

      // Clear companyRegistration error if file exists
      if (formData.companyRegistration && errors.companyRegistration) {
        delete newErrors.companyRegistration;
        hasChanges = true;
      }

      if (hasChanges) {
        setErrors(newErrors);
      }
    }
  }, [
    formData.companyStamp,
    formData.authorizedSignature,
    formData.companyRegistration,
    errors,
    setErrors,
  ]);

  // Helper function to create consistent file object
  const createFileObject = (file) => {
    return {
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };
  };

  const handleFileChange = (e, documentType) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      if (!validateFileSize(file)) {
        alert("ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB");
        return;
      }

      // สำหรับ companyStamp และ authorizedSignature บังคับเป็นไฟล์รูปภาพเท่านั้น
      if (documentType === "companyStamp" || documentType === "authorizedSignature") {
        if (!validateFileType(file, ["image/jpeg", "image/jpg", "image/png"])) {
          alert("ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ภาพเท่านั้น (JPG, JPEG หรือ PNG)");
          return;
        }

        // เปิด Image Editor สำหรับไฟล์รูปภาพ
        setEditingImage(file);
        setEditingType(documentType);
        setShowImageEditor(true);
      } else {
        // สำหรับเอกสารอื่นๆ
        if (!validateFileType(file, ["application/pdf", "image/jpeg", "image/jpg", "image/png"])) {
          alert("กรุณาเลือกไฟล์ประเภท PDF, JPG หรือ PNG เท่านั้น");
          return;
        }
        const fileObj = createFileObject(file);
        setSelectedFiles((prev) => ({ ...prev, [documentType]: fileObj }));
        setFormData((prev) => ({ ...prev, [documentType]: fileObj }));
      }
    }
  };

  const handleImageSave = (blob) => {
    const file = new File([blob], `${editingType}.png`, { type: "image/png" });
    const fileObj = createFileObject(file);
    setSelectedFiles((prev) => ({ ...prev, [editingType]: fileObj }));
    setFormData((prev) => ({ ...prev, [editingType]: fileObj }));
    setShowImageEditor(false);
    setEditingImage(null);
    setEditingType("");
  };

  const editImage = (documentType) => {
    const file = selectedFiles[documentType];
    if (file) {
      setEditingImage(file);
      setEditingType(documentType);
      setShowImageEditor(true);
    }
  };

  const removeFile = (documentType) => {
    setSelectedFiles((prev) => ({ ...prev, [documentType]: null }));
    setFormData((prev) => ({ ...prev, [documentType]: null }));
    
    const fileInput = document.getElementById(documentType);
    if (fileInput) {
      fileInput.value = "";
    }
  };



  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
        {/* Header Section */}
        <div className="bg-blue-600 px-8 py-6">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            เอกสารประกอบการสมัคร / Application Documents
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            กรุณาอัพโหลดเอกสารที่จำเป็นสำหรับการสมัครสมาชิกประเภทสมทบ-นิติบุคคล (ทน) / Please upload
            required documents for Associate Corporate membership application
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 py-8 space-y-8">
          {/* Required Documents Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>โปรดอัพโหลดเอกสารที่จำเป็น</strong> เอกสารต้องเป็นไฟล์ PDF, JPG หรือ PNG
                  ขนาดไม่เกิน 5MB
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  รายการเอกสารที่ท่านต้องเตรียม: หนังสือรับรองการจดทะเบียนนิติบุคคล, ตราประทับบริษัท
                  และลายเซ็นผู้มีอำนาจลงนาม
                </p>
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                <svg
                  className="w-4 h-4 text-blue-600"
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
                <span className="text-sm font-medium text-blue-800">
                  อัปโหลดเอกสารประกอบการสมัคร
                </span>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                <svg
                  className="w-4 h-4 text-blue-600"
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
                <span className="text-sm font-medium text-blue-800">
                  อัปโหลดเอกสารประกอบการสมัคร
                </span>
              </div>
            </div>

            {/* Company Registration Upload */}
            <SingleFileUploadZone
              title="สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล"
              description="ออกโดยกระทรวงพาณิชย์ อายุไม่เกิน 6 เดือน พร้อมลายเซ็นสำเนาถูกต้อง"
              name="companyRegistration"
              file={selectedFiles.companyRegistration}
              icon={
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
              iconColor="text-blue-600"
              bgColor="bg-blue-100"
              error={errors?.companyRegistration}
            />
          </div>

          {/* Required Company Documents - Always visible */}
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-sm font-medium text-blue-800">
                  เอกสารที่จำเป็นต้องอัปโหลด (บังคับ)
                </span>
              </div>
            </div>

            {/* Authorized Signatory Name Inputs */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-blue-800">ข้อมูลผู้มีอำนาจลงนาม</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* แถวที่ 1: ภาษาไทย */}
                {/* คำนำหน้า (ไทย) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำนำหน้า (ไทย) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.authorizedSignatoryPrenameTh || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const mapThToEn = { นาย: "Mr", นาง: "Mrs", นางสาว: "Ms", อื่นๆ: "Other" };
                      const mappedEn = mapThToEn[value] || "";
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryPrenameTh: value,
                        authorizedSignatoryPrenameEn: mappedEn,
                        authorizedSignatoryPrenameOther:
                          value === "อื่นๆ" ? prev.authorizedSignatoryPrenameOther || "" : "",
                        authorizedSignatoryPrenameOtherEn:
                          mappedEn === "Other" ? prev.authorizedSignatoryPrenameOtherEn || "" : "",
                      }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        value={formData.authorizedSignatoryPrenameOther || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            authorizedSignatoryPrenameOther: e.target.value.replace(
                              /[^ก-๙\.\s]/g,
                              "",
                            ),
                          }))
                        }
                        placeholder="ระบุคำนำหน้า เช่น ผศ.ดร."
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${errors?.authorizedSignatoryPrenameOther ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`}
                        required
                      />
                      {errors?.authorizedSignatoryPrenameOther && (
                        <p className="mt-1 text-xs text-red-600 flex items-center">
                          <span className="mr-1">*</span>
                          {errors.authorizedSignatoryPrenameOther}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* ชื่อ (ไทย) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อ (ภาษาไทย) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="authorizedSignatoryFirstNameTh"
                    name="authorizedSignatoryFirstNameTh"
                    value={formData.authorizedSignatoryFirstNameTh || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryFirstNameTh: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors?.authorizedSignatoryFirstNameTh
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="เช่น สมชาย"
                  />
                  {errors?.authorizedSignatoryFirstNameTh && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.authorizedSignatoryFirstNameTh}
                    </p>
                  )}
                </div>

                {/* นามสกุล (ไทย) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="authorizedSignatoryLastNameTh"
                    name="authorizedSignatoryLastNameTh"
                    value={formData.authorizedSignatoryLastNameTh || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryLastNameTh: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors?.authorizedSignatoryLastNameTh
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="เช่น ใจดี"
                  />
                  {errors?.authorizedSignatoryLastNameTh && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.authorizedSignatoryLastNameTh}
                    </p>
                  )}
                </div>

                {/* ตำแหน่ง (ไทย) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ตำแหน่ง (ภาษาไทย) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="authorizedSignatoryPositionTh"
                    name="authorizedSignatoryPositionTh"
                    value={formData.authorizedSignatoryPositionTh || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryPositionTh: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors?.authorizedSignatoryPositionTh
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="เช่น กรรมการผู้จัดการ"
                  />
                  {errors?.authorizedSignatoryPositionTh && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.authorizedSignatoryPositionTh}
                    </p>
                  )}
                </div>

                {/* ซ่อนฟิลด์ภาษาอังกฤษ - ไม่ใช้งาน */}
              </div>

              <div></div>
            </div>

            {/* Company Stamp Upload */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BuildingIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  โลโก้/ตราประทับบริษัท / Company Logo/Stamp
                </h3>
              </div>
              <div className="max-w-2xl">
                <SingleFileUploadZone
                  title=""
                  description="กรุณาอัปโหลดโลโก้หรือตราประทับบริษัท (PNG พื้นหลังโปร่งใสจะดีที่สุด)"
                  name="companyStamp"
                  file={selectedFiles.companyStamp}
                  icon={BuildingIcon}
                  error={errors?.companyStamp}
                  onFileChange={(e) => handleFileChange(e, "companyStamp")}
                  onRemoveFile={() => removeFile("companyStamp")}
                  onViewFile={() => viewFile(selectedFiles.companyStamp)}
                  onEditImage={() => editImage("companyStamp")}
                  disabled={selectedFiles.companyStamp !== null}
                  accept=".jpg,.jpeg,.png"
                  isImageRequired={true}
                />
              </div>
            </div>

            {/* Authorized Signature Upload */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ShieldIcon className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  ลายเซ็นผู้มีอำนาจลงนาม / Authorized Signatory's Signature
                </h3>
              </div>
              <div className="max-w-2xl">
                <SingleFileUploadZone
                  title=""
                  description="กรุณาอัปโหลดลายเซ็นของผู้มีอำนาจลงนาม (PNG พื้นหลังโปร่งใสจะดีที่สุด)"
                  name="authorizedSignature"
                  file={selectedFiles.authorizedSignature}
                  icon={PhotoIcon}
                  error={errors?.authorizedSignature}
                  onFileChange={(e) => handleFileChange(e, "authorizedSignature")}
                  onRemoveFile={() => removeFile("authorizedSignature")}
                  onViewFile={() => viewFile(selectedFiles.authorizedSignature)}
                  onEditImage={() => editImage("authorizedSignature")}
                  disabled={selectedFiles.authorizedSignature !== null}
                  accept=".jpg,.jpeg,.png"
                  isImageRequired={true}
                />
              </div>
            </div>

            {/* Attachment Document Upload */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <DocumentIcon className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  เอกสารแนบ / Attachment Document
                </h3>
              </div>
              <div className="max-w-2xl">
                <SingleFileUploadZone
                  title=""
                  description="หมายเหตุ : โปรดลงนาม และประทับตราทุกหน้า"
                  name="attachmentDocument"
                  file={selectedFiles.attachmentDocument}
                  icon={DocumentIcon}
                  error={errors?.attachmentDocument}
                  onFileChange={(e) => handleFileChange(e, "attachmentDocument")}
                  onRemoveFile={() => removeFile("attachmentDocument")}
                  onViewFile={() => viewFile(selectedFiles.attachmentDocument)}
                  onEditImage={null}
                  disabled={selectedFiles.attachmentDocument !== null}
                  accept=".pdf,.jpg,.jpeg,.png"
                  isImageRequired={false}
                />
              </div>
            </div>

            {/* Certificate Upload */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <DocumentIcon className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  หนังสือรับรองการจดทะเบียนนิติบุคคล / Certificate of Registration
                </h3>
              </div>
              <div className="max-w-2xl">
                <SingleFileUploadZone
                  title=""
                  description="กรุณาอัปโหลดหนังสือรับรองการจดทะเบียนนิติบุคคล (PDF, JPG หรือ PNG)"
                  name="certificateFile"
                  file={selectedFiles.certificateFile}
                  icon={DocumentIcon}
                  error={errors?.certificateFile}
                  onFileChange={(e) => handleFileChange(e, "certificateFile")}
                  onRemoveFile={() => removeFile("certificateFile")}
                  onViewFile={() => viewFile(selectedFiles.certificateFile)}
                  onEditImage={null}
                  disabled={selectedFiles.certificateFile !== null}
                  accept=".pdf,.jpg,.jpeg,.png"
                  isImageRequired={false}
                />
              </div>
            </div>
          </div>

          {/* Image Editor Modal */}
          <div>
            <ImageEditor
              isOpen={showImageEditor}
              onClose={() => {
                setShowImageEditor(false);
                setEditingImage(null);
                setEditingType("");
              }}
              onSave={handleImageSave}
              initialImage={editingImage}
              title={getImageEditorTitle(editingType)}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
