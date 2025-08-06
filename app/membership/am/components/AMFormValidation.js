// components/AMFormValidation.js
'use client';

/**
 * ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูลในฟอร์มสมัครสมาชิกสมาคม
 * @param {Object} formData - ข้อมูลทั้งหมดในฟอร์ม
 * @param {Number} step - ขั้นตอนปัจจุบันที่ต้องการตรวจสอบ
 * @returns {Object} - ข้อผิดพลาดที่พบ (ถ้ามี)
 */
export const validateAMForm = (formData, step) => {
  const errors = {};

  // ตรวจสอบตามขั้นตอน
  switch (step) {
    case 1: // ข้อมูลสมาคม
      validateAssociationInfo(formData, errors);
      break;
    case 2: // ข้อมูลผู้แทน
      validateRepresentatives(formData, errors);
      break;
    case 3: // ข้อมูลธุรกิจ
      validateBusinessInfo(formData, errors);
      break;
    case 4: // เอกสาร
      validateDocuments(formData, errors);
      break;
    case 5: // สรุป - ตรวจสอบทั้งหมดอีกครั้ง
      validateAssociationInfo(formData, errors);
      validateRepresentatives(formData, errors);
      validateBusinessInfo(formData, errors);
      validateDocuments(formData, errors);
      break;
    default:
      break;
  }

  return errors;
};

/**
 * ตรวจสอบข้อมูลสมาคม
 */
