// Status constants
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Status configuration for UI display
export const STATUS_CONFIG = {
  [STATUS.PENDING]: {
    text: 'รอพิจารณา',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800'
  },
  [STATUS.APPROVED]: {
    text: 'อนุมัติแล้ว',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800'
  },
  [STATUS.REJECTED]: {
    text: 'ปฏิเสธแล้ว',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800'
  },
  // Default fallback
  0: {
    text: 'ไม่ทราบสถานะ',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800'
  }
};

// Member types
export const MEMBER_TYPES = {
  ic: {
    code: 'ทบ',
    name: 'สมทบ-บุคคลธรรมดา'
  },
  oc: {
    code: 'สน',
    name: 'สามัญ-โรงงาน'
  },
  am: {
    code: 'สส',
    name: 'สามัญ-สมาคมการค้า'
  },
  ac: {
    code: 'ทน',
    name: 'สมทบ-นิติบุคคล'
  }
};

// Business types
export const BUSINESS_TYPES = {
  manufacturing: 'การผลิต',
  trading: 'การค้า',
  service: 'บริการ',
  agriculture: 'เกษตรกรรม',
  construction: 'ก่อสร้าง',
  technology: 'เทคโนโลยี',
  finance: 'การเงิน',
  healthcare: 'สุขภาพ',
  education: 'การศึกษา',
  transportation: 'การขนส่ง',
  energy: 'พลังงาน',
  mining: 'การขุดเจาะ',
  textile: 'สิ่งทอ',
  food: 'อาหาร',
  chemical: 'เคมี',
  automotive: 'ยานยนต์',
  electronics: 'อิเล็กทรอนิกส์',
  other: 'อื่นๆ'
};

// Factory types
export const FACTORY_TYPES = {
  1: 'โรงงานประเภท 1',
  2: 'โรงงานประเภท 2',
  3: 'โรงงานประเภท 3'
};

// Document types
export const DOCUMENT_TYPES = {
  company_registration: 'หนังสือรับรองการจดทะเบียนนิติบุคคล',
  tax_registration: 'ใบทะเบียนภาษีมูลค่าเพิ่ม',
  factory_license: 'ใบอนุญาตประกอบกิจการโรงงาน',
  business_license: 'ใบอนุญาตประกอบธุรกิจ',
  financial_statement: 'งบการเงิน',
  company_profile: 'โปรไฟล์บริษัท',
  product_catalog: 'แคตตาล็อกสินค้า',
  certification: 'ใบรับรองมาตรฐาน',
  other: 'เอกสารอื่นๆ'
};