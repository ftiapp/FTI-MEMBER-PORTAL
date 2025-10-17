/**
 * Utility functions สำหรับจัดการที่อยู่
 */

/**
 * คอนฟิกประเภทที่อยู่
 */
export const ADDRESS_TYPES = {
  1: { label: "ที่อยู่สำนักงาน / Office Address", color: "blue", description: "ที่อยู่สำนักงานหลัก / Main office address" },
  2: { label: "ที่อยู่จัดส่งเอกสาร / Mailing Address", color: "blue", description: "ที่อยู่สำหรับการจัดส่งเอกสาร / Address for document delivery" },
  3: { label: "ที่อยู่ใบกำกับภาษี / Tax Invoice Address", color: "blue", description: "ที่อยู่ตามใบกำกับภาษี / Address on tax invoice" },
};

/**
 * ฟังก์ชันสำหรับ initialize ข้อมูลที่อยู่
 */
export const initializeAddresses = () => ({
  1: { addressType: "1" },
  2: { addressType: "2" },
  3: { addressType: "3" },
});

/**
 * ฟังก์ชันสำหรับคัดลอกที่อยู่
 * @param {Object} sourceAddress - ที่อยู่ต้นทาง
 * @param {string} targetType - ประเภทที่อยู่ปลายทาง
 * @returns {Object} ที่อยู่ที่คัดลอกแล้ว
 */
export const copyAddress = (sourceAddress, targetType) => {
  if (!sourceAddress) {
    return null;
  }

  // สร้าง deep copy
  const addressCopy = JSON.parse(JSON.stringify(sourceAddress));

  // อัพเดท addressType
  addressCopy.addressType = targetType;

  // จัดการ dynamic contact fields (phone, email, website)
  // ลบ keys ที่มี suffix ของ source type
  const keysToRemap = Object.keys(addressCopy).filter(
    (key) => key.match(/-(1|2|3)$/)
  );

  keysToRemap.forEach((key) => {
    const baseKey = key.replace(/-(1|2|3)$/, "");
    const newKey = `${baseKey}-${targetType}`;
    addressCopy[newKey] = addressCopy[key];
    delete addressCopy[key];
  });

  return addressCopy;
};

/**
 * ฟังก์ชันสำหรับดึงข้อมูลที่อยู่ปัจจุบัน
 * @param {Object} addresses - ข้อมูลที่อยู่ทั้งหมด
 * @param {string} activeTab - แท็บที่เลือกอยู่
 * @returns {Object} ข้อมูลที่อยู่ปัจจุบัน
 */
export const getCurrentAddress = (addresses, activeTab) => {
  return addresses?.[activeTab] || { addressType: activeTab };
};

/**
 * ฟังก์ชันสำหรับตรวจสอบว่ามี error ในที่อยู่หรือไม่
 * @param {Object} errors - ข้อผิดพลาดทั้งหมด
 * @param {string} addressType - ประเภทที่อยู่
 * @returns {boolean} มี error หรือไม่
 */
export const hasAddressErrors = (errors, addressType) => {
  if (!errors) return false;

  // ตรวจสอบ flattened keys (addresses.1.field)
  const flatKeys = Object.keys(errors).filter((key) =>
    key.startsWith(`addresses.${addressType}.`)
  );
  if (flatKeys.length > 0) return true;

  // ตรวจสอบ nested structure (errors.addresses[1])
  if (errors.addresses && errors.addresses[addressType]) {
    return Object.keys(errors.addresses[addressType]).length > 0;
  }

  return false;
};

/**
 * ฟังก์ชันสำหรับหา tab แรกที่มี error
 * @param {Object} errors - ข้อผิดพลาดทั้งหมด
 * @returns {string|null} tab ที่มี error หรือ null
 */
export const findFirstErrorTab = (errors) => {
  if (!errors) return null;

  // ตรวจสอบ IC format: address_1_field, address_2_field
  const icKeys = Object.keys(errors).filter((key) => /^address_\d+_/.test(key));
  if (icKeys.length > 0) {
    const match = icKeys[0].match(/^address_(\d+)_/);
    if (match && match[1]) {
      return match[1];
    }
  }

  // ตรวจสอบ OC format: addresses.1.field
  const flatKeys = Object.keys(errors).filter((key) => key.startsWith("addresses."));
  if (flatKeys.length > 0) {
    const match = flatKeys[0].match(/addresses\.(\d+)\./);
    if (match && match[1]) {
      return match[1];
    }
  }

  // ตรวจสอบ nested structure
  if (errors.addresses && typeof errors.addresses === "object") {
    const typeKeys = ["1", "2", "3"];
    for (const type of typeKeys) {
      if (errors.addresses[type] && Object.keys(errors.addresses[type]).length > 0) {
        return type;
      }
    }
  }

  return null;
};

/**
 * ฟังก์ชันสำหรับ scroll ไปยัง address section
 */
export const scrollToAddressSection = () => {
  setTimeout(() => {
    const addressSection =
      document.querySelector('[data-section="company-address"]') ||
      document.querySelector('[data-section="addresses"]') ||
      document.querySelector(".company-address") ||
      document.querySelector(".bg-white");
    
    if (addressSection) {
      addressSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 100);
};

/**
 * ฟังก์ชันสำหรับสร้าง error signature
 * @param {Object} errors - ข้อผิดพลาดทั้งหมด
 * @returns {string} error signature
 */
export const createErrorSignature = (errors) => {
  if (!errors) return "";

  const addressKeys = Object.keys(errors).filter(
    (key) => key.startsWith("addresses.") || /^address_\d+_/.test(key)
  );

  return addressKeys.sort().join("|");
};