const validateAssociationInfo = (formData, errors) => {
  if (!formData.associationName) {
    errors.associationName = 'กรุณากรอกชื่อสมาคมภาษาไทย';
  }
  
  if (!formData.associationNameEng) {
    errors.associationNameEng = 'กรุณากรอกชื่อสมาคมภาษาอังกฤษ';
  } else if (!/^[A-Za-z0-9\s.,&()-]+$/.test(formData.associationNameEng)) {
    errors.associationNameEng = 'ชื่อสมาคมภาษาอังกฤษต้องเป็นภาษาอังกฤษเท่านั้น';
  }

  // ตรวจสอบเลขประจำตัวผู้เสียภาษีเท่านั้น ไม่ต้องตรวจสอบเลขทะเบียนสมาคม
  if (!formData.taxId) {
    errors.taxId = 'กรุณากรอกเลขประจำตัวผู้เสียภาษี';
  } else if (formData.taxId.length !== 13 || !/^\d+$/.test(formData.taxId)) {
    errors.taxId = 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก';
  }

  // ตรวจสอบข้อมูลผู้ติดต่อ (Contact Persons) - ระบบใหม่
  if (!formData.contactPersons || formData.contactPersons.length === 0) {
    errors.contactPersons = 'กรุณาเพิ่มข้อมูลผู้ประสานงานหลัก';
  } else {
    // ตรวจสอบผู้ประสานงานหลัก (คนแรก)
    const mainContact = formData.contactPersons[0];
    if (mainContact) {
      // ตรวจสอบชื่อภาษาไทย
      if (!mainContact.firstNameTh) {
        errors.contactPerson0FirstNameTh = 'กรุณากรอกชื่อ (ภาษาไทย)';
      } else if (!/^[ก-๙\s]+$/.test(mainContact.firstNameTh)) {
        errors.contactPerson0FirstNameTh = 'ชื่อผู้ประสานงานต้องเป็นภาษาไทยเท่านั้น';
      }

      if (!mainContact.lastNameTh) {
        errors.contactPerson0LastNameTh = 'กรุณากรอกนามสกุล (ภาษาไทย)';
      } else if (!/^[ก-๙\s]+$/.test(mainContact.lastNameTh)) {
        errors.contactPerson0LastNameTh = 'นามสกุลผู้ประสานงานต้องเป็นภาษาไทยเท่านั้น';
      }

      // ตรวจสอบชื่อภาษาอังกฤษ - บังคับกรอก
      if (!mainContact.firstNameEn) {
        errors.contactPerson0FirstNameEn = 'กรุณากรอกชื่อ (ภาษาอังกฤษ)';
      } else if (!/^[a-zA-Z\s]+$/.test(mainContact.firstNameEn)) {
        errors.contactPerson0FirstNameEn = 'ชื่อผู้ประสานงานต้องเป็นภาษาอังกฤษเท่านั้น';
      }

      if (!mainContact.lastNameEn) {
        errors.contactPerson0LastNameEn = 'กรุณากรอกนามสกุล (ภาษาอังกฤษ)';
      } else if (!/^[a-zA-Z\s]+$/.test(mainContact.lastNameEn)) {
        errors.contactPerson0LastNameEn = 'นามสกุลผู้ประสานงานต้องเป็นภาษาอังกฤษเท่านั้น';
      }

      // ตรวจสอบข้อมูลอื่นๆ
      if (!mainContact.position) {
        errors.contactPerson0Position = 'กรุณากรอกตำแหน่ง';
      }

      if (!mainContact.email) {
        errors.contactPerson0Email = 'กรุณากรอกอีเมลผู้ประสานงาน';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mainContact.email)) {
        errors.contactPerson0Email = 'รูปแบบอีเมลไม่ถูกต้อง';
      }

      if (!mainContact.phone) {
        errors.contactPerson0Phone = 'กรุณากรอกเบอร์โทรศัพท์ผู้ประสานงาน';
      } else if (!/^\d{9,10}$/.test(mainContact.phone.replace(/[-\s]/g, ''))) {
        errors.contactPerson0Phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
      }

      // ตรวจสอบประเภทผู้ติดต่อ
      if (!mainContact.typeContactId) {
        errors.contactPerson0TypeContactId = 'กรุณาเลือกประเภทผู้ติดต่อ';
      }

      // ตรวจสอบรายละเอียดเพิ่มเติมสำหรับประเภท "อื่นๆ"
      if (mainContact.typeContactId && mainContact.typeContactOtherDetail === undefined && 
          mainContact.typeContactName === 'อื่นๆ') {
        if (!mainContact.typeContactOtherDetail) {
          errors.contactPerson0TypeContactOtherDetail = 'กรุณาระบุรายละเอียดประเภทผู้ติดต่อ';
        }
      }
    }
  }

  // ตรวจสอบที่อยู่ - รองรับ multi-address
  const addressTypes = ['1', '2', '3'];
  const addressLabels = {
    '1': 'ที่อยู่สำนักงาน',
    '2': 'ที่อยู่จัดส่งเอกสาร', 
    '3': 'ที่อยู่ใบกำกับภาษี'
  };

  // ตรวจสอบว่ามี addresses object หรือไม่
  if (formData.addresses && typeof formData.addresses === 'object') {
    // ตรวจสอบ multi-address format
    addressTypes.forEach(type => {
      const address = formData.addresses[type];
      const label = addressLabels[type];
      
      if (!address) {
        errors[`address_${type}`] = `กรุณากรอก${label}`;
        return;
      }

      if (!address.addressNumber) {
        errors[`address_${type}_addressNumber`] = `กรุณากรอกบ้านเลขที่ (${label})`;
      }

      if (!address.subDistrict) {
        errors[`address_${type}_subDistrict`] = `กรุณากรอกตำบล/แขวง (${label})`;
      }

      if (!address.district) {
        errors[`address_${type}_district`] = `กรุณากรอกอำเภอ/เขต (${label})`;
      }

      if (!address.province) {
        errors[`address_${type}_province`] = `กรุณาเลือกจังหวัด (${label})`;
      }

      if (!address.postalCode) {
        errors[`address_${type}_postalCode`] = `กรุณากรอกรหัสไปรษณีย์ (${label})`;
      } else if (!/^\d{5}$/.test(address.postalCode)) {
        errors[`address_${type}_postalCode`] = `รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก (${label})`;
      }

      // ตรวจสอบอีเมลถ้ามี
      if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
        errors[`address_${type}_email`] = `รูปแบบอีเมลไม่ถูกต้อง (${label})`;
      }

      // ตรวจสอบเบอร์โทรศัพท์ถ้ามี
      if (address.phone && !/^\d{9,10}$/.test(address.phone.replace(/[-\s]/g, ''))) {
        errors[`address_${type}_phone`] = `รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (${label})`;
      }
    });
  } else {
    // Fallback สำหรับ single address format เก่า
    if (!formData.addressNumber) {
      errors.addressNumber = 'กรุณากรอกบ้านเลขที่';
    }

    if (!formData.subDistrict) {
      errors.subDistrict = 'กรุณากรอกตำบล/แขวง';
    }

    if (!formData.district) {
      errors.district = 'กรุณากรอกอำเภอ/เขต';
    }

    if (!formData.province) {
      errors.province = 'กรุณาเลือกจังหวัด';
    }

    if (!formData.postalCode) {
      errors.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      errors.postalCode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
    }
  }
};

