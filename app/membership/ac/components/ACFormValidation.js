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
        
        // ตรวจสอบชื่อภาษาไทย - แก้ไข regex ให้ตรงกับ component
        if (!rep.firstNameThai || rep.firstNameThai.trim() === '') {
          repError.firstNameThai = 'กรุณากรอกชื่อภาษาไทย';
        } else if (!/^[ก-๙\s]+$/.test(rep.firstNameThai)) {
          repError.firstNameThai = 'กรุณากรอกเฉพาะภาษาไทยเท่านั้น';
        }
        
        // ตรวจสอบนามสกุลภาษาไทย - แก้ไข regex ให้ตรงกับ component
        if (!rep.lastNameThai || rep.lastNameThai.trim() === '') {
          repError.lastNameThai = 'กรุณากรอกนามสกุลภาษาไทย';
        } else if (!/^[ก-๙\s]+$/.test(rep.lastNameThai)) {
          repError.lastNameThai = 'กรุณากรอกเฉพาะภาษาไทยเท่านั้น';
        }
        
        // ตรวจสอบชื่อภาษาอังกฤษ
        if (!rep.firstNameEng || rep.firstNameEng.trim() === '') {
          repError.firstNameEng = 'กรุณากรอกชื่อภาษาอังกฤษ';
        } else if (!/^[a-zA-Z\s]+$/.test(rep.firstNameEng)) {
          repError.firstNameEng = 'กรุณากรอกเฉพาะภาษาอังกฤษเท่านั้น';
        }
        
        // ตรวจสอบนามสกุลภาษาอังกฤษ
        if (!rep.lastNameEng || rep.lastNameEng.trim() === '') {
          repError.lastNameEng = 'กรุณากรอกนามสกุลภาษาอังกฤษ';
        } else if (!/^[a-zA-Z\s]+$/.test(rep.lastNameEng)) {
          repError.lastNameEng = 'กรุณากรอกเฉพาะภาษาอังกฤษเท่านั้น';
        }
        
        // ตรวจสอบอีเมล - แก้ไขข้อความให้ตรงกับ component
        if (!rep.email || rep.email.trim() === '') {
          repError.email = 'กรุณากรอกอีเมล';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rep.email)) {
          repError.email = 'กรุณากรอกอีเมลให้ถูกต้อง';
        }
        
        // ตรวจสอบเบอร์โทรศัพท์ - แก้ไขให้ตรงกับ component
        if (!rep.phone || rep.phone.trim() === '') {
          repError.phone = 'กรุณากรอกเบอร์โทรศัพท์';
        } else if (!/^[0-9]{9,10}$/.test(rep.phone.replace(/[- ]/g, ''))) {
          repError.phone = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง';
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
      // ตรวจสอบว่าผลิตภัณฑ์แต่ละรายการมีชื่อภาษาไทย
      const invalidProducts = formData.products.filter(product => !product.nameTh || product.nameTh.trim() === '');
      if (invalidProducts.length > 0) {
        errors.products = 'กรุณาระบุชื่อผลิตภัณฑ์/บริการภาษาไทยให้ครบทุกรายการ';
      }
    }
  }
  
  else if (step === 4) {
    // ตรวจสอบเอกสารแนบ
    if (!formData.companyRegistration) errors.companyRegistration = 'กรุณาอัพโหลดหนังสือรับรองบริษัท';
    if (!formData.companyProfile) errors.companyProfile = 'กรุณาอัพโหลด Company Profile';
    if (!formData.shareholderList) errors.shareholderList = 'กรุณาอัพโหลดบัญชีรายชื่อผู้ถือหุ้น';
    if (!formData.vatRegistration) errors.vatRegistration = 'กรุณาอัพโหลดใบทะเบียนภาษีมูลค่าเพิ่ม';
  }
  
  return errors;
};