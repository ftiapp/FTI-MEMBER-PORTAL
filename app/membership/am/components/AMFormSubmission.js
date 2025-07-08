// components/AMFormSubmission.js
'use client';

/**
 * ฟังก์ชันสำหรับส่งข้อมูลฟอร์มสมัครสมาชิกสมาคม
 * @param {Object} formData - ข้อมูลทั้งหมดในฟอร์ม
 * @returns {Promise<Object>} - ผลลัพธ์การส่งข้อมูล
 */
export const submitAMMembershipForm = async (formData) => {
  try {
    // สร้าง FormData สำหรับส่งไฟล์
    const formDataToSubmit = new FormData();
    
    // เพิ่มข้อมูลพื้นฐานของสมาคม
    formDataToSubmit.append('associationName', formData.associationName);
    formDataToSubmit.append('associationRegistrationNumber', formData.associationRegistrationNumber);
    formDataToSubmit.append('taxId', formData.taxId);
    formDataToSubmit.append('associationEmail', formData.associationEmail);
    formDataToSubmit.append('associationPhone', formData.associationPhone);
    
    // เพิ่มข้อมูลที่อยู่
    formDataToSubmit.append('addressNumber', formData.addressNumber);
    formDataToSubmit.append('moo', formData.moo || '');
    formDataToSubmit.append('soi', formData.soi || '');
    formDataToSubmit.append('road', formData.road || '');
    formDataToSubmit.append('subDistrict', formData.subDistrict);
    formDataToSubmit.append('district', formData.district);
    formDataToSubmit.append('province', formData.province);
    formDataToSubmit.append('postalCode', formData.postalCode);
    
    // เพิ่มข้อมูลผู้แทน
    formDataToSubmit.append('representatives', JSON.stringify(formData.representatives));
    
    // เพิ่มข้อมูลธุรกิจ
    formDataToSubmit.append('businessTypes', JSON.stringify(formData.businessTypes));
    formDataToSubmit.append('otherBusinessTypeDetail', formData.otherBusinessTypeDetail || '');
    formDataToSubmit.append('products', formData.products || '');
    formDataToSubmit.append('memberCount', formData.memberCount);
    formDataToSubmit.append('registeredCapital', formData.registeredCapital || '');
    formDataToSubmit.append('businessDescription', formData.businessDescription || '');
    formDataToSubmit.append('industrialGroup', formData.industrialGroup || '');
    formDataToSubmit.append('provincialCouncil', formData.provincialCouncil || '');
    
    // เพิ่มข้อมูลประเภทโรงงาน
    formDataToSubmit.append('factoryType', formData.factoryType || '');
    
    // เพิ่มไฟล์เอกสาร
    if (formData.associationCertificate) {
      formDataToSubmit.append('associationCertificate', formData.associationCertificate);
    }
    
    if (formData.factoryType === 'type1') {
      if (formData.factoryLicense) {
        formDataToSubmit.append('factoryLicense', formData.factoryLicense);
      }
      
      if (formData.industrialEstateLicense) {
        formDataToSubmit.append('industrialEstateLicense', formData.industrialEstateLicense);
      }
    } else if (formData.factoryType === 'type2' && formData.productionImages) {
      // สำหรับรูปภาพหลายรูป
      formData.productionImages.forEach((file, index) => {
        formDataToSubmit.append(`productionImages[${index}]`, file);
      });
    }
    
    // ส่งข้อมูลไปยัง API
    const response = await fetch('/api/am-membership', {
      method: 'POST',
      body: formDataToSubmit
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
    
    return {
      success: true,
      message: result.message || 'ส่งข้อมูลสำเร็จ',
      data: result.data
    };
  } catch (error) {
    console.error('Error submitting AM membership form:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง'
    };
  }
};
