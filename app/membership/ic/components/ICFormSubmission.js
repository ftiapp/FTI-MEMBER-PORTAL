// ICFormSubmission.js - ไฟล์สำหรับจัดการการส่งข้อมูลสมัครสมาชิก IC

// ฟังก์ชันตรวจสอบเลขบัตรประชาชน
export const checkIdCard = async (idCardNumber) => {
  try {
    // Validate format first
    if (!/^\d{13}$/.test(idCardNumber)) {
      return {
        valid: false,
        message: 'รูปแบบเลขบัตรประชาชนไม่ถูกต้อง',
        isFormatError: true
      };
    }
    
    const response = await fetch('/api/member/ic-membership/check-id-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idCardNumber })
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    return {
      valid: !data.exists,
      message: data.exists ? 'เลขบัตรประชาชนนี้มีการสมัครแล้ว' : '',
      isDuplicate: data.exists
    };
  } catch (error) {
    return {
      valid: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน'
    };
  }
};

// Check if ID card number is unique (alias สำหรับ backward compatibility)
export const checkIdCardUniqueness = checkIdCard;

import { toast } from 'react-hot-toast';

// ✅ Cloudinary upload configuration - ใช้เหมือนกับ OC/AC
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dyq1xftjr/upload';
const UPLOAD_PRESET = 'fti_portal';

// ✅ ฟังก์ชัน upload document แบบเดียวกับ OC/AC
const uploadDocumentToCloudinary = async (file, documentType) => {
  if (!file) return { success: false };

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'FTI_PORTAL_IC_member_DOC');

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) {
      return {
        success: true,
        secure_url: data.secure_url,
        public_id: data.public_id,
        original_filename: data.original_filename,
        format: data.format,
        size: data.bytes
      };
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    console.error(`Error uploading ${documentType}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ฟังก์ชันส่งข้อมูลสมัครสมาชิก IC
export const submitICMembershipForm = async (formData) => {
  console.log('=== DEBUG submitICMembershipForm ===');
  console.log('Form Data received:', formData);
  
  try {
    const formDataToSubmit = new FormData();
    
    // ข้อมูลหลัก
    formDataToSubmit.append('idCardNumber', formData.idCardNumber || '');
    formDataToSubmit.append('firstNameTh', formData.firstNameThai || '');
    formDataToSubmit.append('lastNameTh', formData.lastNameThai || '');
    formDataToSubmit.append('firstNameEn', formData.firstNameEng || '');
    formDataToSubmit.append('lastNameEn', formData.lastNameEng || '');
    formDataToSubmit.append('phone', formData.phone || '');
    formDataToSubmit.append('email', formData.email || '');
    
    // ข้อมูลที่อยู่
    formDataToSubmit.append('addressNumber', formData.addressNumber || '');
    formDataToSubmit.append('moo', formData.moo || '');
    formDataToSubmit.append('soi', formData.soi || '');
    formDataToSubmit.append('road', formData.road || '');
    formDataToSubmit.append('subDistrict', formData.subDistrict || '');
    formDataToSubmit.append('district', formData.district || '');
    formDataToSubmit.append('province', formData.province || '');
    formDataToSubmit.append('postalCode', formData.postalCode || '');
    formDataToSubmit.append('website', formData.website || '');
    
    // ข้อมูลผู้แทน
    formDataToSubmit.append('representativeFirstNameTh', formData.representativeFirstNameTh || '');
    formDataToSubmit.append('representativeLastNameTh', formData.representativeLastNameTh || '');
    formDataToSubmit.append('representativeFirstNameEn', formData.representativeFirstNameEn || '');
    formDataToSubmit.append('representativeLastNameEn', formData.representativeLastNameEn || '');
    formDataToSubmit.append('representativeEmail', formData.representativeEmail || '');
    formDataToSubmit.append('representativePhone', formData.representativePhone || '');
    
    // ประเภทธุรกิจ
    if (formData.businessTypes && Array.isArray(formData.businessTypes)) {
      formDataToSubmit.append('businessTypes', JSON.stringify(formData.businessTypes));
      console.log('Business types to submit:', formData.businessTypes);
    } else {
      formDataToSubmit.append('businessTypes', JSON.stringify([]));
    }
    
    // ประเภทธุรกิจอื่นๆ
    if (formData.otherBusinessTypeDetail) {
      formDataToSubmit.append('businessCategoryOther', formData.otherBusinessTypeDetail);
    }
    
    // สินค้า/บริการ
    if (formData.products && Array.isArray(formData.products)) {
      const validProducts = formData.products.filter(p => p.nameTh && p.nameTh.trim());
      formDataToSubmit.append('products', JSON.stringify(validProducts));
      console.log('Products to submit:', validProducts);
    } else {
      formDataToSubmit.append('products', JSON.stringify([]));
    }
    
    // ✅ FIX: แก้ไขการส่งข้อมูลกลุ่มอุตสาหกรรม
    console.log('=== Processing Industry Groups ===');
    console.log('formData.industryGroups:', formData.industryGroups);
    console.log('formData.industrialGroupId:', formData.industrialGroupId);
    
    let industryGroupsToSend = [];
    
    // ลองหาข้อมูลจาก field ต่างๆ
    if (formData.industryGroups && Array.isArray(formData.industryGroups)) {
      industryGroupsToSend = formData.industryGroups;
    } else if (formData.industrialGroupId) {
      industryGroupsToSend = Array.isArray(formData.industrialGroupId) 
        ? formData.industrialGroupId 
        : [formData.industrialGroupId];
    }
    
    // กรองเฉพาะค่าที่ไม่ใช่ null, undefined, หรือ empty string
    industryGroupsToSend = industryGroupsToSend.filter(id => id && id.toString().trim());
    
    formDataToSubmit.append('industryGroups', JSON.stringify(industryGroupsToSend));
    console.log('Industry groups to submit:', industryGroupsToSend);
    
    // ✅ FIX: แก้ไขการส่งข้อมูลสภาอุตสาหกรรมจังหวัด
    console.log('=== Processing Province Chapters ===');
    console.log('formData.provinceChapters:', formData.provinceChapters);
    console.log('formData.provincialChapterId:', formData.provincialChapterId);
    
    let provinceChaptersToSend = [];
    
    // ลองหาข้อมูลจาก field ต่างๆ
    if (formData.provinceChapters && Array.isArray(formData.provinceChapters)) {
      provinceChaptersToSend = formData.provinceChapters;
    } else if (formData.provincialChapterId) {
      provinceChaptersToSend = Array.isArray(formData.provincialChapterId) 
        ? formData.provincialChapterId 
        : [formData.provincialChapterId];
    }
    
    // กรองเฉพาะค่าที่ไม่ใช่ null, undefined, หรือ empty string
    provinceChaptersToSend = provinceChaptersToSend.filter(id => id && id.toString().trim());
    
    formDataToSubmit.append('provinceChapters', JSON.stringify(provinceChaptersToSend));
    console.log('Province chapters to submit:', provinceChaptersToSend);
    
    // ✅ Phase 3: Send files directly to backend - Remove frontend Cloudinary upload
    // Files are now handled by the backend API route like OC
    console.log('=== Preparing files for backend upload ===');
    
    // Append actual files to FormData for backend processing
    if (formData.idCardDocument && formData.idCardDocument instanceof File) {
      formDataToSubmit.append('idCardDocument', formData.idCardDocument);
    }

    if (formData.companyRegistrationDocument && formData.companyRegistrationDocument instanceof File) {
      formDataToSubmit.append('companyRegistrationDocument', formData.companyRegistrationDocument);
    }

    if (formData.taxRegistrationDocument && formData.taxRegistrationDocument instanceof File) {
      formDataToSubmit.append('taxRegistrationDocument', formData.taxRegistrationDocument);
    }
    
    // Debug: แสดงข้อมูลทั้งหมดที่จะส่ง
    console.log('=== FormData entries ===');
    for (const [key, value] of formDataToSubmit.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    
    console.log('Sending request to /api/member/ic-membership/submit...');
    
    const response = await fetch('/api/member/ic-membership/submit', {
      method: 'POST',
      body: formDataToSubmit
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage = 'เกิดข้อผิดพลาดในการส่งข้อมูล';
      try {
        const errorData = await response.json();
        console.log('Error response data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.log('Could not parse error response as JSON');
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('=== IC Form Submission Complete ===');
    
    // Redirect to documents page after successful submission
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard?tab=documents';
    }
    
    return {
      success: true,
      message: 'ส่งข้อมูลสมัครสมาชิก IC สำเร็จ',
      memberId: result.memberId,
      redirectUrl: '/dashboard?tab=documents'
    };
    
  } catch (error) {
    console.error('Error submitting IC membership form:', error);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล'
    };
  }
};