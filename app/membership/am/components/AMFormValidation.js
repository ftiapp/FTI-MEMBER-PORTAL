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
    errors.associationName = 'กรุณากรอกชื่อสมาคม';
  }

  // ตรวจสอบเลขประจำตัวผู้เสียภาษีเท่านั้น ไม่ต้องตรวจสอบเลขทะเบียนสมาคม
  if (!formData.taxId) {
    errors.taxId = 'กรุณากรอกเลขประจำตัวผู้เสียภาษี';
  } else if (formData.taxId.length !== 13 || !/^\d+$/.test(formData.taxId)) {
    errors.taxId = 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก';
  }

  // ตรวจสอบอีเมลและเบอร์โทรศัพท์ในฟิลด์ contactPerson
  if (!formData.contactPerson?.email) {
    if (!errors.contactPerson) errors.contactPerson = {};
    errors.contactPerson.email = 'กรุณากรอกอีเมลสมาคม';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactPerson.email)) {
    if (!errors.contactPerson) errors.contactPerson = {};
    errors.contactPerson.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  if (!formData.contactPerson?.phone) {
    if (!errors.contactPerson) errors.contactPerson = {};
    errors.contactPerson.phone = 'กรุณากรอกเบอร์โทรศัพท์สมาคม';
  } else if (!/^\d{9,10}$/.test(formData.contactPerson.phone.replace(/[-\s]/g, ''))) {
    if (!errors.contactPerson) errors.contactPerson = {};
    errors.contactPerson.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
  }

  // ตรวจสอบที่อยู่
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
};

/**
 * ตรวจสอบข้อมูลผู้แทน
 */
const validateRepresentatives = (formData, errors) => {
  const representativeErrors = [];
  let hasMainRepresentative = false;

  if (!formData.representatives || formData.representatives.length === 0) {
    errors.representatives = 'กรุณาเพิ่มข้อมูลผู้แทนอย่างน้อย 1 คน';
    return;
  }

  formData.representatives.forEach((rep, index) => {
    const repError = {};

    // ตรวจสอบชื่อภาษาไทย
    if (!rep.firstNameThai) {
      repError.firstNameThai = 'กรุณากรอกชื่อภาษาไทย';
    } else if (!/^[ก-๙\s]+$/.test(rep.firstNameThai)) {
      repError.firstNameThai = 'ชื่อต้องเป็นภาษาไทยเท่านั้น';
    }

    if (!rep.lastNameThai) {
      repError.lastNameThai = 'กรุณากรอกนามสกุลภาษาไทย';
    } else if (!/^[ก-๙\s]+$/.test(rep.lastNameThai)) {
      repError.lastNameThai = 'นามสกุลต้องเป็นภาษาไทยเท่านั้น';
    }

    // ตรวจสอบชื่อภาษาอังกฤษ
    if (!rep.firstNameEng) {
      repError.firstNameEng = 'กรุณากรอกชื่อภาษาอังกฤษ';
    } else if (!/^[a-zA-Z\s]+$/.test(rep.firstNameEng)) {
      repError.firstNameEng = 'ชื่อต้องเป็นภาษาอังกฤษเท่านั้น';
    }

    if (!rep.lastNameEng) {
      repError.lastNameEng = 'กรุณากรอกนามสกุลภาษาอังกฤษ';
    } else if (!/^[a-zA-Z\s]+$/.test(rep.lastNameEng)) {
      repError.lastNameEng = 'นามสกุลต้องเป็นภาษาอังกฤษเท่านั้น';
    }

    // ตรวจสอบอีเมล
    if (rep.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rep.email)) {
      repError.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    // ตรวจสอบเบอร์โทรศัพท์
    if (rep.phone && !/^\d{9,10}$/.test(rep.phone.replace(/[-\s]/g, ''))) {
      repError.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
    }

    // ตรวจสอบผู้แทนหลัก
    if (rep.isPrimary) {
      hasMainRepresentative = true;
    }

    if (Object.keys(repError).length > 0) {
      representativeErrors[index] = repError;
    }
  });

  if (!hasMainRepresentative) {
    errors.representatives = 'กรุณาระบุผู้แทนหลักอย่างน้อย 1 คน';
  }

  if (representativeErrors.length > 0 && representativeErrors.some(err => err !== undefined)) {
    errors.representativeErrors = representativeErrors;
  }
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
