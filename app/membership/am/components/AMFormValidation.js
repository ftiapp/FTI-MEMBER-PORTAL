// components/AMFormValidation.js
"use client";

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
    errors.associationName = "กรุณากรอกชื่อสมาคมภาษาไทย";
  }

  if (!formData.associationNameEng) {
    errors.associationNameEng = "กรุณากรอกชื่อสมาคมภาษาอังกฤษ";
  } else if (!/^[A-Za-z0-9\s.,&()-]+$/.test(formData.associationNameEng)) {
    errors.associationNameEng = "ชื่อสมาคมภาษาอังกฤษต้องเป็นภาษาอังกฤษเท่านั้น";
  }

  // ตรวจสอบเลขประจำตัวผู้เสียภาษีเท่านั้น ไม่ต้องตรวจสอบเลขทะเบียนสมาคม
  if (!formData.taxId) {
    errors.taxId = "กรุณากรอกเลขประจำตัวผู้เสียภาษี";
  } else if (formData.taxId.length !== 13 || !/^\d+$/.test(formData.taxId)) {
    errors.taxId = "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก";
  }

  // ตรวจสอบข้อมูลผู้ติดต่อ (Contact Persons) - ระบบใหม่
  if (!formData.contactPersons || formData.contactPersons.length === 0) {
    errors.contactPersons = "กรุณาเพิ่มข้อมูลผู้ประสานงานหลัก";
  } else {
    // ตรวจสอบผู้ประสานงานหลัก (คนแรก)
    const mainContact = formData.contactPersons[0];
    if (mainContact) {
      // ตรวจสอบชื่อภาษาไทย
      if (!mainContact.firstNameTh) {
        errors.contactPerson0FirstNameTh = "กรุณากรอกชื่อ (ภาษาไทย)";
      } else if (!/^[ก-๙\s]+$/.test(mainContact.firstNameTh)) {
        errors.contactPerson0FirstNameTh = "ชื่อผู้ประสานงานต้องเป็นภาษาไทยเท่านั้น";
      }

      if (!mainContact.lastNameTh) {
        errors.contactPerson0LastNameTh = "กรุณากรอกนามสกุล (ภาษาไทย)";
      } else if (!/^[ก-๙\s]+$/.test(mainContact.lastNameTh)) {
        errors.contactPerson0LastNameTh = "นามสกุลผู้ประสานงานต้องเป็นภาษาไทยเท่านั้น";
      }

      // ตรวจสอบคำนำหน้าชื่อ (prename) - ใช้คีย์ camelCase ให้ตรงกับ ContactPersonSection
      if (!mainContact.prenameTh) {
        errors.contactPerson0PrenameTh = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)";
      } else if (!/^[\u0E00-\u0E7F\.\s]+$/.test(mainContact.prenameTh)) {
        errors.contactPerson0PrenameTh = "คำนำหน้าชื่อต้องเป็นภาษาไทยเท่านั้น";
      }

      if (!mainContact.prenameEn) {
        errors.contactPerson0PrenameEn = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาอังกฤษ)";
      } else if (!/^[A-Za-z\.\s]+$/.test(mainContact.prenameEn)) {
        errors.contactPerson0PrenameEn = "คำนำหน้าชื่อต้องเป็นภาษาอังกฤษเท่านั้น";
      }

      if (
        (mainContact.prenameTh === "อื่นๆ" ||
          (mainContact.prenameEn && mainContact.prenameEn.toLowerCase() === "other")) &&
        !mainContact.prenameOther
      ) {
        errors.contactPerson0PrenameOther = "กรุณาระบุคำนำหน้าชื่อ (อื่นๆ)";
      }

      // ตรวจสอบชื่อภาษาอังกฤษ - บังคับกรอก
      if (!mainContact.firstNameEn) {
        errors.contactPerson0FirstNameEn = "กรุณากรอกชื่อ (ภาษาอังกฤษ)";
      } else if (!/^[a-zA-Z\s]+$/.test(mainContact.firstNameEn)) {
        errors.contactPerson0FirstNameEn = "ชื่อผู้ประสานงานต้องเป็นภาษาอังกฤษเท่านั้น";
      }

      if (!mainContact.lastNameEn) {
        errors.contactPerson0LastNameEn = "กรุณากรอกนามสกุล (ภาษาอังกฤษ)";
      } else if (!/^[a-zA-Z\s]+$/.test(mainContact.lastNameEn)) {
        errors.contactPerson0LastNameEn = "นามสกุลผู้ประสานงานต้องเป็นภาษาอังกฤษเท่านั้น";
      }

      // ตรวจสอบข้อมูลอื่นๆ
      if (!mainContact.position) {
        errors.contactPerson0Position = "กรุณากรอกตำแหน่ง";
      }

      if (mainContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mainContact.email)) {
        errors.contactPerson0Email = "รูปแบบอีเมลไม่ถูกต้อง";
      }

      if (!mainContact.phone) {
        errors.contactPerson0Phone = "กรุณากรอกเบอร์โทรศัพท์ผู้ประสานงาน";
      } else if (!/^\d{9,10}$/.test(mainContact.phone.replace(/[-\s]/g, ""))) {
        errors.contactPerson0Phone = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก";
      }

      // ตรวจสอบประเภทผู้ติดต่อ
      if (!mainContact.typeContactId) {
        errors.contactPerson0TypeContactId = "กรุณาเลือกประเภทผู้ติดต่อ";
      }

      // ตรวจสอบรายละเอียดเพิ่มเติมสำหรับประเภท "อื่นๆ"
      if (
        mainContact.typeContactId &&
        mainContact.typeContactOtherDetail === undefined &&
        mainContact.typeContactName === "อื่นๆ"
      ) {
        if (!mainContact.typeContactOtherDetail) {
          errors.contactPerson0TypeContactOtherDetail = "กรุณาระบุรายละเอียดประเภทผู้ติดต่อ";
        }
      }
    }
  }

  // ตรวจสอบที่อยู่ - รองรับ multi-address
  const addressTypes = ["1", "2", "3"];
  const addressLabels = {
    1: "ที่อยู่สำนักงาน",
    2: "ที่อยู่จัดส่งเอกสาร",
    3: "ที่อยู่ใบกำกับภาษี",
  };

  // ตรวจสอบว่ามี addresses object หรือไม่
  if (formData.addresses && typeof formData.addresses === "object") {
    // ตรวจสอบ multi-address format
    addressTypes.forEach((type) => {
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

      // ตรวจสอบอีเมล (บังคับกรอก)
      if (!address.email) {
        errors[`address_${type}_email`] = `กรุณากรอกอีเมล (${label})`;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
        errors[`address_${type}_email`] = `รูปแบบอีเมลไม่ถูกต้อง (${label})`;
      }

      // ตรวจสอบเบอร์โทรศัพท์ (บังคับกรอก, รองรับ 9-10 หลัก)
      if (!address.phone) {
        errors[`address_${type}_phone`] = `กรุณากรอกเบอร์โทรศัพท์ (${label})`;
      } else if (!/^\d{9,10}$/.test(address.phone.replace(/[-\s]/g, ""))) {
        errors[`address_${type}_phone`] = `เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก (${label})`;
      }
    });
  } else {
    // Fallback สำหรับ single address format เก่า
    if (!formData.addressNumber) {
      errors.addressNumber = "กรุณากรอกบ้านเลขที่";
    }

    if (!formData.subDistrict) {
      errors.subDistrict = "กรุณากรอกตำบล/แขวง";
    }

    if (!formData.district) {
      errors.district = "กรุณากรอกอำเภอ/เขต";
    }

    if (!formData.province) {
      errors.province = "กรุณาเลือกจังหวัด";
    }

    if (!formData.postalCode) {
      errors.postalCode = "กรุณากรอกรหัสไปรษณีย์";
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      errors.postalCode = "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
    }
  }
};

