'use client';

/**
 * ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูลในฟอร์มสมัครสมาชิกประเภท AC (สมทบ-นิติบุคคล)
 * @param {Object} formData ข้อมูลฟอร์มทั้งหมด
 * @param {number} step ขั้นตอนปัจจุบันที่ต้องการตรวจสอบ
 * @returns {Object} ข้อความแสดงข้อผิดพลาด (ถ้ามี)
 */
export const validateACForm = (formData, step) => {
  const errors = {};
  
  if (step === 1) {
    // ตรวจสอบข้อมูลบริษัท
    if (!formData.companyName) errors.companyName = 'กรุณากรอกชื่อบริษัท';
    
    if (!formData.taxId) {
      errors.taxId = 'กรุณากรอกเลขประจำตัวผู้เสียภาษี';
    } else if (formData.taxId.length !== 13) {
      errors.taxId = 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก';
    } else if (!/^\d+$/.test(formData.taxId)) {
      errors.taxId = 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลขเท่านั้น';
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
      // เตรียม object เก็บข้อผิดพลาดแบบซ้อนภายในให้ตรงกับ UI (errors.addresses[type].field)
      errors.addresses = errors.addresses || {};
      let hasAddressErrors = false;

      // ตรวจสอบ multi-address format
      addressTypes.forEach(type => {
        const address = formData.addresses[type];
        const label = addressLabels[type];
        // เตรียมที่เก็บ error ของ address แต่ละประเภท
        if (!errors.addresses[type]) errors.addresses[type] = {};
        
        if (!address) {
          errors.addresses[type].base = `กรุณากรอก${label}`;
          hasAddressErrors = true;
          return;
        }

        if (!address.addressNumber) {
          errors.addresses[type].addressNumber = `กรุณากรอกเลขที่ (${label})`;
          hasAddressErrors = true;
        }

        if (!address.subDistrict) {
          errors.addresses[type].subDistrict = `กรุณากรอกตำบล/แขวง (${label})`;
          hasAddressErrors = true;
        }

        if (!address.district) {
          errors.addresses[type].district = `กรุณากรอกอำเภอ/เขต (${label})`;
          hasAddressErrors = true;
        }

        if (!address.province) {
          errors.addresses[type].province = `กรุณากรอกจังหวัด (${label})`;
          hasAddressErrors = true;
        }

        if (!address.postalCode) {
          errors.addresses[type].postalCode = `กรุณากรอกรหัสไปรษณีย์ (${label})`;
          hasAddressErrors = true;
        } else if (address.postalCode.length !== 5 || !/^\d+$/.test(address.postalCode)) {
          errors.addresses[type].postalCode = `รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก (${label})`;
          hasAddressErrors = true;
        }

        // ตรวจสอบอีเมลบริษัทของที่อยู่นั้น (companyEmail) บังคับกรอก
        if (!address.companyEmail) {
          errors.addresses[type].companyEmail = `กรุณากรอกอีเมล (${label})`;
          hasAddressErrors = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.companyEmail)) {
          errors.addresses[type].companyEmail = `รูปแบบอีเมลไม่ถูกต้อง (${label})`;
          hasAddressErrors = true;
        }

        // ตรวจสอบเบอร์โทรศัพท์บริษัทของที่อยู่นั้น (companyPhone) บังคับกรอก
        if (!address.companyPhone) {
          errors.addresses[type].companyPhone = `กรุณากรอกเบอร์โทรศัพท์ (${label})`;
          hasAddressErrors = true;
        } else if (!/^\d{9,10}$/.test(String(address.companyPhone).replace(/[-\s]/g, ''))) {
          errors.addresses[type].companyPhone = `รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (${label})`;
          hasAddressErrors = true;
        }
      });

      // เพิ่มข้อความสรุปเพื่อแสดงใน Alert ด้านบน (หลีกเลี่ยง [object Object])
      if (hasAddressErrors) {
        // ใช้คีย์ _error เพื่อให้ renderer แสดงข้อความสรุป
        errors.addresses._error = 'กรุณาตรวจสอบข้อมูลที่อยู่ทั้ง 3 ประเภทให้ครบถ้วน';
      }
    } else {
      // Fallback สำหรับ single address format เก่า
      if (!formData.addressNumber) errors.addressNumber = 'กรุณากรอกเลขที่';
      if (!formData.subDistrict) errors.subDistrict = 'กรุณากรอกตำบล/แขวง';
      if (!formData.district) errors.district = 'กรุณากรอกอำเภอ/เขต';
      if (!formData.province) errors.province = 'กรุณากรอกจังหวัด';
      if (!formData.postalCode) {
        errors.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
      } else if (formData.postalCode.length !== 5 || !/^\d+$/.test(formData.postalCode)) {
        errors.postalCode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
      }
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

        // Email is optional, but validate format if provided
        if (mainContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mainContact.email)) {
          errors.contactPerson0Email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }

        if (!mainContact.phone) {
          errors.contactPerson0Phone = 'กรุณากรอกเบอร์โทรศัพท์ผู้ประสานงาน';
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
        
        // Normalize prename fields from UI (camelCase) or legacy (snake_case)
        const prenameTh = rep.prenameTh ?? rep.prename_th ?? '';
        const prenameEn = rep.prenameEn ?? rep.prename_en ?? '';
        const prenameOther = rep.prenameOther ?? rep.prename_other ?? '';

        // ตรวจสอบคำนำหน้าชื่อ (ภาษาไทย)
        if (!prenameTh) {
          repError.prename_th = 'กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)';
        } else if (!/^[ก-๙\.\s]+$/.test(prenameTh)) {
          repError.prename_th = 'คำนำหน้าชื่อต้องเป็นภาษาไทยเท่านั้น';
        }

        // ตรวจสอบคำนำหน้าชื่อ (ภาษาอังกฤษ)
        if (!prenameEn) {
          repError.prename_en = 'กรุณาเลือกคำนำหน้าชื่อ (ภาษาอังกฤษ)';
        } else if (!/^[A-Za-z\.\s]+$/.test(prenameEn)) {
          repError.prename_en = 'คำนำหน้าชื่อต้องเป็นภาษาอังกฤษเท่านั้น';
        }

        // ตรวจสอบกรณีเลือก "อื่นๆ/Other" ต้องระบุรายละเอียด
        if ((prenameTh === 'อื่นๆ' || (prenameEn && prenameEn.toLowerCase() === 'other')) && !prenameOther) {
          repError.prename_other = 'กรุณาระบุคำนำหน้าชื่อ (อื่นๆ)';
        }

        // ตรวจสอบชื่อภาษาไทย - ใช้ regex ที่ตรงกับ component
        if (!rep.firstNameTh || rep.firstNameTh.trim() === '') {
          repError.firstNameTh = 'กรุณากรอกชื่อภาษาไทย';
        } else if (!/^[ก-๙\s]+$/.test(rep.firstNameTh)) {
          repError.firstNameTh = 'กรุณากรอกเฉพาะภาษาไทยเท่านั้น';
        }
        
        // ตรวจสอบนามสกุลภาษาไทย - ใช้ regex ที่ตรงกับ component
        if (!rep.lastNameTh || rep.lastNameTh.trim() === '') {
          repError.lastNameTh = 'กรุณากรอกนามสกุลภาษาไทย';
        } else if (!/^[ก-๙\s]+$/.test(rep.lastNameTh)) {
          repError.lastNameTh = 'กรุณากรอกเฉพาะภาษาไทยเท่านั้น';
        }
        
        // ตรวจสอบชื่อภาษาอังกฤษ - ใช้ regex ที่ตรงกับ component
        if (!rep.firstNameEn || rep.firstNameEn.trim() === '') {
          repError.firstNameEn = 'กรุณากรอกชื่อภาษาอังกฤษ';
        } else if (!/^[a-zA-Z\s]+$/.test(rep.firstNameEn)) {
          repError.firstNameEn = 'กรุณากรอกเฉพาะภาษาอังกฤษเท่านั้น';
        }
        
        // ตรวจสอบนามสกุลภาษาอังกฤษ - ใช้ regex ที่ตรงกับ component
        if (!rep.lastNameEn || rep.lastNameEn.trim() === '') {
          repError.lastNameEn = 'กรุณากรอกนามสกุลภาษาอังกฤษ';
        } else if (!/^[a-zA-Z\s]+$/.test(rep.lastNameEn)) {
          repError.lastNameEn = 'กรุณากรอกเฉพาะภาษาอังกฤษเท่านั้น';
        }
        
        // ตรวจสอบอีเมล - ใช้ข้อความที่ตรงกับ component
        if (!rep.email || rep.email.trim() === '') {
          repError.email = 'กรุณากรอกอีเมล';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rep.email)) {
          repError.email = 'รูปแบบอีเมลไม่ถูกต้อง'; // เปลี่ยนจาก 'กรุณากรอกอีเมลให้ถูกต้อง'
        }
        
        // ตรวจสอบเบอร์โทรศัพท์ - ใช้ regex ที่ตรงกับ component
        if (!rep.phone || rep.phone.trim() === '') {
          repError.phone = 'กรุณากรอกเบอร์โทรศัพท์';
        } else {
          // ใช้ regex ที่ตรงกับ component: /^[0-9\-\s\+\(\)]{10,15}$/
          if (!/^[0-9\-\s\+\(\)]{10,15}$/.test(rep.phone)) {
            repError.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง'; // เปลี่ยนจาก 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง'
          }
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
    
    // ตรวจสอบจำนวนพนักงาน
    if (!formData.numberOfEmployees && formData.numberOfEmployees !== 0) {
      errors.numberOfEmployees = 'กรุณาระบุจำนวนพนักงาน';
    } else if (formData.numberOfEmployees < 0) {
      errors.numberOfEmployees = 'จำนวนพนักงานต้องไม่น้อยกว่า 0';
    }
    
    // ตรวจสอบผลิตภัณฑ์/บริการ
    if (!formData.products || formData.products.length === 0) {
      errors.products = 'กรุณาระบุผลิตภัณฑ์/บริการอย่างน้อย 1 รายการ';
    } else {
      // ตรวจสอบว่ามีผลิตภัณฑ์อย่างน้อย 1 รายการที่มีชื่อภาษาไทย
      const validThaiProducts = formData.products.filter(product => product.nameTh && product.nameTh.trim() !== '');
      if (validThaiProducts.length === 0) {
        errors.products = 'กรุณาระบุชื่อผลิตภัณฑ์/บริการภาษาไทยอย่างน้อย 1 รายการ';
      }
    }
    
    // หมายเหตุ: ข้อมูลทางการเงินทั้งหมดเป็นข้อมูลที่ไม่บังคับกรอก ได้แก่
    // - registeredCapital (ทุนจดทะเบียน)
    // - revenueLastYear, revenuePreviousYear (รายได้รวมย้อนหลัง)
    // - productionCapacityValue, productionCapacityUnit (กำลังการผลิต)
    // - salesDomestic, salesExport (ยอดจำหน่าย)
    // - shareholderThaiPercent, shareholderForeignPercent (สัดส่วนผู้ถือหุ้น)
  }
  
  else if (step === 4) {
    // ตรวจสอบเอกสารแนบ - เฉพาะสำเนาหนังสือรับรองการจดทะเบียนนิติบุคคลเท่านั้น
    if (!formData.companyRegistration) errors.companyRegistration = 'กรุณาอัพโหลดสำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล';
    
    // ตรวจสอบเอกสารที่จำเป็น (บังคับทุกกรณี)
    if (!formData.companyStamp) {
      errors.companyStamp = 'กรุณาอัพโหลดรูปตราประทับบริษัท (หรือรูปลายเซ็นหากไม่มีตราประทับ)';
    }
    
    if (!formData.authorizedSignature) {
      errors.authorizedSignature = 'กรุณาอัพโหลดรูปลายเซ็นผู้มีอำนาจลงนาม';
    }
  }
  
  return errors;
};