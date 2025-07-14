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
      if (value && typeof value === 'object' && value.file instanceof File) {
        formData.append(key, value.file, value.name);
      } 
      // Handle array of file objects for productionImages
      else if (key === 'productionImages' && Array.isArray(value)) {
        value.forEach((fileObj, index) => {
          if (fileObj && fileObj.file instanceof File) {
            formData.append(`${key}[${index}]`, fileObj.file, fileObj.name);
          }
        });
      } 
      // Handle other arrays and objects
      else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        formData.append(key, JSON.stringify(value));
      } 
      // Handle other primitive values
      else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    };

    // Convert the plain object to FormData
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        appendToFormData(key, data[key]);
      }
    }

    const response = await fetch('/api/member/oc-membership/submit', {
      method: 'POST',
      body: formData, // body is now a FormData object
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, data: null, error: result.error || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ' };
    }

    return { success: true, data: result, error: null };
  } catch (error) {
    console.error('Error submitting OC membership form:', error);
    return { success: false, data: null, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์' };
  }
}

/**
 * Checks if a Tax ID is already registered or pending.
 * @param {string} taxId - The Tax ID to check.
 * @returns {Promise<{isUnique: boolean, message: string | null}>}
 */
export async function checkTaxIdUniqueness(taxId) {
  try {
    const response = await fetch(`/api/member/oc-membership/check-tax-id?taxId=${taxId}`);
    const result = await response.json();

    if (!response.ok) {
      // The API should return a 409 status if not unique
      if (response.status === 409) {
        return { isUnique: false, message: result.error };
      }
      // For other errors, treat as a generic error
      return { isUnique: false, message: result.error || 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' };
    }

    // If response is ok (e.g., 200), it means the ID is unique
    return { isUnique: true, message: null };
  } catch (error) {
    console.error('Error checking tax ID uniqueness:', error);
    return { isUnique: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อตรวจสอบข้อมูล' };
  }
}