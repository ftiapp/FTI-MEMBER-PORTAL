'use client';

// Function to validate Thai ID Card number
const validateThaiIDCard = (id) => {
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
    errors.idCardNumber = 'เลขบัตรประชาชนไม่ถูกต้อง';
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

  if (!formData.email) {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  // Address validation - required fields only
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
  const representative = formData.representative;

  // For IC form, representative is required and only one is allowed
  if (!representative || Object.keys(representative).length === 0) {
    errors.representative = 'กรุณากรอกข้อมูลผู้แทน';
    return errors;
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
      
      if (!product.nameEn) {
        productError.nameEn = 'กรุณากรอกชื่อสินค้า/บริการภาษาอังกฤษ';
      }
      
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

  // For IC form, only ID card document is required
  if (!formData.idCardDocument) {
    errors.idCardDocument = 'กรุณาอัพโหลดสำเนาบัตรประชาชน';
  }

  return errors;
};