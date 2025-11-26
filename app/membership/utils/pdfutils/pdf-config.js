// pdf-config.js - ค่าคงที่และการตั้งค่า

export const PDF_CONFIG = {
  // การตั้งค่า PDF
  margin: 3,
  imageQuality: 0.95,
  scale: 2,
  imageTimeout: 15000,
  format: 'a4',
  orientation: 'portrait',
  
  // ข้อจำกัดการแสดงผล
  MAX_PRODUCTS_DISPLAY: 12,
  MAX_GROUPS_DISPLAY: 10,
  MAX_CHAPTERS_DISPLAY: 10,
  
  // URL และ path
  FTI_LOGO_PATH: '/FTI-MasterLogo_RGB_forLightBG.png',
};

export const FORM_TITLES = {
  ic: 'ใบสมัครสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย',
  oc: 'ใบสมัครสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย',
  ac: 'ใบสมัครสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย',
  am: 'ใบสมัครสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย',
};

export const BUSINESS_TYPE_NAMES = {
  manufacturer: 'ผู้ผลิต',
  distributor: 'ผู้จัดจำหน่าย',
  importer: 'ผู้นำเข้า',
  exporter: 'ผู้ส่งออก',
  service: 'ผู้ให้บริการ',
  service_provider: 'ผู้ให้บริการ',
  other: 'อื่นๆ',
};

export const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export const DOCUMENT_ALIASES = {
  authorizedSignature: [
    'authorizedSignature',
    'authorizedSignatures',
    'authorized_signature',
    'signature',
    'authorizedSign',
  ],
  companyStamp: ['companyStamp', 'company_stamp', 'stamp'],
};