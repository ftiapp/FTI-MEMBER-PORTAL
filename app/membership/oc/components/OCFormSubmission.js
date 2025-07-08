'use client';

import { toast } from 'react-hot-toast';

/**
 * ตรวจสอบ Tax ID ว่าซ้ำในระบบหรือไม่
 * @param {string} taxId เลขประจำตัวผู้เสียภาษี
 * @returns {Promise<boolean>} ผลการตรวจสอบ (true = ไม่ซ้ำ, false = ซ้ำ)
 */
export const checkTaxIdUniqueness = async (taxId) => {
  try {
    const response = await fetch('/api/membership/check-tax-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taxId, memberType: 'OC' }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking tax ID:', error);
    toast.error('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล กรุณาลองใหม่อีกครั้ง');
    return false;
  }
};

/**
 * ตรวจสอบเลขบัตรประชาชนว่าซ้ำในระบบหรือไม่
 * @param {string} idCardNumber เลขบัตรประชาชน
 * @returns {Promise<boolean>} ผลการตรวจสอบ (true = ไม่ซ้ำ, false = ซ้ำ)
 */
export const checkIdCardUniqueness = async (idCardNumber) => {
  try {
    const response = await fetch('/api/membership/check-id-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idCardNumber, memberType: 'OC' }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking ID card:', error);
    toast.error('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล กรุณาลองใหม่อีกครั้ง');
    return false;
  }
};

/**
 * ส่งข้อมูลการสมัครสมาชิก OC ไปยัง API
 * @param {Object} formData ข้อมูลฟอร์มทั้งหมด
 * @returns {Promise<{success: boolean, message: string}>} ผลการส่งข้อมูล
 */
export const submitOCMembershipForm = async (formData) => {
  try {
    const formDataToSend = new FormData();
    
    // เพิ่มข้อมูลทั่วไป
    Object.keys(formData).forEach(key => {
      if (key === 'businessTypes') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (
        key !== 'companyRegistration' && 
        key !== 'companyProfile' && 
        key !== 'shareholderList' && 
        key !== 'vatRegistration' && 
        key !== 'idCard' && 
        key !== 'authorityLetter'
      ) {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    // เพิ่มไฟล์เอกสาร
    if (formData.companyRegistration) formDataToSend.append('companyRegistration', formData.companyRegistration);
    if (formData.companyProfile) formDataToSend.append('companyProfile', formData.companyProfile);
    if (formData.shareholderList) formDataToSend.append('shareholderList', formData.shareholderList);
    if (formData.vatRegistration) formDataToSend.append('vatRegistration', formData.vatRegistration);
    if (formData.idCard) formDataToSend.append('idCard', formData.idCard);
    if (formData.authorityLetter) formDataToSend.append('authorityLetter', formData.authorityLetter);
    
    // ระบุประเภทสมาชิก
    formDataToSend.append('memberType', 'OC');
    
    const response = await fetch('/api/membership/register', {
      method: 'POST',
      body: formDataToSend,
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: 'ส่งข้อมูลการสมัครสมาชิกเรียบร้อยแล้ว' };
    } else {
      return { success: false, message: data.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล' };
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    return { 
      success: false, 
      message: error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง' 
    };
  }
};
