'use client';

// Function to validate Thai ID Card number
export const validateThaiIDCard = (id) => {
  if (id.length !== 13 || !/^\d{13}$/.test(id)) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i)) * (13 - i);
  }
  
  const checkDigit = (11 - (sum % 11)) % 10;
  return parseInt(id.charAt(12)) === checkDigit;
};

// Validate the current step of the IC membership form
export const validateCurrentStep = (step, formData) => {
  let errors = {};

  switch (step) {
    case 1:
      errors = validateApplicantInfo(formData);
      break;
    case 2:
      errors = validateRepresentativeInfo(formData);
      break;
    case 3:
      errors = validateBusinessInfo(formData);
      break;
    case 4:
      errors = validateDocuments(formData);
      break;
    default:
      break;
  }

  return errors;
};

// Validate applicant information
const validateApplicantInfo = (formData) => {
  const errors = {};

  // ID Card validation
  if (!formData.idCardNumber) {
    errors.idCardNumber = 'กรุณากรอกเลขบัตรประชาชน';
  } else if (!/^\d{13}$/.test(formData.idCardNumber)) {
    errors.idCardNumber = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
  } else if (!validateThaiIDCard(formData.idCardNumber)) {
    errors.idCardNumber = 'รูปแบบเลขบัตรประชาชนไม่ถูกต้อง';
  }

  // ตรวจสอบคำนำหน้าชื่อ (prename) ผู้ยื่นสมัคร - รองรับทั้ง snake_case และ camelCase
  const prenameThVal = formData.prename_th ?? formData.prenameTh;
  const prenameEnVal = formData.prename_en ?? formData.prenameEn;
  const prenameOtherVal = formData.prename_other ?? formData.prenameOther;
  const prenameOtherEnVal = formData.prename_other_en ?? formData.prenameOtherEn;

  if (!prenameThVal) {
    errors.prename_th = 'กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)';
  } else if (!/^[\u0E00-\u0E7F\.\s]+$/.test(prenameThVal)) {
    errors.prename_th = 'คำนำหน้าชื่อต้องเป็นภาษาไทยเท่านั้น';
  }

  if (!prenameEnVal) {
    errors.prename_en = 'กรุณาเลือกคำนำหน้าชื่อ (ภาษาอังกฤษ)';
  } else if (!/^[A-Za-z\.\s]+$/.test(prenameEnVal)) {
    errors.prename_en = 'คำนำหน้าชื่อต้องเป็นภาษาอังกฤษเท่านั้น';
  }

  if ((prenameThVal === 'อื่นๆ' || (prenameEnVal && String(prenameEnVal).toLowerCase() === 'other')) && !prenameOtherVal) {
    errors.prename_other = 'กรุณาระบุคำนำหน้าชื่อ (อื่นๆ)';
  }
  if (prenameEnVal && String(prenameEnVal).toLowerCase() === 'other' && !prenameOtherEnVal) {
    errors.prename_other_en = 'Please specify prename (English)';
  }

  // Thai name validation
  if (!formData.firstNameThai) {
    errors.firstNameThai = 'กรุณากรอกชื่อภาษาไทย';
  } else if (!/^[ก-๙\s]+$/.test(formData.firstNameThai)) {
    errors.firstNameThai = 'กรุณากรอกชื่อเป็นภาษาไทยเท่านั้น';
  }

  if (!formData.lastNameThai) {
    errors.lastNameThai = 'กรุณากรอกนามสกุลภาษาไทย';
  } else if (!/^[ก-๙\s]+$/.test(formData.lastNameThai)) {
    errors.lastNameThai = 'กรุณากรอกนามสกุลเป็นภาษาไทยเท่านั้น';
  }

  // English name validation
  if (!formData.firstNameEng) {
    errors.firstNameEng = 'กรุณากรอกชื่อภาษาอังกฤษ';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.firstNameEng)) {
    errors.firstNameEng = 'กรุณากรอกชื่อเป็นภาษาอังกฤษเท่านั้น';
  }

  if (!formData.lastNameEng) {
    errors.lastNameEng = 'กรุณากรอกนามสกุลภาษาอังกฤษ';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.lastNameEng)) {
    errors.lastNameEng = 'กรุณากรอกนามสกุลเป็นภาษาอังกฤษเท่านั้น';
  }

  // Contact information validation
  if (!formData.phone) {
    errors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
  } else if (!/^\d{9,10}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.phone = 'เบอร์โทรศัพท์ไม่ถูกต้อง';
  }
  
  // Phone extension validation: allow non-numeric characters (commas, parentheses, etc.)
  // No strict validation needed; accept any string if provided

  if (!formData.email) {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  // Address validation - รองรับ multi-address
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
        errors[`address_${type}_province`] = `กรุณากรอกจังหวัด (${label})`;
      }

      if (!address.postalCode) {
        errors[`address_${type}_postalCode`] = `กรุณากรอกรหัสไปรษณีย์ (${label})`;
      } else if (!/^\d{5}$/.test(address.postalCode)) {
        errors[`address_${type}_postalCode`] = `รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก (${label})`;
      }

      // ตรวจสอบอีเมล (ไม่บังคับกรอก แต่ถ้ามีต้องเป็นรูปแบบที่ถูกต้อง)
      if (address.email && address.email.trim() !== '') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
          errors[`address_${type}_email`] = `รูปแบบอีเมลไม่ถูกต้อง (${label})`;
        }
      }

      // ตรวจสอบเบอร์โทรศัพท์ (บังคับกรอก)
      if (!address.phone) {
        errors[`address_${type}_phone`] = `กรุณากรอกเบอร์โทรศัพท์ (${label})`;
      } else if (!/^\d{9,10}$/.test(address.phone.replace(/[-\s]/g, ''))) {
        errors[`address_${type}_phone`] = `รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (${label})`;
      }

      // ตรวจสอบเว็บไซต์ถ้ามี
      if (address.website && address.website.trim() !== '') {
        try {
          new URL(address.website);
        } catch (e) {
          errors[`address_${type}_website`] = `รูปแบบเว็บไซต์ไม่ถูกต้อง (${label})`;
        }
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
      errors.province = 'กรุณากรอกจังหวัด';
    }

    if (!formData.postalCode) {
      errors.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      errors.postalCode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
    }
  }

  // Note: moo, soi, street are optional fields - no validation required
  // Note: Industrial group and provincial chapter are not required fields for IC
  
  // Website validation (optional field but must be valid if provided)
  if (formData.website && formData.website.trim() !== '') {
    // Simple URL validation
    try {
      new URL(formData.website);
    } catch (e) {
      errors.website = 'รูปแบบเว็บไซต์ไม่ถูกต้อง กรุณาระบุ URL ที่สมบูรณ์ เช่น https://example.com';
    }
  }
  
  return errors;
};

