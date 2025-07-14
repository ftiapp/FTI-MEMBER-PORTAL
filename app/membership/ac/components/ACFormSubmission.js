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
export const submitACMembershipForm = async (formData) => {
  try {
    const formDataToSend = new FormData();
    
    // เพิ่มข้อมูลทั่วไป
    Object.keys(formData).forEach(key => {
      if (key === 'businessTypes' || key === 'industrialGroups') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (
        key !== 'companyRegistration' && 
        key !== 'companyProfile' && 
        key !== 'shareholderList' && 
        key !== 'vatRegistration'
      ) {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    // เพิ่มไฟล์เอกสาร
    if (formData.companyRegistration) formDataToSend.append('companyRegistration', formData.companyRegistration);
    if (formData.companyProfile) formDataToSend.append('companyProfile', formData.companyProfile);
    if (formData.shareholderList) formDataToSend.append('shareholderList', formData.shareholderList);
    if (formData.vatRegistration) formDataToSend.append('vatRegistration', formData.vatRegistration);
    
    // ระบุประเภทสมาชิก
    formDataToSend.append('memberType', 'AC');
    
    // ส่งข้อมูลไปยัง API
    const response = await fetch('/api/ac-membership/submit', {
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
