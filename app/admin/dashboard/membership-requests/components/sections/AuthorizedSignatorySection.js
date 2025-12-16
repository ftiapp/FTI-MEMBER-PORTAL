import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const AuthorizedSignatorySection = ({ application, type, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data with existing signatories data
  useEffect(() => {
    console.log(
      "🔍 DEBUG AuthorizedSignatorySection - application.signatories:",
      application?.signatories,
    );
    console.log(
      "🔍 DEBUG AuthorizedSignatorySection - application.signatureName:",
      application?.signatureName,
    );

    // Use new signatories array if available, otherwise convert old signatureName to array
    if (application?.signatories && application.signatories.length > 0) {
      setFormData(application.signatories);
    } else if (application?.signatureName) {
      // Convert old single signature to array format
      setFormData([
        {
          prename_th: application.signatureName.prenameTh || "",
          prename_other: application.signatureName.prenameOther || "",
          first_name_th: application.signatureName.firstNameTh || "",
          last_name_th: application.signatureName.lastNameTh || "",
          position_th: application.signatureName.positionTh || "",
        },
      ]);
    } else {
      setFormData([]);
    }
  }, [application?.signatories, application?.signatureName]);

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index] };

      // Handle prename selection with auto-clear for "อื่นๆ"
      if (name === "prename_th") {
        updated[index].prename_th = value;
        updated[index].prename_other = value === "อื่นๆ" ? updated[index].prename_other || "" : "";
      } else {
        // For other fields, just update the value
        updated[index][name] = value;
      }

      return updated;
    });

    // Clear errors when user starts typing
    if (errors[`${index}_${name}`]) {
      setErrors((prev) => ({ ...prev, [`${index}_${name}`]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    formData.forEach((signatory, index) => {
      // Thai fields validation
      if (!signatory.prename_th || signatory.prename_th.trim() === "") {
        newErrors[`${index}_prename_th`] = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)";
      }

      if (
        signatory.prename_th === "อื่นๆ" &&
        (!signatory.prename_other || signatory.prename_other.trim() === "")
      ) {
        newErrors[`${index}_prename_other`] = "กรุณาระบุคำนำหน้าชื่อ (อื่นๆ)";
      }

      if (!signatory.first_name_th || signatory.first_name_th.trim() === "") {
        newErrors[`${index}_first_name_th`] = "กรุณาเลือกชื่อ (ภาษาไทย)";
      }

      if (!signatory.last_name_th || signatory.last_name_th.trim() === "") {
        newErrors[`${index}_last_name_th`] = "กรุณาระบุนามสกุล (ภาษาไทย)";
      }

      if (!signatory.position_th || signatory.position_th.trim() === "") {
        newErrors[`${index}_position_th`] = "กรุณาระบุตำแหน่ง (ภาษาไทย)";
      }
    });

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
      const response = await fetch(
        `/api/admin/membership-requests/${type}/${application.id}/authorized-signatory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        },
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "บันทึกข้อมูลล้มเหลว");
      }

      toast.success("บันทึกข้อมูลผู้มีอำนาจลงนามสำเร็จ");
      setIsEditing(false);

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error saving authorized signatory:", error);
      toast.error(error.message || "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    if (application?.signatories && application.signatories.length > 0) {
      setFormData(application.signatories);
    } else if (application?.signatureName) {
      setFormData([
        {
          prename_th: application.signatureName.prenameTh || "",
          prename_other: application.signatureName.prenameOther || "",
          first_name_th: application.signatureName.firstNameTh || "",
          last_name_th: application.signatureName.lastNameTh || "",
          position_th: application.signatureName.positionTh || "",
        },
      ]);
    } else {
      setFormData([]);
    }
    setErrors({});
    setIsEditing(false);
  };

  const hasExistingData =
    (application?.signatories && application.signatories.length > 0) ||
    (application?.signatureName &&
      (application.signatureName.prenameTh ||
        application.signatureName.firstNameTh ||
        application.signatureName.lastNameTh));

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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            {hasExistingData ? "แก้ไข" : "เพิ่ม"}
          </button>
        )}
      </div>

      {!isEditing ? (
        // Display mode
        <div className="space-y-4">
          {hasExistingData ? (
            <div className="space-y-6">
              {/* Display new signatories array if available */}
              {application?.signatories && application.signatories.length > 0 ? (
                application.signatories.map((signatory, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                          {index + 1}
                        </span>
                        ผู้มีอำนาจลงนามคนที่ {index + 1}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-semibold text-gray-600 mb-2">ข้อมูลภาษาไทย</h5>
                        <div className="space-y-1">
                          <div className="flex">
                            <span className="text-xs font-medium text-gray-500 w-20">
                              คำนำหน้า:
                            </span>
                            <span className="text-xs text-gray-900">
                              {signatory.prenameTh || signatory.prename_th}
                              {(signatory.prenameTh === "อื่นๆ" ||
                                signatory.prename_th === "อื่นๆ") &&
                                ` ${signatory.prenameOther || signatory.prename_other}`}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-xs font-medium text-gray-500 w-20">
                              ชื่อ-นามสกุล:
                            </span>
                            <span className="text-xs text-gray-900">
                              {signatory.firstNameTh || signatory.first_name_th || ""}{" "}
                              {signatory.lastNameTh || signatory.last_name_th || ""}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-xs font-medium text-gray-500 w-20">ตำแหน่ง:</span>
                            <span className="text-xs text-gray-900">
                              {signatory.positionTh || signatory.position_th}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Fallback to old single signature display */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-3">
                      ข้อมูลผู้มีอำนาจลงนาม
                    </h4>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 w-24">คำนำหน้า:</span>
                        <span className="text-sm text-gray-900">
                          {application.signatureName.prenameTh}
                          {application.signatureName.prenameTh === "อื่นๆ" &&
                            ` ${application.signatureName.prenameOther}`}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 w-24">ชื่อ:</span>
                        <span className="text-sm text-gray-900">
                          {application.signatureName.firstNameTh}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 w-24">นามสกุล:</span>
                        <span className="text-sm text-gray-900">
                          {application.signatureName.lastNameTh}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-sm font-medium text-gray-500 w-24">ตำแหน่ง:</span>
                        <span className="text-sm text-gray-900">
                          {application.signatureName.positionTh}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <p className="text-gray-500">ยังไม่มีข้อมูลผู้มีอำนาจลงนาม</p>
              <p className="text-sm text-gray-400 mt-1">
                กดปุ่ม &quot;เพิ่ม&quot; เพื่อเพิ่มข้อมูล
              </p>
            </div>
          )}
        </div>
      ) : (
        // Edit mode
        <div className="space-y-6">
          {formData.map((signatory, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                    {index + 1}
                  </span>
                  ผู้มีอำนาจลงนามคนที่ {index + 1}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Prename Thai */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คำนำหน้า (ไทย) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="prename_th"
                    value={signatory.prename_th || ""}
                    onChange={(e) => handleInputChange(index, e)}
                    className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors[`${index}_prename_th`]
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
                  {errors[`${index}_prename_th`] && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors[`${index}_prename_th`]}
                    </p>
                  )}
                  {signatory.prename_th === "อื่นๆ" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="prename_other"
                        value={signatory.prename_other || ""}
                        onChange={(e) => handleInputChange(index, e)}
                        placeholder="ระบุคำนำหน้า เช่น ผศ.ดร."
                        className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                          errors[`${index}_prename_other`]
                            ? "border-red-300 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                      />
                      {errors[`${index}_prename_other`] && (
                        <p className="mt-1 text-xs text-red-600 flex items-center">
                          <span className="mr-1">*</span>
                          {errors[`${index}_prename_other`]}
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
                    value={signatory.first_name_th || ""}
                    onChange={(e) => handleInputChange(index, e)}
                    placeholder="เช่น สมชาย"
                    className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors[`${index}_first_name_th`]
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                  />
                  {errors[`${index}_first_name_th`] && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors[`${index}_first_name_th`]}
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
                    value={signatory.last_name_th || ""}
                    onChange={(e) => handleInputChange(index, e)}
                    placeholder="เช่น ใจดี"
                    className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors[`${index}_last_name_th`]
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                  />
                  {errors[`${index}_last_name_th`] && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors[`${index}_last_name_th`]}
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
                    value={signatory.position_th || ""}
                    onChange={(e) => handleInputChange(index, e)}
                    placeholder="เช่น กรรมการผู้จัดการ"
                    className={`block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors[`${index}_position_th`]
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                  />
                  {errors[`${index}_position_th`] && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>
                      {errors[`${index}_position_th`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add/Remove Signatory Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => [
                  ...prev,
                  {
                    prename_th: "",
                    prename_other: "",
                    first_name_th: "",
                    last_name_th: "",
                    position_th: "",
                  },
                ]);
              }}
              className="px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              เพิ่มผู้มีอำนาจลงนาม
            </button>

            {formData.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => prev.slice(0, -1));
                }}
                className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                ลบผู้มีอำนาจลงนามคนสุดท้าย
              </button>
            )}
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
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
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
