"use client";

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
export const validateCurrentStep = (formData, step) => {
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
    errors.idCardNumber = "กรุณากรอกเลขบัตรประชาชน";
  } else if (!/^\d{13}$/.test(formData.idCardNumber)) {
    errors.idCardNumber = "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
  } else if (!validateThaiIDCard(formData.idCardNumber)) {
    errors.idCardNumber = "รูปแบบเลขบัตรประชาชนไม่ถูกต้อง";
  }

  // ตรวจสอบคำนำหน้าชื่อ (prename) ผู้ยื่นสมัคร - รองรับทั้ง snake_case และ camelCase
  // Priority: snake_case > camelCase
  const prenameThVal = formData.prename_th !== undefined ? formData.prename_th : formData.prenameTh;
  const prenameEnVal = formData.prename_en !== undefined ? formData.prename_en : formData.prenameEn;
  const prenameOtherVal =
    formData.prename_other !== undefined ? formData.prename_other : formData.prenameOther;
  const prenameOtherEnVal =
    formData.prename_other_en !== undefined ? formData.prename_other_en : formData.prenameOtherEn;

  console.log(
    "🔍 DEBUG validateApplicantInfo - prenameThVal:",
    prenameThVal,
    "type:",
    typeof prenameThVal,
  );
  console.log(
    "🔍 DEBUG validateApplicantInfo - prenameEnVal:",
    prenameEnVal,
    "type:",
    typeof prenameEnVal,
  );
  console.log(
    "🔍 DEBUG validateApplicantInfo - prenameOtherVal:",
    prenameOtherVal,
    "type:",
    typeof prenameOtherVal,
  );
  console.log(
    "🔍 DEBUG validateApplicantInfo - prenameOtherEnVal:",
    prenameOtherEnVal,
    "type:",
    typeof prenameOtherEnVal,
  );
  console.log(
    "🔍 DEBUG validateApplicantInfo - formData keys:",
    Object.keys(formData).filter((k) => k.includes("prename")),
  );

  if (!prenameThVal || prenameThVal.trim() === "") {
    errors.prename_th = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)";
  } else if (!/^[\u0E00-\u0E7F\.\s]+$/.test(String(prenameThVal))) {
    errors.prename_th = "คำนำหน้าชื่อต้องเป็นภาษาไทยเท่านั้น";
  }

  if (!prenameEnVal || prenameEnVal.trim() === "") {
    errors.prename_en = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาอังกฤษ)";
  } else if (!/^[A-Za-z\.\s]+$/.test(String(prenameEnVal))) {
    errors.prename_en = "คำนำหน้าชื่อต้องเป็นภาษาอังกฤษเท่านั้น";
  }

  // ตรวจสอบว่าถ้าเลือก "อื่นๆ" ต้องระบุรายละเอียด
  if (prenameThVal === "อื่นๆ") {
    console.log(
      "✅ DETECTED Thai prename is 'อื่นๆ' - checking prenameOtherVal:",
      prenameOtherVal,
      "trimmed:",
      prenameOtherVal?.trim?.(),
    );
    if (!prenameOtherVal || prenameOtherVal.trim() === "") {
      console.log("❌ ERROR: prenameOther is empty when prename_th is 'อื่นๆ'");
      errors.prename_other = "กรุณาระบุคำนำหน้าชื่อ (อื่นๆ) ภาษาไทย";
    } else {
      console.log("✅ OK: prenameOther has value:", prenameOtherVal);
    }
  }

  // ตรวจสอบว่าถ้าเลือก "Other" ต้องระบุรายละเอียด
  if (prenameEnVal && String(prenameEnVal).toLowerCase() === "other") {
    console.log(
      "✅ DETECTED English prename is 'Other' - checking prenameOtherEnVal:",
      prenameOtherEnVal,
      "trimmed:",
      prenameOtherEnVal?.trim?.(),
    );
    if (!prenameOtherEnVal || prenameOtherEnVal.trim() === "") {
      console.log("❌ ERROR: prenameOtherEn is empty when prename_en is 'Other'");
      errors.prename_other_en = "กรุณาระบุคำนำหน้าชื่อ (Other) ภาษาอังกฤษ";
    } else {
      console.log("✅ OK: prenameOtherEn has value:", prenameOtherEnVal);
    }
  }

  // Thai name validation
  if (!formData.firstNameThai) {
    errors.firstNameThai = "กรุณากรอกชื่อภาษาไทย";
  } else if (!/^[ก-๙\s]+$/.test(formData.firstNameThai)) {
    errors.firstNameThai = "กรุณากรอกชื่อเป็นภาษาไทยเท่านั้น";
  }

  if (!formData.lastNameThai) {
    errors.lastNameThai = "กรุณากรอกนามสกุลภาษาไทย";
  } else if (!/^[ก-๙\s]+$/.test(formData.lastNameThai)) {
    errors.lastNameThai = "กรุณากรอกนามสกุลเป็นภาษาไทยเท่านั้น";
  }

  // English name validation
  if (!formData.firstNameEng) {
    errors.firstNameEng = "กรุณากรอกชื่อภาษาอังกฤษ";
  } else if (!/^[a-zA-Z\s]+$/.test(formData.firstNameEng)) {
    errors.firstNameEng = "กรุณากรอกชื่อเป็นภาษาอังกฤษเท่านั้น";
  }

  if (!formData.lastNameEng) {
    errors.lastNameEng = "กรุณากรอกนามสกุลภาษาอังกฤษ";
  } else if (!/^[a-zA-Z\s]+$/.test(formData.lastNameEng)) {
    errors.lastNameEng = "กรุณากรอกนามสกุลเป็นภาษาอังกฤษเท่านั้น";
  }

  // Contact information validation (รองรับ 9-10 หลัก)
  if (!formData.phone) {
    errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
  } else if (formData.phone.length > 50) {
    errors.phone = "เบอร์โทรศัพท์ต้องไม่เกิน 50 ตัวอักษร";
  }

  // Phone extension validation: allow non-numeric characters (commas, parentheses, etc.)
  // No strict validation needed; accept any string if provided

  if (!formData.email) {
    errors.email = "กรุณากรอกอีเมล";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  }

  // Address validation - รองรับ multi-address
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
        errors[`address_${type}_province`] = `กรุณากรอกจังหวัด (${label})`;
      }

      if (!address.postalCode) {
        errors[`address_${type}_postalCode`] = `กรุณากรอกรหัสไปรษณีย์ (${label})`;
      } else if (!/^\d{5}$/.test(address.postalCode)) {
        errors[`address_${type}_postalCode`] = `รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก (${label})`;
      }

      // ตรวจสอบอีเมล (บังคับกรอก) - ให้ priority กับคีย์ไดนามิกจาก UI ก่อน (email-1, ฯลฯ)
      const email = address[`email-${type}`] || address.email || "";
      if (!email || email.trim() === "") {
        errors[`address_${type}_email`] = `กรุณากรอกอีเมล (${label})`;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors[`address_${type}_email`] = `รูปแบบอีเมลไม่ถูกต้อง (${label})`;
      }

      // ตรวจสอบเบอร์โทรศัพท์ (บังคับกรอก, รองรับ 9-10 หลัก) - ให้ priority กับคีย์ไดนามิกจาก UI ก่อน (phone-1, ฯลฯ)
      const phone = address[`phone-${type}`] || address.phone || "";
      if (!phone) {
        errors[`address_${type}_phone`] = `กรุณากรอกเบอร์โทรศัพท์ (${label})`;
      } else if (phone.length > 50) {
        errors[`address_${type}_phone`] = `เบอร์โทรศัพท์ต้องไม่เกิน 50 ตัวอักษร (${label})`;
      }

      // ตรวจสอบเว็บไซต์ถ้ามี
      const website = address.website || address[`website-${type}`] || "";
      if (website && website.trim() !== "") {
        try {
          new URL(website);
        } catch (e) {
          errors[`address_${type}_website`] = `รูปแบบเว็บไซต์ไม่ถูกต้อง (${label})`;
        }
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
      errors.province = "กรุณากรอกจังหวัด";
    }

    if (!formData.postalCode) {
      errors.postalCode = "กรุณากรอกรหัสไปรษณีย์";
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      errors.postalCode = "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
    }
  }

  // Note: moo, soi, street are optional fields - no validation required
  // Note: Industrial group and provincial chapter are not required fields for IC

  // Website validation (optional field but must be valid if provided)
  if (formData.website && formData.website.trim() !== "") {
    // Simple URL validation
    try {
      new URL(formData.website);
    } catch (e) {
      errors.website = "รูปแบบเว็บไซต์ไม่ถูกต้อง กรุณาระบุ URL ที่สมบูรณ์ เช่น https://example.com";
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

  // ตรวจสอบคำนำหน้าชื่อ (prename) ผู้แทน - shared component ใช้ camelCase
  const repPrenameTh = representative.prenameTh || "";
  const repPrenameEn = representative.prenameEn || "";
  const repPrenameOther = representative.prenameOther || "";
  const repPrenameOtherEn = representative.prenameOtherEn || "";

  if (!repPrenameTh || repPrenameTh.trim() === "") {
    representativeErrors.prename_th = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)";
  } else if (!/^[\u0E00-\u0E7F\.\s]+$/.test(String(repPrenameTh))) {
    representativeErrors.prename_th = "คำนำหน้าชื่อต้องเป็นภาษาไทยเท่านั้น";
  }

  if (!repPrenameEn || repPrenameEn.trim() === "") {
    representativeErrors.prename_en = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาอังกฤษ)";
  } else if (!/^[A-Za-z\.\s]+$/.test(String(repPrenameEn))) {
    representativeErrors.prename_en = "คำนำหน้าชื่อต้องเป็นภาษาอังกฤษเท่านั้น";
  }

  // ตรวจสอบว่าถ้าเลือก "อื่นๆ" ต้องระบุรายละเอียด
  if (repPrenameTh === "อื่นๆ") {
    if (!repPrenameOther || repPrenameOther.trim() === "") {
      representativeErrors.prename_other = "กรุณาระบุคำนำหน้าชื่อ (อื่นๆ) ภาษาไทย";
    }
  }

  // ตรวจสอบว่าถ้าเลือก "Other" ต้องระบุรายละเอียด
  if (repPrenameEn && String(repPrenameEn).toLowerCase() === "other") {
    if (!repPrenameOtherEn || repPrenameOtherEn.trim() === "") {
      representativeErrors.prename_other_en = "กรุณาระบุคำนำหน้าชื่อ (Other) ภาษาอังกฤษ";
    }
  }

  // Thai name validation - IC uses firstNameThai, lastNameThai (from hook)
  const repFirstNameThai = representative.firstNameThai || representative.firstNameTh || "";
  const repLastNameThai = representative.lastNameThai || representative.lastNameTh || "";
  const repFirstNameEng = representative.firstNameEng || representative.firstNameEn || "";
  const repLastNameEng = representative.lastNameEng || representative.lastNameEn || "";

  if (!repFirstNameThai) {
    representativeErrors.firstNameThai = "กรุณากรอกชื่อภาษาไทย";
  } else if (!/^[ก-๙\s]+$/.test(repFirstNameThai)) {
    representativeErrors.firstNameThai = "กรุณากรอกชื่อเป็นภาษาไทยเท่านั้น";
  }

  if (!repLastNameThai) {
    representativeErrors.lastNameThai = "กรุณากรอกนามสกุลภาษาไทย";
  } else if (!/^[ก-๙\s]+$/.test(repLastNameThai)) {
    representativeErrors.lastNameThai = "กรุณากรอกนามสกุลเป็นภาษาไทยเท่านั้น";
  }

  // English name validation - support both camelCase and snake_case
  if (!repFirstNameEng) {
    representativeErrors.firstNameEng = "กรุณากรอกชื่อภาษาอังกฤษ";
  } else if (!/^[a-zA-Z\s]+$/.test(repFirstNameEng)) {
    representativeErrors.firstNameEng = "กรุณากรอกชื่อเป็นภาษาอังกฤษเท่านั้น";
  }

  if (!repLastNameEng) {
    representativeErrors.lastNameEng = "กรุณากรอกนามสกุลภาษาอังกฤษ";
  } else if (!/^[a-zA-Z\s]+$/.test(repLastNameEng)) {
    representativeErrors.lastNameEng = "กรุณากรอกนามสกุลเป็นภาษาอังกฤษเท่านั้น";
  }

  // Contact information validation (รองรับ 9-10 หลัก, อนุญาตให้มี - และช่องว่าง)
  if (!representative.phone) {
    representativeErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
  } else if (representative.phone.length > 50) {
    representativeErrors.phone = "เบอร์โทรศัพท์ต้องไม่เกิน 50 ตัวอักษร";
  }

  // Phone extension validation: allow non-numeric characters for representative as well
  // No strict validation; accept any string if provided

  if (!representative.email) {
    representativeErrors.email = "กรุณากรอกอีเมล";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(representative.email)) {
    representativeErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  }

  if (Object.keys(representativeErrors).length > 0) {
    errors.representativeErrors = representativeErrors;
  }

  console.log("✅ validateRepresentativeInfo - Final errors:", representativeErrors);
  return errors;
};

