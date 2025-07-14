'use client';

/**
 * ฟังก์ชันสำหรับตรวจสอบความถูกต้องของเลขประจำตัวผู้เสียภาษีกับ API
 * @param {string} taxId เลขประจำตัวผู้เสียภาษี
 * @returns {Promise<{valid: boolean, message: string}>} ผลการตรวจสอบ
 */
export const validateTaxId = async (taxId) => {
  if (!taxId || taxId.length !== 13) {
    return { valid: false, message: 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก' };
  }
  
  try {
    const response = await fetch('/api/member/oc-membership/check-tax-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taxId })
    });
    
    const data = await response.json();
    console.log('Tax ID validation response:', data);
    
    return {
      valid: data.valid === true,
      message: data.message || 'ไม่สามารถตรวจสอบเลขประจำตัวผู้เสียภาษีได้'
    };
  } catch (error) {
    console.error('Error validating tax ID:', error);
    return { valid: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี' };
  }
};

/**
 * ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูลในฟอร์มสมัครสมาชิกประเภท OC
 * @param {Object} formData ข้อมูลฟอร์มทั้งหมด
 * @param {number} step ขั้นตอนปัจจุบันที่ต้องการตรวจสอบ
 * @returns {Object} ข้อความแสดงข้อผิดพลาด (ถ้ามี)
 */
export const validateOCForm = (formData, step) => {
  const errors = {};
  
  if (step === 1) {
    // ตรวจสอบข้อมูลบริษัท
    if (!formData.companyName) errors.companyName = 'กรุณากรอกชื่อบริษัท';
    if (!formData.companyNameEng) {
      errors.companyNameEng = 'กรุณากรอกชื่อบริษัทภาษาอังกฤษ';
    } else if (!/^[A-Za-z0-9\s.,&()\-'"]+$/.test(formData.companyNameEng)) {
      errors.companyNameEng = 'ชื่อบริษัทภาษาอังกฤษต้องเป็นภาษาอังกฤษเท่านั้น';
    }
    
    if (!formData.taxId) {
      errors.taxId = 'กรุณากรอกเลขประจำตัวผู้เสียภาษี';
    } else if (formData.taxId.length !== 13) {
      errors.taxId = 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก';
    } else if (!/^\d+$/.test(formData.taxId)) {
      errors.taxId = 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลขเท่านั้น';
    }
    
    if (!formData.companyEmail) {
      errors.companyEmail = 'กรุณากรอกอีเมลบริษัท';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      errors.companyEmail = 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    
    if (!formData.companyPhone) errors.companyPhone = 'กรุณากรอกเบอร์โทรศัพท์บริษัท';
    
    // ตรวจสอบที่อยู่
    if (!formData.addressNumber) errors.addressNumber = 'กรุณากรอกเลขที่';
    if (!formData.subDistrict) errors.subDistrict = 'กรุณากรอกตำบล/แขวง';
    if (!formData.district) errors.district = 'กรุณากรอกอำเภอ/เขต';
    if (!formData.province) errors.province = 'กรุณากรอกจังหวัด';
    if (!formData.postalCode) {
      errors.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
    } else if (formData.postalCode.length !== 5 || !/^\d+$/.test(formData.postalCode)) {
      errors.postalCode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
    }
    
    // ตรวจสอบข้อมูลผู้ให้ข้อมูล (Contact Person)
    if (!formData.contactPersonFirstName) {
      errors.contactPersonFirstName = 'กรุณากรอกชื่อ (ภาษาไทย)';
    } else if (!/^[\u0E00-\u0E7F\s]+$/.test(formData.contactPersonFirstName)) {
      errors.contactPersonFirstName = 'ชื่อผู้ให้ข้อมูลต้องเป็นภาษาไทยเท่านั้น';
    }

    if (!formData.contactPersonLastName) {
      errors.contactPersonLastName = 'กรุณากรอกนามสกุล (ภาษาไทย)';
    } else if (!/^[\u0E00-\u0E7F\s]+$/.test(formData.contactPersonLastName)) {
      errors.contactPersonLastName = 'นามสกุลผู้ให้ข้อมูลต้องเป็นภาษาไทยเท่านั้น';
    }

    if (!formData.contactPersonFirstNameEng) {
      errors.contactPersonFirstNameEng = 'กรุณากรอกชื่อ (ภาษาอังกฤษ)';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.contactPersonFirstNameEng)) {
      errors.contactPersonFirstNameEng = 'ชื่อผู้ให้ข้อมูลต้องเป็นภาษาอังกฤษเท่านั้น';
    }

    if (!formData.contactPersonLastNameEng) {
      errors.contactPersonLastNameEng = 'กรุณากรอกนามสกุล (ภาษาอังกฤษ)';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.contactPersonLastNameEng)) {
      errors.contactPersonLastNameEng = 'นามสกุลผู้ให้ข้อมูลต้องเป็นภาษาอังกฤษเท่านั้น';
    }

    if (!formData.contactPersonPosition) {
      errors.contactPersonPosition = 'กรุณากรอกตำแหน่ง';
    }

    if (!formData.contactPersonEmail) {
      errors.contactPersonEmail = 'กรุณากรอกอีเมลผู้ให้ข้อมูล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactPersonEmail)) {
      errors.contactPersonEmail = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.contactPersonPhone) {
      errors.contactPersonPhone = 'กรุณากรอกเบอร์โทรศัพท์ผู้ให้ข้อมูล';
    }
  }
  
  else if (step === 2) {
    // ตรวจสอบข้อมูลผู้แทน
    if (!formData.representatives || formData.representatives.length === 0) {
      errors.representatives = 'กรุณาเพิ่มข้อมูลผู้แทนอย่างน้อย 1 คน';
    } else {
      // ตรวจสอบข้อมูลผู้แทนแต่ละคน
      const representativeErrors = [];
      
      formData.representatives.forEach((rep, index) => {
        const repError = {};
        
        // ตรวจสอบชื่อภาษาไทย
        if (!rep.firstNameThai) {
          repError.firstNameThai = 'กรุณากรอกชื่อภาษาไทย';
        } else if (!/^[\u0E00-\u0E7F\s]+$/.test(rep.firstNameThai)) {
          repError.firstNameThai = 'กรุณากรอกชื่อเป็นภาษาไทยเท่านั้น';
        }
        
        // ตรวจสอบนามสกุลภาษาไทย
        if (!rep.lastNameThai) {
          repError.lastNameThai = 'กรุณากรอกนามสกุลภาษาไทย';
        } else if (!/^[\u0E00-\u0E7F\s]+$/.test(rep.lastNameThai)) {
          repError.lastNameThai = 'กรุณากรอกนามสกุลเป็นภาษาไทยเท่านั้น';
        }
        
        // ตรวจสอบชื่อภาษาอังกฤษ
        if (!rep.firstNameEnglish) {
          repError.firstNameEnglish = 'กรุณากรอกชื่อภาษาอังกฤษ';
        } else if (!/^[a-zA-Z\s]+$/.test(rep.firstNameEnglish)) {
          repError.firstNameEnglish = 'กรุณากรอกชื่อเป็นภาษาอังกฤษเท่านั้น';
        }
        
        // ตรวจสอบนามสกุลภาษาอังกฤษ
        if (!rep.lastNameEnglish) {
          repError.lastNameEnglish = 'กรุณากรอกนามสกุลภาษาอังกฤษ';
        } else if (!/^[a-zA-Z\s]+$/.test(rep.lastNameEnglish)) {
          repError.lastNameEnglish = 'กรุณากรอกนามสกุลเป็นภาษาอังกฤษเท่านั้น';
        }
        
        // ตรวจสอบอีเมล
        if (!rep.email) {
          repError.email = 'กรุณากรอกอีเมล';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rep.email)) {
          repError.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        
        // ตรวจสอบเบอร์โทรศัพท์
        if (!rep.phone) {
          repError.phone = 'กรุณากรอกเบอร์โทรศัพท์';
        }
        
        // เพิ่มข้อผิดพลาดของผู้แทนคนนี้เข้าไปใน array
        if (Object.keys(repError).length > 0) {
          representativeErrors[index] = repError;
        }
      });
      
      // ถ้ามีข้อผิดพลาดในผู้แทนคนใดคนหนึ่ง
      if (representativeErrors.length > 0) {
        errors.representativeErrors = representativeErrors;
      }
    }
  }
  
  else if (step === 3) {
    // ตรวจสอบข้อมูลธุรกิจ
    if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) {
      errors.businessTypes = 'กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ข้อ';
    }
    
    // ถ้าเลือก "อื่นๆ" ต้องกรอกรายละเอียด
    if (formData.businessTypes?.other && !formData.otherBusinessTypeDetail) {
      errors.otherBusinessTypeDetail = 'กรุณาระบุรายละเอียดประเภทธุรกิจอื่นๆ';
    }
    
    // ตรวจสอบจำนวนพนักงานและข้อมูลทางการเงิน
    if (!formData.numberOfEmployees) errors.numberOfEmployees = 'กรุณากรอกจำนวนพนักงาน';
    
    // ตรวจสอบผลิตภัณฑ์/บริการ
    if (!formData.products || formData.products.length === 0) {
      errors.products = 'กรุณาระบุผลิตภัณฑ์/บริการอย่างน้อย 1 รายการ';
    } else {
      // ตรวจสอบข้อมูลผลิตภัณฑ์/บริการแต่ละรายการ
      const productErrors = [];
      
      formData.products.forEach((product, index) => {
        const prodError = {};
        
        // ตรวจสอบชื่อผลิตภัณฑ์/บริการภาษาไทย
        if (!product.nameTh) {
          prodError.nameTh = 'กรุณากรอกชื่อผลิตภัณฑ์/บริการภาษาไทย';
        }
        
        // ตรวจสอบชื่อผลิตภัณฑ์/บริการภาษาอังกฤษ
        if (!product.nameEn) {
          prodError.nameEn = 'กรุณากรอกชื่อผลิตภัณฑ์/บริการภาษาอังกฤษ';
        }
        
        // เพิ่มข้อผิดพลาดของผลิตภัณฑ์/บริการรายการนี้เข้าไปใน array
        if (Object.keys(prodError).length > 0) {
          productErrors[index] = prodError;
        }
      });
      
      // ถ้ามีข้อผิดพลาดในผลิตภัณฑ์/บริการรายการใดรายการหนึ่ง
      if (productErrors.length > 0) {
        errors.products = 'กรุณากรอกข้อมูลผลิตภัณฑ์/บริการให้ครบถ้วน';
        errors.productErrors = productErrors; // เก็บรายละเอียดข้อผิดพลาดไว้ในตัวแปรแยก
      }
    }
  }
  
  else if (step === 4) {
    // ตรวจสอบประเภทโรงงานที่เลือก
    if (!formData.factoryType) {
      errors.factoryType = 'กรุณาเลือกประเภทโรงงาน';
    } else {
      // ตรวจสอบเอกสารตามประเภทโรงงาน
      if (formData.factoryType === 'type1') {
        // ประเภทที่ 1: ต้องมีใบอนุญาตประกอบกิจการโรงงาน (รง.4) หรือ ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (กนอ.)
        if (!formData.factoryLicense && !formData.industrialEstateLicense) {
          errors.factoryLicense = 'กรุณาอัพโหลดใบอนุญาตประกอบกิจการโรงงาน (รง.4) หรือ ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (กนอ.)';
          errors.industrialEstateLicense = 'กรุณาอัพโหลดใบอนุญาตประกอบกิจการโรงงาน (รง.4) หรือ ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (กนอ.)';
        }
      } else if (formData.factoryType === 'type2') {
        // ประเภทที่ 2: ต้องมีรูปถ่ายเครื่องจักร อุปกรณ์ กระบวนการผลิต และสถานที่ผลิต
        if (!formData.productionImages || formData.productionImages.length === 0) {
          errors.productionImages = 'กรุณาอัพโหลดรูปถ่ายเครื่องจักร อุปกรณ์ กระบวนการผลิต หรือสถานที่ผลิต';
        }
      }
    }
  }
  
  return errors;
};
