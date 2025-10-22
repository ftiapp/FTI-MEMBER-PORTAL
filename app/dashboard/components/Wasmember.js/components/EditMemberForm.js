"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import MemberSearchField from "./MemberSearchField";

import Image from "next/image";

/**
 * EditMemberForm Component
 *
 * This component allows FTI_Portal_User to edit and resubmit their rejected member verification information.
 * It pre-fills the form with the existing submission data and allows FTI_Portal_User to make changes.
 */
const EditMemberForm = ({ submission, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    memberSearch: "",
    memberNumber: submission?.memberNumber || "",
    memberType: submission?.memberType || "",
    companyName: submission?.companyName || "",
    taxId: submission?.taxId || "",
    documentFile: null,
    comment: "",
  });

  const [formErrors, setFormErrors] = useState({
    memberSearch: false,
    memberNumber: false,
    memberType: false,
    taxId: false,
    documentFile: false,
  });

  const [selectedResult, setSelectedResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [rejectionComment, setRejectionComment] = useState("");
  const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);
  const [sizeErrorMessage, setSizeErrorMessage] = useState("");

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Size validation: 10MB as per help text
      if (file.size > 10 * 1024 * 1024) {
        setSizeErrorMessage("ไฟล์มีขนาดใหญ่เกินไป กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 10MB");
        setShowSizeErrorModal(true);
        e.target.value = null;
        return;
      }

      setFormData((prev) => ({
        ...prev,
        documentFile: file,
      }));

      // Clear file error
      if (formErrors.documentFile) {
        setFormErrors((prev) => ({
          ...prev,
          documentFile: false,
        }));
      }
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {
      memberNumber: !formData.memberNumber,
      memberType: !formData.memberType,
      companyName: !formData.companyName,
      taxId: !formData.taxId,
      documentFile: !formData.documentFile && existingDocuments.length === 0,
    };

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  // Fetch member data and documents when component mounts
  useEffect(() => {
    const fetchMemberData = async () => {
      if (!submission || !submission.id) return;

      try {
        setIsLoading(true);

        // Fetch member details
        const response = await fetch(`/api/member/get-submission-details?id=${submission.id}`);
        const data = await response.json();

        if (data.success) {
          const memberData = data.submission;

          setFormData((prev) => ({
            ...prev,
            memberNumber: memberData.MEMBER_CODE || memberData.memberNumber || "",
            memberType: memberData.MEMBER_TYPE || memberData.memberType || "",
            companyName: memberData.company_name || memberData.companyName || "",
            taxId: memberData.TAX_ID || memberData.taxId || "",
          }));

          // Set rejection comment if available
          if (memberData.reject_reason) {
            setRejectionComment(memberData.reject_reason);
          }

          // Fetch documents
          if (memberData.MEMBER_CODE) {
            const docsResponse = await fetch(
              `/api/member/get-documents?memberCode=${memberData.MEMBER_CODE}`,
            );
            const docsData = await docsResponse.json();

            if (docsData.success) {
              setExistingDocuments(docsData.documents || []);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching member data:", error);
        toast.error("ไม่สามารถดึงข้อมูลสมาชิกได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberData();
  }, [submission]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create form data for submission
      const data = new FormData();
      data.append("userId", submission.userId || "");
      data.append("submissionId", submission.id || "");
      data.append("memberNumber", formData.memberNumber);
      data.append("memberType", formData.memberType);
      data.append("companyName", formData.companyName);
      data.append("taxId", formData.taxId);
      data.append("comment", formData.comment);

      // Only append file if a new one is selected
      if (formData.documentFile) {
        data.append("documentFile", formData.documentFile);
      }

      // Show loading toast
      const loadingToast = toast.loading("กำลังส่งข้อมูล โปรดรอสักครู่...");

      // Submit data to API
      const response = await fetch("/api/member/edit-submission", {
        method: "POST",
        body: data,
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      const result = await response.json();

      if (result.success) {
        toast.success(
          "แก้ไขข้อมูลเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 1-2 วันทำการ",
        );

        // Call onSuccess callback with the updated submission
        if (onSuccess) {
          onSuccess(result.submission);
        }

        // Close the edit form
        if (onClose) {
          onClose();
        }
      } else {
        // Show error message
        toast.error(result.message || "ไม่สามารถแก้ไขข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">แก้ไขข้อมูลการยืนยันสมาชิก</h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          ) : (
            <div>
              {rejectionComment && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="text-sm sm:text-md font-medium text-red-800 mb-2">เหตุผลที่ถูกปฏิเสธ:</h3>
                  <p className="text-sm text-red-700">{rejectionComment}</p>
                </div>
              )}

              {existingDocuments.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-sm sm:text-md font-medium text-gray-800 mb-2">เอกสารที่มีอยู่:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {existingDocuments.map((doc, index) => (
                      <div key={`doc-${index}`} className="border rounded-md p-3 flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {doc.file_path.toLowerCase().endsWith(".pdf") ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 text-red-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          ) : (
                            <div className="relative h-10 w-10 overflow-hidden rounded-md border border-gray-200">
                              <Image
                                src={doc.file_path}
                                alt="Document preview"
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            อัปโหลดเมื่อ: {new Date(doc.uploaded_at).toLocaleDateString("th-TH")}
                          </p>
                        </div>
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ดูเอกสาร
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Member Search Field */}
                <div>
                  <label
                    htmlFor="memberSearch"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ค้นหาข้อมูลสมาชิก <span className="text-xs text-gray-500">(ไม่บังคับ)</span>
                  </label>
                  <MemberSearchField
                    value={formData.memberSearch}
                    onChange={(value) => setFormData((prev) => ({ ...prev, memberSearch: value }))}
                    onSelect={(result) => {
                      setSelectedResult(result);
                      setFormData((prev) => ({
                        ...prev,
                        memberNumber: result.MEMBER_CODE || "",
                        memberType: result.MEMBER_TYPE || "",
                        companyName: result.COMPANY_NAME || "",
                        taxId: result.TAX_ID || "",
                      }));
                    }}
                  />
                </div>

                {/* Member Number */}
                <div>
                  <label
                    htmlFor="memberNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    รหัสสมาชิก <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="memberNumber"
                    name="memberNumber"
                    value={formData.memberNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border text-sm sm:text-base ${formErrors.memberNumber ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="รหัสสมาชิก"
                  />
                  {formErrors.memberNumber && (
                    <p className="mt-1 text-sm text-red-600">กรุณาระบุรหัสสมาชิก</p>
                  )}
                </div>

                {/* Member Type */}
                <div>
                  <label
                    htmlFor="memberType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ประเภทสมาชิก <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="memberType"
                    name="memberType"
                    value={formData.memberType}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border text-sm sm:text-base ${formErrors.memberType ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">เลือกประเภทสมาชิก</option>
                    <option value="สามัญ">สามัญ</option>
                    <option value="วิสามัญ">วิสามัญ</option>
                    <option value="กิตติมศักดิ์">กิตติมศักดิ์</option>
                  </select>
                  {formErrors.memberType && (
                    <p className="mt-1 text-sm text-red-600">กรุณาเลือกประเภทสมาชิก</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ชื่อบริษัท <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.companyName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="ชื่อบริษัท"
                  />
                  {formErrors.companyName && (
                    <p className="mt-1 text-sm text-red-600">กรุณาระบุชื่อบริษัท</p>
                  )}
                </div>

                {/* Tax ID */}
                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                    เลขประจำตัวผู้เสียภาษี <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formErrors.taxId ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="เลขประจำตัวผู้เสียภาษี"
                  />
                  {formErrors.taxId && (
                    <p className="mt-1 text-sm text-red-600">กรุณาระบุเลขประจำตัวผู้เสียภาษี</p>
                  )}
                </div>

                {/* Document Upload */}
                <div>
                  <label
                    htmlFor="documentFile"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เอกสารยืนยันตัวตน{" "}
                    {existingDocuments.length === 0 && <span className="text-red-500">*</span>}
                  </label>
                  <div
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${formErrors.documentFile ? "border-red-500" : "border-gray-300"}`}
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="documentFile"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>อัปโหลดไฟล์</span>
                          <input
                            id="documentFile"
                            name="documentFile"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">หรือลากไฟล์มาวาง</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        รองรับไฟล์ PDF, JPG, JPEG, PNG ขนาดไม่เกิน 10MB
                      </p>
                      {formData.documentFile && (
                        <p className="text-sm text-green-600">
                          ไฟล์ที่เลือก: {formData.documentFile.name}
                        </p>
                      )}
                      {existingDocuments.length > 0 && !formData.documentFile && (
                        <p className="text-sm text-blue-600">
                          มีเอกสารอยู่แล้ว {existingDocuments.length} ไฟล์ (ดูด้านบน)
                        </p>
                      )}
                    </div>
                  </div>
                  {formErrors.documentFile && (
                    <p className="mt-1 text-sm text-red-600">กรุณาอัปโหลดเอกสารยืนยันตัวตน</p>
                  )}
                </div>

                {/* Comment Section */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    ความคิดเห็นเพิ่มเติม
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={3}
                    value={formData.comment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="หากมีข้อมูลเพิ่มเติมที่ต้องการแจ้งให้เจ้าหน้าที่ทราบ สามารถระบุได้ที่นี่"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none order-2 sm:order-1"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none flex items-center justify-center order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลังส่งข้อมูล...
                      </>
                    ) : (
                      "บันทึกการแก้ไข"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Oversize File Error Modal */}
      {showSizeErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">ไฟล์มีขนาดใหญ่เกินกำหนด</h3>
              <button
                type="button"
                onClick={() => setShowSizeErrorModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="ปิด"
              >
                {/* reuse simple X */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700">
                {sizeErrorMessage || "กรุณาอัปโหลดไฟล์ที่มีขนาดไม่เกิน 10MB"}
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
};

export default EditMemberForm;
