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

    const appendToFormData = (key, value) => {
      if (value && typeof value === 'object' && value.file instanceof File) {
        formDataToSend.append(key, value.file, value.name);
      }
      else if (key === 'productionImages' && Array.isArray(value)) {
        value.forEach((fileObj, index) => {
          if (fileObj && fileObj.file instanceof File) {
            formDataToSend.append(`${key}[${index}]`, fileObj.file, fileObj.name);
          }
        });
      }
      else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        formDataToSend.append(key, JSON.stringify(value));
      }
      else if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    };
    
    // ✅ ตรวจสอบและเตรียมข้อมูลกลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด
    console.log('=== Processing Industry Groups and Provincial Chapters ===');
    
    // ตรวจสอบว่ามีข้อมูลชื่อกลุ่มอุตสาหกรรมหรือไม่
    if (mappedData.industrialGroups && Array.isArray(mappedData.industrialGroups) && 
        (!mappedData.industrialGroupNames || !Array.isArray(mappedData.industrialGroupNames) || 
         mappedData.industrialGroupNames.length !== mappedData.industrialGroups.length)) {
      console.log('Setting industrialGroupNames as fallback from IDs');
      mappedData.industrialGroupNames = mappedData.industrialGroups.map(id => id.toString());
    }
    
    // ตรวจสอบว่ามีข้อมูลชื่อสภาอุตสาหกรรมจังหวัดหรือไม่
    if (mappedData.provincialChapters && Array.isArray(mappedData.provincialChapters) && 
        (!mappedData.provincialChapterNames || !Array.isArray(mappedData.provincialChapterNames) || 
         mappedData.provincialChapterNames.length !== mappedData.provincialChapters.length)) {
      console.log('Setting provincialChapterNames as fallback from IDs');
      mappedData.provincialChapterNames = mappedData.provincialChapters.map(id => id.toString());
    }

    for (const key in mappedData) {
      if (Object.prototype.hasOwnProperty.call(mappedData, key)) {
        appendToFormData(key, mappedData[key]);
      }
    }

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
    
    console.log('=== AC Form Submission Complete ===');
    
    // Redirect to documents page after successful submission
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard?tab=documents';
    }
    
    return {
      success: true,
      message: 'ส่งข้อมูลสมัครสมาชิก AC สำเร็จ',
      memberId: result.memberId,
      redirectUrl: '/dashboard?tab=documents'
    };
  } catch (error) {
    console.error('Error submitting form:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง'
    };
  }
};