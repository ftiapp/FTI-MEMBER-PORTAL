"use client";
import { toast } from "react-hot-toast";

/**
 * ตรวจสอบ Tax ID ว่าซ้ำในระบบหรือไม่
 * @param {string} taxId เลขประจำตัวผู้เสียภาษี
 * @returns {Promise<{isUnique: boolean, message: string}>} ผลการตรวจสอบ
 */
export const checkTaxIdUniqueness = async (taxId) => {
  try {
    const response = await fetch("/api/membership/check-tax-id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taxId, memberType: "AC" }),
    });

    const data = await response.json();

    // ตรวจสอบสถานะจาก API โดยดูจาก status ที่ส่งกลับมา
    if (response.status !== 200 || data.status === "pending" || data.status === "approved") {
      return {
        isUnique: false,
        message: data.message || "เลขประจำตัวผู้เสียภาษีนี้มีในระบบแล้ว",
      };
    }

    // ถ้า status เป็น available แสดงว่าสามารถใช้งานได้
    return {
      isUnique: data.status === "available",
      message: data.message || "เลขประจำตัวผู้เสียภาษีสามารถใช้งานได้",
    };
  } catch (error) {
    console.error("Error checking tax ID:", error);
    return {
      isUnique: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล กรุณาลองใหม่อีกครั้ง",
    };
  }
};

/**
 * ส่งข้อมูลการสมัครสมาชิก AC ไปยัง API
 * @param {Object} data ข้อมูลฟอร์มทั้งหมด
 * @returns {Promise<{success: boolean, message: string}>} ผลการส่งข้อมูล
 */
export const submitACMembershipForm = async (data) => {
  try {
    const formDataToSend = new FormData();

    // ✅ Map Contact Person fields ให้ตรงกับที่ API คาดหวัง
    const mappedData = { ...data };

    if (data.contactPerson) {
      mappedData.contactPersonPosition = data.contactPerson.position;
      mappedData.contactPersonFirstName = data.contactPerson.firstNameThai;
      mappedData.contactPersonLastName = data.contactPerson.lastNameThai;
      mappedData.contactPersonFirstNameEng = data.contactPerson.firstNameEng;
      mappedData.contactPersonLastNameEng = data.contactPerson.lastNameEng;
      mappedData.contactPersonEmail = data.contactPerson.email;
      mappedData.contactPersonPhone = data.contactPerson.phone;
      delete mappedData.contactPerson;
    }

    // ✅ ตรวจสอบและเตรียมข้อมูลกลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด
    console.log("=== Processing Industry Groups and Provincial Chapters ===");

    // กรอง "000" (ไม่ระบุ) ออกจาก industrialGroups และ industrialGroupIds
    if (mappedData.industrialGroups && Array.isArray(mappedData.industrialGroups)) {
      mappedData.industrialGroups = mappedData.industrialGroups.filter(
        (id) => id !== "000" && id !== 0,
      );
    }
    if (mappedData.industrialGroupIds && Array.isArray(mappedData.industrialGroupIds)) {
      mappedData.industrialGroupIds = mappedData.industrialGroupIds.filter(
        (id) => id !== "000" && id !== 0,
      );
    }

    // กรอง "000" (ไม่ระบุ) ออกจาก provincialChapters และ provincialChapterIds
    if (mappedData.provincialChapters && Array.isArray(mappedData.provincialChapters)) {
      mappedData.provincialChapters = mappedData.provincialChapters.filter(
        (id) => id !== "000" && id !== 0,
      );
    }
    if (mappedData.provincialChapterIds && Array.isArray(mappedData.provincialChapterIds)) {
      mappedData.provincialChapterIds = mappedData.provincialChapterIds.filter(
        (id) => id !== "000" && id !== 0,
      );
    }

    // ตรวจสอบว่ามีข้อมูลชื่อกลุ่มอุตสาหกรรมหรือไม่
    if (
      mappedData.industrialGroups &&
      Array.isArray(mappedData.industrialGroups) &&
      (!mappedData.industrialGroupNames ||
        !Array.isArray(mappedData.industrialGroupNames) ||
        mappedData.industrialGroupNames.length !== mappedData.industrialGroups.length)
    ) {
      console.log("Setting industrialGroupNames as fallback from IDs");
      mappedData.industrialGroupNames = mappedData.industrialGroups.map((id) => id.toString());
    }

    // ตรวจสอบว่ามีข้อมูลชื่อสภาอุตสาหกรรมจังหวัดหรือไม่
    if (
      mappedData.provincialChapters &&
      Array.isArray(mappedData.provincialChapters) &&
      (!mappedData.provincialChapterNames ||
        !Array.isArray(mappedData.provincialChapterNames) ||
        mappedData.provincialChapterNames.length !== mappedData.provincialChapters.length)
    ) {
      console.log("Setting provincialChapterNames as fallback from IDs");
      mappedData.provincialChapterNames = mappedData.provincialChapters.map((id) => id.toString());
    }

    // Normalize address fields to use 'street' (keep 'road' for backward compatibility)
    const streetValue = mappedData.street || mappedData.road || "";
    if (streetValue) {
      mappedData.street = streetValue;
      mappedData.road = streetValue;
    }

    // Normalize nested addresses object if provided
    if (mappedData.addresses && typeof mappedData.addresses === "object") {
      mappedData.addresses = Object.entries(mappedData.addresses).reduce((acc, [type, addr]) => {
        const a = { ...(addr || {}) };
        if (!a.street && a.road) a.street = a.road;
        return { ...acc, [type]: a };
      }, {});
    }

    // ✅ Handle authorizedSignatures array of files BEFORE appendToFormData
    if (mappedData.authorizedSignatures && Array.isArray(mappedData.authorizedSignatures)) {
      console.log(
        "🔍 [ACFormSubmission] Authorized Signatures files before FormData conversion:",
        mappedData.authorizedSignatures,
      );

      mappedData.authorizedSignatures.forEach((fileObj, index) => {
        if (fileObj && fileObj.file instanceof File) {
          formDataToSend.append(
            `authorizedSignatures[${index}]`,
            fileObj.file,
            fileObj.name || fileObj.file.name,
          );
          console.log(
            ` Signature ${index + 1}: File(${fileObj.file.name}, ${fileObj.file.size} bytes)`,
          );
        } else if (fileObj instanceof File) {
          formDataToSend.append(`authorizedSignatures[${index}]`, fileObj, fileObj.name);
          console.log(` Signature ${index + 1}: File(${fileObj.name}, ${fileObj.size} bytes)`);
        }
      });

      // Remove from mappedData to avoid duplicate processing
      delete mappedData.authorizedSignatures;
    }

    // ✅ ฟังก์ชันช่วยในการ append ข้อมูลไปยัง FormData
    const appendToFormData = (key, value) => {
      // 1) If value is a direct File
      if (value instanceof File) {
        formDataToSend.append(key, value, value.name);
      }
      // 2) If value is an object containing a File under the 'file' property
      else if (value && typeof value === "object" && value.file instanceof File) {
        formDataToSend.append(key, value.file, value.name || value.file.name);
      }
      // 3) Special handling for multiple production images
      else if (key === "productionImages" && Array.isArray(value)) {
        value.forEach((fileObj, index) => {
          if (fileObj && fileObj.file instanceof File) {
            formDataToSend.append(`${key}[${index}]`, fileObj.file, fileObj.name);
          }
        });
      }
      // 4) Arrays or objects
      else if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
        formDataToSend.append(key, JSON.stringify(value));
      }
      // 5) Primitives
      else if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    };

    // Convert the plain object to FormData
    for (const key in mappedData) {
      if (Object.prototype.hasOwnProperty.call(mappedData, key)) {
        appendToFormData(key, mappedData[key]);
      }
    }

    formDataToSend.append("memberType", "AC");
    if (mappedData.rejectionId) {
      formDataToSend.append("rejectionId", mappedData.rejectionId);
    }

    // Debug: Log what's being sent
    console.log("📤 Sending AC form data to API...");
    for (let [key, value] of formDataToSend.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const response = await fetch("/api/member/ac-membership/submit", {
      method: "POST",
      body: formDataToSend,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง",
      };
    }

    console.log("=== AC Form Submission Complete ===");

    // Create notification
    try {
      const memberData = {
        taxId: data.taxId,
        companyNameTh: data.companyNameTh,
        companyNameEn: data.companyNameEn,
        applicantName:
          data.signatories && data.signatories.length > 0
            ? `${data.signatories[0].prenameTh || ""} ${data.signatories[0].firstNameTh || ""} ${data.signatories[0].lastNameTh || ""}`.trim()
            : "ผู้มีอำนาจลงนาม",
      };

      await fetch("/api/notifications/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipType: "ac",
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
      message: "ส่งข้อมูลสมัครสมาชิก AC สำเร็จ",
      memberId: result.memberId,
      memberData: {
        taxId: data.taxId,
        companyNameTh: data.companyNameTh,
        companyNameEn: data.companyNameEn,
        applicantName: `${data.firstNameTh || ""} ${data.lastNameTh || ""}`.trim(),
      },
      redirectUrl: "/dashboard?tab=documents",
    };
  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง",
    };
  }
};

