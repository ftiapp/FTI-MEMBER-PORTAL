"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLoading } from "../../../components/GlobalLoadingOverlay";
import { FaCheckCircle, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "react-hot-toast";

// Import components
import {
  AddressFormHeader,
  SuccessMessage,
  WarningMessage,
  ErrorMessage,
  ThaiAddressFields,
  EnglishAddressFields,
  ContactFields,
  DocumentUpload,
  StepIndicator,
} from "./components";

/**
 * Main EditAddressForm component that orchestrates all the child components
 *
 * @param {Object} props Component properties
 * @param {Object} props.address The address object to edit
 * @param {string} props.addrCode The address code (001 or 002)
 * @param {string} props.memberCode The member code
 * @param {string} props.compPersonCode The company person code
 * @param {string} props.registCode The registration code
 * @param {string} props.memberType The member type (000, 100, 200)
 * @param {string} props.memberGroupCode The member group code within the member type
 * @param {string} props.typeCode The specific group code within the member type
 * @param {Function} props.onCancel Function to call when canceling edit
 * @param {Function} props.onSuccess Function to call after successful submission
 */
export default function EditAddressForm({
  address,
  addrCode,
  memberCode,
  compPersonCode,
  registCode,
  memberType,
  memberGroupCode,
  typeCode,
  onCancel,
  onSuccess,
}) {
  // Debug all props on component mount
  useEffect(() => {
    console.log("EditAddressForm props on mount:", {
      address,
      addrCode,
      memberCode,
      compPersonCode,
      registCode,
      memberType,
      memberGroupCode,
      typeCode,
    });
  }, [
    address,
    addrCode,
    memberCode,
    compPersonCode,
    registCode,
    memberType,
    memberGroupCode,
    typeCode,
  ]);

  const { user } = useAuth();
  // State to track current step
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Thai address fields
    ADDR_NO: "",
    ADDR_MOO: "",
    ADDR_SOI: "",
    ADDR_ROAD: "",
    ADDR_SUB_DISTRICT: "",
    ADDR_DISTRICT: "",
    ADDR_PROVINCE_NAME: "",
    ADDR_POSTCODE: "",
    ADDR_TELEPHONE: "",
    ADDR_FAX: "",
    ADDR_EMAIL: "",
    ADDR_WEBSITE: "",
    // English address fields
    ADDR_NO_EN: "",
    ADDR_MOO_EN: "",
    ADDR_SOI_EN: "",
    ADDR_ROAD_EN: "",
    ADDR_SUB_DISTRICT_EN: "",
    ADDR_DISTRICT_EN: "",
    ADDR_PROVINCE_NAME_EN: "",
    ADDR_POSTCODE_EN: "",
    ADDR_TELEPHONE_EN: "",
    ADDR_FAX_EN: "",
    ADDR_EMAIL_EN: "",
    ADDR_WEBSITE_EN: "",
  });

  // State to track which language tab is active - default to 'th'
  const [activeLanguage, setActiveLanguage] = useState("th");

  // State for document file
  const [documentFile, setDocumentFile] = useState(null);

  // Log when language changes
  const handleLanguageChange = (lang) => {
    console.log("Language changed to:", lang);
    setActiveLanguage(lang);
  };

  // Handle document file change (including clearing when file is null)
  const handleDocumentChange = (file) => {
    // If child requests clearing the file
    if (!file) {
      setDocumentFile(null);
      // Do not keep old validation error when user removed the file manually
      setErrorMessage("");
      return;
    }

    // Validate new file
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB");
      return;
    }

    // Check file type
    const fileExt = file.name.split(".").pop().toLowerCase();
    const allowedTypes = ["pdf", "jpg", "jpeg", "png"];

    if (!allowedTypes.includes(fileExt)) {
      setErrorMessage(
        `ไฟล์ประเภท ${fileExt} ไม่ได้รับการสนับสนุน กรุณาอัพโหลดไฟล์ประเภท PDF, JPG, JPEG, PNG`,
      );
      return;
    }

    // Validate PDF content for address types 001 and 003
    if (fileExt === "pdf" && (addrCode === "001" || addrCode === "003")) {
      // Create a FileReader to check the PDF content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = new Uint8Array(e.target.result);
        // Check for PDF header signature %PDF-
        const header = content.subarray(0, 5);
        const isPDF =
          header[0] === 37 &&
          header[1] === 80 &&
          header[2] === 68 &&
          header[3] === 70 &&
          header[4] === 45;

        if (!isPDF) {
          setErrorMessage("ไฟล์ PDF ไม่ถูกต้อง กรุณาอัพโหลดไฟล์ PDF ที่ถูกต้อง");
          setDocumentFile(null);
          return;
        }

        // If all checks pass, set the document file
        setDocumentFile(file);
        setErrorMessage(""); // Clear any previous error messages
      };
      reader.readAsArrayBuffer(file.slice(0, 5)); // Only read the first few bytes for the header check
    } else {
      // For non-PDF files, just set the document file
      setDocumentFile(file);
      setErrorMessage(""); // Clear any previous error messages
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Debug props
  useEffect(() => {
    console.log("EditAddressForm props:", {
      memberCode,
      compPersonCode,
      registCode,
      addrCode,
      activeLanguage,
    });
  }, [memberCode, compPersonCode, registCode, addrCode, activeLanguage]);

  // Initialize form data from address
  useEffect(() => {
    if (address) {
      console.log("Address data from API:", address);
      setFormData({
        // Thai address fields
        ADDR_NO: address.ADDR_NO || "",
        ADDR_MOO: address.ADDR_MOO || "",
        ADDR_SOI: address.ADDR_SOI || "",
        ADDR_ROAD: address.ADDR_ROAD || "",
        ADDR_SUB_DISTRICT: address.ADDR_SUB_DISTRICT || "",
        ADDR_DISTRICT: address.ADDR_DISTRICT || "",
        ADDR_PROVINCE_NAME: address.ADDR_PROVINCE_NAME || "",
        ADDR_POSTCODE: address.ADDR_POSTCODE || "",
        ADDR_TELEPHONE: address.ADDR_TELEPHONE || "",
        ADDR_FAX: address.ADDR_FAX || "",
        ADDR_EMAIL: address.ADDR_EMAIL || "",
        ADDR_WEBSITE: address.ADDR_WEBSITE || "",
        // English address fields
        ADDR_NO_EN: address.ADDR_NO_EN || "",
        ADDR_MOO_EN: address.ADDR_MOO_EN || "",
        ADDR_SOI_EN: address.ADDR_SOI_EN || "",
        ADDR_ROAD_EN: address.ADDR_ROAD_EN || "",
        ADDR_SUB_DISTRICT_EN: address.ADDR_SUB_DISTRICT_EN || "",
        ADDR_DISTRICT_EN: address.ADDR_DISTRICT_EN || "",
        ADDR_PROVINCE_NAME_EN: address.ADDR_PROVINCE_NAME_EN || "",
        ADDR_POSTCODE_EN: address.ADDR_POSTCODE_EN || "",
        ADDR_TELEPHONE_EN: address.ADDR_TELEPHONE_EN || "",
        ADDR_FAX_EN: address.ADDR_FAX_EN || "",
        ADDR_EMAIL_EN: address.ADDR_EMAIL_EN || "",
        // Use the same website value for both Thai and English if ADDR_WEBSITE_EN is not available
        ADDR_WEBSITE_EN: address.ADDR_WEBSITE_EN || address.ADDR_WEBSITE || "",
      });
    }
  }, [address]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get the global loading state
  const { setLoading } = useLoading();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true, "กำลังส่งข้อมูลการแก้ไขที่อยู่...");
    setErrorMessage(""); // Clear any previous error messages

    console.log("Submitting form with language:", activeLanguage);

    // ตรวจสอบว่ามี user object หรือไม่
    if (!user || !user.id) {
      console.error("User object is missing or has no ID");
      setErrorMessage("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      setIsSubmitting(false);
      setLoading(false);
      return;
    }

    // ตรวจสอบว่าต้องแนบเอกสารหรือไม่
    const requiresDocument = addrCode === "001" || addrCode === "003";
    if (requiresDocument && !documentFile) {
      const documentType =
        addrCode === "001"
          ? "หนังสือรับรองนิติบุคคลจากกระทรวงพาณิชย์"
          : "ใบทะเบียนภาษีมูลค่าเพิ่ม (แบบ ภ.พ.20)";
      setErrorMessage(`กรุณาแนบไฟล์ ${documentType}`);
      setIsSubmitting(false);
      setLoading(false);
      return;
    }

    try {
      // แยกข้อมูลตามภาษาที่เลือก
      let filteredFormData = {};

      if (activeLanguage === "en") {
        // เลือกเฉพาะฟิลด์ภาษาอังกฤษและเปลี่ยนชื่อฟิลด์ให้ตรงกับที่ต้องการ
        Object.keys(formData).forEach((key) => {
          if (key.endsWith("_EN")) {
            // เปลี่ยนชื่อฟิลด์จาก ADDR_XXX_EN เป็น ADDR_XXX
            const newKey = key.replace("_EN", "");
            filteredFormData[newKey] = formData[key];
          } else if (!key.includes("_EN")) {
            // คัดลอกฟิลด์ที่ไม่มีเวอร์ชันภาษาอังกฤษ เช่น เบอร์โทรศัพท์ อีเมล์ เว็บไซต์
            if (
              key === "ADDR_TELEPHONE" ||
              key === "ADDR_FAX" ||
              key === "ADDR_EMAIL" ||
              key === "ADDR_WEBSITE"
            ) {
              filteredFormData[key] = formData[key];
            }
          }
        });
      } else {
        // เลือกเฉพาะฟิลด์ภาษาไทย
        Object.keys(formData).forEach((key) => {
          if (!key.endsWith("_EN")) {
            filteredFormData[key] = formData[key];
          }
        });
      }

      // Prepare data for API
      const requestData = {
        userId: user?.id, // เพิ่ม userId จาก user context
        memberCode: memberCode || "", // ตรวจสอบว่ามีค่าหรือไม่
        compPersonCode: compPersonCode || "", // ตรวจสอบว่ามีค่าหรือไม่
        registCode: registCode || "", // ตรวจสอบว่ามีค่าหรือไม่
        memberType: memberType || "000", // ตรวจสอบว่ามีค่าหรือไม่
        memberGroupCode: memberGroupCode || "", // ตรวจสอบว่ามีค่าหรือไม่
        typeCode: typeCode || "000", // ตรวจสอบว่ามีค่าหรือไม่
        addrCode: addrCode || "001", // ตรวจสอบว่ามีค่าหรือไม่
        addrLang: activeLanguage, // Add the active language (th or en)
        originalAddress: address || {}, // ตรวจสอบว่ามีค่าหรือไม่
        newAddress: filteredFormData,
      };

      // ตรวจสอบและแสดงค่าที่จะส่งไป API
      console.log("Checking values before sending to API:", {
        memberCode: requestData.memberCode,
        compPersonCode: requestData.compPersonCode,
        registCode: requestData.registCode,
        memberType: requestData.memberType,
        memberGroupCode: requestData.memberGroupCode,
        typeCode: requestData.typeCode,
        addrCode: requestData.addrCode,
      });

      // Debug request data
      console.log("Request data sent to API:", JSON.stringify(requestData, null, 2));

      let documentUrl = null;

      // Upload document if needed
      if (documentFile) {
        console.log("Uploading document file:", documentFile.name);

        try {
          // Create FormData for file upload
          const formData = new FormData();
          formData.append("file", documentFile);
          formData.append("folder", `address_documents/${addrCode}`);
          formData.append("userId", user.id);

          // Upload file to server via API
          const uploadResponse = await fetch("/api/upload/document", {
            method: "POST",
            body: formData,
          });

          const uploadResult = await uploadResponse.json();

          if (!uploadResponse.ok || !uploadResult.success) {
            console.error("Document upload failed:", uploadResult.message || "Unknown error");
            setErrorMessage(uploadResult.message || "เกิดข้อผิดพลาดในการอัปโหลดเอกสาร");
            setIsSubmitting(false);
            setLoading(false); // Hide the global loading overlay on error
            return;
          }

          documentUrl = uploadResult.url;
          console.log("Document uploaded successfully:", documentUrl);

          // Add document URL to request data
          requestData.documentUrl = documentUrl;
        } catch (uploadError) {
          console.error("Error during document upload:", uploadError);
          setErrorMessage(
            "เกิดข้อผิดพลาดในการอัปโหลดเอกสาร: " + (uploadError.message || "ไม่ทราบสาเหตุ"),
          );
          setIsSubmitting(false);
          setLoading(false); // Hide the global loading overlay on error
          return;
        }
      }

      // Call API to submit address update request
      const response = await fetch("/api/member/request-address-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);

        // Show success notification
        toast.success("ส่งคำขอแก้ไขที่อยู่สำเร็จ", {
          duration: 5000,
          position: "top-center",
        });

        // Keep the global loading overlay visible for 2 seconds to show success
        setTimeout(() => {
          // Hide the global loading overlay
          setLoading(false);
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        console.error("Failed to submit address update request:", data.message);
        setErrorMessage(data.message || "เกิดข้อผิดพลาดในการส่งคำขอแก้ไขที่อยู่");
        // Hide the global loading overlay on error
        setLoading(false);
      }
    } catch (error) {
      console.error("Error submitting address update request:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      // Hide the global loading overlay on error
      setLoading(false);
    } finally {
      setIsSubmitting(false);
      // Note: We don't hide the global loading overlay here because we want to keep it visible
      // on success until the redirect happens, but we've already hidden it on error cases above
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Check if document step should be skipped (for address type 002)
  const skipDocumentStep = addrCode === "002";

  // Get max step based on address type
  const maxStep = skipDocumentStep ? 3 : 4;

  // Handle next step
  const handleNextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      // Basic validation for step 1 (form data)
      if (!formData.ADDR_NO || !formData.ADDR_DISTRICT || !formData.ADDR_PROVINCE_NAME) {
        setErrorMessage("กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน");
        return;
      }

      // For address type 002, skip to step 3 (which is actually step 2 in the UI)
      if (skipDocumentStep) {
        setCurrentStep(2); // Skip to confirmation step
        return;
      }
    } else if (currentStep === 2 && !skipDocumentStep) {
      // Validate document upload for step 2 (only for address types 001 and 003)
      const requiresDocument = addrCode === "001" || addrCode === "003";
      if (requiresDocument && !documentFile) {
        const documentType =
          addrCode === "001"
            ? "หนังสือรับรองนิติบุคคลจากกระทรวงพาณิชย์"
            : "ใบทะเบียนภาษีมูลค่าเพิ่ม (แบบ ภ.พ.20)";
        setErrorMessage(`กรุณาแนบไฟล์ ${documentType}`);
        return;
      }
    }

    // Clear any error messages
    setErrorMessage("");

    // Move to next step
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // If success, show success message
  if (submitSuccess) {
    return <SuccessMessage />;
  }

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        // For address type 002, we have only 2 steps, so submit on step 2
        // For other address types, we submit on step 3
        if (
          (addrCode === "002" && currentStep === 2) ||
          (addrCode !== "002" && currentStep === 3)
        ) {
          handleSubmit(e);
        } else {
          handleNextStep();
        }
      }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} addrCode={addrCode} />

      {/* Form Header with language tabs - only show in step 1 */}
      {currentStep === 1 && (
        <AddressFormHeader
          addrCode={addrCode}
          activeLanguage={activeLanguage}
          handleLanguageChange={handleLanguageChange}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}

      {/* Error Message */}
      <ErrorMessage message={errorMessage} />

      {/* Success Indicator */}
      {submitSuccess && (
        <motion.div
          className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" />
            <p>คำขอแก้ไขที่อยู่ถูกส่งเรียบร้อยแล้ว กรุณารอการตรวจสอบจากเจ้าหน้าที่</p>
          </div>
        </motion.div>
      )}

      {/* Warning Message - only show in step 1 */}
      {currentStep === 1 && <WarningMessage itemVariants={itemVariants} />}

      {/* Step 1: Edit Address Information */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section headers */}
          <div className="md:col-span-2 border-b border-gray-200 pb-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {activeLanguage === "th" ? "ข้อมูลที่อยู่" : "Address Information"}
            </h3>
          </div>

          {/* Address Fields based on active language */}
          {activeLanguage === "th" ? (
            <ThaiAddressFields
              formData={formData}
              handleChange={handleChange}
              itemVariants={itemVariants}
            />
          ) : (
            <EnglishAddressFields
              formData={formData}
              handleChange={handleChange}
              itemVariants={itemVariants}
            />
          )}

          {/* Contact Fields */}
          <ContactFields
            formData={formData}
            handleChange={handleChange}
            itemVariants={itemVariants}
            activeLanguage={activeLanguage}
          />
        </div>
      )}

      {/* Step 2: Document Upload - only show for address types 001 and 003 */}
      {currentStep === 2 && !skipDocumentStep && (
        <div className="grid grid-cols-1 gap-6">
          <div className="border-b border-gray-200 pb-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">แนบเอกสารยืนยัน</h3>
            <p className="text-sm text-gray-600 mt-1">
              {addrCode === "001" && "กรุณาแนบหนังสือรับรองนิติบุคคลจากกระทรวงพาณิชย์"}
              {addrCode === "003" && "กรุณาแนบใบทะเบียนภาษีมูลค่าเพิ่ม (แบบ ภ.พ.20)"}
            </p>
          </div>

          <DocumentUpload
            addrCode={addrCode}
            onFileChange={handleDocumentChange}
            itemVariants={itemVariants}
            file={documentFile}
          />
        </div>
      )}

      {/* Step 3: Confirmation (Step 2 for address type 002) */}
      {(currentStep === 3 || (skipDocumentStep && currentStep === 2)) && (
        <div className="grid grid-cols-1 gap-6">
          <div className="border-b border-gray-200 pb-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">ยืนยันการส่งข้อมูล</h3>
            <p className="text-sm text-gray-600 mt-1">
              กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการส่ง
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">ข้อมูลที่อยู่ที่ต้องการแก้ไข</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ประเภทที่อยู่:</p>
                <p className="text-sm">
                  {addrCode === "001" && "ที่อยู่สำนักงานใหญ่"}
                  {addrCode === "002" && "ที่อยู่สำหรับจัดส่งเอกสาร"}
                  {addrCode === "003" && "ที่อยู่สำหรับออกใบกำกับภาษี"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ภาษา:</p>
                <p className="text-sm">{activeLanguage === "th" ? "ภาษาไทย" : "ภาษาอังกฤษ"}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">ที่อยู่ใหม่:</p>
                <p className="text-sm">
                  {activeLanguage === "th" ? (
                    <>
                      {formData.ADDR_NO} {formData.ADDR_MOO && `หมู่ ${formData.ADDR_MOO}`}
                      {formData.ADDR_SOI && `ซอย ${formData.ADDR_SOI}`}
                      {formData.ADDR_ROAD && `ถนน ${formData.ADDR_ROAD}`}
                      {formData.ADDR_SUB_DISTRICT && `ตำบล/แขวง ${formData.ADDR_SUB_DISTRICT}`}
                      {formData.ADDR_DISTRICT && `อำเภอ/เขต ${formData.ADDR_DISTRICT}`}
                      {formData.ADDR_PROVINCE_NAME && `จังหวัด ${formData.ADDR_PROVINCE_NAME}`}
                      {formData.ADDR_POSTCODE}
                    </>
                  ) : (
                    <>
                      {formData.ADDR_NO_EN} {formData.ADDR_MOO_EN && `Moo ${formData.ADDR_MOO_EN}`}
                      {formData.ADDR_SOI_EN && `Soi ${formData.ADDR_SOI_EN}`}
                      {formData.ADDR_ROAD_EN && `Road ${formData.ADDR_ROAD_EN}`}
                      {formData.ADDR_SUB_DISTRICT_EN &&
                        `Sub-district ${formData.ADDR_SUB_DISTRICT_EN}`}
                      {formData.ADDR_DISTRICT_EN && `District ${formData.ADDR_DISTRICT_EN}`}
                      {formData.ADDR_PROVINCE_NAME_EN &&
                        `Province ${formData.ADDR_PROVINCE_NAME_EN}`}
                      {formData.ADDR_POSTCODE_EN}
                    </>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์:</p>
                <p className="text-sm">{formData.ADDR_TELEPHONE || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">อีเมล:</p>
                <p className="text-sm">{formData.ADDR_EMAIL || "-"}</p>
              </div>

              {(addrCode === "001" || addrCode === "003") && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">เอกสารแนบ:</p>
                  <p className="text-sm">{documentFile ? documentFile.name : "ไม่ได้แนบเอกสาร"}</p>
                </div>
              )}
            </div>
          </div>

          <motion.div
            className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-md"
            variants={itemVariants}
          >
            <p>หลังจากส่งคำขอแล้ว เจ้าหน้าที่จะตรวจสอบและดำเนินการแก้ไขข้อมูลให้ภายใน 2 วันทำการ</p>
          </motion.div>
        </div>
      )}

      {/* Step 4: Waiting for Approval (Step 3 for address type 002) */}
      {(currentStep === 4 || (skipDocumentStep && currentStep === 3)) && (
        <div className="grid grid-cols-1 gap-6">
          <div className="border-b border-gray-200 pb-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">รอการอนุมัติจากแอดมิน</h3>
          </div>

          <motion.div
            className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center"
            variants={itemVariants}
          >
            <FaCheckCircle className="mx-auto mb-4 text-4xl text-blue-500" />
            <h4 className="text-xl font-semibold text-blue-700 mb-2">
              คำขอแก้ไขที่อยู่ถูกส่งเรียบร้อยแล้ว
            </h4>
            <p className="text-gray-600 mb-4">
              เจ้าหน้าที่จะตรวจสอบข้อมูลและดำเนินการแก้ไขให้ภายใน 3-5 วันทำการ
              คุณสามารถตรวจสอบสถานะคำขอได้ที่หน้าแดชบอร์ด
            </p>

            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              กลับสู่หน้าหลัก
            </button>
          </motion.div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-4 py-2 flex items-center text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            <FaArrowLeft className="mr-2" />
            ย้อนกลับ
          </button>
        )}

        {currentStep === 1 && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            ยกเลิก
          </button>
        )}

        <div className="ml-auto">
          {/* For address type 002, only show Next button in step 1 */}
          {/* For other address types, show Next button in steps 1 and 2 */}
          {((addrCode !== "002" && currentStep < 3) || (addrCode === "002" && currentStep < 2)) && (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-4 py-2 flex items-center text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              ถัดไป
              <FaArrowRight className="ml-2" />
            </button>
          )}

          {/* For address type 002, show Submit button in step 2 */}
          {/* For other address types, show Submit button in step 3 */}
          {(currentStep === 3 || (skipDocumentStep && currentStep === 2)) && (
            <button
              type="submit"
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? "กำลังส่งข้อมูล..." : "ยืนยันการส่งข้อมูล"}
              <FaCheckCircle className="ml-2" />
            </button>
          )}
        </div>
      </div>
    </motion.form>
  );
}
