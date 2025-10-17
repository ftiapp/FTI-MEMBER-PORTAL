// AMMembershipForm_Constants.js
// Constants for AM Membership Form

// ค่าคงที่สำหรับขั้นตอนต่างๆ
export const STEPS = [
  { id: 1, name: "ข้อมูลสมาคม" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

// ข้อมูลเริ่มต้นของฟอร์ม
export const INITIAL_FORM_DATA = {
  // ข้อมูลสมาคม
  associationName: "",
  associationNameEng: "",
  taxId: "",
  associationEmail: "",
  associationPhone: "",
  addressNumber: "",
  street: "",
  subDistrict: "",
  district: "",
  province: "",
  postalCode: "",

  // ข้อมูลผู้แทน
  representatives: [
    {
      idCardNumber: "",
      firstNameThai: "",
      lastNameThai: "",
      firstNameEnglish: "",
      lastNameEnglish: "",
      position: "",
      email: "",
      phone: "",
      isPrimary: true,
    },
  ],

  // ข้อมูลธุรกิจ
  businessTypes: [],
  otherBusinessType: "",
  products: "",
  memberCount: "", // จำนวนสมาชิกสมาคม

  // เอกสาร
  associationRegistration: null,
  associationProfile: null,
  memberList: null,
  vatRegistration: null,
  idCard: null,
  authorityLetter: null,

  // เอกสารที่จำเป็น (บังคับทุกกรณี)
  companyStamp: null,
  authorizedSignature: null,

  // ข้อมูลชื่อผู้มีอำนาจลงนาม
  authorizedSignatoryFirstNameTh: "",
  authorizedSignatoryLastNameTh: "",
  authorizedSignatoryFirstNameEn: "",
  authorizedSignatoryLastNameEn: "",
};

// Field mapping for error messages
export const FIELD_ERROR_MAP = {
  'prename_th': 'คำนำหน้าชื่อ (ไทย)',
  'prename_en': 'คำนำหน้าชื่อ (อังกฤษ)',
  'firstNameThai': 'ชื่อ (ไทย)',
  'lastNameThai': 'นามสกุล (ไทย)',
  'firstNameEnglish': 'ชื่อ (อังกฤษ)',
  'lastNameEnglish': 'นามสกุล (อังกฤษ)',
  'email': 'อีเมล',
  'phone': 'เบอร์โทรศัพท์',
  'position': 'ตำแหน่ง'
};

// Sticky header offset
export const STICKY_HEADER_OFFSET = 120;