/**
 * ตรวจสอบข้อมูลผู้แทน
 */
const validateRepresentatives = (formData, errors) => {
  const representativeErrors = [];

  if (!formData.representatives || formData.representatives.length === 0) {
    errors.representatives = "กรุณาเพิ่มข้อมูลผู้แทนอย่างน้อย 1 คน";
    return;
  }

  formData.representatives.forEach((rep, index) => {
    const repError = {};

    // ตรวจสอบฟิลด์ที่จำเป็น
    if (!rep.firstNameTh) repError.firstNameTh = "กรุณากรอกชื่อภาษาไทย";
    if (!rep.lastNameTh) repError.lastNameTh = "กรุณากรอกนามสกุลภาษาไทย";
    if (!rep.firstNameEn) repError.firstNameEn = "กรุณากรอกชื่อภาษาอังกฤษ";
    if (!rep.lastNameEn) repError.lastNameEn = "กรุณากรอกนามสกุลภาษาอังกฤษ";
    if (!rep.email) repError.email = "กรุณากรอกอีเมล";
    if (!rep.phone) repError.phone = "กรุณากรอกเบอร์โทรศัพท์";

    // ตรวจสอบคำนำหน้าชื่อ (prename)
    const prenameTh = rep.prenameTh ?? rep.prename_th;
    const prenameEn = rep.prenameEn ?? rep.prename_en;
    const prenameOther = rep.prenameOther ?? rep.prename_other;

    if (!prenameTh) {
      repError.prename_th = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)";
    } else if (!/^[\u0E00-\u0E7F\.\s]+$/.test(prenameTh)) {
      repError.prename_th = "คำนำหน้าชื่อต้องเป็นภาษาไทยเท่านั้น";
    }

    if (!prenameEn) {
      repError.prename_en = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาอังกฤษ)";
    } else if (!/^[A-Za-z\.\s]+$/.test(prenameEn)) {
      repError.prename_en = "คำนำหน้าชื่อต้องเป็นภาษาอังกฤษเท่านั้น";
    }

    if (
      (prenameTh === "อื่นๆ" || (prenameEn && prenameEn.toLowerCase() === "other")) &&
      !prenameOther
    ) {
      repError.prename_other = "กรุณาระบุคำนำหน้าชื่อ (อื่นๆ)";
    }

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
  // ตรวจสอบประเภทธุรกิจ - ต้องเลือกอย่างน้อย 1 ประเภท
  if (
    !formData.businessTypes ||
    Object.keys(formData.businessTypes).filter((key) => formData.businessTypes[key]).length === 0
  ) {
    errors.businessTypes = "กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ประเภท";
  } else if (formData.businessTypes.other && !formData.otherBusinessTypeDetail) {
    // ถ้าเลือก "อื่นๆ" ต้องระบุรายละเอียด
    errors.otherBusinessTypeDetail = "กรุณาระบุรายละเอียดประเภทธุรกิจอื่นๆ";
  }

  // ตรวจสอบจำนวนสมาชิก
  if (!formData.memberCount) {
    errors.memberCount = "กรุณากรอกจำนวนสมาชิก";
  } else if (isNaN(formData.memberCount) || parseInt(formData.memberCount) <= 0) {
    errors.memberCount = "จำนวนสมาชิกต้องเป็นตัวเลขมากกว่า 0";
  }

  // ตรวจสอบจำนวนพนักงาน
  if (!formData.numberOfEmployees) {
    errors.numberOfEmployees = "กรุณากรอกจำนวนพนักงาน";
  } else if (isNaN(formData.numberOfEmployees) || parseInt(formData.numberOfEmployees) < 0) {
    errors.numberOfEmployees = "จำนวนพนักงานต้องเป็นตัวเลขและมีค่ามากกว่าหรือเท่ากับ 0";
  }

  // ตรวจสอบผลิตภัณฑ์ - ต้องมีอย่างน้อย 1 รายการและต้องมีชื่อภาษาไทย
  if (formData.products && formData.products.length > 0) {
    const hasValidProduct = formData.products.some(
      (product) => product.nameTh && product.nameTh.trim() !== "",
    );
    if (!hasValidProduct) {
      errors.products = "กรุณาระบุชื่อผลิตภัณฑ์/บริการภาษาไทยอย่างน้อย 1 รายการ";
    }
  } else {
    errors.products = "กรุณาเพิ่มผลิตภัณฑ์/บริการอย่างน้อย 1 รายการ";
  }

  // ตรวจสอบทุนจดทะเบียน (ไม่บังคับกรอก)
  if (
    formData.registeredCapital &&
    (isNaN(formData.registeredCapital) || parseFloat(formData.registeredCapital) < 0)
  ) {
    errors.registeredCapital = "ทุนจดทะเบียนต้องเป็นตัวเลขและมีค่ามากกว่าหรือเท่ากับ 0";
  }

  // ตรวจสอบรายได้ปีล่าสุด (ไม่บังคับกรอก)
  if (
    formData.revenueLastYear &&
    (isNaN(formData.revenueLastYear) || parseFloat(formData.revenueLastYear) < 0)
  ) {
    errors.revenueLastYear = "รายได้ปีล่าสุดต้องเป็นตัวเลขและมีค่ามากกว่าหรือเท่ากับ 0";
  }

  // ตรวจสอบรายได้ปีก่อนหน้า (ไม่บังคับกรอก)
  if (
    formData.revenuePreviousYear &&
    (isNaN(formData.revenuePreviousYear) || parseFloat(formData.revenuePreviousYear) < 0)
  ) {
    errors.revenuePreviousYear = "รายได้ปีก่อนหน้าต้องเป็นตัวเลขและมีค่ามากกว่าหรือเท่ากับ 0";
  }

  // กลุ่มอุตสาหกรรมเป็นฟิลด์ทางเลือก ไม่ต้องตรวจสอบ
};

