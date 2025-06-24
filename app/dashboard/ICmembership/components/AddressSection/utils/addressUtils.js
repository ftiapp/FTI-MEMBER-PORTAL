// ฟังก์ชันตรวจสอบว่าข้อมูลที่อยู่ครบถ้วนหรือไม่
export const isAddressComplete = (formData) => {
    return formData.addressSubdistrict && 
           formData.addressDistrict && 
           formData.addressProvince && 
           formData.addressPostalCode;
  };
  
  // ฟังก์ชันตรวจสอบว่ามีข้อมูลที่อยู่บางส่วนหรือไม่
  export const hasPartialAddressData = (formData) => {
    return formData.addressDistrict || formData.addressProvince;
  };
  
  // สร้าง synthetic event
  export const createSyntheticEvent = (name, value) => ({
    target: { name, value },
    preventDefault: () => {}
  });
  
  // ตรวจสอบว่าเป็นตัวเลขเท่านั้น
  export const isNumericOnly = (value) => {
    return /^\d*$/.test(value);
  };
  
  // จัดการการเปลี่ยนแปลงของฟิลด์ที่อยู่
  export const handleAddressFieldChange = (e, handleChange, searchFunction) => {
    const { value } = e.target;
    
    // เรียกใช้ handleChange ปกติก่อน
    handleChange(e);
    
    // เรียกใช้ฟังก์ชันค้นหา
    if (searchFunction) {
      searchFunction(value);
    }
  };
  
  // จัดการการเปลี่ยนแปลงของรหัสไปรษณีย์
  export const handlePostalCodeFieldChange = (e, handleChange, searchFunction) => {
    const { value } = e.target;
    
    // ตรวจสอบว่าเป็นตัวเลขเท่านั้น
    if (!isNumericOnly(value)) {
      return;
    }
    
    // เรียกใช้ handleChange ปกติก่อน
    handleChange(e);
    
    // เรียกใช้ฟังก์ชันค้นหา
    if (searchFunction) {
      searchFunction(value);
    }
  };