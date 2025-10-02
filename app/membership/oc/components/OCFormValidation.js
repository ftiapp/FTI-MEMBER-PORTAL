"use client";

/**
 * ฟังก์ชันสำหรับตรวจสอบความถูกต้องของเลขประจำตัวผู้เสียภาษีกับ API
 * @param {string} taxId เลขประจำตัวผู้เสียภาษี
 * @returns {Promise<{valid: boolean, message: string}>} ผลการตรวจสอบ
 */
export const validateTaxId = async (taxId) => {
  if (!taxId || taxId.length !== 13) {
    return { valid: false, message: "เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก" };
  }

  try {
    const response = await fetch("/api/member/oc-membership/check-tax-id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taxId }),
    });

    const data = await response.json();
    console.log("Tax ID validation response:", data);

    return {
      valid: data.valid === true,
      message: data.message || "ไม่สามารถตรวจสอบเลขประจำตัวผู้เสียภาษีได้",
    };
  } catch (error) {
    console.error("Error validating tax ID:", error);
    return { valid: false, message: "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี" };
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
    if (!formData.companyName) errors.companyName = "กรุณากรอกชื่อบริษัท";
    if (!formData.companyNameEng) {
      errors.companyNameEng = "กรุณากรอกชื่อบริษัทภาษาอังกฤษ";
    } else if (!/^[A-Za-z0-9\s.,&\(\)\-'\"]+$/.test(formData.companyNameEng)) {
      errors.companyNameEng = "ชื่อบริษัทภาษาอังกฤษต้องเป็นภาษาอังกฤษเท่านั้น";
    }

    if (!formData.taxId) {
      errors.taxId = "กรุณากรอกเลขประจำตัวผู้เสียภาษี";
    } else if (formData.taxId.length !== 13) {
      errors.taxId = "เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก";
    } else if (!/^\d+$/.test(formData.taxId)) {
      errors.taxId = "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลขเท่านั้น";
    }

    // หมายเหตุ: อีเมลและโทรศัพท์ตรวจสอบใน address validation แล้ว

    // ตรวจสอบที่อยู่ - รองรับ multi-address และบังคับให้กรอกครบทั้ง 3 ประเภท
    const addressTypes = ["1", "2", "3"];
    const addressLabels = {
      1: "ที่อยู่สำนักงาน",
      2: "ที่อยู่จัดส่งเอกสาร",
      3: "ที่อยู่ใบกำกับภาษี",
    };

    // ตรวจสอบว่ามี addresses object หรือไม่
    if (formData.addresses && typeof formData.addresses === "object") {
      // ตรวจสอบ multi-address format - บังคับให้กรอกครบทั้ง 3 ประเภท
      addressTypes.forEach((type) => {
        const address = formData.addresses[type];
        const label = addressLabels[type];

        if (!address || Object.keys(address).length === 0) {
          errors[`addresses.${type}`] = `❗ กรุณากรอก${label} (บังคับทั้ง 3 ประเภท)`;
          return;
        }

        if (!address.addressNumber) {
          errors[`addresses.${type}.addressNumber`] = `กรุณากรอกเลขที่ (${label})`;
        }

        if (!address.subDistrict) {
          errors[`addresses.${type}.subDistrict`] = `กรุณากรอกตำบล/แขวง (${label})`;
        }

        if (!address.district) {
          errors[`addresses.${type}.district`] = `กรุณากรอกอำเภอ/เขต (${label})`;
        }

        if (!address.province) {
          errors[`addresses.${type}.province`] = `กรุณากรอกจังหวัด (${label})`;
        }

        if (!address.postalCode) {
          errors[`addresses.${type}.postalCode`] = `กรุณากรอกรหัสไปรษณีย์ (${label})`;
        } else if (address.postalCode.length !== 5 || !/^\d+$/.test(address.postalCode)) {
          errors[`addresses.${type}.postalCode`] = `รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก (${label})`;
        }

        // อ่านค่า email/phone จากทั้งคีย์มาตรฐานและคีย์ไดนามิกของ UI
        const emailVal = address.email ?? address[`email-${type}`];
        const phoneRaw = address.phone ?? address[`phone-${type}`];
        const phoneVal = typeof phoneRaw === "string" ? phoneRaw.replace(/[-\s]/g, "") : phoneRaw;

        // อีเมลไม่บังคับ: ตรวจรูปแบบเฉพาะเมื่อมีค่า
        if (emailVal) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            errors[`addresses.${type}.email`] = `รูปแบบอีเมลไม่ถูกต้อง (${label})`;
          }
        }

        // เบอร์โทรศัพท์บังคับ
        if (!phoneVal) {
          errors[`addresses.${type}.phone`] = `กรุณากรอกเบอร์โทรศัพท์ (${label})`;
        } else if (!/^\d{9,10}$/.test(phoneVal)) {
          errors[`addresses.${type}.phone`] = `รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (${label})`;
        }
      });

      // เพิ่มข้อความเตือนหลักถ้าไม่มีที่อยู่เลย
      const hasAnyAddress = addressTypes.some(
        (type) => formData.addresses[type] && Object.keys(formData.addresses[type]).length > 0,
      );

      if (!hasAnyAddress) {
        errors["addresses.required"] =
          "⚠️ กรุณากรอกที่อยู่ให้ครบทั้ง 3 ประเภท: สำนักงาน, จัดส่งเอกสาร, และใบกำกับภาษี";
      }
    } else {
      // Fallback สำหรับ single address format เก่า
      errors["addresses.migration"] =
        "⚠️ กรุณากรอกที่อยู่ให้ครบทั้ง 3 ประเภท: สำนักงาน, จัดส่งเอกสาร, และใบกำกับภาษี";

      if (!formData.addressNumber) errors["addresses.legacy.addressNumber"] = "กรุณากรอกเลขที่";
      if (!formData.subDistrict) errors["addresses.legacy.subDistrict"] = "กรุณากรอกตำบล/แขวง";
      if (!formData.district) errors["addresses.legacy.district"] = "กรุณากรอกอำเภอ/เขต";
      if (!formData.province) errors["addresses.legacy.province"] = "กรุณากรอกจังหวัด";
      if (!formData.postalCode) {
        errors["addresses.legacy.postalCode"] = "กรุณากรอกรหัสไปรษณีย์";
      } else if (formData.postalCode.length !== 5 || !/^\d+$/.test(formData.postalCode)) {
        errors["addresses.legacy.postalCode"] = "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
      }
    }

    // ตรวจสอบข้อมูลผู้ติดต่อ (Contact Persons) - ระบบใหม่
    if (!formData.contactPersons || formData.contactPersons.length === 0) {
      errors.contactPersons = "กรุณาเพิ่มข้อมูลผู้ประสานงานหลัก";
    } else {
      // ตรวจสอบผู้ประสานงานหลัก (คนแรก)
      const mainContact = formData.contactPersons[0];
      if (mainContact) {
        // รองรับได้ทั้ง prename_th/prenameTh, prename_en/prenameEn, prename_other/prenameOther
        const prenameTh = mainContact.prename_th ?? mainContact.prenameTh;
        const prenameEn = mainContact.prename_en ?? mainContact.prenameEn;
        const prenameOther = mainContact.prename_other ?? mainContact.prenameOther;
        // ตรวจสอบชื่อภาษาไทย
        if (!mainContact.firstNameTh) {
          errors.contactPerson0FirstNameTh = "กรุณากรอกชื่อ (ภาษาไทย)";
        } else if (!/^[\u0E00-\u0E7F\s]+$/.test(mainContact.firstNameTh)) {
          errors.contactPerson0FirstNameTh = "ชื่อผู้ประสานงานต้องเป็นภาษาไทยเท่านั้น";
        }

        if (!mainContact.lastNameTh) {
          errors.contactPerson0LastNameTh = "กรุณากรอกนามสกุล (ภาษาไทย)";
        } else if (!/^[\u0E00-\u0E7F\s]+$/.test(mainContact.lastNameTh)) {
          errors.contactPerson0LastNameTh = "นามสกุลผู้ประสานงานต้องเป็นภาษาไทยเท่านั้น";
        }

        // ตรวจสอบคำนำหน้าชื่อ (prename)
        if (!prenameTh) {
          errors.contactPerson0PrenameTh = "กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)";
        } else if (!/^[\u0E00-\u0E7F\.\s]+$/.test(prenameTh)) {
          errors.contactPerson0PrenameTh = "คำนำหน้าชื่อต้องเป็นภาษาไทยเท่านั้น";
        }

        // EN prename/name เป็น optional: ตรวจรูปแบบเมื่อมีค่าเท่านั้น
        if (prenameEn && !/^[A-Za-z\.\s]+$/.test(prenameEn)) {
          errors.contactPerson0PrenameEn = "คำนำหน้าชื่อต้องเป็นภาษาอังกฤษเท่านั้น";
        }

        // หากเลือก "อื่นๆ" ใน TH หรือ EN ต้องระบุ prename_other และต้องเป็นภาษาไทย/เว้นวรรค/จุด เท่านั้น
        if (prenameTh === "อื่นๆ" || (prenameEn && prenameEn.toLowerCase() === "other")) {
          if (!prenameOther || prenameOther.trim() === "") {
            errors.contactPerson0PrenameOther = "กรุณาระบุคำนำหน้าชื่อ (อื่นๆ)";
          } else if (!/^[\u0E00-\u0E7F\.\s]+$/.test(prenameOther)) {
            errors.contactPerson0PrenameOther = "คำนำหน้าชื่อ (อื่นๆ) ต้องเป็นภาษาไทยเท่านั้น";
          }
        }

        // ชื่อ-นามสกุลภาษาอังกฤษ: ไม่บังคับ แต่ตรวจรูปแบบถ้ามีค่า
        if (mainContact.firstNameEn && !/^[a-zA-Z\s]+$/.test(mainContact.firstNameEn)) {
          errors.contactPerson0FirstNameEn = "ชื่อผู้ประสานงานต้องเป็นภาษาอังกฤษเท่านั้น";
        }
        if (mainContact.lastNameEn && !/^[a-zA-Z\s]+$/.test(mainContact.lastNameEn)) {
          errors.contactPerson0LastNameEn = "นามสกุลผู้ประสานงานต้องเป็นภาษาอังกฤษเท่านั้น";
        }

        // ตรวจสอบข้อมูลอื่นๆ
        if (!mainContact.position) {
          errors.contactPerson0Position = "กรุณากรอกตำแหน่ง";
        }

        if (!mainContact.email) {
          errors.contactPerson0Email = "กรุณากรอกอีเมลผู้ประสานงาน";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mainContact.email)) {
          errors.contactPerson0Email = "รูปแบบอีเมลไม่ถูกต้อง";
        }

        if (!mainContact.phone) {
          errors.contactPerson0Phone = "กรุณากรอกเบอร์โทรศัพท์ผู้ประสานงาน";
        }

        // ตรวจสอบประเภทผู้ติดต่อ
        if (!mainContact.typeContactId) {
          errors.contactPerson0TypeContactId = "กรุณาเลือกประเภทผู้ติดต่อ";
        }

        // ตรวจสอบรายละเอียดเพิ่มเติมสำหรับประเภท "อื่นๆ"
        if (
          mainContact.typeContactId &&
          mainContact.typeContactOtherDetail === undefined &&
          // ตรวจสอบว่าเป็นประเภท "อื่นๆ" หรือไม่ (ต้องมีการตรวจสอบเพิ่มเติม)
          mainContact.typeContactName === "อื่นๆ"
        ) {
          if (!mainContact.typeContactOtherDetail) {
            errors.contactPerson0TypeContactOtherDetail = "กรุณาระบุรายละเอียดประเภทผู้ติดต่อ";
          }
        }
      }
    }
  } else if (step === 2) {
    // ตรวจสอบข้อมูลผู้แทน
    if (!formData.representatives || formData.representatives.length === 0) {
      errors.representatives = "กรุณาเพิ่มข้อมูลผู้แทนอย่างน้อย 1 คน";
    } else {
      // ตรวจสอบข้อมูลผู้แทนแต่ละคน
      const representativeErrors = [];

      formData.representatives.forEach((rep, index) => {
        const repError = {};
        const repPrenameTh = rep.prename_th ?? rep.prenameTh;
        const repPrenameEn = rep.prename_en ?? rep.prenameEn;
        const repPrenameOther = rep.prename_other ?? rep.prenameOther;

        // ตรวจสอบคำนำหน้าชื่อภาษาไทย (บังคับ)
        if (!repPrenameTh) {
          repError.prename_th = "กรุณาเลือกคำนำหน้าชื่อ";
        } else if (!/^[\u0E00-\u0E7F\.\s]+$/.test(repPrenameTh)) {
          repError.prename_th = "คำนำหน้าชื่อต้องเป็นภาษาไทยเท่านั้น";
        }

        // ตรวจสอบชื่อภาษาไทย
        if (!rep.firstNameThai) {
          repError.firstNameThai = "กรุณากรอกชื่อภาษาไทย";
        } else if (!/^[\u0E00-\u0E7F\s]+$/.test(rep.firstNameThai)) {
          repError.firstNameThai = "กรุณากรอกชื่อเป็นภาษาไทยเท่านั้น";
        }

        // ตรวจสอบนามสกุลภาษาไทย
        if (!rep.lastNameThai) {
          repError.lastNameThai = "กรุณากรอกนามสกุลภาษาไทย";
        } else if (!/^[\u0E00-\u0E7F\s]+$/.test(rep.lastNameThai)) {
          repError.lastNameThai = "กรุณากรอกนามสกุลเป็นภาษาไทยเท่านั้น";
        }

        // prename และชื่อ-สกุลภาษาอังกฤษ: ไม่บังคับสำหรับผู้แทน แต่ตรวจรูปแบบเมื่อมีค่า
        if (repPrenameTh && !/^[\u0E00-\u0E7F\.\s]+$/.test(repPrenameTh)) {
          repError.prename_th = "คำนำหน้าชื่อต้องเป็นภาษาไทยเท่านั้น";
        }
        if (repPrenameEn && !/^[A-Za-z\.\s]+$/.test(repPrenameEn)) {
          repError.prename_en = "คำนำหน้าชื่อต้องเป็นภาษาอังกฤษเท่านั้น";
        }
        if (repPrenameTh === "อื่นๆ" || (repPrenameEn && repPrenameEn.toLowerCase() === "other")) {
          if (!repPrenameOther || repPrenameOther.trim() === "") {
            repError.prename_other = "กรุณาระบุคำนำหน้าชื่อ (อื่นๆ)";
          } else if (!/^[\u0E00-\u0E7F\.\s]+$/.test(repPrenameOther)) {
            repError.prename_other = "คำนำหน้าชื่อ (อื่นๆ) ต้องเป็นภาษาไทยเท่านั้น";
          }
        }

        if (rep.firstNameEnglish && !/^[a-zA-Z\s]+$/.test(rep.firstNameEnglish)) {
          repError.firstNameEnglish = "กรุณากรอกชื่อเป็นภาษาอังกฤษเท่านั้น";
        }

        if (rep.lastNameEnglish && !/^[a-zA-Z\s]+$/.test(rep.lastNameEnglish)) {
          repError.lastNameEnglish = "กรุณากรอกนามสกุลเป็นภาษาอังกฤษเท่านั้น";
        }

        // ตรวจสอบอีเมล
        if (!rep.email) {
          repError.email = "กรุณากรอกอีเมล";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rep.email)) {
          repError.email = "รูปแบบอีเมลไม่ถูกต้อง";
        }

        // ตรวจสอบเบอร์โทรศัพท์
        if (!rep.phone) {
          repError.phone = "กรุณากรอกเบอร์โทรศัพท์";
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
  } else if (step === 3) {
    // ตรวจสอบข้อมูลธุรกิจ
    if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) {
      errors.businessTypes = "กรุณาเลือกประเภทธุรกิจอย่างน้อย 1 ข้อ";
    }

    // ถ้าเลือก "อื่นๆ" ต้องกรอกรายละเอียด
    if (
      formData.businessTypes?.other &&
      (!formData.otherBusinessTypeDetail || formData.otherBusinessTypeDetail.trim() === "")
    ) {
      errors.otherBusinessTypeDetail = "กรุณาระบุรายละเอียดประเภทธุรกิจอื่นๆ";
    }

    // ตรวจสอบจำนวนพนักงาน (ยังคงบังคับกรอก)
    if (!formData.numberOfEmployees) errors.numberOfEmployees = "กรุณากรอกจำนวนพนักงาน";

    // หมายเหตุ: ข้อมูลทางการเงินไม่บังคับกรอก (ทุนจดทะเบียน, รายได้, สัดส่วนผู้ถือหุ้น)

    // ตรวจสอบผลิตภัณฑ์/บริการ
    if (!formData.products || formData.products.length === 0) {
      errors.products = "กรุณาระบุผลิตภัณฑ์/บริการอย่างน้อย 1 รายการ";
    } else {
      // ตรวจสอบข้อมูลผลิตภัณฑ์/บริการแต่ละรายการ
      const productErrors = [];
      let hasValidProduct = false;

      formData.products.forEach((product, index) => {
        const prodError = {};

        // ตรวจสอบชื่อผลิตภัณฑ์/บริการภาษาไทย (บังคับ)
        if (!product.nameTh || product.nameTh.trim() === "") {
          prodError.nameTh = "กรุณากรอกชื่อผลิตภัณฑ์/บริการภาษาไทย";
        } else {
          // มีอย่างน้อย 1 รายการที่มีชื่อภาษาไทย
          hasValidProduct = true;
        }

        // ชื่อผลิตภัณฑ์/บริการภาษาอังกฤษ: ไม่บังคับกรอก

        // เพิ่มข้อผิดพลาดของผลิตภัณฑ์/บริการรายการนี้เข้าไปใน array หากมี
        if (Object.keys(prodError).length > 0) {
          productErrors[index] = prodError;
        }
      });

      // ถ้าไม่มีผลิตภัณฑ์ที่มีชื่อภาษาไทยเลย
      if (!hasValidProduct) {
        errors.products = "กรุณาระบุชื่อผลิตภัณฑ์/บริการภาษาไทยอย่างน้อย 1 รายการ";
      }

      // ถ้ามีข้อผิดพลาดในผลิตภัณฑ์/บริการรายการใดรายการหนึ่ง
      if (productErrors.length > 0) {
        errors.productErrors = productErrors; // เก็บรายละเอียดข้อผิดพลาดไว้ในตัวแปรแยก
      }
    }
  } else if (step === 4) {
    // ตรวจสอบประเภทโรงงานที่เลือก
    if (!formData.factoryType) {
      errors.factoryType = "กรุณาเลือกประเภทโรงงาน";
    } else {
      // ตรวจสอบเอกสารตามประเภทโรงงาน
      if (formData.factoryType === "type1") {
        // ประเภทที่ 1: ต้องมีอย่างน้อย 1 ไฟล์ (ใบอนุญาตประกอบกิจการโรงงาน รง.4 หรือ ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม กนอ.)
        if (!formData.factoryLicense && !formData.industrialEstateLicense) {
          errors.documents =
            "กรุณาอัพโหลดเอกสารอย่างน้อย 1 ไฟล์ (ใบอนุญาตประกอบกิจการโรงงาน รง.4 หรือ ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม กนอ.)";
        }
      } else if (formData.factoryType === "type2") {
        // ประเภทที่ 2: ต้องมีรูปถ่ายเครื่องจักร อุปกรณ์ กระบวนการผลิต และสถานที่ผลิต
        if (!formData.productionImages || formData.productionImages.length === 0) {
          errors.productionImages =
            "กรุณาอัพโหลดรูปถ่ายเครื่องจักร อุปกรณ์ กระบวนการผลิต หรือสถานที่ผลิต";
        }
      }
    }

    // ตรวจสอบเอกสารที่จำเป็น (บังคับทุกกรณี)
    if (!formData.companyStamp) {
      errors.companyStamp = "กรุณาอัพโหลดรูปตราประทับบริษัท (หรือรูปลายเซ็นหากไม่มีตราประทับ)";
    }

    if (!formData.authorizedSignature) {
      errors.authorizedSignature = "กรุณาอัพโหลดรูปลายเซ็นผู้มีอำนาจลงนาม";
    }

    // ตรวจสอบชื่อผู้มีอำนาจลงนาม
    if (!formData.authorizedSignatoryFirstNameTh) {
      errors.authorizedSignatoryFirstNameTh = "กรุณากรอกชื่อผู้มีอำนาจลงนาม (ภาษาไทย)";
    } else if (!/^[ก-๙\s]+$/.test(formData.authorizedSignatoryFirstNameTh)) {
      errors.authorizedSignatoryFirstNameTh = "ชื่อภาษาไทยต้องเป็นภาษาไทยและช่องว่างเท่านั้น";
    }

    if (!formData.authorizedSignatoryLastNameTh) {
      errors.authorizedSignatoryLastNameTh = "กรุณากรอกนามสกุลผู้มีอำนาจลงนาม (ภาษาไทย)";
    } else if (!/^[ก-๙\s]+$/.test(formData.authorizedSignatoryLastNameTh)) {
      errors.authorizedSignatoryLastNameTh = "นามสกุลภาษาไทยต้องเป็นภาษาไทยและช่องว่างเท่านั้น";
    }

    if (!formData.authorizedSignatoryFirstNameEn) {
      errors.authorizedSignatoryFirstNameEn = "กรุณากรอกชื่อผู้มีอำนาจลงนาม (ภาษาอังกฤษ)";
    } else if (!/^[A-Za-z\s]+$/.test(formData.authorizedSignatoryFirstNameEn)) {
      errors.authorizedSignatoryFirstNameEn = "ชื่อภาษาอังกฤษต้องเป็นภาษาอังกฤษและช่องว่างเท่านั้น";
    }

    if (!formData.authorizedSignatoryLastNameEn) {
      errors.authorizedSignatoryLastNameEn = "กรุณากรอกนามสกุลผู้มีอำนาจลงนาม (ภาษาอังกฤษ)";
    } else if (!/^[A-Za-z\s]+$/.test(formData.authorizedSignatoryLastNameEn)) {
      errors.authorizedSignatoryLastNameEn =
        "นามสกุลภาษาอังกฤษต้องเป็นภาษาอังกฤษและช่องว่างเท่านั้น";
    }

    // ตรวจสอบตำแหน่งผู้มีอำนาจลงนาม (ภาษาไทย) - บังคับกรอก
    if (!formData.authorizedSignatoryPositionTh) {
      errors.authorizedSignatoryPositionTh = "กรุณากรอกตำแหน่งผู้มีอำนาจลงนาม (ภาษาไทย)";
    }

    // ตรวจสอบตำแหน่งผู้มีอำนาจลงนาม (ภาษาอังกฤษ) - ไม่บังคับกรอก แต่ตรวจสอบรูปแบบถ้ามีค่า
    if (
      formData.authorizedSignatoryPositionEn &&
      !/^[A-Za-z\s]+$/.test(formData.authorizedSignatoryPositionEn)
    ) {
      errors.authorizedSignatoryPositionEn =
        "ตำแหน่งภาษาอังกฤษต้องเป็นภาษาอังกฤษและช่องว่างเท่านั้น";
    }
  }

  return errors;
};
