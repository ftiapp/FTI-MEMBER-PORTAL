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
    
    // ข้อมูลหลัก - แก้ไขชื่อฟิลด์ให้ตรงกับ backend
    formDataToSubmit.append('idCardNumber', formData.idCardNumber || '');
    formDataToSubmit.append('firstNameTh', formData.firstNameThai || '');
    formDataToSubmit.append('lastNameTh', formData.lastNameThai || '');
    formDataToSubmit.append('firstNameEn', formData.firstNameEng || '');
    formDataToSubmit.append('lastNameEn', formData.lastNameEng || '');
    // Applicant prename fields
    formDataToSubmit.append('prenameTh', formData.prenameTh || '');
    formDataToSubmit.append('prenameEn', formData.prenameEn || '');
    formDataToSubmit.append('prenameOther', formData.prenameOther || '');
    // Duplicate in snake_case for compatibility with some backends
    formDataToSubmit.append('prename_th', formData.prenameTh || '');
    formDataToSubmit.append('prename_en', formData.prenameEn || '');
    formDataToSubmit.append('prename_other', formData.prenameOther || '');
    formDataToSubmit.append('phone', formData.phone || '');
    formDataToSubmit.append('phoneExtension', formData.phoneExtension || '');
    formDataToSubmit.append('email', formData.email || '');
    
    // ข้อมูลที่อยู่ - แก้ไขให้รองรับทั้ง road และ street (มาตรฐานคือ street)
    formDataToSubmit.append('addressNumber', formData.addressNumber || '');
    formDataToSubmit.append('moo', formData.moo || '');
    formDataToSubmit.append('soi', formData.soi || '');
    // ใช้ key ใหม่ 'street' เป็นหลัก และแนบ 'road' เผื่อความเข้ากันได้ย้อนหลัง
    const streetValue = formData.street || formData.road || '';
    formDataToSubmit.append('street', streetValue);
    formDataToSubmit.append('road', streetValue);
    formDataToSubmit.append('subDistrict', formData.subDistrict || '');
    formDataToSubmit.append('district', formData.district || '');
    formDataToSubmit.append('province', formData.province || '');
    formDataToSubmit.append('postalCode', formData.postalCode || '');
    formDataToSubmit.append('website', formData.website || '');
    
    // ✅ ส่งข้อมูลที่อยู่แบบหลายประเภท (addresses) หากมี
    // Backend จะอ่าน key 'addresses' (JSON) และบันทึกลงตาราง MemberRegist_IC_Address
    if (formData.addresses && typeof formData.addresses === 'object') {
      try {
        // Normalize: map road -> street if needed per address entry
        const normalizedAddresses = Object.entries(formData.addresses).reduce((acc, [type, addr]) => {
          const a = { ...(addr || {}) };
          if (!a.street && a.road) a.street = a.road;
          return { ...acc, [type]: a };
        }, {});
        const addressesPayload = JSON.stringify(normalizedAddresses);
        formDataToSubmit.append('addresses', addressesPayload);
        console.log('Addresses payload to submit:', addressesPayload);
      } catch (e) {
        console.warn('Could not stringify addresses payload:', e);
      }
    }

    // ข้อมูลผู้แทน
    if (formData.representative) {
      // ถ้ามีข้อมูลในรูปแบบ object
      formDataToSubmit.append('representativeFirstNameTh', formData.representative.firstNameThai || '');
      formDataToSubmit.append('representativeLastNameTh', formData.representative.lastNameThai || '');
      formDataToSubmit.append('representativeFirstNameEn', formData.representative.firstNameEng || '');
      formDataToSubmit.append('representativeLastNameEn', formData.representative.lastNameEng || '');
      formDataToSubmit.append('representativeEmail', formData.representative.email || '');
      formDataToSubmit.append('representativePhone', formData.representative.phone || '');
      formDataToSubmit.append('representativePhoneExtension', formData.representative.phoneExtension || '');
      // ✅ Add prename fields (object form)
      formDataToSubmit.append('representativePrenameTh', formData.representative.prenameTh || '');
      formDataToSubmit.append('representativePrenameEn', formData.representative.prenameEn || '');
      formDataToSubmit.append('representativePrenameOther', formData.representative.prenameOther || '');
      console.log('Representative data from object:', formData.representative);
    } else {
      // รูปแบบเก่า (แบบ flat)
      formDataToSubmit.append('representativeFirstNameTh', formData.representativeFirstNameTh || '');
      formDataToSubmit.append('representativeLastNameTh', formData.representativeLastNameTh || '');
      formDataToSubmit.append('representativeFirstNameEn', formData.representativeFirstNameEn || '');
      formDataToSubmit.append('representativeLastNameEn', formData.representativeLastNameEn || '');
      formDataToSubmit.append('representativeEmail', formData.representativeEmail || '');
      formDataToSubmit.append('representativePhone', formData.representativePhone || '');
      formDataToSubmit.append('representativePhoneExtension', formData.representativePhoneExtension || '');
      // ✅ Add prename fields (flat fallback)
      formDataToSubmit.append('representativePrenameTh', formData.representativePrenameTh || '');
      formDataToSubmit.append('representativePrenameEn', formData.representativePrenameEn || '');
      formDataToSubmit.append('representativePrenameOther', formData.representativePrenameOther || '');
      console.log('Representative data from flat structure');
    }
    
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
    console.log('formData.industrialGroupNames:', formData.industrialGroupNames);
    
    let industryGroupsToSend = [];
    let industryGroupNamesToSend = [];
    
    // ลองหาข้อมูลจาก field ต่างๆ
    if (formData.industryGroups && Array.isArray(formData.industryGroups)) {
      industryGroupsToSend = formData.industryGroups;
    } else if (formData.industrialGroupId) {
      industryGroupsToSend = Array.isArray(formData.industrialGroupId) 
        ? formData.industrialGroupId 
        : [formData.industrialGroupId];
    }
    
    // ✅ FIX: ดึงข้อมูลชื่อกลุ่มอุตสาหกรรมให้ถูกต้อง
    if (formData.industrialGroupNames && Array.isArray(formData.industrialGroupNames)) {
      // ✅ Keep array length aligned with IDs; do not filter out empties
      industryGroupNamesToSend = formData.industrialGroupNames.map(name => (typeof name === 'string' ? name : ''));
    }
    
    // กรองเฉพาะค่าที่ไม่ใช่ null, undefined, หรือ empty string
    industryGroupsToSend = industryGroupsToSend.filter(id => id && id.toString().trim());
    
    // ✅ ตรวจสอบให้แน่ใจว่ามีชื่อส่งไปด้วย
    if (industryGroupsToSend.length > 0 && industryGroupNamesToSend.length === 0) {
      console.warn('⚠️ มี IDs แต่ไม่มี names - อาจจะแสดงเป็น ID ในฐานข้อมูล');
    }
    
    formDataToSubmit.append('industryGroups', JSON.stringify(industryGroupsToSend));
    formDataToSubmit.append('industryGroupNames', JSON.stringify(industryGroupNamesToSend));
    console.log('Industry groups to submit:', industryGroupsToSend);
    console.log('Industry group names to submit:', industryGroupNamesToSend);
    
    // ✅ FIX: แก้ไขการส่งข้อมูลสภาอุตสาหกรรมจังหวัด
    console.log('=== Processing Province Chapters ===');
    console.log('formData.provinceChapters:', formData.provinceChapters);
    console.log('formData.provincialChapterId:', formData.provincialChapterId);
    console.log('formData.provincialChapterNames:', formData.provincialChapterNames);
    console.log('formData.provincialCouncilNames:', formData.provincialCouncilNames);
    
    let provinceChaptersToSend = [];
    let provinceChapterNamesToSend = [];
    
    // ลองหาข้อมูลจาก field ต่างๆ
    if (formData.provinceChapters && Array.isArray(formData.provinceChapters)) {
      provinceChaptersToSend = formData.provinceChapters;
    } else if (formData.provincialChapterId) {
      provinceChaptersToSend = Array.isArray(formData.provincialChapterId) 
        ? formData.provincialChapterId 
        : [formData.provincialChapterId];
    }
    
    // ✅ FIX: ดึงข้อมูลชื่อสภาอุตสาหกรรมจังหวัดให้ถูกต้อง
    if (formData.provincialChapterNames && Array.isArray(formData.provincialChapterNames)) {
      // ✅ Keep array length aligned with IDs; do not filter out empties
      provinceChapterNamesToSend = formData.provincialChapterNames.map(name => (typeof name === 'string' ? name : ''));
    } else if (formData.provincialCouncilNames && Array.isArray(formData.provincialCouncilNames)) {
      // Backward compatibility
      provinceChapterNamesToSend = formData.provincialCouncilNames.map(name => (typeof name === 'string' ? name : ''));
    }
    
    // กรองเฉพาะค่าที่ไม่ใช่ null, undefined, หรือ empty string
    provinceChaptersToSend = provinceChaptersToSend.filter(id => id && id.toString().trim());
    
    // ✅ ตรวจสอบให้แน่ใจว่ามีชื่อส่งไปด้วย
    if (provinceChaptersToSend.length > 0 && provinceChapterNamesToSend.length === 0) {
      console.warn('⚠️ มี Province Chapter IDs แต่ไม่มี names - อาจจะแสดงเป็น ID ในฐานข้อมูล');
    }
    
    formDataToSubmit.append('provinceChapters', JSON.stringify(provinceChaptersToSend));
    formDataToSubmit.append('provinceChapterNames', JSON.stringify(provinceChapterNamesToSend));
    console.log('Province chapters to submit:', provinceChaptersToSend);
    console.log('Province chapter names to submit:', provinceChapterNamesToSend);
    
    // ✅ Phase 3: Send files directly to backend - Remove frontend Cloudinary upload
    // Files are now handled by the backend API route like OC
    console.log('=== Preparing files for backend upload ===');

    // ✅ Authorized signatory name fields
    if (typeof formData.authorizedSignatoryFirstNameTh === 'string') {
      formDataToSubmit.append('authorizedSignatoryFirstNameTh', formData.authorizedSignatoryFirstNameTh);
    }
    if (typeof formData.authorizedSignatoryLastNameTh === 'string') {
      formDataToSubmit.append('authorizedSignatoryLastNameTh', formData.authorizedSignatoryLastNameTh);
    }
    if (typeof formData.authorizedSignatoryFirstNameEn === 'string') {
      formDataToSubmit.append('authorizedSignatoryFirstNameEn', formData.authorizedSignatoryFirstNameEn);
    }
    if (typeof formData.authorizedSignatoryLastNameEn === 'string') {
      formDataToSubmit.append('authorizedSignatoryLastNameEn', formData.authorizedSignatoryLastNameEn);
    }

    // Append actual files to FormData for backend processing
    if (formData.idCardDocument && formData.idCardDocument instanceof File) {
      formDataToSubmit.append('idCardDocument', formData.idCardDocument);
    }

    // ✅ NEW: Authorized signature file
    if (formData.authorizedSignature && formData.authorizedSignature instanceof File) {
      formDataToSubmit.append('authorizedSignature', formData.authorizedSignature);
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
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
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
    
    // Create notification
    try {
      const memberData = {
        idCard: formData.idCardNumber,
        applicantName: `${formData.firstNameThai || formData.firstNameTh || ''} ${formData.lastNameThai || formData.lastNameTh || ''}`.trim(),
        companyNameTh: `${formData.firstNameThai || formData.firstNameTh || ''} ${formData.lastNameThai || formData.lastNameTh || ''}`.trim(),
        companyNameEn: `${formData.firstNameEng || formData.firstNameEn || ''} ${formData.lastNameEng || formData.lastNameEn || ''}`.trim()
      };

      await fetch('/api/notifications/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipType: 'ic',
          memberData,
          memberId: result.memberId
        })
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the submission if notification fails
    }
    
    return {
      success: true,
      message: 'ส่งข้อมูลสมัครสมาชิก IC สำเร็จ',
      memberId: result.memberId,
      memberData: {
        idCard: formData.idCardNumber,
        applicantName: `${formData.firstNameThai || formData.firstNameTh || ''} ${formData.lastNameThai || formData.lastNameTh || ''}`.trim(),
        companyNameTh: `${formData.firstNameThai || formData.firstNameTh || ''} ${formData.lastNameThai || formData.lastNameTh || ''}`.trim(),
        companyNameEn: `${formData.firstNameEng || formData.firstNameEn || ''} ${formData.lastNameEng || formData.lastNameEn || ''}`.trim()
      },
      redirectUrl: '/dashboard?tab=documents'
    };
    
  } catch (error) {
    console.error('Error submitting IC membership form:', error);
    console.error('Error stack:', error && error.stack ? error.stack : 'n/a');
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล'
    };
  }
};