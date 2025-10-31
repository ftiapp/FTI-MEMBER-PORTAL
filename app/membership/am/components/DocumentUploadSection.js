// components/DocumentUploadSection.js
"use client";

import { useState, useEffect } from "react";
import ImageEditor from "../../components/DocumentUpload/ImageEditor";
import SingleFileUploadZone from "../../components/DocumentUpload/SingleFileUploadZone";
import {
  createFileObject,
  validateFileSize,
  validateFileType,
  getImageEditorTitle,
} from "../../components/DocumentUpload/fileUtils";
import {
  DocumentIcon,
  UsersIcon,
  ShieldIcon,
  PhotoIcon,
} from "../../components/DocumentUpload/IconComponents";

export default function DocumentUploadSection({ formData, setFormData, errors }) {
  // ใช้ข้อมูลจาก formData เป็นค่าเริ่มต้นเพื่อให้แสดงไฟล์ที่เคยอัปโหลดไว้
  const [selectedFiles, setSelectedFiles] = useState({
    associationCertificate: formData.associationCertificate || null,
    memberList: formData.memberList || null,
    companyStamp: formData.companyStamp || null,
    authorizedSignature: formData.authorizedSignature || null,
    attachmentDocument: formData.attachmentDocument || null,
  });

  // Image editor states
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editingType, setEditingType] = useState(""); // 'companyStamp' or 'authorizedSignature'

  // Debug: เพิ่ม useEffect เพื่อ debug
  useEffect(() => {
    console.log("=== DEBUG AM DocumentUploadSection ===");
    console.log("formData.companyStamp:", formData.companyStamp);
    console.log("formData.authorizedSignature:", formData.authorizedSignature);
    console.log("selectedFiles:", selectedFiles);
    console.log("errors:", errors);
  }, [formData.companyStamp, formData.authorizedSignature, selectedFiles, errors]);

  // Sync selectedFiles with formData when component mounts or formData changes
  useEffect(() => {
    setSelectedFiles({
      associationCertificate: formData.associationCertificate || null,
      memberList: formData.memberList || null,
      companyStamp: formData.companyStamp || null,
      authorizedSignature: formData.authorizedSignature || null,
      attachmentDocument: formData.attachmentDocument || null,
    });
  }, [formData]);

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
        // สำหรับเอกสารอื่นๆ รองรับทั้ง PDF และรูปภาพ
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (!validateFileType(file, allowedTypes)) {
          alert("กรุณาเลือกไฟล์ประเภท PDF, JPG หรือ PNG เท่านั้น");
          return;
        }

        console.log(`📁 Selected file for ${documentType}:`, file.name, file.size, file.type);

        setSelectedFiles((prev) => ({ ...prev, [documentType]: file }));
        setFormData((prev) => ({ ...prev, [documentType]: file }));
      }
    }
  };

  const handleImageSave = (blob) => {
    const file = new File([blob], `${editingType}.png`, { type: "image/png" });
    setSelectedFiles((prev) => ({ ...prev, [editingType]: file }));
    setFormData((prev) => ({ ...prev, [editingType]: file }));
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
  };



  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">เอกสารประกอบการสมัคร</h2>
          <p className="text-blue-100 text-base mt-2">
            กรุณาอัพโหลดเอกสารที่จำเป็นสำหรับการสมัครสมาชิกสมาคมการค้า
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 py-8 space-y-8">
          {/* Required Documents Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-semibold text-blue-900 mb-2">ข้อมูลสำคัญ</h3>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>โปรดอัพโหลดเอกสารที่จำเป็น</strong> เอกสารต้องเป็นไฟล์ PDF, JPG หรือ PNG
                  ขนาดไม่เกิน 5MB
                </p>
                <p className="text-sm text-blue-800">
                  รายการเอกสารที่ท่านต้องเตรียม: หนังสือรับรองการจดทะเบียนสมาคมการค้า
                  และรายชื่อสมาชิกสมาคม
                </p>
              </div>
            </div>
          </div>

          {/* Document Upload Section - เอกสารทั่วไป */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-blue-200 rounded-full shadow-sm">
                <svg
                  className="w-5 h-5 text-blue-600"
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
                <span className="text-base font-semibold text-blue-800">
                  เอกสารรับรอง / Certification Documents *
                </span>
              </div>
            </div>

            {/* Association Certificate Upload */}
            <div data-error-key="associationCertificate">
              <SingleFileUploadZone
                title="สำเนาหนังสือรับรองการจดทะเบียนเป็นสมาคมการค้า / Association Registration Certificate *"
                description="เอกสารรับรองการจดทะเบียนสมาคมการค้าที่ออกโดยหน่วยงานราชการ พร้อมลายเซ็นสำเนาถูกต้อง "
                name="associationCertificate"
                file={selectedFiles.associationCertificate}
                icon={DocumentIcon}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
                error={errors?.associationCertificate}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
              />
            </div>

            {/* Member List Upload */}
            <div data-error-key="memberList">
              <SingleFileUploadZone
                title="รายชื่อสมาชิกสมาคม / Association Member List *"
                description="เอกสารแสดงรายชื่อสมาชิกของสมาคมการค้า พร้อมลายเซ็นสำเนาถูกต้อง"
                name="memberList"
                file={selectedFiles.memberList}
                icon={UsersIcon}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
                error={errors?.memberList}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
              />
            </div>
          </div>

          {/* เพิ่มช่องว่างระหว่างส่วน */}
          <div className="h-12"></div>

          {/* Document Upload Section - ตราประทับและลายเซ็น */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-blue-200 rounded-full shadow-sm">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="text-base font-semibold text-blue-800">
                  ตราประทับและลายเซ็น / Stamp and Signature
                </span>
              </div>
            </div>

            {/* Required Documents Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-8">
              <div className="flex items-center gap-2">
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  จำเป็น
                </span>
                <span className="text-sm text-red-700 font-medium">
                  เอกสารที่จำเป็นสำหรับการสมัครสมาชิก
                </span>
              </div>
            </div>

            {/* Company Stamp Upload - Required */}
            <div className="space-y-3" data-error-key="companyStamp">
              <SingleFileUploadZone
                title="รูปตราประทับสมาคม / Association Stamp Image *"
                description="รูปถ่ายตราประทับของสมาคม หรือรูปลายเซ็นหากไม่มีตราประทับ (จำเป็น) / Photo of association stamp or signature image if no stamp available (required)"
                name="companyStamp"
                file={selectedFiles.companyStamp}
                icon={ShieldIcon}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
                error={errors?.companyStamp}
                isImageRequired={true}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
                onEditImage={editImage}
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
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
                      ขนาดแนะนำ: 300x300 พิกเซล, พื้นหลังโปร่งใส (PNG)
                    </p>
                    <div className="flex gap-4">
                      <a
                        href="/images/FTI-LOGOsample.png"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        ดูตัวอย่างตราประทับ
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Authorized Signatory Name Fields */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  ข้อมูลผู้มีอำนาจลงนาม / Authorized Signatory Information
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  กรุณากรอกชื่อ-นามสกุล และตำแหน่งของผู้มีอำนาจลงนามทั้งภาษาไทยและอังกฤษ / Please
                  enter name and position of authorized signatory in both Thai and English
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* คำนำหน้า (ไทย) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำนำหน้า <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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
                        className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPrenameOther ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`}
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
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.authorizedSignatoryFirstNameTh || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryFirstNameTh: e.target.value,
                      }))
                    }
                    data-error-key="authorizedSignatoryFirstNameTh"
                    placeholder="เช่น สมชาย"
                    className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.authorizedSignatoryFirstNameTh ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                    required
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
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.authorizedSignatoryLastNameTh || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryLastNameTh: e.target.value,
                      }))
                    }
                    data-error-key="authorizedSignatoryLastNameTh"
                    placeholder="เช่น ใจดี"
                    className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.authorizedSignatoryLastNameTh ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                    required
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
                    ตำแหน่ง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.authorizedSignatoryPositionTh || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryPositionTh: e.target.value,
                      }))
                    }
                    placeholder="เช่น กรรมการผู้จัดการ"
                    className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.authorizedSignatoryPositionTh ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  />
                  {errors?.authorizedSignatoryPositionTh && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.authorizedSignatoryPositionTh}
                    </p>
                  )}
                </div>

                {/* Prename (EN) - Hidden */}
                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prename (EN)
                  </label>
                  <select
                    value={formData.authorizedSignatoryPrenameEn || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const mapEnToTh = { Mr: "นาย", Mrs: "นาง", Ms: "นางสาว", Other: "อื่นๆ" };
                      const mappedTh = mapEnToTh[value] || "";
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryPrenameEn: value,
                        authorizedSignatoryPrenameTh: mappedTh,
                        authorizedSignatoryPrenameOtherEn:
                          value === "Other" ? prev.authorizedSignatoryPrenameOtherEn || "" : "",
                        authorizedSignatoryPrenameOther:
                          mappedTh === "อื่นๆ" ? prev.authorizedSignatoryPrenameOther || "" : "",
                      }));
                    }}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Other">Other</option>
                  </select>
                  {formData.authorizedSignatoryPrenameEn === "Other" && (
                    <input
                      type="text"
                      value={formData.authorizedSignatoryPrenameOtherEn || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          authorizedSignatoryPrenameOtherEn: e.target.value.replace(
                            /[^a-zA-Z\.\s]/g,
                            "",
                          ),
                        }))
                      }
                      placeholder="e.g., Assoc. Prof., Dr."
                      className="mt-2 w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  )}
                </div>

                {/* First Name (EN) - Hidden */}
                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.authorizedSignatoryFirstNameEn || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryFirstNameEn: e.target.value,
                      }))
                    }
                    data-error-key="authorizedSignatoryFirstNameEn"
                    placeholder="e.g., Somchai"
                    className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.authorizedSignatoryFirstNameEn ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  />
                  {errors?.authorizedSignatoryFirstNameEn && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.authorizedSignatoryFirstNameEn}
                    </p>
                  )}
                </div>

                {/* Last Name (EN) - Hidden */}
                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.authorizedSignatoryLastNameEn || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryLastNameEn: e.target.value,
                      }))
                    }
                    data-error-key="authorizedSignatoryLastNameEn"
                    placeholder="e.g., Jaidee"
                    className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors?.authorizedSignatoryLastNameEn ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  />
                  {errors?.authorizedSignatoryLastNameEn && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.authorizedSignatoryLastNameEn}
                    </p>
                  )}
                </div>

                {/* Position (EN) - Hidden */}
                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.authorizedSignatoryPositionEn || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        authorizedSignatoryPositionEn: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors?.authorizedSignatoryPositionEn
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g. Managing Director"
                  />
                  {errors?.authorizedSignatoryPositionEn && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.authorizedSignatoryPositionEn}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Authorized Signature Upload */}
            <div className="space-y-3">
              <SingleFileUploadZone
                title="รูปลายเซ็นผู้มีอำนาจลงนาม *"
                description="รูปถ่ายลายเซ็นของผู้มีอำนาจลงนามของสมาคม (จำเป็น)"
                name="authorizedSignature"
                file={selectedFiles.authorizedSignature}
                icon={PhotoIcon}
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
                error={errors?.authorizedSignature}
                isImageRequired={true}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
                onEditImage={editImage}
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
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

              {/* Attachment Document Upload */}
              <div className="space-y-3">
                <SingleFileUploadZone
                  title="เอกสารแนบ"
                  description="หมายเหตุ : โปรดลงนาม และประทับตราทุกหน้า"
                  name="attachmentDocument"
                  file={selectedFiles.attachmentDocument}
                  icon={DocumentIcon}
                  iconColor="text-blue-600"
                  bgColor="bg-blue-100"
                  error={errors?.attachmentDocument}
                  isImageRequired={false}
                  onFileChange={handleFileChange}
                  onRemoveFile={removeFile}
                />
              </div>
            </div>
          </div>

          {/* Image Editor Modal */}
          <div>
            <ImageEditor
              isOpen={showImageEditor}
              onClose={() => setShowImageEditor(false)}
              onSave={handleImageSave}
              initialImage={editingImage}
              title={getImageEditorTitle(editingType)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