/**
 * ตรวจสอบข้อมูลผู้แทน
 */
const validateRepresentatives = (formData, errors) => {
  const representativeErrors = [];
  
  if (!formData.representatives || formData.representatives.length === 0) {
    errors.representatives = 'กรุณาเพิ่มข้อมูลผู้แทนอย่างน้อย 1 คน';
    return;
  }

  formData.representatives.forEach((rep, index) => {
    const repError = {};

    // ตรวจสอบฟิลด์ที่จำเป็น
    if (!rep.firstNameTh) repError.firstNameTh = 'กรุณากรอกชื่อภาษาไทย';
    if (!rep.lastNameTh) repError.lastNameTh = 'กรุณากรอกนามสกุลภาษาไทย';
    if (!rep.firstNameEn) repError.firstNameEn = 'กรุณากรอกชื่อภาษาอังกฤษ';
    if (!rep.lastNameEn) repError.lastNameEn = 'กรุณากรอกนามสกุลภาษาอังกฤษ';
    if (!rep.email) repError.email = 'กรุณากรอกอีเมล';
    if (!rep.phone) repError.phone = 'กรุณากรอกเบอร์โทรศัพท์';

    if (Object.keys(repError).length > 0) {
      representativeErrors[index] = repError;
    }
  });

  if (representativeErrors.length > 0) {
    errors.representativeErrors = representativeErrors;
  }
  
  return;
};

/**
 * ตรวจสอบข้อมูลธุรกิจ
 */
const validateBusinessInfo = (formData, errors) => {
  // ตรวจสอบประเภทธุรกิจ
  if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) {
    errors.businessTypes = 'กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ประเภท';
  } else if (formData.businessTypes.other && !formData.otherBusinessTypeDetail) {
    errors.otherBusinessTypeDetail = 'กรุณาระบุรายละเอียดประเภทธุรกิจอื่นๆ';
  }

  // ตรวจสอบจำนวนสมาชิก
  if (!formData.memberCount) {
    errors.memberCount = 'กรุณากรอกจำนวนสมาชิก';
  } else if (isNaN(formData.memberCount) || parseInt(formData.memberCount) <= 0) {
    errors.memberCount = 'จำนวนสมาชิกต้องเป็นตัวเลขมากกว่า 0';
  }

  // ตรวจสอบทุนจดทะเบียน
  if (formData.registeredCapital && (isNaN(formData.registeredCapital) || parseFloat(formData.registeredCapital) < 0)) {
    errors.registeredCapital = 'ทุนจดทะเบียนต้องเป็นตัวเลขและมีค่ามากกว่าหรือเท่ากับ 0';
  }

  // กลุ่มอุตสาหกรรมเป็นฟิลด์ทางเลือก ไม่ต้องตรวจสอบ
};

/**
 * ตรวจสอบเอกสาร
 */
const validateDocuments = (formData, errors) => {
  // ตรวจสอบสำเนาหนังสือรับรองการจดทะเบียนเป็นสมาคมการค้า
  if (!formData.associationCertificate) {
    errors.associationCertificate = 'กรุณาแนบสำเนาหนังสือรับรองการจดทะเบียนเป็นสมาคมการค้า';
  }

  // ตรวจสอบรายชื่อสมาชิกสมาคม
  if (!formData.memberList) {
    errors.memberList = 'กรุณาแนบรายชื่อสมาชิกสมาคม';
  }
};
