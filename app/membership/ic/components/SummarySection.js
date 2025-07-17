'use client';

import React from 'react';
import PropTypes from 'prop-types';

// Simplified info card with consistent blue theme
const InfoCard = ({ title, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
    <p className="text-sm text-gray-900">{value || '-'}</p>
  </div>
);

// Special card for business types with tags
const BusinessTypesCard = ({ title, businessTypes }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
    {businessTypes.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {businessTypes.map((type, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
          >
            {type}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">ไม่ได้เลือก</p>
    )}
  </div>
);

// Products/Services card
const ProductsCard = ({ products }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-3">สินค้า/บริการ</h4>
    {products && products.length > 0 ? (
      <div className="space-y-2">
        {products.map((product, index) => (
          <div key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
            <p className="text-sm font-medium">{product.nameTh || '-'}</p>
            <p className="text-xs text-gray-500">{product.nameEn || '-'}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">ไม่มีข้อมูล</p>
    )}
  </div>
);

// Representative card
const RepresentativeCard = ({ representative }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <div className="mb-2">
      <h4 className="text-sm font-medium text-gray-700">ข้อมูลผู้แทน</h4>
    </div>
    
    {representative ? (
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (ไทย)</p>
          <p className="text-sm">{representative.firstNameThai} {representative.lastNameThai}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (อังกฤษ)</p>
          <p className="text-sm">{representative.firstNameEng} {representative.lastNameEng}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">อีเมล</p>
          <p className="text-sm">{representative.email || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">เบอร์โทรศัพท์</p>
          <p className="text-sm">{representative.phone || '-'}</p>
        </div>
      </div>
    ) : (
      <p className="text-sm text-gray-500">ไม่มีข้อมูล</p>
    )}
  </div>
);

// Simplified file display
const FileCard = ({ fileName, description }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{description}</p>
        <p className="text-xs text-gray-500">{fileName !== 'ไม่ได้อัปโหลด' ? fileName : 'ไม่ได้อัปโหลด'}</p>
      </div>
      {fileName !== 'ไม่ได้อัปโหลด' && (
        <div className="w-4 h-4 text-green-500">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  </div>
);

// Simplified section with consistent blue theme
const Section = ({ title, children, className }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className || ''}`}>
    <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default function SummarySection({ formData }) {
  // Get selected business types
  const getSelectedBusinessTypes = () => {
    if (!formData.businessTypes) return [];
    
    const BUSINESS_TYPE_LABELS = {
      manufacturer: 'ผู้ผลิต',
      distributor: 'ผู้จัดจำหน่าย',
      importer: 'ผู้นำเข้า',
      exporter: 'ผู้ส่งออก',
      service: 'ผู้ให้บริการ',
      other: 'อื่นๆ'
    };
    
    return Object.keys(formData.businessTypes)
      .map(key => {
        if (key === 'other') {
          return `${BUSINESS_TYPE_LABELS[key]} (${formData.otherBusinessTypeDetail || ''})`;
        }
        return BUSINESS_TYPE_LABELS[key] || key; // ถ้าไม่พบ key ในตาราง ให้แสดง key เดิม
      });
  };

  // Format products for display
  const formatProducts = () => {
    return formData.products?.map(product => ({
      nameTh: product.nameTh || '-',
      nameEn: product.nameEn || '-'
    })) || [];
  };

  // Helper function to get file name
  const getFileName = (fileObj) => {
    if (!fileObj) return 'ไม่ได้อัปโหลด';
    if (typeof fileObj === 'object') {
      if (fileObj instanceof File) return fileObj.name;
      if (fileObj.name) return fileObj.name;
      if (fileObj.file && fileObj.file.name) return fileObj.file.name;
    }
    return 'ไฟล์ถูกอัปโหลดแล้ว';
  };

  return (
    <div className="space-y-6">
      {/* ข้อมูลผู้สมัคร */}
      <Section title="ข้อมูลผู้สมัคร">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="เลขบัตรประจำตัวประชาชน" value={formData.idCardNumber} />
          <InfoCard title="ชื่อ-นามสกุล (ไทย)" value={`${formData.firstNameThai || ''} ${formData.lastNameThai || ''}`} />
          <InfoCard title="ชื่อ-นามสกุล (อังกฤษ)" value={`${formData.firstNameEng || ''} ${formData.lastNameEng || ''}`} />
          <InfoCard title="อีเมล" value={formData.email} />
          <InfoCard title="เบอร์โทรศัพท์" value={formData.phone} />
        </div>
      </Section>

      {/* ที่อยู่ - แยกเป็นข้อย่อยๆ เหมือน OC */}
      <Section title="ที่อยู่" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="เลขที่" value={formData.addressNumber} />
          <InfoCard title="หมู่" value={formData.moo} />
          <InfoCard title="ซอย" value={formData.soi} />
          <InfoCard title="ถนน" value={formData.street} />
          <InfoCard title="ตำบล/แขวง" value={formData.subDistrict} />
          <InfoCard title="อำเภอ/เขต" value={formData.district} />
          <InfoCard title="จังหวัด" value={formData.province} />
          <InfoCard title="รหัสไปรษณีย์" value={formData.postalCode} />
        </div>
      </Section>

      {/* กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด */}
      <Section title="กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">กลุ่มอุตสาหกรรม</h4>
            {formData.industrialGroupNames && formData.industrialGroupNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.industrialGroupNames.map((name, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">ไม่ได้เลือก</p>
            )}
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">สภาอุตสาหกรรมจังหวัด</h4>
            {formData.provincialCouncilNames && formData.provincialCouncilNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.provincialCouncilNames.map((name, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">ไม่ได้เลือก</p>
            )}
          </div>
        </div>
      </Section>

      {/* ข้อมูลผู้แทน */}
      <Section title="ข้อมูลผู้แทน">
        <div className="grid grid-cols-1 gap-4">
          <RepresentativeCard representative={formData.representative} />
        </div>
      </Section>

      {/* ข้อมูลธุรกิจ */}
      <Section title="ข้อมูลธุรกิจ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BusinessTypesCard title="ประเภทธุรกิจ" businessTypes={getSelectedBusinessTypes()} />
          <ProductsCard products={formatProducts()} />
        </div>
      </Section>

      {/* เอกสารแนบ */}
      <Section title="เอกสารแนบ">
        <div className="space-y-3">
          <FileCard 
            fileName={getFileName(formData.idCardDocument)} 
            description="สำเนาบัตรประชาชน" 
          />
        </div>
      </Section>
    </div>
  );
}

SummarySection.propTypes = {
  formData: PropTypes.shape({
    idCardNumber: PropTypes.string,
    firstNameThai: PropTypes.string,
    lastNameThai: PropTypes.string,
    firstNameEng: PropTypes.string,
    lastNameEng: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,

    addressNumber: PropTypes.string,
    moo: PropTypes.string,
    soi: PropTypes.string,
    street: PropTypes.string, // Fixed: Changed from 'road' to 'street'
    subDistrict: PropTypes.string,
    district: PropTypes.string,
    province: PropTypes.string,
    postalCode: PropTypes.string,
    industrialGroupIds: PropTypes.array,
    industrialGroupNames: PropTypes.array,
    provincialCouncilIds: PropTypes.array,
    provincialCouncilNames: PropTypes.array,
    representative: PropTypes.object,
    businessTypes: PropTypes.object,
    otherBusinessTypeDetail: PropTypes.string,
    products: PropTypes.array,
    idCardDocument: PropTypes.object
  }).isRequired
};