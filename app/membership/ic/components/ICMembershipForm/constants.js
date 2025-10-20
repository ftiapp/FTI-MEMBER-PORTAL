// ICMembershipForm_Constants.js
// Constants for IC Form

export const STEPS = [
  { id: 1, name: "ข้อมูลผู้สมัคร" },
  { id: 2, name: "ข้อมูลผู้แทน" },
  { id: 3, name: "ข้อมูลธุรกิจ" },
  { id: 4, name: "อัพโหลดเอกสาร" },
  { id: 5, name: "ยืนยันข้อมูล" },
];

export const INITIAL_FORM_DATA = {
  // Applicant info
  idCardNumber: "",
  // Prename fields (applicant) - using snake_case to match validation
  prename_th: "",
  prename_en: "",
  prename_other: "",
  prename_other_en: "",
  firstNameThai: "",
  lastNameThai: "",
  firstNameEng: "",
  lastNameEng: "",
  phone: "",
  phoneExtension: "",
  email: "",

  // Multi-address support
  addresses: {
    "1": {}, // ที่อยู่สำนักงาน
    "2": {}, // ที่อยู่จัดส่งเอกสาร  
    "3": {}, // ที่อยู่ใบกำกับภาษี
  },

  // Industrial group and provincial chapter
  industrialGroupId: "",
  provincialChapterId: "",
  website: "",

  // Representative info (only one allowed)
  representative: {
    prename_th: "",
    prename_en: "",
    prename_other: "",
    prename_other_en: "",
    firstNameThai: "",
    lastNameThai: "",
    firstNameEng: "",
    lastNameEng: "",
    email: "",
    phone: "",
    phoneExtension: "",
  },

  // Business info
  businessTypes: {},
  otherBusinessTypeDetail: "",
  products: [{ id: 1, nameTh: "", nameEn: "" }],

  // Documents
  idCardDocument: null,
  authorizedSignature: null,

  // Authorized signatory name fields
  authorizedSignatoryPrenameTh: "",
  authorizedSignatoryPrenameEn: "",
  authorizedSignatoryPrenameOther: "",
  authorizedSignatoryPrenameOtherEn: "",
  authorizedSignatoryFirstNameTh: "",
  authorizedSignatoryLastNameTh: "",
  authorizedSignatoryFirstNameEn: "",
  authorizedSignatoryLastNameEn: "",
};

export const STICKY_HEADER_OFFSET = 120;

// Field mapping for error messages
export const FIELD_ERROR_MAP = {
  'idCardNumber': 'เลขบัตรประชาชน',
  'prename_th': 'คำนำหน้าชื่อ (ไทย)',
  'prename_en': 'คำนำหน้าชื่อ (อังกฤษ)',
  'prename_other': 'คำนำหน้าชื่อ (อื่นๆ)',
  'prename_other_en': 'คำนำหน้าชื่อ (Other)',
  'firstNameThai': 'ชื่อ (ไทย)',
  'lastNameThai': 'นามสกุล (ไทย)',
  'firstNameEng': 'ชื่อ (อังกฤษ)',  
  'lastNameEng': 'นามสกุล (อังกฤษ)',
  'email': 'อีเมล',
  'phone': 'เบอร์โทรศัพท์',
  'phoneExtension': 'ต่อ',
  'addressNumber': 'บ้านเลขที่',
  'building': 'อาคาร',
  'moo': 'หมู่',
  'soi': 'ซอย',
  'street': 'ถนน',
  'subDistrict': 'ตำบล/แขวง',
  'district': 'อำเภอ/เขต',
  'province': 'จังหวัด',
  'postalCode': 'รหัสไปรษณีย์',
  'website': 'เว็บไซต์',
  'businessTypes': 'ประเภทธุรกิจ',
  'otherBusinessTypeDetail': 'ประเภทธุรกิจอื่นๆ',
  'products': 'สินค้า/บริการ',
  'productErrors': 'สินค้า/บริการ',
  'idCardDocument': 'สำเนาบัตรประชาชน',
  'authorizedSignature': 'ลายเซ็นผู้มีอำนาจ',
  'authorizedSignatoryFirstNameTh': 'ชื่อผู้มีอำนาจลงนาม',
  'authorizedSignatoryLastNameTh': 'นามสกุลผู้มีอำนาจลงนาม',
  'authorizedSignatoryPrenameTh': 'คำนำหน้าผู้มีอำนาจลงนาม',
  'authorizedSignatoryPrenameOther': 'คำนำหน้า (อื่นๆ)',
  'authorizedSignatoryPrenameEn': 'คำนำหน้า (อังกฤษ)',
  'authorizedSignatoryPrenameOtherEn': 'คำนำหน้า (Other)',
  'authorizedSignatoryPositionTh': 'ตำแหน่งผู้มีอำนาจลงนาม'
};
