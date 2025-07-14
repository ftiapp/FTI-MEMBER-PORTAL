'use client';

import React from 'react';

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
const Section = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default function SummarySectionComponent({ formData, businessTypes, industrialGroups, provincialChapters }) {
  // Helper functions
  const getFileName = (fileObj) => {
    if (!fileObj) return 'ไม่ได้อัปโหลด';
    if (typeof fileObj === 'object') {
      if (fileObj instanceof File) return fileObj.name;
      if (fileObj.name) return fileObj.name;
      if (fileObj.file && fileObj.file.name) return fileObj.file.name;
    }
    return 'ไฟล์ถูกอัปโหลดแล้ว';
  };

  const getSelectedItemsName = (ids, items) => {
    if (!ids || ids.length === 0) return 'ไม่ได้เลือก';
    if (!items || items.length === 0) return ids.join(', ');
    return ids.map(id => items.find(item => String(item.id) === String(id))?.name_th || id).join(', ');
  };
  
  // แก้ไขให้ return array แทน string
  const getSelectedBusinessTypesArray = () => {
    if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) return [];
    
    // ใช้ข้อมูลเดียวกับ BusinessInfoSection
    const BUSINESS_TYPES = [
      { id: 'manufacturer', nameTh: 'ผู้ผลิต' },
      { id: 'distributor', nameTh: 'ผู้จัดจำหน่าย' },
      { id: 'importer', nameTh: 'ผู้นำเข้า' },
      { id: 'exporter', nameTh: 'ผู้ส่งออก' },
      { id: 'service', nameTh: 'ผู้ให้บริการ' },
      { id: 'other', nameTh: 'อื่นๆ' }
    ];
    
    const selectedTypes = Object.keys(formData.businessTypes);
    let result = selectedTypes.map(typeId => {
      const businessType = BUSINESS_TYPES.find(type => type.id === typeId);
      if (typeId === 'other' && formData.otherBusinessTypeDetail && formData.otherBusinessTypeDetail.trim() !== '') {
        return `อื่นๆ (${formData.otherBusinessTypeDetail})`;
      }
      return businessType ? businessType.nameTh : typeId;
    });
    
    return result;
  };

  const getProductsText = () => {
    if (!formData.products || !Array.isArray(formData.products) || formData.products.length === 0) {
      return 'ไม่ได้ระบุ';
    }
    return formData.products
      .map(product => {
        const thName = product.nameTh || '';
        const enName = product.nameEn || '';
        if (thName && enName) return `${thName} / ${enName}`;
        return thName || enName || 'ไม่ได้ระบุชื่อ';
      })
      .filter(name => name.trim() !== '')
      .join(', ') || 'ไม่ได้ระบุ';
  };

  const getContactPersonFullName = (isEnglish = false) => {
    if (isEnglish) {
      return formData.contactPersonFirstNameEng && formData.contactPersonLastNameEng 
        ? `${formData.contactPersonFirstNameEng} ${formData.contactPersonLastNameEng}` 
        : '-';
    }
    return formData.contactPersonFirstName && formData.contactPersonLastName 
      ? `${formData.contactPersonFirstName} ${formData.contactPersonLastName}` 
      : '-';
  };

  const getAddress = () => {
    const parts = [
      formData.addressNumber,
      formData.street,
      formData.subDistrict,
      formData.district,
      formData.province,
      formData.postalCode
    ].filter(Boolean).filter(part => part.trim() !== '');
    return parts.length > 0 ? parts.join(' ') : '-';
  };

  const getFactoryTypeLabel = () => {
    if (formData.factoryType === 'type1') return 'มีเครื่องจักรมากกว่า 50 แรงม้า';
    if (formData.factoryType === 'type2') return 'ไม่มีเครื่องจักร / มีเครื่องจักรต่ำกว่า 5 แรงม้า';
    return 'ไม่ได้เลือก';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">สรุปข้อมูลการสมัครสมาชิก</h2>
        <p className="text-gray-600">กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการสมัคร</p>
      </div>

      {/* ข้อมูลบริษัท */}
      <Section title="ข้อมูลบริษัท">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="ชื่อบริษัท (ไทย)" value={formData.companyName} />
          <InfoCard title="ชื่อบริษัท (อังกฤษ)" value={formData.companyNameEng} />
          <InfoCard title="เลขประจำตัวผู้เสียภาษี" value={formData.taxId} />
          <InfoCard title="อีเมล" value={formData.companyEmail} />
          <InfoCard title="เบอร์โทรศัพท์" value={formData.companyPhone} />
          <InfoCard title="ที่ตั้งบริษัท" value={getAddress()} />
        </div>
      </Section>

      {/* ข้อมูลผู้ให้ข้อมูล */}
      <Section title="ข้อมูลผู้ให้ข้อมูล">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="ชื่อ-นามสกุล (ไทย)" value={getContactPersonFullName(false)} />
          <InfoCard title="ชื่อ-นามสกุล (อังกฤษ)" value={getContactPersonFullName(true)} />
          <InfoCard title="ตำแหน่ง" value={formData.contactPersonPosition} />
          <InfoCard title="อีเมล" value={formData.contactPersonEmail} />
          <InfoCard title="เบอร์โทรศัพท์" value={formData.contactPersonPhone} />
        </div>
      </Section>

      {/* ข้อมูลผู้แทน */}
      {formData.representatives && formData.representatives.length > 0 && (
        <Section title="ข้อมูลผู้แทน">
          <div className="space-y-6">
            {formData.representatives.map((rep, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">ผู้แทน {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoCard title="ชื่อ-นามสกุล (ไทย)" value={`${rep.firstNameThai} ${rep.lastNameThai}`} />
                  <InfoCard title="ชื่อ-นามสกุล (อังกฤษ)" value={`${rep.firstNameEnglish} ${rep.lastNameEnglish}`} />
                  <InfoCard title="อีเมล" value={rep.email} />
                  <InfoCard title="เบอร์โทรศัพท์" value={rep.phone} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ข้อมูลธุรกิจ - ใช้ BusinessTypesCard แบบ tags */}
      <Section title="ข้อมูลธุรกิจ">
        <div className="grid grid-cols-1 gap-4">
          <BusinessTypesCard 
            title="ประเภทธุรกิจ" 
            businessTypes={getSelectedBusinessTypesArray()} 
          />
          <InfoCard title="จำนวนพนักงาน" value={formData.numberOfEmployees} />
          <InfoCard title="สินค้าและบริการ" value={getProductsText()} />
          <InfoCard title="กลุ่มอุตสาหกรรม" value={getSelectedItemsName(formData.industrialGroupIds, industrialGroups)} />
          <InfoCard title="สภาอุตสาหกรรมจังหวัด" value={getSelectedItemsName(formData.provincialChapterIds, provincialChapters)} />
        </div>
      </Section>

      {/* เอกสารใบอนุญาต */}
      {formData.factoryType && (
        <Section title="เอกสารใบอนุญาต">
          <div className="space-y-4">
            <InfoCard title="ประเภทโรงงาน" value={getFactoryTypeLabel()} />

            {formData.factoryType === 'type1' && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">เอกสารใบอนุญาต</h4>
                <FileCard
                  fileName={getFileName(formData.factoryLicense)}
                  description="ใบอนุญาตประกอบกิจการโรงงาน (รง.4)"
                />
                <FileCard
                  fileName={getFileName(formData.industrialEstateLicense)}
                  description="ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (กนอ.)"
                />
              </div>
            )}

            {formData.factoryType === 'type2' && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">เอกสารการผลิต</h4>
                <FileCard
                  fileName={formData.productionImages && formData.productionImages.length > 0 
                    ? `อัปโหลดแล้ว ${formData.productionImages.length} ไฟล์` 
                    : 'ไม่ได้อัปโหลด'
                  }
                  description="รูปภาพหรือเอกสารการผลิต"
                />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ข้อความยืนยัน */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">ตรวจสอบข้อมูลเรียบร้อยแล้ว</h3>
        <p className="text-gray-600">กรุณาตรวจสอบข้อมูลทั้งหมดให้ถูกต้องก่อนยืนยันการสมัครสมาชิก</p>
      </div>
    </div>
  );
}