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
    name: 'สมาชิกสามัญ - โรงงาน'
  },
  am: {
    code: 'สส',
    name: 'สมาชิกสามัญ-สมาคมการค้า'
  },
  ac: {
    code: 'ทน',
    name: 'สมทบ-นิติบุคคล'
  }
};

// Business types
export const BUSINESS_TYPES = {
  manufacturing: 'อุตสาหกรรมการผลิต',
  manufacturer: 'อุตสาหกรรมการผลิต',
  trading: 'การค้าขายและจำหน่าย',
  service: 'ธุรกิจบริการ',
  service_provider: 'ผู้ให้บริการ',
  agriculture: 'เกษตรกรรมและประมง',
  construction: 'ก่อสร้างและอสังหาริมทรัพย์',
  technology: 'เทคโนโลยีสารสนเทศ',
  finance: 'การเงินและธนาคาร',
  healthcare: 'สาธารณสุขและการแพทย์',
  education: 'การศึกษาและฝึกอบรม',
  transportation: 'การขนส่งและโลจิสติกส์',
  energy: 'พลังงานและสาธารณูปโภค',
  mining: 'การขุดเจาะและเหมืองแร่',
  textile: 'สิ่งทอและเครื่องนุ่งห่ม',
  food: 'อาหารและเครื่องดื่ม',
  chemical: 'เคมีภัณฑ์และปิโตรเคมี',
  automotive: 'ยานยนต์และชิ้นส่วน',
  electronics: 'อิเล็กทรอนิกส์และไฟฟ้า',
  exporter: 'ผู้ส่งออก',
  importer: 'ผู้นำเข้า',
  distributor: 'ผู้จัดจำหน่าย',
  other: 'อื่นๆ'
};

// Factory types
export const FACTORY_TYPES = {
  'type1': 'ประเภทที่ 1: มีเครื่องจักร มากกว่า 50 แรงม้า',
  'type2': 'ประเภทที่ 2: ไม่มีเครื่องจักร/มีเครื่องจักร ต่ำกว่า 50 แรงม้า',
  1: 'ประเภทที่ 1: มีเครื่องจักร มากกว่า 50 แรงม้า',
  2: 'ประเภทที่ 2: ไม่มีเครื่องจักร/มีเครื่องจักร ต่ำกว่า 50 แรงม้า'
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