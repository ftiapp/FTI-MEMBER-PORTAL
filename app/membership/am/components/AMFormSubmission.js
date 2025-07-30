// components/AMFormSubmission.js
'use client';

/**
 * ฟังก์ชันสำหรับส่งข้อมูลฟอร์มสมัครสมาชิกสมาคม (แก้ไขแล้ว)
 * @param {Object} formData - ข้อมูลทั้งหมดในฟอร์ม
 * @returns {Promise<Object>} - ผลลัพธ์การส่งข้อมูล
 */
export const submitAMMembershipForm = async (formData) => {
  try {
    console.log('🚀 [AM] Starting form submission...');
    console.log('📋 [AM] Original form data:', formData);
    
    // สร้าง FormData สำหรับส่งไฟล์
    const formDataToSubmit = new FormData();
    
    // เพิ่มข้อมูลพื้นฐานของสมาคม
    formDataToSubmit.append('associationName', formData.associationName || '');
    formDataToSubmit.append('associationNameEng', formData.associationNameEng || '');
    formDataToSubmit.append('associationRegistrationNumber', formData.associationRegistrationNumber || '');
    formDataToSubmit.append('taxId', formData.taxId || '');
    formDataToSubmit.append('associationEmail', formData.associationEmail || '');
    formDataToSubmit.append('associationPhone', formData.associationPhone || '');
    formDataToSubmit.append('website', formData.website || '');
    
    // เพิ่มข้อมูลที่อยู่
    formDataToSubmit.append('addressNumber', formData.addressNumber || '');
    formDataToSubmit.append('moo', formData.moo || '');
    formDataToSubmit.append('soi', formData.soi || '');
    formDataToSubmit.append('road', formData.road || '');
    formDataToSubmit.append('subDistrict', formData.subDistrict || '');
    formDataToSubmit.append('district', formData.district || '');
    formDataToSubmit.append('province', formData.province || '');
    formDataToSubmit.append('postalCode', formData.postalCode || '');
    
    // เพิ่มข้อมูลผู้แทน - แปลงเป็น JSON string
    if (formData.representatives && Array.isArray(formData.representatives)) {
      formDataToSubmit.append('representatives', JSON.stringify(formData.representatives));
    }
    
    // เพิ่มข้อมูลผู้ติดต่อ - แปลงเป็น JSON string
    if (formData.contactPerson) {
      formDataToSubmit.append('contactPerson', JSON.stringify(formData.contactPerson));
    }
    
    // เพิ่มข้อมูลธุรกิจ - แก้ไขการส่ง businessTypes
    if (formData.businessTypes) {
      formDataToSubmit.append('businessTypes', JSON.stringify(formData.businessTypes));
    }
    
    formDataToSubmit.append('otherBusinessTypeDetail', formData.otherBusinessTypeDetail || '');
    
    // เพิ่มข้อมูล products - แก้ไขการส่ง
    if (formData.products && Array.isArray(formData.products)) {
      const validProducts = formData.products.filter(product => 
        product && (product.nameTh?.trim() || product.nameEn?.trim())
      );
      formDataToSubmit.append('products', JSON.stringify(validProducts));
    }
    
    // เพิ่มข้อมูลจำนวน
    formDataToSubmit.append('memberCount', formData.memberCount || '0');
    formDataToSubmit.append('numberOfEmployees', formData.numberOfEmployees || '0');
    formDataToSubmit.append('registeredCapital', formData.registeredCapital || '');
    formDataToSubmit.append('businessDescription', formData.businessDescription || '');
    
    // ✅ แก้ไขการส่งข้อมูลกลุ่มอุตสาหกรรม
    const processIndustrialGroups = () => {
      const industrialData = formData.industrialGroups || formData.industrialGroup || [];
      
      if (Array.isArray(industrialData) && industrialData.length > 0) {
        const industrialGroupIds = industrialData.map(group => {
          if (typeof group === 'object' && group !== null) {
            return group.id || group.value || group.MEMBER_GROUP_CODE || group;
          }
          return group;
        }).filter(id => id !== null && id !== undefined && id !== '');
        
        console.log('✅ [AM] Industrial Groups processed:', industrialGroupIds);
        return industrialGroupIds;
      }
      
      console.log('⚠️ [AM] No industrial groups data found');
      return [];
    };
    
    // ✅ แก้ไขการส่งข้อมูลสภาจังหวัด
    const processProvincialCouncils = () => {
      const provincialData = formData.provincialCouncils || formData.provincialChapters || formData.provincialCouncil || [];
      
      if (Array.isArray(provincialData) && provincialData.length > 0) {
        const provincialChapterIds = provincialData.map(chapter => {
          if (typeof chapter === 'object' && chapter !== null) {
            return chapter.id || chapter.value || chapter.MEMBER_GROUP_CODE || chapter;
          }
          return chapter;
        }).filter(id => id !== null && id !== undefined && id !== '');
        
        console.log('✅ [AM] Provincial Chapters processed:', provincialChapterIds);
        return provincialChapterIds;
      }
      
      console.log('⚠️ [AM] No provincial councils data found');
      return [];
    };
    
    // ประมวลผลและส่งข้อมูล
    const industrialGroupIds = processIndustrialGroups();
    const provincialChapterIds = processProvincialCouncils();
    
    formDataToSubmit.append('industrialGroupIds', JSON.stringify(industrialGroupIds));
    formDataToSubmit.append('provincialChapterIds', JSON.stringify(provincialChapterIds));
    
    // ✅ แก้ไขการส่งไฟล์เอกสารหลัก - ใช้ File object โดยตรง
    console.log('📄 [AM] Processing required documents...');
    
    // ตรวจสอบและส่งไฟล์ associationCertificate
    if (formData.associationCertificate) {
      if (formData.associationCertificate instanceof File) {
        formDataToSubmit.append('associationCertificate', formData.associationCertificate);
        console.log('✅ [AM] Added associationCertificate:', formData.associationCertificate.name);
      } else {
        console.warn('⚠️ [AM] associationCertificate is not a File object:', formData.associationCertificate);
      }
    } else {
      console.warn('⚠️ [AM] No associationCertificate found in formData');
    }
    
    // ตรวจสอบและส่งไฟล์ memberList
    if (formData.memberList) {
      if (formData.memberList instanceof File) {
        formDataToSubmit.append('memberList', formData.memberList);
        console.log('✅ [AM] Added memberList:', formData.memberList.name);
      } else {
        console.warn('⚠️ [AM] memberList is not a File object:', formData.memberList);
      }
    } else {
      console.warn('⚠️ [AM] No memberList found in formData');
    }
    
    // เพิ่มไฟล์ตามประเภทโรงงาน
    if (formData.factoryType === 'type1') {
      if (formData.factoryLicense instanceof File) {
        formDataToSubmit.append('factoryLicense', formData.factoryLicense);
        console.log('✅ [AM] Added factoryLicense:', formData.factoryLicense.name);
      }
      
      if (formData.industrialEstateLicense instanceof File) {
        formDataToSubmit.append('industrialEstateLicense', formData.industrialEstateLicense);
        console.log('✅ [AM] Added industrialEstateLicense:', formData.industrialEstateLicense.name);
      }
    } else if (formData.factoryType === 'type2' && formData.productionImages) {
      // สำหรับรูปภาพหลายรูป
      if (Array.isArray(formData.productionImages)) {
        console.log(`🖼️ [AM] Processing ${formData.productionImages.length} production images`);
        formData.productionImages.forEach((file, index) => {
          if (file instanceof File) {
            formDataToSubmit.append('productionImages', file);
            console.log(`✅ [AM] Added production image ${index + 1}: ${file.name} (${file.size} bytes)`);
          }
        });
      }
    }
    
    // เพิ่มเอกสารเพิ่มเติม
    if (formData.documents && Array.isArray(formData.documents)) {
      console.log(`📎 [AM] Processing ${formData.documents.length} additional documents`);
      formData.documents.forEach((doc, index) => {
        if (doc.file instanceof File) {
          formDataToSubmit.append('documents', doc.file);
          formDataToSubmit.append('documentTypes', doc.type || '');
          console.log(`✅ [AM] Added document ${index + 1}: ${doc.file.name} (${doc.file.size} bytes), type: ${doc.type || 'unspecified'}`);
        }
      });
    }
    
    // เพิ่มประเภทโรงงาน
    formDataToSubmit.append('factoryType', formData.factoryType || '');
    
    // Debug: แสดงข้อมูลที่จะส่ง
    console.log('📦 [AM] FormData contents:');
    for (let [key, value] of formDataToSubmit.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    // ส่งข้อมูลไปยัง API พร้อม retry logic สำหรับ lock wait timeout
    console.log('🌐 [AM] Sending data to API...');
    
    const maxRetries = 3;
    let retryCount = 0;
    
    let result;
    while (retryCount < maxRetries) {
      try {
        const response = await fetch('/api/member/am-membership/submit', {
          method: 'POST',
          body: formDataToSubmit
        });
        
        console.log('📡 [AM] API Response status:', response.status);
        
        result = await response.json();
        console.log('📥 [AM] API Response data:', result);
        
        if (!response.ok) {
          // จัดการ lock wait timeout ด้วย retry
          if (response.status === 429 && result.retryAfter) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // exponential backoff
            console.log(`⏳ [AM] Lock wait timeout, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retryCount++;
            continue;
          }
          
          console.error('❌ [AM] API Error:', result);
          throw new Error(result.error || result.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
        }
        
        if (result.success) {
          console.log('🎉 [AM] Form submission successful!');
          
          // Redirect to documents page after successful submission
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard?tab=documents';
          }
          
          return {
            success: true,
            message: 'ส่งข้อมูลสมัครสมาชิก AM สำเร็จ',
            data: result,
            redirectUrl: '/dashboard?tab=documents'
          };
        }
        
        break; // Success, exit retry loop
      } catch (error) {
        // Network errors or other exceptions
        if (retryCount < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(`⏳ [AM] Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('💥 [AM] Error submitting AM membership form:', error);
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง'
    };
  }
};

// Helper function สำหรับการ validate ข้อมูลก่อนส่ง
export const validateAMFormData = (formData) => {
  const errors = {};

  // ตรวจสอบข้อมูลพื้นฐาน
  if (!formData.associationName?.trim()) {
    errors.associationName = 'กรุณากรอกชื่อสมาคม';
  }

  if (!formData.taxId?.trim()) {
    errors.taxId = 'กรุณากรอกเลขประจำตัวผู้เสียภาษี';
  }

  if (!formData.memberCount || parseInt(formData.memberCount) < 0) {
    errors.memberCount = 'กรุณากรอกจำนวนสมาชิกที่ถูกต้อง';
  }

  // ตรวจสอบที่อยู่
  if (!formData.addressNumber?.trim()) {
    errors.addressNumber = 'กรุณากรอกเลขที่';
  }

  if (!formData.subDistrict?.trim()) {
    errors.subDistrict = 'กรุณาเลือกตำบล/แขวง';
  }

  if (!formData.district?.trim()) {
    errors.district = 'กรุณาเลือกอำเภอ/เขต';
  }

  if (!formData.province?.trim()) {
    errors.province = 'กรุณาเลือกจังหวัด';
  }

  if (!formData.postalCode?.trim()) {
    errors.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
  }

  // ตรวจสอบประเภทธุรกิจ
  if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) {
    errors.businessTypes = 'กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ข้อ';
  }

  // ตรวจสอบผลิตภัณฑ์
  if (!formData.products || !Array.isArray(formData.products) || 
      !formData.products.some(p => p.nameTh?.trim())) {
    errors.products = 'กรุณากรอกข้อมูลผลิตภัณฑ์/บริการอย่างน้อย 1 รายการ';
  }

  // ✅ ตรวจสอบเอกสารที่จำเป็น
  if (!formData.associationCertificate) {
    errors.associationCertificate = 'กรุณาอัปโหลดหนังสือรับรองการจดทะเบียนสมาคมการค้า';
  }

  if (!formData.memberList) {
    errors.memberList = 'กรุณาอัปโหลดรายชื่อสมาชิกสมาคม';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