/**
 * ตรวจสอบเอกสาร
 */
const validateDocuments = (formData, errors) => {
  // ตรวจสอบสำเนาหนังสือรับรองการจดทะเบียนเป็นสมาคมการค้า
  if (!formData.associationCertificate) {
    errors.associationCertificate = "กรุณาแนบสำเนาหนังสือรับรองการจดทะเบียนเป็นสมาคมการค้า";
  }

  // ตรวจสอบรายชื่อสมาชิกสมาคม
  if (!formData.memberList) {
    errors.memberList = "กรุณาแนบรายชื่อสมาชิกสมาคม";
  }

  // ตรวจสอบเอกสารที่จำเป็น (บังคับทุกกรณี)
  if (!formData.companyStamp) {
    errors.companyStamp = "กรุณาอัพโหลดรูปตราประทับสมาคม (หรือรูปลายเซ็นหากไม่มีตราประทับ)";
  }

  if (!formData.authorizedSignature) {
    errors.authorizedSignature = "กรุณาอัพโหลดรูปลายเซ็นผู้มีอำนาจลงนาม";
  }

  // ตรวจสอบคำนำหน้าผู้มีอำนาจลงนาม (ภาษาไทย) - บังคับ
  if (!formData.authorizedSignatoryPrenameTh) {
    errors.authorizedSignatoryPrenameTh = "กรุณาเลือกคำนำหน้าผู้มีอำนาจลงนาม (ภาษาไทย)";
  }

  // ถ้าเลือก "อื่นๆ" ต้องระบุรายละเอียด
  if (formData.authorizedSignatoryPrenameTh === "อื่นๆ") {
    if (!formData.authorizedSignatoryPrenameOther || formData.authorizedSignatoryPrenameOther.trim() === "") {
      errors.authorizedSignatoryPrenameOther = "กรุณาระบุคำนำหน้า (อื่นๆ) ภาษาไทย";
    }
  }

  // ถ้าเลือก "Other" ในภาษาอังกฤษ ต้องระบุรายละเอียด
  if (formData.authorizedSignatoryPrenameEn === "Other") {
    if (!formData.authorizedSignatoryPrenameOtherEn || formData.authorizedSignatoryPrenameOtherEn.trim() === "") {
      errors.authorizedSignatoryPrenameOtherEn = "กรุณาระบุคำนำหน้า (Other) ภาษาอังกฤษ";
    }
  }

  // ตรวจสอบข้อมูลชื่อผู้มีอำนาจลงนาม
  if (!formData.authorizedSignatoryFirstNameTh) {
    errors.authorizedSignatoryFirstNameTh = "กรุณากรอกชื่อผู้มีอำนาจลงนาม (ภาษาไทย)";
  } else if (!/^[ก-๙\s]+$/.test(formData.authorizedSignatoryFirstNameTh)) {
    errors.authorizedSignatoryFirstNameTh = "ชื่อผู้มีอำนาจลงนามต้องเป็นภาษาไทยเท่านั้น";
  }

  if (!formData.authorizedSignatoryLastNameTh) {
    errors.authorizedSignatoryLastNameTh = "กรุณากรอกนามสกุลผู้มีอำนาจลงนาม (ภาษาไทย)";
  } else if (!/^[ก-๙\s]+$/.test(formData.authorizedSignatoryLastNameTh)) {
    errors.authorizedSignatoryLastNameTh = "นามสกุลผู้มีอำนาจลงนามต้องเป็นภาษาไทยเท่านั้น";
  }

  // ชื่อ-นามสกุลภาษาอังกฤษ: ไม่บังคับกรอก แต่ตรวจสอบรูปแบบถ้ามีค่า
  if (formData.authorizedSignatoryFirstNameEn && !/^[a-zA-Z\s]+$/.test(formData.authorizedSignatoryFirstNameEn)) {
    errors.authorizedSignatoryFirstNameEn = "ชื่อผู้มีอำนาจลงนามต้องเป็นภาษาอังกฤษเท่านั้น";
  }

  if (formData.authorizedSignatoryLastNameEn && !/^[a-zA-Z\s]+$/.test(formData.authorizedSignatoryLastNameEn)) {
    errors.authorizedSignatoryLastNameEn = "นามสกุลผู้มีอำนาจลงนามต้องเป็นภาษาอังกฤษเท่านั้น";
  } else if (!/^[a-zA-Z\s]+$/.test(formData.authorizedSignatoryLastNameEn)) {
    errors.authorizedSignatoryLastNameEn = "นามสกุลผู้มีอำนาจลงนามต้องเป็นภาษาอังกฤษเท่านั้น";
  }
};