// Validate representative information
const validateRepresentativeInfo = (formData) => {
  const errors = {};
  const representativeErrors = {};
  // Normalize representative object
  const representative = formData.representative || {};
  // For IC form, representative is required and only one is allowed
  // Instead of returning a single generic error, create field-specific errors
  // so the UI and toast can point to the exact missing field

  // ตรวจสอบคำนำหน้าชื่อ (prename) ผู้แทน - รองรับทั้ง snake_case และ camelCase
  const repPrenameTh = representative.prename_th ?? representative.prenameTh;
  const repPrenameEn = representative.prename_en ?? representative.prenameEn;
  const repPrenameOther = representative.prename_other ?? representative.prenameOther;
  const repPrenameOtherEn = representative.prename_other_en ?? representative.prenameOtherEn;

  if (!repPrenameTh) {
    representativeErrors.prename_th = 'กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)';
  } else if (!/^[\u0E00-\u0E7F\.\s]+$/.test(repPrenameTh)) {
    representativeErrors.prename_th = 'คำนำหน้าชื่อต้องเป็นภาษาไทยเท่านั้น';
  }

  if (!repPrenameEn) {
    representativeErrors.prename_en = 'กรุณาเลือกคำนำหน้าชื่อ (ภาษาอังกฤษ)';
  } else if (!/^[A-Za-z\.\s]+$/.test(repPrenameEn)) {
    representativeErrors.prename_en = 'คำนำหน้าชื่อต้องเป็นภาษาอังกฤษเท่านั้น';
  }

  if ((repPrenameTh === 'อื่นๆ' || (repPrenameEn && String(repPrenameEn).toLowerCase() === 'other')) && !repPrenameOther) {
    representativeErrors.prename_other = 'กรุณาระบุคำนำหน้าชื่อ (อื่นๆ)';
  }
  if (repPrenameEn && String(repPrenameEn).toLowerCase() === 'other' && !repPrenameOtherEn) {
    representativeErrors.prename_other_en = 'Please specify prename (English)';
  }

  // Thai name validation
  if (!representative.firstNameThai) {
    representativeErrors.firstNameThai = 'กรุณากรอกชื่อภาษาไทย';
  } else if (!/^[ก-๙\s]+$/.test(representative.firstNameThai)) {
    representativeErrors.firstNameThai = 'กรุณากรอกชื่อเป็นภาษาไทยเท่านั้น';
  }

  if (!representative.lastNameThai) {
    representativeErrors.lastNameThai = 'กรุณากรอกนามสกุลภาษาไทย';
  } else if (!/^[ก-๙\s]+$/.test(representative.lastNameThai)) {
    representativeErrors.lastNameThai = 'กรุณากรอกนามสกุลเป็นภาษาไทยเท่านั้น';
  }

  // English name validation
  if (!representative.firstNameEng) {
    representativeErrors.firstNameEng = 'กรุณากรอกชื่อภาษาอังกฤษ';
  } else if (!/^[a-zA-Z\s]+$/.test(representative.firstNameEng)) {
    representativeErrors.firstNameEng = 'กรุณากรอกชื่อเป็นภาษาอังกฤษเท่านั้น';
  }

  if (!representative.lastNameEng) {
    representativeErrors.lastNameEng = 'กรุณากรอกนามสกุลภาษาอังกฤษ';
  } else if (!/^[a-zA-Z\s]+$/.test(representative.lastNameEng)) {
    representativeErrors.lastNameEng = 'กรุณากรอกนามสกุลเป็นภาษาอังกฤษเท่านั้น';
  }

  // Contact information validation
  if (!representative.phone) {
    representativeErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
  } else if (!/^\d{9,10}$/.test(representative.phone.replace(/\s/g, ''))) {
    representativeErrors.phone = 'เบอร์โทรศัพท์ไม่ถูกต้อง';
  }
  
  // Phone extension validation: allow non-numeric characters for representative as well
  // No strict validation; accept any string if provided

  if (!representative.email) {
    representativeErrors.email = 'กรุณากรอกอีเมล';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(representative.email)) {
    representativeErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  if (Object.keys(representativeErrors).length > 0) {
    errors.representativeErrors = representativeErrors;
  }

  return errors;
};

// Validate business information
const validateBusinessInfo = (formData) => {
  const errors = {};
  const productErrors = [];

  // Business type validation
  if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) {
    errors.businessTypes = 'กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ประเภท';
  } else if (formData.businessTypes.other && !formData.otherBusinessTypeDetail) {
    errors.otherBusinessTypeDetail = 'กรุณาระบุประเภทธุรกิจอื่นๆ';
  }

  // Product validation
  if (!formData.products || formData.products.length === 0) {
    errors.products = 'กรุณากรอกข้อมูลสินค้า/บริการอย่างน้อย 1 รายการ';
  } else {
    formData.products.forEach((product, index) => {
      const productError = {};
      
      if (!product.nameTh) {
        productError.nameTh = 'กรุณากรอกชื่อสินค้า/บริการภาษาไทย';
      }
      
      // ชื่อสินค้า/บริการภาษาอังกฤษ: ไม่บังคับกรอก (optional)
      
      if (Object.keys(productError).length > 0) {
        productErrors[index] = productError;
      }
    });
  }

  if (productErrors.length > 0) {
    errors.productErrors = productErrors;
  }

  return errors;
};