export const submitACMembershipDocumentsUpdate = async (data, mainId) => {
  try {
    const formData = new FormData();

    const appendToFormData = (key, value) => {
      if (value && typeof value === "object" && value.file instanceof File) {
        formData.append(key, value.file, value.name || value.file.name);
      } else if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (key === "productionImages" && Array.isArray(value)) {
        value.forEach((fileObj, index) => {
          if (fileObj && fileObj.file instanceof File) {
            formData.append(
              `productionImages[${index}]`,
              fileObj.file,
              fileObj.name || fileObj.file.name,
            );
          } else if (fileObj instanceof File) {
            formData.append(`productionImages[${index}]`, fileObj, fileObj.name);
          }
        });
      } else if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    };

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (key === "authorizedSignatures") continue;
        appendToFormData(key, data[key]);
      }
    }

    if (data.authorizedSignatures && Array.isArray(data.authorizedSignatures)) {
      data.authorizedSignatures.forEach((fileObj, index) => {
        if (fileObj && fileObj.file instanceof File) {
          formData.append(
            `authorizedSignatures[${index}]`,
            fileObj.file,
            fileObj.name || fileObj.file.name,
          );
        } else if (fileObj instanceof File) {
          formData.append(`authorizedSignatures[${index}]`, fileObj, fileObj.name);
        }
      });
    }

    const response = await fetch(`/api/member/ac-membership/update-documents/${mainId}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "ไม่สามารถอัปเดตเอกสารแนบได้",
      };
    }

    return {
      success: true,
      message: result.message || "อัปเดตเอกสารแนบเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("❌ Error updating AC membership documents:", error);
    return {
      success: false,
      message: "ไม่สามารถอัปเดตเอกสารแนบได้",
    };
  }
};
