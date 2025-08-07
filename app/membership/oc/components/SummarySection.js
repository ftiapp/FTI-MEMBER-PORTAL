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
            <p className="text-sm font-medium">{product.nameTh || product.name_th || '-'}</p>
            <p className="text-xs text-gray-500">{product.nameEn || product.name_en || '-'}</p>
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
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-500">ชื่อ-นามสกุล (ไทย)</p>
        <p className="text-sm">{representative.firstNameThai || '-'} {representative.lastNameThai || '-'}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">ชื่อ-นามสกุล (อังกฤษ)</p>
        <p className="text-sm">{representative.firstNameEnglish || '-'} {representative.lastNameEnglish || '-'}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">ตำแหน่ง</p>
        <p className="text-sm">{representative.position || '-'}</p>
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
  </div>
);

// 🔥 แก้ไข: Simplified file display with better file detection
const FileCard = ({ fileName, description, fileUrl }) => {
  // 🔥 แก้ไข: ปรับปรุงการตรวจสอบไฟล์
  const hasFile = fileName && fileName !== 'ไม่ได้อัปโหลด' && fileName.trim() !== '';
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{description}</p>
          <p className="text-xs text-gray-500">{hasFile ? fileName : 'ไม่ได้อัปโหลด'}</p>
        </div>
        {hasFile && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-green-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {fileUrl && (
              <button 
                className="w-6 h-6 text-blue-600 hover:text-blue-800 transition-colors"
                title="ดูไฟล์แนบ"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

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
  // 🔥 แก้ไข: Helper functions สำหรับจัดการไฟล์
  const getFileName = (fileObj) => {
    if (!fileObj) return 'ไม่ได้อัปโหลด';
    
    // ถ้าเป็น object
    if (typeof fileObj === 'object') {
      if (fileObj instanceof File) return fileObj.name;
      if (fileObj.name) return fileObj.name;
      if (fileObj.file && fileObj.file.name) return fileObj.file.name;
      if (fileObj.fileName) return fileObj.fileName;
    }
    
    // ถ้าเป็น string
    if (typeof fileObj === 'string' && fileObj.trim() !== '') {
      return fileObj;
    }
    
    return 'ไฟล์ถูกอัปโหลดแล้ว';
  };

  const getFileUrl = (fileObj) => {
    if (!fileObj) return null;
    
    if (typeof fileObj === 'object') {
      return fileObj.fileUrl || fileObj.cloudinary_url || fileObj.file_path || null;
    }
    
    return null;
  };

  // 🔥 แก้ไข: ฟังก์ชันสำหรับจัดการ production images
  const getProductionImagesDisplay = () => {
    if (!formData?.productionImages) return 'ไม่ได้อัปโหลด';
    
    if (Array.isArray(formData.productionImages)) {
      const validImages = formData.productionImages.filter(img => 
        img && (img.name || img.fileName || (typeof img === 'string' && img.trim() !== ''))
      );
      
      if (validImages.length > 0) {
        return `อัปโหลดแล้ว ${validImages.length} ไฟล์`;
      }
    }
    
    return 'ไม่ได้อัปโหลด';
  };

  // ฟังก์ชันสำหรับแสดงประเภทธุรกิจที่เลือกแบบ array
  const getSelectedBusinessTypesArray = () => {
    console.log('formData.businessTypes:', formData?.businessTypes);
    
    if (!formData || !formData.businessTypes) {
      return [];
    }
    
    // ถ้าเป็น object (checkbox format)
    if (typeof formData.businessTypes === 'object' && !Array.isArray(formData.businessTypes)) {
      const BUSINESS_TYPES = [
        { id: 'manufacturer', nameTh: 'ผู้ผลิต' },
        { id: 'distributor', nameTh: 'ผู้จัดจำหน่าย' },
        { id: 'importer', nameTh: 'ผู้นำเข้า' },
        { id: 'exporter', nameTh: 'ผู้ส่งออก' },
        { id: 'service', nameTh: 'ผู้ให้บริการ' },
        { id: 'other', nameTh: 'อื่นๆ' }
      ];
      
      const selectedTypes = Object.keys(formData.businessTypes).filter(key => formData.businessTypes[key]);
      return selectedTypes.map(typeId => {
        const businessType = BUSINESS_TYPES.find(type => type.id === typeId);
        if (typeId === 'other' && formData.otherBusinessTypeDetail && formData.otherBusinessTypeDetail.trim() !== '') {
          return `อื่นๆ (${formData.otherBusinessTypeDetail})`;
        }
        return businessType ? businessType.nameTh : typeId;
      });
    }
    
    // ถ้าเป็น array
    if (Array.isArray(formData.businessTypes)) {
      return formData.businessTypes.map(type => {
        if (typeof type === 'object' && type.name_th) {
          return type.name_th;
        }
        return String(type);
      });
    }
    
    return [];
  };

  // ฟังก์ชันสำหรับแสดงกลุ่มอุตสาหกรรมที่เลือกแบบ array
  const getSelectedIndustrialGroupsArray = () => {
    console.log('formData.industrialGroupIds:', formData?.industrialGroupIds);
    console.log('formData.industrialGroupNames:', formData?.industrialGroupNames);
    console.log('formData.industryGroups:', formData?.industryGroups);
    
    // ลองหาจาก industrialGroupNames ก่อน (จาก IndustrialGroupSection)
    if (formData?.industrialGroupNames && formData.industrialGroupNames.length > 0) {
      return formData.industrialGroupNames.filter(name => name && name.trim() !== '');
    }
    
    // ลองหาจาก industrialGroupIds (จาก IndustrialGroupSection)
    if (formData?.industrialGroupIds && formData.industrialGroupIds.length > 0) {
      return formData.industrialGroupIds.map(id => {
        const industryGroup = industrialGroups?.find(g => String(g.id) === String(id));
        return industryGroup ? industryGroup.name_th : `กลุ่มอุตสาหกรรม ${id}`;
      });
    }
    
    // ลองหาจาก industryGroups (รูปแบบเก่า)
    if (formData?.industryGroups && formData.industryGroups.length > 0) {
      return formData.industryGroups.map(group => {
        if (group && typeof group === 'object' && group.industryGroupName) {
          return group.industryGroupName;
        }
        
        if (group && typeof group === 'object' && group.name_th) {
          return group.name_th;
        }
        
        const industryGroup = industrialGroups?.find(g => String(g.id) === String(group));
        return industryGroup ? (industryGroup.name_th || industryGroup.industryGroupName) : `กลุ่มอุตสาหกรรม ${group}`;
      });
    }
    
    return [];
  };

  // ฟังก์ชันสำหรับแสดงสภาอุตสาหกรรมจังหวัดแบบ array
  const getSelectedProvincialChaptersArray = () => {
    console.log('formData.provincialChapterIds:', formData?.provincialChapterIds);
    console.log('formData.provincialChapterNames:', formData?.provincialChapterNames);
    console.log('formData.provinceChapters:', formData?.provinceChapters);
    
    // ลองหาจาก provincialChapterNames ก่อน (จาก IndustrialGroupSection)
    if (formData?.provincialChapterNames && formData.provincialChapterNames.length > 0) {
      return formData.provincialChapterNames.filter(name => name && name.trim() !== '');
    }
    
    // ลองหาจาก provincialChapterIds (จาก IndustrialGroupSection)
    if (formData?.provincialChapterIds && formData.provincialChapterIds.length > 0) {
      return formData.provincialChapterIds.map(id => {
        const provinceChapter = provincialChapters?.find(c => String(c.id) === String(id));
        return provinceChapter ? provinceChapter.name_th : `สภาอุตสาหกรรมจังหวัด ${id}`;
      });
    }
    
    // ลองหาจาก provinceChapters (รูปแบบเก่า)
    if (formData?.provinceChapters && formData.provinceChapters.length > 0) {
      return formData.provinceChapters.map(chapter => {
        if (chapter && typeof chapter === 'object' && chapter.provinceChapterName) {
          return chapter.provinceChapterName;
        }
        
        if (chapter && typeof chapter === 'object' && chapter.name_th) {
          return chapter.name_th;
        }
        
        const provinceChapter = provincialChapters?.find(c => String(c.id) === String(chapter));
        return provinceChapter ? (provinceChapter.name_th || provinceChapter.provinceChapterName) : `สภาอุตสาหกรรมจังหวัด ${chapter}`;
      });
    }
    
    return [];
  };

  const getContactPersonFullName = (isEnglish = false) => {
    if (!formData) return '-';
    
    // ระบบใหม่: ใช้ contactPersons array
    if (formData.contactPersons && formData.contactPersons.length > 0) {
      const mainContact = formData.contactPersons[0]; // ผู้ประสานงานหลัก
      if (isEnglish) {
        return mainContact.firstNameEn && mainContact.lastNameEn 
          ? `${mainContact.firstNameEn} ${mainContact.lastNameEn}` 
          : '-';
      }
      return mainContact.firstNameTh && mainContact.lastNameTh 
        ? `${mainContact.firstNameTh} ${mainContact.lastNameTh}` 
        : '-';
    }
    
    // ระบบเก่า: ใช้ field names แบบเดิม (สำหรับ backward compatibility)
    if (isEnglish) {
      return formData.contactPersonFirstNameEng && formData.contactPersonLastNameEng 
        ? `${formData.contactPersonFirstNameEng} ${formData.contactPersonLastNameEng}` 
        : '-';
    }
    return formData.contactPersonFirstName && formData.contactPersonLastName 
      ? `${formData.contactPersonFirstName} ${formData.contactPersonLastName}` 
      : '-';
  };

  // ฟังก์ชันใหม่สำหรับแสดงข้อมูลผู้ติดต่อทั้งหมด
  const getContactPersonDetails = () => {
    if (!formData) return {};
    
    // ระบบใหม่: ใช้ contactPersons array
    if (formData.contactPersons && formData.contactPersons.length > 0) {
      const mainContact = formData.contactPersons[0];
      return {
        position: mainContact.position || '-',
        email: mainContact.email || '-',
        phone: mainContact.phone || '-',
        typeContactName: mainContact.typeContactName || 'ผู้ประสานงานหลัก',
        typeContactOtherDetail: mainContact.typeContactOtherDetail || ''
      };
    }
    
    // ระบบเก่า: ใช้ field names แบบเดิม
    return {
      position: formData.contactPersonPosition || formData.contact_person_position || '-',
      email: formData.contactPersonEmail || formData.contact_person_email || '-',
      phone: formData.contactPersonPhone || formData.contact_person_phone || '-',
      typeContactName: 'ผู้ประสานงานหลัก', // default สำหรับระบบเก่า
      typeContactOtherDetail: ''
    };
  };

  // สร้างข้อมูลที่อยู่แยกเป็นฟิลด์ย่อย
  const getAddressFields = (addressType) => {
    if (!formData) {
      return {
        addressNumber: '-',
        building: '-',
        moo: '-',
        soi: '-',
        street: '-',
        subDistrict: '-',
        district: '-',
        province: '-',
        postalCode: '-',
        phone: '-',
        email: '-',
        website: '-'
      };
    }
    
    // ตรวจสอบ addresses structure ใหม่
    if (formData.addresses && formData.addresses[addressType]) {
      const address = formData.addresses[addressType];
      return {
        addressNumber: address.addressNumber || '-',
        building: address.building || '-',
        moo: address.moo || '-',
        soi: address.soi || '-',
        street: address.street || '-',
        subDistrict: address.subDistrict || '-',
        district: address.district || '-',
        province: address.province || '-',
        postalCode: address.postalCode || '-',
        phone: address.phone || '-',
        email: address.email || '-',
        website: address.website || '-'
      };
    }
    
    // Fallback สำหรับ structure เก่า (backward compatibility)
    const address = formData.address || formData;
    return {
      addressNumber: address.addressNumber || address.address_number || '-',
      building: address.building || '-',
      moo: address.moo || '-',
      soi: address.soi || '-',
      street: address.street || address.road || '-',
      subDistrict: address.subDistrict || address.sub_district || '-',
      district: address.district || '-',
      province: address.province || '-',
      postalCode: address.postalCode || address.postal_code || '-',
      phone: address.phone || formData.companyPhone || '-',
      email: address.email || formData.companyEmail || '-',
      website: address.website || formData.companyWebsite || '-'
    };
  };

  const getFactoryTypeLabel = () => {
    if (!formData) return 'ไม่ได้เลือก';
    if (formData.factoryType === 'type1') return 'มีเครื่องจักรมากกว่า 50 แรงม้า';
    if (formData.factoryType === 'type2') return 'ไม่มีเครื่องจักร / มีเครื่องจักรต่ำกว่า 5 แรงม้า';
    return 'ไม่ได้เลือก';
  };

  // Get address fields for all 3 types
  const addressTypes = {
    '1': { label: 'ที่อยู่สำนักงาน', color: 'blue' },
    '2': { label: 'ที่อยู่จัดส่งเอกสาร', color: 'green' },
    '3': { label: 'ที่อยู่ใบกำกับภาษี', color: 'purple' }
  };
  
  const addressFields = {
    '1': getAddressFields('1'),
    '2': getAddressFields('2'),
    '3': getAddressFields('3')
  };
  
  // Check if using new addresses structure
  const hasMultipleAddresses = formData?.addresses && Object.keys(formData.addresses).length > 0;

  // Debug formData
  console.log('=== Summary Debug ===');
  console.log('formData:', formData);
  console.log('businessTypes:', getSelectedBusinessTypesArray());
  console.log('addressFields:', addressFields);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">สรุปข้อมูลการสมัครสมาชิก</h2>
        <p className="text-gray-600">กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการสมัคร</p>
      </div>

      {/* ข้อมูลบริษัท */}
      <Section title="ข้อมูลบริษัท">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="ชื่อบริษัท (ไทย)" value={formData?.companyName} />
          <InfoCard title="ชื่อบริษัท (อังกฤษ)" value={formData?.companyNameEng || formData?.company_name_eng} />
          <InfoCard title="เลขประจำตัวผู้เสียภาษี" value={formData?.taxId} />
       
        </div>
      </Section>

      {/* ที่อยู่บริษัท */}
      {hasMultipleAddresses ? (
        // แสดงที่อยู่ 3 ประเภท
        <div className="space-y-6">
          {Object.entries(addressTypes).map(([type, config]) => {
            const fields = addressFields[type];
            const hasData = fields && Object.values(fields).some(value => value !== '-');
            
            if (!hasData) return null;
            
            return (
              <Section key={type} title={config.label} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard title="เลขที่" value={fields.addressNumber} />
                  <InfoCard title="อาคาร/หมู่บ้าน" value={fields.building} />
                  <InfoCard title="หมู่" value={fields.moo} />
                  <InfoCard title="ซอย" value={fields.soi} />
                  <InfoCard title="ถนน" value={fields.street} />
                  <InfoCard title="ตำบล/แขวง" value={fields.subDistrict} />
                  <InfoCard title="อำเภอ/เขต" value={fields.district} />
                  <InfoCard title="จังหวัด" value={fields.province} />
                  <InfoCard title="รหัสไปรษณีย์" value={fields.postalCode} />
                  <InfoCard title="โทรศัพท์" value={fields.phone} />
                  <InfoCard title="อีเมล" value={fields.email} />
                  <InfoCard title="เว็บไซต์" value={fields.website} />
                </div>
              </Section>
            );
          })}
        </div>
      ) : (
        // แสดงที่อยู่แบบเดิม (backward compatibility)
        <Section title="ที่อยู่บริษัท" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard title="เลขที่" value={addressFields['2'].addressNumber} />
            <InfoCard title="อาคาร/หมู่บ้าน" value={addressFields['2'].building} />
            <InfoCard title="หมู่" value={addressFields['2'].moo} />
            <InfoCard title="ซอย" value={addressFields['2'].soi} />
            <InfoCard title="ถนน" value={addressFields['2'].street} />
            <InfoCard title="ตำบล/แขวง" value={addressFields['2'].subDistrict} />
            <InfoCard title="อำเภอ/เขต" value={addressFields['2'].district} />
            <InfoCard title="จังหวัด" value={addressFields['2'].province} />
            <InfoCard title="รหัสไปรษณีย์" value={addressFields['2'].postalCode} />
          </div>
        </Section>
      )}

      {/* ข้อมูลผู้ติดต่อ */}
      <Section title="ข้อมูลผู้ติดต่อ" className="mt-6">
        {(() => {
          const contactDetails = getContactPersonDetails();
          return (
            <div className="space-y-4">
              {/* แสดงประเภทผู้ติดต่อ */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    {contactDetails.typeContactName}
                  </span>
                  {contactDetails.typeContactOtherDetail && (
                    <span className="text-sm text-gray-600 italic">
                      ({contactDetails.typeContactOtherDetail})
                    </span>
                  )}
                </div>
              </div>
              
              {/* ข้อมูลผู้ติดต่อ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="ชื่อ-นามสกุล (ไทย)" value={getContactPersonFullName(false)} />
                <InfoCard title="ชื่อ-นามสกุล (อังกฤษ)" value={getContactPersonFullName(true)} />
                <InfoCard title="ตำแหน่ง" value={contactDetails.position} />
                <InfoCard title="อีเมล" value={contactDetails.email} />
                <InfoCard title="เบอร์โทรศัพท์" value={contactDetails.phone} />
              </div>
              
              {/* แสดงผู้ติดต่อเพิ่มเติม (ถ้ามี) */}
              {formData?.contactPersons && formData.contactPersons.length > 1 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">ผู้ติดต่อเพิ่มเติม</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.contactPersons.slice(1).map((contact, index) => (
                      <div key={index + 1} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {contact.typeContactName || 'ผู้ติดต่อ'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">ชื่อ:</span> {contact.firstNameTh} {contact.lastNameTh}</div>
                          <div><span className="font-medium">ตำแหน่ง:</span> {contact.position || '-'}</div>
                          <div><span className="font-medium">อีเมล:</span> {contact.email || '-'}</div>
                          <div><span className="font-medium">โทร:</span> {contact.phone || '-'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Section>

      {/* ข้อมูลผู้แทน */}
      {formData?.representatives && formData.representatives.length > 0 && (
        <Section title="ข้อมูลผู้แทน" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formData.representatives.map((rep, index) => (
              <RepresentativeCard key={index} representative={rep} index={index} />
            ))}
          </div>
        </Section>
      )}

      {/* ข้อมูลธุรกิจ */}
      <Section title="ข้อมูลธุรกิจ" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BusinessTypesCard 
            title="ประเภทธุรกิจ" 
            businessTypes={getSelectedBusinessTypesArray()} 
          />
          <InfoCard title="จำนวนพนักงาน" value={formData?.numberOfEmployees || formData?.number_of_employees} />
          <ProductsCard products={formData?.products || []} />
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

      {/* เอกสารใบอนุญาต */}
      {formData?.factoryType && (
        <Section title="เอกสารใบอนุญาต" className="mt-6">
          <div className="space-y-4">
            <InfoCard title="ประเภทโรงงาน" value={getFactoryTypeLabel()} />

            {formData?.factoryType === 'type1' && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">เอกสารใบอนุญาต</h4>
                <FileCard
                  fileName={getFileName(formData?.factoryLicense)}
                  fileUrl={getFileUrl(formData?.factoryLicense)}
                  description="ใบอนุญาตประกอบกิจการโรงงาน (รง.4)"
                />
                <FileCard
                  fileName={getFileName(formData?.industrialEstateLicense)}
                  fileUrl={getFileUrl(formData?.industrialEstateLicense)}
                  description="ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (กนอ.)"
                />
              </div>
            )}

            {formData?.factoryType === 'type2' && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">เอกสารการผลิต</h4>
                {formData?.productionImages && formData.productionImages.length > 0 ? (
                  <div className="space-y-2">
                    {formData.productionImages.map((image, index) => (
                      <FileCard
                        key={index}
                        fileName={image.fileName || image.name || `ไฟล์ที่ ${index + 1}`}
                        fileUrl={image.fileUrl || image.cloudinary_url}
                        description={`รูปภาพการผลิต ${index + 1}`}
                      />
                    ))}
                  </div>
                ) : (
                  <FileCard
                    fileName="ไม่ได้อัปโหลด"
                    description="รูปภาพหรือเอกสารการผลิต"
                  />
                )}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* เอกสารที่จำเป็น (บังคับ) */}
      <Section title="เอกสารที่จำเป็น" className="mt-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-red-800">
              เอกสารที่จำเป็นต้องอัปโหลด (บังคับทุกกรณี)
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <FileCard
            fileName={getFileName(formData?.companyStamp)}
            fileUrl={getFileUrl(formData?.companyStamp)}
            description="รูปตราประทับบริษัท (หรือรูปลายเซ็นหากไม่มีตราประทับ)"
          />
          <FileCard
            fileName={getFileName(formData?.authorizedSignature)}
            fileUrl={getFileUrl(formData?.authorizedSignature)}
            description="รูปลายเซ็นผู้มีอำนาจลงนาม"
          />
        </div>
      </Section>

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