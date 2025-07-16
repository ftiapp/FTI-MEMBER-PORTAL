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

// Industrial Groups card with tags (similar to BusinessTypesCard)
const IndustrialGroupsCard = ({ title, industrialGroups }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
    {industrialGroups.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {industrialGroups.map((group, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
          >
            {group}
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
const RepresentativeCard = ({ representative, index }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <div className="mb-2">
      <h4 className="text-sm font-medium text-gray-700">ผู้แทนคนที่ {index + 1}</h4>
    </div>
    
    {representative ? (
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (ไทย)</p>
          <p className="text-sm">{representative.firstNameThai} {representative.lastNameThai}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (อังกฤษ)</p>
          <p className="text-sm">{representative.firstNameEnglish} {representative.lastNameEnglish}</p>
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

// Simplified file display (from file 1)
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

  // ฟังก์ชันสำหรับแสดงกลุ่มอุตสาหกรรมที่เลือกแบบ array
  const getSelectedIndustrialGroupsArray = () => {
    if (!formData.industrialGroupIds || formData.industrialGroupIds.length === 0) {
      return [];
    }
    
    return formData.industrialGroupIds.map(groupId => {
      const group = industrialGroups.find(g => String(g.id) === String(groupId));
      return group ? group.name_th : `กลุ่มอุตสาหกรรม ${groupId}`;
    });
  };

  // ฟังก์ชันสำหรับแสดงสภาอุตสาหกรรมจังหวัดแบบ array
  const getSelectedProvincialChaptersArray = () => {
    if (!formData.provincialChapterIds || formData.provincialChapterIds.length === 0) {
      return [];
    }
    
    return formData.provincialChapterIds.map(chapterId => {
      const chapter = provincialChapters.find(c => String(c.id) === String(chapterId));
      return chapter ? chapter.name_th : `สภาอุตสาหกรรมจังหวัด ${chapterId}`;
    });
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

  // สร้างข้อมูลที่อยู่แยกเป็นฟิลด์ย่อย
  const getAddressFields = () => {
    return {
      addressNumber: formData.addressNumber || '-',
      moo: formData.moo || '-',
      soi: formData.soi || '-',
      road: formData.road || '-',
      subDistrict: formData.subDistrict || '-',
      district: formData.district || '-',
      province: formData.province || '-',
      postalCode: formData.postalCode || '-'
    };
  };

  const getFactoryTypeLabel = () => {
    if (formData.factoryType === 'type1') return 'มีเครื่องจักรมากกว่า 50 แรงม้า';
    if (formData.factoryType === 'type2') return 'ไม่มีเครื่องจักร / มีเครื่องจักรต่ำกว่า 5 แรงม้า';
    return 'ไม่ได้เลือก';
  };

  const addressFields = getAddressFields();

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
          <InfoCard title="เว็บไซต์" value={formData.companyWebsite} />
        </div>
      </Section>

      {/* ที่อยู่บริษัท - แยกเป็นข้อย่อยๆ เหมือน file 2 */}
      <Section title="ที่อยู่บริษัท" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="เลขที่" value={addressFields.addressNumber} />
          <InfoCard title="หมู่" value={addressFields.moo} />
          <InfoCard title="ซอย" value={addressFields.soi} />
          <InfoCard title="ถนน" value={addressFields.road} />
          <InfoCard title="ตำบล/แขวง" value={addressFields.subDistrict} />
          <InfoCard title="อำเภอ/เขต" value={addressFields.district} />
          <InfoCard title="จังหวัด" value={addressFields.province} />
          <InfoCard title="รหัสไปรษณีย์" value={addressFields.postalCode} />
        </div>
      </Section>

      {/* ข้อมูลผู้ให้ข้อมูล */}
      <Section title="ข้อมูลผู้ให้ข้อมูล" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="ชื่อ-นามสกุล (ไทย)" value={getContactPersonFullName(false)} />
          <InfoCard title="ชื่อ-นามสกุล (อังกฤษ)" value={getContactPersonFullName(true)} />
          <InfoCard title="ตำแหน่ง" value={formData.contactPersonPosition} />
          <InfoCard title="อีเมล" value={formData.contactPersonEmail} />
          <InfoCard title="เบอร์โทรศัพท์" value={formData.contactPersonPhone} />
        </div>
      </Section>

      {/* ข้อมูลผู้แทน - ใช้ RepresentativeCard แบบ file 2 */}
      {formData.representatives && formData.representatives.length > 0 && (
        <Section title="ข้อมูลผู้แทน" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formData.representatives.map((rep, index) => (
              <RepresentativeCard key={index} representative={rep} index={index} />
            ))}
          </div>
        </Section>
      )}

      {/* ข้อมูลธุรกิจ - ใช้ tags แบบ file 2 แต่เก็บ BusinessTypesCard จาก file 1 */}
      <Section title="ข้อมูลธุรกิจ" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BusinessTypesCard 
            title="ประเภทธุรกิจ" 
            businessTypes={getSelectedBusinessTypesArray()} 
          />
          <InfoCard title="จำนวนพนักงาน" value={formData.numberOfEmployees} />
          <ProductsCard products={formData.products || []} />
          <IndustrialGroupsCard 
            title="กลุ่มอุตสาหกรรม" 
            industrialGroups={getSelectedIndustrialGroupsArray()} 
          />
          <IndustrialGroupsCard 
            title="สภาอุตสาหกรรมจังหวัด" 
            industrialGroups={getSelectedProvincialChaptersArray()} 
          />
        </div>
      </Section>

      {/* เอกสารใบอนุญาต - เก็บ UI แบบ file 1 */}
      {formData.factoryType && (
        <Section title="เอกสารใบอนุญาต" className="mt-6">
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