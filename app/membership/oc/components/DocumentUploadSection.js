"use client";

import { useState, useEffect } from "react";
import FactoryTypeSelector from "../../components/FactoryTypeSelector";
import MultipleFileManager from "../../components/MultipleFileManager";
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
  BuildingIcon,
  ShieldIcon,
  PhotoIcon,
} from "../../components/DocumentUpload/IconComponents";

export default function DocumentUploadSection({ formData, setFormData, errors, showErrors }) {
  // ใช้ข้อมูลจาก formData เป็นค่าเริ่มต้น
  const [selectedFiles, setSelectedFiles] = useState({
    factoryLicense: formData.factoryLicense || null,
    industrialEstateLicense: formData.industrialEstateLicense || null,
    productionImages: formData.productionImages || [],
    companyStamp: formData.companyStamp || null,
    authorizedSignature: formData.authorizedSignature || null,
    attachmentDocument: formData.attachmentDocument || null,
  });

  const [factoryType, setFactoryType] = useState(formData.factoryType || "");

  // Image editor states
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editingType, setEditingType] = useState(""); // 'companyStamp' or 'authorizedSignature'

  // Debug: เพิ่ม useEffect เพื่อ debug
  useEffect(() => {
    console.log("=== DEBUG OC DocumentUploadSection ===");
    console.log("formData.companyStamp:", formData.companyStamp);
    console.log("formData.authorizedSignature:", formData.authorizedSignature);
    console.log("selectedFiles:", selectedFiles);
    console.log("errors:", errors);
  }, [formData.companyStamp, formData.authorizedSignature, selectedFiles, errors]);

  // Sync selectedFiles with formData when component mounts or formData changes
  useEffect(() => {
    setSelectedFiles({
      factoryLicense: formData.factoryLicense || null,
      industrialEstateLicense: formData.industrialEstateLicense || null,
      productionImages: formData.productionImages || [],
      companyStamp: formData.companyStamp || null,
      authorizedSignature: formData.authorizedSignature || null,
      attachmentDocument: formData.attachmentDocument || null,
    });
    setFactoryType(formData.factoryType || "");
  }, [formData]);


  const handleFactoryTypeChange = (type) => {
    setFactoryType(type);
    setFormData((prev) => ({
      ...prev,
      factoryType: type,
      // Clear opposite type files when switching
      factoryLicense: type === "type1" ? prev.factoryLicense : null,
      industrialEstateLicense: type === "type1" ? prev.industrialEstateLicense : null,
      productionImages: type === "type2" ? prev.productionImages : [],
    }));

    setSelectedFiles((prev) => ({
      ...prev,
      factoryLicense: type === "type1" ? prev.factoryLicense : null,
      industrialEstateLicense: type === "type1" ? prev.industrialEstateLicense : null,
      productionImages: type === "type2" ? prev.productionImages : [],
    }));
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
        const fileObj = createFileObject(file);
        setSelectedFiles((prev) => ({ ...prev, [documentType]: fileObj }));
        setFormData((prev) => ({ ...prev, [documentType]: fileObj }));
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

  // Multiple file upload for production images
  const handleMultipleFileChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((file) => createFileObject(file));
      const currentFiles = selectedFiles.productionImages || [];
      const totalFiles = [...currentFiles, ...newFiles].slice(0, 5);

      setSelectedFiles((prev) => ({ ...prev, productionImages: totalFiles }));
      setFormData((prev) => ({ ...prev, productionImages: totalFiles }));
    }
  };

  const removeProductionImage = (index) => {
    const updatedFiles = selectedFiles.productionImages.filter((_, i) => i !== index);
    setSelectedFiles((prev) => ({ ...prev, productionImages: updatedFiles }));
    setFormData((prev) => ({ ...prev, productionImages: updatedFiles }));
  };

  const viewFile = (fileOrUrl) => {
    if (!fileOrUrl) return;

    // Handle string URLs directly
    if (typeof fileOrUrl === "string") {
      window.open(fileOrUrl, "_blank");
      return;
    }

    // Handle file objects that might have a URL (from rejection data)
    if (fileOrUrl.url && typeof fileOrUrl.url === "string") {
      window.open(fileOrUrl.url, "_blank");
      return;
    }

    // Handle local File objects
    const file = fileOrUrl.file || fileOrUrl;
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    } else if (typeof file === "string") {
      // Fallback for string URLs nested in objects
      window.open(file, "_blank");
    }
  };


  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
        {/* Header Section */}
        <div className="bg-blue-600 px-8 py-6">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            เอกสารใบอนุญาต / License Documents
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            เลือกประเภทโรงงานและอัปโหลดเอกสารประกอบ / Select factory type and upload supporting
            documents
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 py-8 space-y-8">
          {/* Factory Type Selection */}
          <FactoryTypeSelector
            factoryType={factoryType}
            onChange={handleFactoryTypeChange}
            membershipType="OC"
          />

          {/* Document Upload Section */}
          {factoryType && (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              {/* Type 1 Documents */}
              {factoryType === "type1" && (
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-blue-800">
                        อัปโหลดเอกสาร (เลือกอย่างน้อย 1 ไฟล์)
                      </span>
                    </div>
                  </div>

                  {/* Factory License Upload */}
                  <SingleFileUploadZone
                    title="ใบอนุญาตประกอบกิจการโรงงาน (ตัวเลือกที่ 1)"
                    description="รง.4 - เอกสารใบอนุญาตประกอบกิจการโรงงานที่ออกโดยกรมโรงงานอุตสาหกรรม"
                    name="factoryLicense"
                    file={selectedFiles.factoryLicense}
                    disabled={selectedFiles.industrialEstateLicense}
                    icon={BuildingIcon}
                    iconColor="text-blue-600"
                    bgColor="bg-blue-100"
                    onFileChange={handleFileChange}
                    onRemoveFile={removeFile}
                  />

                  {/* OR Separator */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-6 py-2 text-gray-500 font-medium border border-gray-300 rounded-full">
                        หรือ
                      </span>
                    </div>
                  </div>

                  {/* Industrial Estate License Upload */}
                  <SingleFileUploadZone
                    title="ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (ตัวเลือกที่ 2)"
                    description="กนอ. - เอกสารใบอนุญาตที่ออกโดยการนิคมอุตสาหกรรมแห่งประเทศไทย"
                    name="industrialEstateLicense"
                    file={selectedFiles.industrialEstateLicense}
                    disabled={selectedFiles.factoryLicense}
                    icon={BuildingIcon}
                    iconColor="text-green-600"
                    bgColor="bg-green-100"
                    onFileChange={handleFileChange}
                    onRemoveFile={removeFile}
                  />
                </div>
              )}

              {/* Type 2 Documents */}
              {factoryType === "type2" && (
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-blue-800">
                        อัปโหลดรูปภาพหรือเอกสาร (ไม่เกิน 5 ไฟล์)
                      </span>
                    </div>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">เอกสารการผลิต</h3>
                        <p className="text-sm text-gray-600 max-w-md mx-auto">
                          รูปถ่ายเครื่องจักร อุปกรณ์ กระบวนการผลิต และสถานที่ผลิต หรือ
                          เอกสารที่ออกโดยหน่วยงานภาครัฐที่แสดงถึงการผลิต
                        </p>
                      </div>

                      <MultipleFileManager
                        files={selectedFiles.productionImages}
                        onUpload={handleMultipleFileChange}
                        onView={viewFile}
                        onRemove={removeProductionImage}
                        maxFiles={5}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Required Company Documents - Always visible */}
          <div className="space-y-8 mt-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
                <svg
                  className="w-4 h-4 text-red-600"
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
                <span className="text-sm font-medium text-red-800">
                  เอกสารที่จำเป็นต้องอัปโหลด (บังคับ)
                </span>
              </div>
            </div>

            {/* Company Stamp Upload */}
            <div className="space-y-3">
              <SingleFileUploadZone
                title="รูปตราประทับบริษัท *"
                description="อัปโหลดรูปตราประทับบริษัท หากไม่มีตราประทับสามารถใช้รูปลายเซ็นแทนได้"
                name="companyStamp"
                file={selectedFiles.companyStamp}
                icon={ShieldIcon}
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

            {/* Authorized Signatory Name Inputs */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ข้อมูลผู้มีอำนาจลงนาม</h3>
              <p className="text-sm text-gray-600 mb-4">
                กรุณากรอกชื่อ-นามสกุล และตำแหน่งของผู้มีอำนาจลงนามทั้งภาษาไทยและอังกฤษ
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Prename Thai */}
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
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                        name="authorizedSignatoryPrenameOther"
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
                        className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPrenameOther ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
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
                    required
                  />
                  {errors?.authorizedSignatoryFirstNameTh && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.authorizedSignatoryFirstNameTh}
                    </p>
                  )}
                </div>
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
                    required
                  />
                  {errors?.authorizedSignatoryLastNameTh && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.authorizedSignatoryLastNameTh}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="authorizedSignatoryPositionTh"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ตำแหน่ง (ภาษาไทย) <span className="text-red-600">*</span>
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
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${(showErrors && !formData.authorizedSignatoryPositionTh) || errors?.authorizedSignatoryPositionTh ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}
                    placeholder="เช่น กรรมการผู้จัดการ"
                  />
                  {((showErrors && !formData.authorizedSignatoryPositionTh) ||
                    errors?.authorizedSignatoryPositionTh) && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors?.authorizedSignatoryPositionTh ||
                        "กรุณาระบุตำแหน่งผู้มีอำนาจลงนาม (ภาษาไทย)"}
                    </p>
                  )}
                </div>
                {/* Prename English - Hidden */}
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
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                      name="authorizedSignatoryPrenameOtherEn"
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
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  )}
                </div>
                <div className="hidden">
                  <label
                    htmlFor="authorizedSignatoryFirstNameEn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ชื่อ (อังกฤษ)
                  </label>
                  <input
                    id="authorizedSignatoryFirstNameEn"
                    name="authorizedSignatoryFirstNameEn"
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
                <div className="hidden">
                  <label
                    htmlFor="authorizedSignatoryLastNameEn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name (EN)
                  </label>
                  <input
                    id="authorizedSignatoryLastNameEn"
                    name="authorizedSignatoryLastNameEn"
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

            {/* Authorized Signature Upload */}
            <div className="space-y-3">
              <SingleFileUploadZone
                title="รูปลายเซ็นผู้มีอำนาจลงนาม *"
                description="อัปโหลดรูปลายเซ็นของผู้มีอำนาจลงนามในการดำเนินธุรกิจ"
                name="authorizedSignature"
                file={selectedFiles.authorizedSignature}
                icon={PhotoIcon}
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
            </div>

            {/* Attachment Document Upload */}
            <div className="space-y-3">
              <SingleFileUploadZone
                title="เอกสารแนบ"
                description="หมายเหตุ : โปรดลงนาม และประทับตราทุกหน้า"
                name="attachmentDocument"
                file={selectedFiles.attachmentDocument}
                icon={DocumentIcon}
                isImageRequired={false}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
              />
            </div>
          </div>

          {/* Empty State */}
        </div>
      </div>

      {/* Image Editor Modal */}
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
    </>
  );
}
