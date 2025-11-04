import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const AuthorizedSignatorySection = ({ application, type, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    prename_th: "",
    prename_other: "",
    first_name_th: "",
    last_name_th: "",
    position_th: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data with existing signature data
  useEffect(() => {
    console.log("🔍 DEBUG AuthorizedSignatorySection - application.signatureName:", application?.signatureName);
    if (application?.signatureName) {
      setFormData({
        prename_th: application.signatureName.prenameTh || "",
        prename_other: application.signatureName.prenameOther || "",
        first_name_th: application.signatureName.firstNameTh || "",
        last_name_th: application.signatureName.lastNameTh || "",
        position_th: application.signatureName.positionTh || "",
      });
    }
  }, [application?.signatureName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle prename selection with auto-clear for "อื่นๆ"
    if (name === "prename_th") {
      setFormData((prev) => ({
        ...prev,
        prename_th: value,
        prename_other: value === "อื่นๆ" ? prev.prename_other || "" : "",
      }));
    } else {
      // For other fields, just update the value
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Thai fields validation
    if (!formData.prename_th || formData.prename_th.trim() === "") {
      newErrors.prename_th = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)";
    }
    
    if (formData.prename_th === "อื่นๆ" && (!formData.prename_other || formData.prename_other.trim() === "")) {
      newErrors.prename_other = "กรุณาระบุคำนำหน้าชื่อ (อื่นๆ)";
    }
    
    if (!formData.first_name_th || formData.first_name_th.trim() === "") {
      newErrors.first_name_th = "กรุณาระบุชื่อ (ภาษาไทย)";
    }
    
    if (!formData.last_name_th || formData.last_name_th.trim() === "") {
      newErrors.last_name_th = "กรุณาระบุนามสกุล (ภาษาไทย)";
    }
    
    if (!formData.position_th || formData.position_th.trim() === "") {
      newErrors.position_th = "กรุณาระบุตำแหน่ง (ภาษาไทย)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/membership-requests/${type}/${application.id}/authorized-signatory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "บันทึกข้อมูลล้มเหลว");
      }

      toast.success("บันทึกข้อมูลผู้มีอำนาจลงนามสำเร็จ");
      setIsEditing(false);
      
      // Call onUpdate to refresh the parent component
      if (onUpdate) {
        // Use the DetailView's handleSectionUpdate format
        await onUpdate("authorizedSignatory", formData);
      }
    } catch (error) {
      console.error("Error saving authorized signatory:", error);
      toast.error(error.message || "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    if (application?.signatureName) {
      setFormData({
        prename_th: application.signatureName.prenameTh || "",
        prename_other: application.signatureName.prenameOther || "",
        first_name_th: application.signatureName.firstNameTh || "",
        last_name_th: application.signatureName.lastNameTh || "",
        position_th: application.signatureName.positionTh || "",
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const hasExistingData = application?.signatureName && (
    application.signatureName.prenameTh ||
    application.signatureName.firstNameTh ||
    application.signatureName.lastNameTh
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8 print:hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-blue-900 border-b border-blue-100 pb-4 flex-1">
          ผู้มีอำนาจลงนาม
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {hasExistingData ? "แก้ไข" : "เพิ่ม"}
          </button>
        )}
      </div>

      {!isEditing ? (
        // Display mode
        <div className="space-y-4">
          {hasExistingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3">ข้อมูลผู้มีอำนาจลงนาม</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-24">คำนำหน้า:</span>
                    <span className="text-sm text-gray-900">
                      {application.signatureName.prenameTh}
                      {application.signatureName.prenameTh === "อื่นๆ" && ` ${application.signatureName.prenameOther}`}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-24">ชื่อ:</span>
                    <span className="text-sm text-gray-900">{application.signatureName.firstNameTh}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-24">นามสกุล:</span>
                    <span className="text-sm text-gray-900">{application.signatureName.lastNameTh}</span>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-gray-500 w-24">ตำแหน่ง:</span>
                    <span className="text-sm text-gray-900">{application.signatureName.positionTh}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-500">ยังไม่มีข้อมูลผู้มีอำนาจลงนาม</p>
              <p className="text-sm text-gray-400 mt-1">กดปุ่ม "เพิ่ม" เพื่อเพิ่มข้อมูล</p>
            </div>
          )}
        </div>
      ) : (
        // Edit mode
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Prename Thai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำนำหน้า (ไทย) <span className="text-red-500">*</span>
              </label>
              <select
                name="prename_th"
                value={formData.prename_th || ""}
                onChange={handleInputChange}
                className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.prename_th ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                }`}
              >
                <option value="">เลือก</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
              {errors.prename_th && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <span className="mr-1">*</span>
                  {errors.prename_th}
                </p>
              )}
              {formData.prename_th === "อื่นๆ" && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="prename_other"
                    value={formData.prename_other || ""}
                    onChange={handleInputChange}
                    placeholder="ระบุคำนำหน้า เช่น ผศ.ดร."
                    className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.prename_other ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                    }`}
                  />
                  {errors.prename_other && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors.prename_other}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* First Name Thai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ (ภาษาไทย) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name_th"
                value={formData.first_name_th || ""}
                onChange={handleInputChange}
                placeholder="เช่น สมชาย"
                className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.first_name_th ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                }`}
              />
              {errors.first_name_th && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <span className="mr-1">*</span>
                  {errors.first_name_th}
                </p>
              )}
            </div>

            {/* Last Name Thai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name_th"
                value={formData.last_name_th || ""}
                onChange={handleInputChange}
                placeholder="เช่น ใจดี"
                className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.last_name_th ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                }`}
              />
              {errors.last_name_th && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <span className="mr-1">*</span>
                  {errors.last_name_th}
                </p>
              )}
            </div>

            {/* Position Thai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ตำแหน่ง (ภาษาไทย) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="position_th"
                value={formData.position_th || ""}
                onChange={handleInputChange}
                placeholder="เช่น กรรมการผู้จัดการ"
                className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.position_th ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                }`}
              />
              {errors.position_th && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <span className="mr-1">*</span>
                  {errors.position_th}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 border-t pt-6">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  บันทึก
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorizedSignatorySection;