// Validate document uploads
const validateDocuments = (formData) => {
  const errors = {};

  // For IC form, ID card document and authorized signature are required
  if (!formData.idCardDocument) {
    errors.idCardDocument = 'กรุณาอัพโหลดสำเนาบัตรประชาชน';
  }
  
  if (!formData.authorizedSignature) {
    errors.authorizedSignature = 'กรุณาอัพโหลดรูปลายเซ็นผู้มีอำนาจลงนาม';
  }

  // Authorized signatory name validations (required)
  // Thai names must be Thai letters/spaces
  if (!formData.authorizedSignatoryFirstNameTh || formData.authorizedSignatoryFirstNameTh.trim() === '') {
    errors.authorizedSignatoryFirstNameTh = 'กรุณากรอกชื่อผู้มีอำนาจลงนาม (ภาษาไทย)';
  } else if (!/^[ก-๙\s]+$/.test(formData.authorizedSignatoryFirstNameTh)) {
    errors.authorizedSignatoryFirstNameTh = 'กรุณากรอกชื่อภาษาไทยเท่านั้น';
  }

  if (!formData.authorizedSignatoryLastNameTh || formData.authorizedSignatoryLastNameTh.trim() === '') {
    errors.authorizedSignatoryLastNameTh = 'กรุณากรอกนามสกุลผู้มีอำนาจลงนาม (ภาษาไทย)';
  } else if (!/^[ก-๙\s]+$/.test(formData.authorizedSignatoryLastNameTh)) {
    errors.authorizedSignatoryLastNameTh = 'กรุณากรอกนามสกุลภาษาไทยเท่านั้น';
  }

  // English names must be English letters/spaces
  if (!formData.authorizedSignatoryFirstNameEn || formData.authorizedSignatoryFirstNameEn.trim() === '') {
    errors.authorizedSignatoryFirstNameEn = 'กรุณากรอกชื่อผู้มีอำนาจลงนาม (อังกฤษ)';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.authorizedSignatoryFirstNameEn)) {
    errors.authorizedSignatoryFirstNameEn = 'กรุณากรอกชื่อภาษาอังกฤษเท่านั้น';
  }

  if (!formData.authorizedSignatoryLastNameEn || formData.authorizedSignatoryLastNameEn.trim() === '') {
    errors.authorizedSignatoryLastNameEn = 'กรุณากรอกนามสกุลผู้มีอำนาจลงนาม (อังกฤษ)';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.authorizedSignatoryLastNameEn)) {
    errors.authorizedSignatoryLastNameEn = 'กรุณากรอกนามสกุลภาษาอังกฤษเท่านั้น';
  }

  return errors;
};