// example.js - ตัวอย่างการใช้งาน PDF Generator

import { generateMembershipPDF, downloadMembershipPDF } from './pdf-generator.js';

// ===== ตัวอย่างที่ 1: ฟอร์ม IC (บุคคลธรรมดา) =====
const exampleIC = async () => {
  const icData = {
    // ข้อมูลส่วนตัว
    prename_th: 'นาย',
    first_name_th: 'สมชาย',
    last_name_th: 'ใจดี',
    prename_en: 'Mr.',
    first_name_en: 'Somchai',
    last_name_en: 'Jaidee',
    id_card: '1234567890123',
    
    // ติดต่อ
    phone: '081-234-5678',
    email: 'somchai@example.com',
    
    // ที่อยู่
    address_number: '123',
    moo: '5',
    soi: 'สุขุมวิท 71',
    street: 'ถนนสุขุมวิท',
    sub_district: 'พระโขนงเหนือ',
    district: 'วัฒนา',
    province: 'กรุงเทพมหานคร',
    postal_code: '10110',
    
    // ผู้แทน
    representatives: [
      {
        prename_th: 'นาย',
        first_name_th: 'สมชาย',
        last_name_th: 'ใจดี',
        prename_en: 'Mr.',
        first_name_en: 'Somchai',
        last_name_en: 'Jaidee',
        position: 'เจ้าของกิจการ',
        phone: '081-234-5678',
        email: 'somchai@example.com',
      }
    ],
    
    // ลายเซ็น
    documents: [
      {
        document_type: 'authorizedSignature',
        file_url: 'https://example.com/signature-somchai.png',
        mime_type: 'image/png',
      }
    ],
  };

  try {
    const result = await downloadMembershipPDF(icData, 'ic');
    console.log('✅ สร้าง PDF สำหรับ IC สำเร็จ:', result.filename);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
};

// ===== ตัวอย่างที่ 2: ฟอร์ม OC (โรงงาน) =====
const exampleOC = async () => {
  const ocData = {
    // ข้อมูลบริษัท
    company_name_th: 'บริษัท ผลิตภัณฑ์ตัวอย่าง จำกัด',
    company_name_en: 'Example Products Company Limited',
    tax_id: '0123456789012',
    
    // ติดต่อ
    phone: '02-123-4567',
    phone_extension: '101',
    email: 'info@example.com',
    website: 'www.example.com',
    
    // ที่อยู่หลัก
    addresses: [
      {
        address_type: '1',
        address_number: '99',
        moo: '3',
        soi: 'ลาดพร้าว 101',
        street: 'ถนนลาดพร้าว',
        sub_district: 'คลองเจ้าคุณสิงห์',
        district: 'วังทองหลาง',
        province: 'กรุงเทพมหานคร',
        postal_code: '10310',
      },
      // ที่อยู่จัดส่งเอกสาร
      {
        address_type: '2',
        address_number: '88',
        moo: '2',
        street: 'ถนนพระราม 9',
        sub_district: 'ห้วยขวาง',
        district: 'ห้วยขวาง',
        province: 'กรุงเทพมหานคร',
        postal_code: '10310',
        phone: '02-987-6543',
        email: 'contact@example.com',
        website: 'www.example.com',
      }
    ],
    
    // ประเภทธุรกิจ
    business_types: 'manufacturer,exporter',
    
    // ข้อมูลโรงงาน
    factory_type: 'TYPE1', // > 50 แรงม้า
    number_of_employees: 250,
    
    // สินค้าและบริการ
    products: [
      { name_th: 'ผลิตภัณฑ์พลาสติก', name_en: 'Plastic Products' },
      { name_th: 'บรรจุภัณฑ์', name_en: 'Packaging' },
      { name_th: 'ภาชนะอาหาร', name_en: 'Food Containers' },
    ],
    
    // ผู้แทน
    representatives: [
      {
        prename_th: 'นาย',
        first_name_th: 'วิชัย',
        last_name_th: 'ธุรกิจดี',
        prename_en: 'Mr.',
        first_name_en: 'Wichai',
        last_name_en: 'Thurakitdee',
        position: 'กรรมการผู้จัดการ',
        phone: '081-111-2222',
        email: 'wichai@example.com',
      },
      {
        prename_th: 'นาง',
        first_name_th: 'สุภา',
        last_name_th: 'ธุรกิจดี',
        prename_en: 'Mrs.',
        first_name_en: 'Supa',
        last_name_en: 'Thurakitdee',
        position: 'กรรมการ',
        phone: '081-333-4444',
        email: 'supa@example.com',
      }
    ],
    
    // ผู้ประสานงาน
    contact_persons: [
      {
        prename_th: 'นางสาว',
        first_name_th: 'มาลี',
        last_name_th: 'ใจดี',
        prename_en: 'Ms.',
        first_name_en: 'Malee',
        last_name_en: 'Jaidee',
        position: 'ผู้จัดการฝ่ายทั่วไป',
        phone: '081-555-6666',
        phone_extension: '202',
        email: 'malee@example.com',
        type_contact_id: 1, // ผู้ประสานงานหลัก
      }
    ],
    
    // ผู้มีอำนาจลงนาม (หลายคน)
    signatories: [
      {
        prename_th: 'นาย',
        first_name_th: 'วิชัย',
        last_name_th: 'ธุรกิจดี',
        position_th: 'กรรมการผู้จัดการ',
      },
      {
        prename_th: 'นาง',
        first_name_th: 'สุภา',
        last_name_th: 'ธุรกิจดี',
        position_th: 'กรรมการ',
      }
    ],
    
    // เอกสาร
    documents: [
      {
        document_type: 'authorizedSignature',
        file_url: 'https://example.com/signature-wichai.png',
        mime_type: 'image/png',
        signature_name_id: 1,
      },
      {
        document_type: 'authorizedSignature2',
        file_url: 'https://example.com/signature-supa.png',
        mime_type: 'image/png',
        signature_name_id: 2,
      },
      {
        document_type: 'companyStamp',
        file_url: 'https://example.com/company-stamp.png',
        mime_type: 'image/png',
      }
    ],
    
    // กลุ่มอุตสาหกรรม
    industry_groups: [
      { industry_group_name: 'กลุ่มอุตสาหกรรมพลาสติก' },
      { industry_group_name: 'กลุ่มอุตสาหกรรมบรรจุภัณฑ์' },
    ],
  };

  try {
    const result = await downloadMembershipPDF(ocData, 'oc');
    console.log('✅ สร้าง PDF สำหรับ OC สำเร็จ:', result.filename);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
};

// ===== ตัวอย่างที่ 3: ฟอร์ม AC (นิติบุคคล) =====
const exampleAC = async () => {
  const acData = {
    company_name_th: 'บริษัท การค้าระหว่างประเทศ จำกัด',
    company_name_en: 'International Trade Company Limited',
    tax_id: '9876543210987',
    
    phone: '02-555-8888',
    email: 'trade@example.com',
    website: 'www.trade-example.com',
    
    address_number: '555',
    street: 'ถนนสีลม',
    sub_district: 'สีลม',
    district: 'บางรัก',
    province: 'กรุงเทพมหานคร',
    postal_code: '10500',
    
    business_types: 'importer,exporter,distributor',
    number_of_employees: 80,
    
    products: [
      { name_th: 'สินค้าอิเล็กทรอนิกส์', name_en: 'Electronics' },
      { name_th: 'อะไหล่คอมพิวเตอร์', name_en: 'Computer Parts' },
    ],
    
    representatives: [
      {
        prename_th: 'นาย',
        first_name_th: 'ประสิทธิ์',
        last_name_th: 'การค้า',
        position: 'ประธานกรรมการ',
        phone: '081-777-8888',
        email: 'prasit@example.com',
      }
    ],
    
    authorized_signatory_name_th: {
      first_name: 'ประสิทธิ์',
      last_name: 'การค้า',
    },
    authorized_signatory_position_th: 'ประธานกรรมการ',
    
    documents: [
      {
        document_type: 'authorizedSignature',
        file_url: 'https://example.com/signature-prasit.png',
      },
      {
        document_type: 'companyStamp',
        file_url: 'https://example.com/trade-stamp.png',
      }
    ],
  };

  try {
    const result = await downloadMembershipPDF(acData, 'ac');
    console.log('✅ สร้าง PDF สำหรับ AC สำเร็จ:', result.filename);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
};

// ===== ตัวอย่างที่ 4: ฟอร์ม AM (สมาคมการค้า) =====
const exampleAM = async () => {
  const amData = {
    association_name: 'สมาคมผู้ประกอบการอุตสาหกรรมอาหาร',
    association_name_eng: 'Food Industry Association',
    tax_id: '5555555555555',
    
    phone: '02-444-5555',
    email: 'info@food-association.com',
    website: 'www.food-association.com',
    
    address_number: '789',
    street: 'ถนนเพชรบุรี',
    sub_district: 'ถนนเพชรบุรี',
    district: 'ราชเทวี',
    province: 'กรุงเทพมหานคร',
    postal_code: '10400',
    
    business_types: 'service',
    number_of_member: 150,
    number_of_employees: 25,
    
    representatives: [
      {
        prename_th: 'นาย',
        first_name_th: 'อนุชา',
        last_name_th: 'สมาคม',
        position: 'นายกสมาคม',
        phone: '081-999-0000',
        email: 'anucha@food-association.com',
      }
    ],
    
    documents: [
      {
        document_type: 'authorizedSignature',
        file_url: 'https://example.com/signature-anucha.png',
      },
      {
        document_type: 'companyStamp',
        file_url: 'https://example.com/association-stamp.png',
      }
    ],
  };

  try {
    const result = await downloadMembershipPDF(amData, 'am');
    console.log('✅ สร้าง PDF สำหรับ AM สำเร็จ:', result.filename);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
};

// ===== ตัวอย่างที่ 5: การใช้งานแบบมีข้อมูลกลุ่มอุตสาหกรรม =====
const exampleWithLookupData = async () => {
  const applicationData = {
    company_name_th: 'บริษัท ทดสอบ จำกัด',
    company_name_en: 'Test Company Limited',
    tax_id: '1111111111111',
    
    // ระบุ ID ของกลุ่มอุตสาหกรรม
    industrial_group_ids: [1, 2, 3],
    
    // ระบุ ID ของสภาอุตสาหกรรมจังหวัด
    provincial_chapter_ids: [10, 20],
  };

  // ข้อมูล lookup สำหรับกลุ่มอุตสาหกรรม
  const industrialGroups = {
    data: [
      { id: 1, industry_group_name: 'กลุ่มอุตสาหกรรมอาหาร' },
      { id: 2, industry_group_name: 'กลุ่มอุตสาหกรรมเครื่องดื่ม' },
      { id: 3, industry_group_name: 'กลุ่มอุตสาหกรรมบรรจุภัณฑ์' },
    ]
  };

  // ข้อมูล lookup สำหรับสภาจังหวัด
  const provincialChapters = {
    data: [
      { id: 10, province_chapter_name: 'สภาอุตสาหกรรมจังหวัดกรุงเทพมหานคร' },
      { id: 20, province_chapter_name: 'สภาอุตสาหกรรมจังหวัดสมุทรปราการ' },
    ]
  };

  try {
    const result = await generateMembershipPDF(
      applicationData,
      'oc',
      industrialGroups,
      provincialChapters
    );
    console.log('✅ สร้าง PDF พร้อม lookup data สำเร็จ:', result.filename);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
};

// ===== เรียกใช้งานตัวอย่าง =====
// เลือกตัวอย่างที่ต้องการทดสอบ

// await exampleIC();           // ทดสอบฟอร์ม IC
// await exampleOC();           // ทดสอบฟอร์ม OC
// await exampleAC();           // ทดสอบฟอร์ม AC
// await exampleAM();           // ทดสอบฟอร์ม AM
// await exampleWithLookupData(); // ทดสอบพร้อม lookup data

console.log(`
📋 ตัวอย่างการใช้งาน PDF Generator

เปิด comment ในบรรทัดด้านล่างเพื่อทดสอบ:

- exampleIC()              : ฟอร์มสมทบ-บุคคลธรรมดา
- exampleOC()              : ฟอร์มสามัญ-โรงงาน
- exampleAC()              : ฟอร์มสมทบ-นิติบุคคล
- exampleAM()              : ฟอร์มสามัญ-สมาคมการค้า
- exampleWithLookupData()  : ตัวอย่างที่มีข้อมูล lookup

หรือ import function เหล่านี้ไปใช้ในโปรเจคของคุณ
`);

export {
  exampleIC,
  exampleOC,
  exampleAC,
  exampleAM,
  exampleWithLookupData,
};