// Validate business information
const validateBusinessInfo = (formData) => {
  const errors = {};
  const productErrors = [];

  // Business type validation
  if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) {
    errors.businessTypes = "กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ประเภท";
  } else if (formData.businessTypes.other && !formData.otherBusinessTypeDetail) {
    errors.otherBusinessTypeDetail = "กรุณาระบุประเภทธุรกิจอื่นๆ";
  }

  // Product validation
  if (!formData.products || formData.products.length === 0) {
    errors.products = "กรุณากรอกข้อมูลสินค้า/บริการอย่างน้อย 1 รายการ";
  } else {
    formData.products.forEach((product, index) => {
      const productError = {};

      if (!product.nameTh) {
        productError.nameTh = "กรุณากรอกชื่อสินค้า/บริการภาษาไทย";
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
    errors.idCardDocument = "กรุณาอัพโหลดสำเนาบัตรประชาชน";
  }

  // ตรวจสอบว่ามีไฟล์จริงๆ (file object / url / fileUrl) ไม่ใช่แค่ object ว่าง
  // รองรับไฟล์เดิมจาก Summary API ที่ใช้ fileUrl ด้วย
  const hasAuthorizedSignature =
    formData.authorizedSignature &&
    (formData.authorizedSignature.file ||
      formData.authorizedSignature.url ||
      formData.authorizedSignature.fileUrl ||
      formData.authorizedSignature instanceof File);

  if (!hasAuthorizedSignature) {
    errors.authorizedSignature = "กรุณาอัพโหลดรูปลายเซ็นผู้มีอำนาจลงนาม";
  }

  // Attachment document validation (optional - no validation required)
  // This field is optional as per requirements

  // Authorized signatory prename validation (required)
  console.log(
    "🔍 DEBUG validateDocuments - authorizedSignatoryPrenameTh:",
    formData.authorizedSignatoryPrenameTh,
  );
  console.log(
    "🔍 DEBUG validateDocuments - authorizedSignatoryPrenameOther:",
    formData.authorizedSignatoryPrenameOther,
  );

  if (
    !formData.authorizedSignatoryPrenameTh ||
    formData.authorizedSignatoryPrenameTh.trim() === ""
  ) {
    errors.authorizedSignatoryPrenameTh = "กรุณาเลือกคำนำหน้าชื่อผู้มีอำนาจลงนาม (ภาษาไทย)";
  }

  // ตรวจสอบว่าถ้าเลือก "อื่นๆ" ต้องระบุรายละเอียด
  if (formData.authorizedSignatoryPrenameTh === "อื่นๆ") {
    console.log(
      "✅ DETECTED authorizedSignatory prename is 'อื่นๆ' - checking authorizedSignatoryPrenameOther:",
      formData.authorizedSignatoryPrenameOther,
    );
    if (
      !formData.authorizedSignatoryPrenameOther ||
      formData.authorizedSignatoryPrenameOther.trim() === ""
    ) {
      console.log("❌ ERROR: authorizedSignatoryPrenameOther is empty when prename is 'อื่นๆ'");
      errors.authorizedSignatoryPrenameOther = "กรุณาระบุคำนำหน้าชื่อผู้มีอำนาจลงนาม (อื่นๆ)";
    } else {
      console.log(
        "✅ OK: authorizedSignatoryPrenameOther has value:",
        formData.authorizedSignatoryPrenameOther,
      );
    }
  }

  // Authorized signatory name validations (required)
  // Thai names must be Thai letters/spaces/dots
  if (
    !formData.authorizedSignatoryFirstNameTh ||
    formData.authorizedSignatoryFirstNameTh.trim() === ""
  ) {
    errors.authorizedSignatoryFirstNameTh = "กรุณากรอกชื่อผู้มีอำนาจลงนาม (ภาษาไทย)";
  } else if (!/^[ก-๙\.\s]+$/.test(formData.authorizedSignatoryFirstNameTh)) {
    errors.authorizedSignatoryFirstNameTh = "กรุณากรอกชื่อภาษาไทยเท่านั้น (สามารถใส่ . ได้)";
  }

  if (
    !formData.authorizedSignatoryLastNameTh ||
    formData.authorizedSignatoryLastNameTh.trim() === ""
  ) {
    errors.authorizedSignatoryLastNameTh = "กรุณากรอกนามสกุลผู้มีอำนาจลงนาม (ภาษาไทย)";
  } else if (!/^[ก-๙\.\s]+$/.test(formData.authorizedSignatoryLastNameTh)) {
    errors.authorizedSignatoryLastNameTh = "กรุณากรอกนามสกุลภาษาไทยเท่านั้น (สามารถใส่ . ได้)";
  }

  // English names: ไม่บังคับกรอกและไม่ตรวจสอบ (ซ่อนไว้)
  // Removed validation for English fields

  return errors;
};
