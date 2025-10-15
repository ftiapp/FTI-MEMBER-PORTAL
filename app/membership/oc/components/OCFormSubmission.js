/**
 * Submits the OC membership form data to the server.
 * @param {object} data - The form data object to submit.
 * @returns {Promise<{success: boolean, data: any, error: string | null}>}
 */
export async function submitOCMembershipForm(data) {
  try {
    const formData = new FormData();

    // Helper to append data, handles files, arrays, and objects
    const appendToFormData = (key, value) => {
      // Handle single file object: { file: File, ... }
      if (value && typeof value === "object" && value.file instanceof File) {
        formData.append(key, value.file, value.name || value.file.name);
      }
      // Handle File objects directly
      else if (value instanceof File) {
        formData.append(key, value, value.name);
      }
      // Handle array of file objects for productionImages
      else if (key === "productionImages" && Array.isArray(value)) {
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
      }
      // Handle other arrays and objects (stringify them as API expects)
      else if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
        formData.append(key, JSON.stringify(value));
      }
      // Handle other primitive values
      else if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    };

    // Convert the plain object to FormData
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        appendToFormData(key, data[key]);
      }
    }

    // Ensure authorized signatory name fields are included
    if (data.authorizedSignatoryFirstNameTh)
      formData.append("authorizedSignatoryFirstNameTh", data.authorizedSignatoryFirstNameTh);
    if (data.authorizedSignatoryLastNameTh)
      formData.append("authorizedSignatoryLastNameTh", data.authorizedSignatoryLastNameTh);
    if (data.authorizedSignatoryFirstNameEn)
      formData.append("authorizedSignatoryFirstNameEn", data.authorizedSignatoryFirstNameEn);
    if (data.authorizedSignatoryLastNameEn)
      formData.append("authorizedSignatoryLastNameEn", data.authorizedSignatoryLastNameEn);

    // Debug: Log what's being sent
    console.log("📤 Sending form data to API...");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const response = await fetch("/api/member/oc-membership/submit", {
      method: "POST",
      body: formData, // body is now a FormData object
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ API Error:", response.status, result);
      return {
        success: false,
        data: null,
        error: result.error || `เกิดข้อผิดพลาด (${response.status})`,
        message: result.error || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ",
      };
    }

    console.log("=== OC Form Submission Complete ===");

    // Create notification
    try {
      const memberData = {
        taxId: data.taxId,
        companyNameTh: data.companyNameTh,
        companyNameEn: data.companyNameEn,
        applicantName: `${data.firstNameTh || ""} ${data.lastNameTh || ""}`.trim(),
      };

      await fetch("/api/FTI_Portal_User_Notifications/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipType: "oc",
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
      message: "ส่งข้อมูลสมัครสมาชิก OC สำเร็จ",
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
    console.error("❌ Error submitting OC membership form:", error);
    return {
      success: false,
      data: null,
      error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
    };
  }
}

/**
 * Checks if a Tax ID is already registered or pending.
 * @param {string} taxId - The Tax ID to check.
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export async function checkTaxIdUniqueness(taxId) {
  try {
    const response = await fetch("/api/member/oc-membership/check-tax-id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taxId }),
    });

    const result = await response.json();

    console.log("Tax ID validation response:", result);

    if (!response.ok) {
      // The API should return a 409 status if not unique
      if (response.status === 409) {
        return { valid: false, message: result.error };
      }
      // For other errors, treat as a generic error
      return { valid: false, message: result.error || "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล" };
    }

    // If response is ok, check the result structure based on API
    return {
      valid: result.valid === true,
      message:
        result.message ||
        (result.valid ? "เลขประจำตัวผู้เสียภาษีสามารถใช้ได้" : "ไม่สามารถตรวจสอบได้"),
    };
  } catch (error) {
    console.error("Error checking tax ID uniqueness:", error);
    return {
      valid: false,
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อตรวจสอบข้อมูล",
    };
  }
}
