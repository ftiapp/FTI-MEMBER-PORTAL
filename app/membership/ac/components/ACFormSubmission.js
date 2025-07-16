'use client';

import { toast } from 'react-hot-toast';

/**
 * ตรวจสอบ Tax ID ว่าซ้ำในระบบหรือไม่
 * @param {string} taxId เลขประจำตัวผู้เสียภาษี
 * @returns {Promise<{isUnique: boolean, message: string}>} ผลการตรวจสอบ
 */
export const checkTaxIdUniqueness = async (taxId) => {
  try {
    const response = await fetch('/api/membership/check-tax-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taxId, memberType: 'AC' }),
    });

    const data = await response.json();

    // ตรวจสอบสถานะจาก API โดยดูจาก status ที่ส่งกลับมา
    if (response.status !== 200 || data.status === 'pending' || data.status === 'approved') {
      return {
        isUnique: false,
        message: data.message || 'เลขประจำตัวผู้เสียภาษีนี้มีในระบบแล้ว'
      };
    }
    
    // ถ้า status เป็น available แสดงว่าสามารถใช้งานได้
    return {
      isUnique: data.status === 'available',
      message: data.message || 'เลขประจำตัวผู้เสียภาษีสามารถใช้งานได้'
    };
  } catch (error) {
    console.error('Error checking tax ID:', error);
    return {
      isUnique: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล กรุณาลองใหม่อีกครั้ง'
    };
  }
};

/**
 * ส่งข้อมูลการสมัครสมาชิก AC ไปยัง API
 * @param {Object} formData ข้อมูลฟอร์มทั้งหมด
 * @returns {Promise<{success: boolean, message: string}>} ผลการส่งข้อมูล
 */
export const submitACMembershipForm = async (data) => {
  try {
    const formDataToSend = new FormData();

    // Robust helper (from OC)
    const appendToFormData = (key, value) => {
      // Single file object: { file: File, ... }
      if (value && typeof value === 'object' && value.file instanceof File) {
        formDataToSend.append(key, value.file, value.name);
      }
      // Array of file objects (e.g., productionImages)
      else if (key === 'productionImages' && Array.isArray(value)) {
        value.forEach((fileObj, index) => {
          if (fileObj && fileObj.file instanceof File) {
            formDataToSend.append(`${key}[${index}]`, fileObj.file, fileObj.name);
          }
        });
      }
      // Other arrays/objects
      else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        formDataToSend.append(key, JSON.stringify(value));
      }
      // Primitives
      else if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    };

    // Convert the plain object to FormData
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        appendToFormData(key, data[key]);
      }
    }

    // Always include memberType for AC
    formDataToSend.append('memberType', 'AC');

    const response = await fetch('/api/member/ac-membership/submit', {
      method: 'POST',
      body: formDataToSend,
    });
    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง'
      };
    }
    return {
      success: true,
      message: 'ส่งข้อมูลการสมัครสมาชิกเรียบร้อยแล้ว'
    };
  } catch (error) {
    console.error('Error submitting form:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง'
    };
  }
};
