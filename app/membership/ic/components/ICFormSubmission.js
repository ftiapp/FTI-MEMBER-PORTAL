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
    
    // กลุ่มอุตสาหกรรม
    if (formData.industryGroups && Array.isArray(formData.industryGroups)) {
      formDataToSubmit.append('industryGroups', JSON.stringify(formData.industryGroups));
      console.log('Industry groups to submit:', formData.industryGroups);
    } else if (formData.industrialGroupId) {
      const industryGroups = Array.isArray(formData.industrialGroupId) 
        ? formData.industrialGroupId 
        : [formData.industrialGroupId];
      formDataToSubmit.append('industryGroups', JSON.stringify(industryGroups));
      console.log('Industry groups (from industrialGroupId):', industryGroups);
    } else {
      formDataToSubmit.append('industryGroups', JSON.stringify([]));
    }
    
    // สภาอุตสาหกรรมจังหวัด
    if (formData.provinceChapters && Array.isArray(formData.provinceChapters)) {
      formDataToSubmit.append('provinceChapters', JSON.stringify(formData.provinceChapters));
      console.log('Province chapters to submit:', formData.provinceChapters);
    } else if (formData.provincialChapterId) {
      const provinceChapters = Array.isArray(formData.provincialChapterId) 
        ? formData.provincialChapterId 
        : [formData.provincialChapterId];
      formDataToSubmit.append('provinceChapters', JSON.stringify(provinceChapters));
      console.log('Province chapters (from provincialChapterId):', provinceChapters);
    } else {
      formDataToSubmit.append('provinceChapters', JSON.stringify([]));
    }
    
    // เอกสารแนบ
    if (formData.idCardFile && formData.idCardFile instanceof File) {
      formDataToSubmit.append('idCardFile', formData.idCardFile);
      console.log('ID card file to upload:', formData.idCardFile.name, formData.idCardFile.size);
    } else if (formData.idCardDocument && formData.idCardDocument instanceof File) {
      formDataToSubmit.append('idCardFile', formData.idCardDocument);
      console.log('ID card document to upload:', formData.idCardDocument.name, formData.idCardDocument.size);
    } else {
      console.log('No ID card file found');
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
    
    console.log('Sending request to /api/ic-membership...');
    
    const response = await fetch('/api/ic-membership', {
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
    console.log('Success response:', result);
    
    return {
      success: true,
      message: result.message || 'ส่งข้อมูลสำเร็จ',
      data: result.data
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