// components/AMFormSubmission.js
"use client";

/**
 * ฟังก์ชันสำหรับส่งข้อมูลฟอร์มสมัครสมาชิกสมาคม (แก้ไขแล้ว)
 * @param {Object} formData - ข้อมูลทั้งหมดในฟอร์ม
 * @returns {Promise<Object>} - ผลลัพธ์การส่งข้อมูล
 */
export const submitAMMembershipForm = async (formData) => {
  try {
    console.log("🚀 [AM] Starting form submission...");
    console.log("📋 [AM] Original form data:", formData);

    // สร้าง FormData สำหรับส่งไฟล์
    const formDataToSubmit = new FormData();

    // Helper to append data, handles files, arrays, and objects (same as OC)
    const appendToFormData = (key, value) => {
      // Handle single file object: { file: File, ... }
      if (value && typeof value === "object" && value.file instanceof File) {
        formDataToSubmit.append(key, value.file, value.name || value.file.name);
      }
      // Handle File objects directly
      else if (value instanceof File) {
        formDataToSubmit.append(key, value, value.name);
      }
      // Handle array of file objects for productionImages
      else if (key === "productionImages" && Array.isArray(value)) {
        value.forEach((fileObj, index) => {
          if (fileObj && fileObj.file instanceof File) {
            formDataToSubmit.append(
              `productionImages[${index}]`,
              fileObj.file,
              fileObj.name || fileObj.file.name,
            );
          } else if (fileObj instanceof File) {
            formDataToSubmit.append(`productionImages[${index}]`, fileObj, fileObj.name);
          }
        });
      }
      // Handle other arrays and objects (stringify them as API expects)
      else if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
        formDataToSubmit.append(key, JSON.stringify(value));
      }
      // Handle other primitive values
      else if (value !== null && value !== undefined && value !== "") {
        formDataToSubmit.append(key, String(value));
      }
    };

    // Convert the plain object to FormData (same as OC)
    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        appendToFormData(key, formData[key]);
      }
    }

    // Ensure authorized signatory name fields are included
    if (formData.authorizedSignatoryFirstNameTh) {
      formDataToSubmit.append(
        "authorizedSignatoryFirstNameTh",
        formData.authorizedSignatoryFirstNameTh,
      );
    }
    if (formData.authorizedSignatoryLastNameTh) {
      formDataToSubmit.append(
        "authorizedSignatoryLastNameTh",
        formData.authorizedSignatoryLastNameTh,
      );
    }
    if (formData.authorizedSignatoryFirstNameEn) {
      formDataToSubmit.append(
        "authorizedSignatoryFirstNameEn",
        formData.authorizedSignatoryFirstNameEn,
      );
    }
    if (formData.authorizedSignatoryLastNameEn) {
      formDataToSubmit.append(
        "authorizedSignatoryLastNameEn",
        formData.authorizedSignatoryLastNameEn,
      );
    }

    // Debug: แสดงข้อมูลที่จะส่ง
    console.log("📦 [AM] FormData contents:");
    for (let [key, value] of formDataToSubmit.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    // ส่งข้อมูลไปยัง API พร้อม retry logic สำหรับ lock wait timeout
    console.log("🌐 [AM] Sending data to API...");

    const maxRetries = 3;
    let retryCount = 0;

    let result;
    while (retryCount < maxRetries) {
      try {
        const response = await fetch("/api/member/am-membership/submit", {
          method: "POST",
          body: formDataToSubmit,
        });

        console.log("📡 [AM] API Response status:", response.status);

        result = await response.json();
        console.log("📥 [AM] API Response data:", result);

        if (!response.ok) {
          // จัดการ lock wait timeout ด้วย retry
          if (response.status === 429 && result.retryAfter) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // exponential backoff
            console.log(
              `⏳ [AM] Lock wait timeout, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            retryCount++;
            continue;
          }

          console.error("❌ [AM] API Error:", result);
          throw new Error(result.error || result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
        }

        // Check if API returned success (explicitly or implicitly via HTTP status)
        if (result.success || (response.ok && response.status === 201)) {
          console.log("🎉 [AM] Form submission successful!");

          // Create notification
          try {
            const memberData = {
              taxId: formData.taxId,
              companyNameTh: formData.associationName,
              companyNameEn: formData.associationNameEn,
              applicantName: `${formData.firstNameTh || ""} ${formData.lastNameTh || ""}`.trim(),
            };

            await fetch("/api/FTI_Portal_User_Notifications/membership", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                membershipType: "am",
                memberData,
                memberId: result.memberId,
              }),
            });
          } catch (notificationError) {
            console.error("Error creating notification:", notificationError);
            // Don't fail the submission if notification fails
          }

          return {
            success: true,
            message: "ส่งข้อมูลสมัครสมาชิก AM สำเร็จ",
            data: result,
            memberData: {
              taxId: formData.taxId,
              companyNameTh: formData.associationName,
              companyNameEn: formData.associationNameEn,
              applicantName: `${formData.firstNameTh || ""} ${formData.lastNameTh || ""}`.trim(),
            },
            redirectUrl: "/dashboard?tab=documents",
          };
        } else {
          // API call was successful but success condition not met
          console.error("❌ [AM] API returned unsuccessful response:", result);
          return {
            success: false,
            message: result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล",
            data: result,
          };
        }

        break; // Success, exit retry loop
      } catch (error) {
        // Network errors or other exceptions
        if (retryCount < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(
            `⏳ [AM] Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          retryCount++;
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error("💥 [AM] Error submitting AM membership form:", error);
    return {
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง",
    };
  }
};

// Helper function สำหรับการ validate ข้อมูลก่อนส่ง
export const validateAMFormData = (formData) => {
  const errors = {};

  // ตรวจสอบข้อมูลพื้นฐาน
  if (!formData.associationName?.trim()) {
    errors.associationName = "กรุณากรอกชื่อสมาคม";
  }

  if (!formData.taxId?.trim()) {
    errors.taxId = "กรุณากรอกเลขประจำตัวผู้เสียภาษี";
  }

  if (!formData.memberCount || parseInt(formData.memberCount) < 0) {
    errors.memberCount = "กรุณากรอกจำนวนสมาชิกที่ถูกต้อง";
  }

  // ตรวจสอบที่อยู่
  if (!formData.addressNumber?.trim()) {
    errors.addressNumber = "กรุณากรอกเลขที่";
  }

  if (!formData.subDistrict?.trim()) {
    errors.subDistrict = "กรุณาเลือกตำบล/แขวง";
  }

  if (!formData.district?.trim()) {
    errors.district = "กรุณาเลือกอำเภอ/เขต";
  }

  if (!formData.province?.trim()) {
    errors.province = "กรุณาเลือกจังหวัด";
  }

  if (!formData.postalCode?.trim()) {
    errors.postalCode = "กรุณากรอกรหัสไปรษณีย์";
  }

  // ตรวจสอบประเภทธุรกิจ
  if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) {
    errors.businessTypes = "กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ข้อ";
  }

  // ตรวจสอบผลิตภัณฑ์
  if (
    !formData.products ||
    !Array.isArray(formData.products) ||
    !formData.products.some((p) => p.nameTh?.trim())
  ) {
    errors.products = "กรุณากรอกข้อมูลผลิตภัณฑ์/บริการอย่างน้อย 1 รายการ";
  }

  // ✅ ตรวจสอบเอกสารที่จำเป็น
  if (!formData.associationCertificate) {
    errors.associationCertificate = "กรุณาอัปโหลดหนังสือรับรองการจดทะเบียนสมาคมการค้า";
  }

  if (!formData.memberList) {
    errors.memberList = "กรุณาอัปโหลดรายชื่อสมาชิกสมาคม";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
