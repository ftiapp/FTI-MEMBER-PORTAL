'use client';

import React from 'react';

// Simplified info card with consistent blue theme
const InfoCard = ({ title, value }) => {
  const hasValue = value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '');
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
      <p className="text-sm text-gray-900">{hasValue ? value : '-'}</p>
    </div>
  );
};

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

// Industrial Groups card with tags
const IndustrialGroupsCard = ({ title, industrialGroups, color = 'blue' }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200"
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
      {industrialGroups.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {industrialGroups.map((group, index) => (
            <span 
              key={index}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}
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
};

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

// Representative card - ✅ รวมคำนำหน้าชื่อ (Prename) ทั้งไทย/อังกฤษ และรองรับ Other/อื่นๆ
const RepresentativeCard = ({ representative, index }) => {
  const getPrename = (rep, en = false) => {
    if (!rep) return '';
    if (en) {
      const pre = rep.prenameEn || '';
      if (pre && /^other$/i.test(pre)) return rep.prenameOther || '';
      return pre;
    }
    const pre = rep.prenameTh || '';
    if (pre && (pre === 'อื่นๆ' || pre === 'อื่น ๆ')) return rep.prenameOther || '';
    return pre;
  };

  const fullNameTh = (() => {
    const pre = getPrename(representative, false);
    const first = representative.firstNameTh || representative.firstNameThai || '';
    const last = representative.lastNameTh || representative.lastNameThai || '';
    const parts = [pre, first, last].filter(Boolean);
    return parts.length ? parts.join(' ') : '-';
  })();

  const fullNameEn = (() => {
    const pre = getPrename(representative, true);
    const first = representative.firstNameEn || representative.firstNameEng || representative.firstNameEnglish || '';
    const last = representative.lastNameEn || representative.lastNameEng || representative.lastNameEnglish || '';
    const parts = [pre, first, last].filter(Boolean);
    return parts.length ? parts.join(' ') : '-';
  })();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="mb-2">
        <h4 className="text-sm font-medium text-gray-700">ผู้แทนคนที่ {index + 1}</h4>
        {representative?.isPrimary && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
            ผู้แทนหลัก
          </span>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (ไทย)</p>
          <p className="text-sm">{fullNameTh}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (อังกฤษ)</p>
          <p className="text-sm">{fullNameEn}</p>
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
          <p className="text-sm">
            {(() => {
              const phone = representative.phone || '-';
              const extension = representative.phoneExtension || '';
              if (phone === '-') return '-';
              return extension ? `${phone} ต่อ ${extension}` : phone;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

// File display card
const FileCard = ({ fileName, description, fileUrl }) => {
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

// Section container
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

/**
 * ✅ แก้ไข: SummarySection ใหม่ที่รองรับ field names ทั้งเก่าและใหม่
 */
export default function SummarySectionComponent({ formData, businessTypes, industrialGroups = [], provincialChapters = [] }) {
  
  // Helper functions สำหรับจัดการไฟล์
  const getFileName = (fileObj) => {
    if (!fileObj) return 'ไม่ได้อัปโหลด';
    if (typeof fileObj === 'object') {
      if (fileObj instanceof File) return fileObj.name;
      if (fileObj.name) return fileObj.name;
      if (fileObj.file && fileObj.file.name) return fileObj.file.name;
      if (fileObj.fileName) return fileObj.fileName;
    }
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

  // ✅ แก้ไข: ฟังก์ชันสำหรับแสดงประเภทธุรกิจ - รองรับทั้ง object และ array
  const getSelectedBusinessTypesArray = () => {
    if (!formData || !formData.businessTypes) return [];
    
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

  // ✅ แก้ไข: ฟังก์ชันสำหรับแสดงกลุ่มอุตสาหกรรม - รองรับ field names ใหม่
  const getSelectedIndustrialGroupsArray = () => {
    // 🔥 ระบบใหม่: ใช้ industrialGroupNames จาก IndustrialGroupSection
    if (formData?.industrialGroupNames && formData.industrialGroupNames.length > 0) {
      return formData.industrialGroupNames.filter(name => name && name.trim() !== '');
    }
    
    // 🔥 ระบบใหม่: ใช้ industrialGroupIds จาก IndustrialGroupSection
    if (formData?.industrialGroupIds && formData.industrialGroupIds.length > 0) {
      return formData.industrialGroupIds.map(id => {
        const group = industrialGroups.find(g => String(g.id) === String(id));
        return group ? group.name_th : `กลุ่มอุตสาหกรรม ${id}`;
      });
    }
    
    // 🔥 ระบบเก่า: backward compatibility
    if (formData?.industrialGroups && formData.industrialGroups.length > 0) {
      return formData.industrialGroups.map(group => {
        if (typeof group === 'object' && group.name_th) {
          return group.name_th;
        }
        if (typeof group === 'string' && !group.match(/^\d+$/)) {
          return group;
        }
        const foundGroup = industrialGroups.find(g => String(g.id) === String(group));
        return foundGroup ? foundGroup.name_th : `กลุ่มอุตสาหกรรม ${group}`;
      });
    }
    
    return [];
  };

  // ✅ แก้ไข: ฟังก์ชันสำหรับแสดงสภาอุตสาหกรรมจังหวัด - รองรับ field names ใหม่
  const getSelectedProvincialChaptersArray = () => {
    // 🔥 ระบบใหม่: ใช้ provincialChapterNames จาก IndustrialGroupSection
    if (formData?.provincialChapterNames && formData.provincialChapterNames.length > 0) {
      return formData.provincialChapterNames.filter(name => name && name.trim() !== '');
    }
    
    // 🔥 ระบบใหม่: ใช้ provincialChapterIds จาก IndustrialGroupSection
    if (formData?.provincialChapterIds && formData.provincialChapterIds.length > 0) {
      return formData.provincialChapterIds.map(id => {
        const chapter = provincialChapters.find(c => String(c.id) === String(id));
        return chapter ? chapter.name_th : `สภาอุตสาหกรรมจังหวัด ${id}`;
      });
    }
    
    // 🔥 ระบบเก่า: backward compatibility
    if (formData?.provincialChapters && formData.provincialChapters.length > 0) {
      return formData.provincialChapters.map(chapter => {
        if (typeof chapter === 'object' && (chapter.name_th || chapter.name)) {
          return chapter.name_th || chapter.name;
        }
        if (typeof chapter === 'string' && !chapter.match(/^\d+$/)) {
          return chapter;
        }
        const foundChapter = provincialChapters.find(c => String(c.id) === String(chapter));
        return foundChapter ? foundChapter.name_th : `สภาอุตสาหกรรมจังหวัด ${chapter}`;
      });
    }
    
    // เผื่อใช้ field name อื่น
    if (formData?.provinceChapters && formData.provinceChapters.length > 0) {
      return formData.provinceChapters.map(chapter => {
        if (typeof chapter === 'object' && (chapter.name_th || chapter.name)) {
          return chapter.name_th || chapter.name;
        }
        return typeof chapter === 'string' ? chapter : `สภาอุตสาหกรรมจังหวัด ${chapter}`;
      });
    }
    
    return [];
  };

  // ฟังก์ชันสำหรับแสดงชื่อผู้ติดต่อ
  const getContactPersonFullName = (isEnglish = false) => {
    if (!formData) return '-';

    // ระบบใหม่: ใช้ contactPersons array
    if (formData.contactPersons && formData.contactPersons.length > 0) {
      const mainContact = formData.contactPersons[0];
      // helper to get prename with fallbacks
      const getPrename = (contact, en = false) => {
        if (!contact) return '';
        if (en) {
          const pre = contact.prenameEn || '';
          if (pre && pre.toLowerCase() === 'other') return contact.prenameOther || '';
          return pre;
        } else {
          const pre = contact.prenameTh || '';
          if (pre && (pre === 'อื่นๆ' || pre === 'อื่น ๆ')) return contact.prenameOther || '';
          return pre;
        }
      };

      if (isEnglish) {
        const prename = getPrename(mainContact, true);
        return (mainContact.firstNameEn || mainContact.firstNameEng) && (mainContact.lastNameEn || mainContact.lastNameEng)
          ? `${[prename, (mainContact.firstNameEn || mainContact.firstNameEng), (mainContact.lastNameEn || mainContact.lastNameEng)].filter(Boolean).join(' ')}`
          : (prename ? prename : '-');
      }
      const prename = getPrename(mainContact, false);
      return (mainContact.firstNameTh || mainContact.firstNameThai) && (mainContact.lastNameTh || mainContact.lastNameThai)
        ? `${[prename, (mainContact.firstNameTh || mainContact.firstNameThai), (mainContact.lastNameTh || mainContact.lastNameThai)].filter(Boolean).join(' ')}`
        : (prename ? prename : '-');
    }
    
    // ระบบเก่า: backward compatibility
    if (isEnglish) {
      const prename = formData.contactPersonPrenameEn === 'Other' ? (formData.contactPersonPrenameOther || '') : (formData.contactPersonPrenameEn || '');
      return formData.contactPersonFirstNameEng && formData.contactPersonLastNameEng 
        ? `${[prename, formData.contactPersonFirstNameEng, formData.contactPersonLastNameEng].filter(Boolean).join(' ')}` 
        : (prename ? prename : '-');
    }
    const prename = (formData.contactPersonPrenameTh === 'อื่นๆ' || formData.contactPersonPrenameTh === 'อื่น ๆ') ? (formData.contactPersonPrenameOther || '') : (formData.contactPersonPrenameTh || '');
    return formData.contactPersonFirstName && formData.contactPersonLastName 
      ? `${[prename, formData.contactPersonFirstName, formData.contactPersonLastName].filter(Boolean).join(' ')}` 
      : (prename ? prename : '-');
  };

  // ฟังก์ชันสำหรับแสดงข้อมูลผู้ติดต่อทั้งหมด
  const getContactPersonDetails = () => {
    if (!formData) return {};
    
    // ระบบใหม่: ใช้ contactPersons array
    if (formData.contactPersons && formData.contactPersons.length > 0) {
      const mainContact = formData.contactPersons[0];
      return {
        position: mainContact.position || '-',
        email: mainContact.email || '-',
        phone: mainContact.phone || '-',
        phoneExtension: mainContact.phoneExtension || mainContact.phone_extension || '',
        typeContactName: mainContact.typeContactName || 'ผู้ประสานงานหลัก',
        typeContactOtherDetail: mainContact.typeContactOtherDetail || ''
      };
    }
    
    // ระบบเก่า: backward compatibility
    return {
      position: formData.contactPersonPosition || formData.contact_person_position || '-',
      email: formData.contactPersonEmail || formData.contact_person_email || '-',
      phone: formData.contactPersonPhone || formData.contact_person_phone || '-',
      phoneExtension: formData.contactPersonPhoneExtension || formData.contact_person_phone_extension || formData.phone_extension || '',
      typeContactName: 'ผู้ประสานงานหลัก',
      typeContactOtherDetail: ''
    };
  };

  // ✅ แก้ไข: สร้างข้อมูลที่อยู่ - รองรับ structure ใหม่
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
        phoneExtension: '-',
        email: '-',
        website: '-'
      };
    }
    
    // ระบบใหม่: addresses structure
    if (formData.addresses && formData.addresses[addressType]) {
      const address = formData.addresses[addressType];
      return {
        addressNumber: address.addressNumber || '-',
        building: address.building || '-',
        moo: address.moo || '-',
        soi: address.soi || '-',
        street: address.STreet || address.street || address.road || '-', // ✅ รองรับ STreet และ road
        subDistrict: address.subDistrict || '-',
        district: address.district || '-',
        province: address.province || '-',
        postalCode: address.postalCode || '-',
        phone: address.phone || formData.companyPhone || '-', // ✅ fallback ไปที่ companyPhone
        phoneExtension: address.phoneExtension || formData.companyPhoneExtension || '-',
        email: address.email || formData.companyEmail || '-', // ✅ fallback ไปที่ companyEmail
        website: address.website || formData.companyWebsite || '-' // ✅ fallback ไปที่ companyWebsite
      };
    }
    
    // ระบบเก่า: single address
    const address = formData.address || formData;
    return {
      addressNumber: address.addressNumber || address.address_number || '-',
      building: address.building || '-',
      moo: address.moo || '-',
      soi: address.soi || '-',
      street: address.STreet || address.street || address.road || '-',
      subDistrict: address.subDistrict || address.sub_district || '-',
      district: address.district || '-',
      province: address.province || '-',
      postalCode: address.postalCode || address.postal_code || '-',
      phone: address.phone || formData.companyPhone || '-',
      phoneExtension: address.phoneExtension || formData.companyPhoneExtension || '-',
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

  // 🔥 Debug logs
  console.log('=== Summary Debug ===');
  console.log('formData:', formData);
  console.log('Industrial Groups:', getSelectedIndustrialGroupsArray());
  console.log('Provincial Chapters:', getSelectedProvincialChaptersArray());

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
          <InfoCard title="ชื่อบริษัท (อังกฤษ)" value={formData?.companyNameEn || formData?.companyNameEng || formData?.company_name_eng} />
          <InfoCard title="เลขประจำตัวผู้เสียภาษี" value={formData?.taxId} />
        </div>
      </Section>

      {/* ที่อยู่บริษัท */}
      {hasMultipleAddresses ? (
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
                  <InfoCard title="โทรศัพท์" value={(function(){ const p = fields.phone; const ext = fields.phoneExtension; if (p === '-') return '-'; return ext ? `${p} ต่อ ${ext}` : p; })()} />
                  <InfoCard title="อีเมล" value={fields.email} />
                  <InfoCard title="เว็บไซต์" value={fields.website} />
                </div>
              </Section>
            );
          })}
        </div>
      ) : (
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
            <InfoCard title="โทรศัพท์" value={(function(){ const f = addressFields['2']; const p = f.phone; const ext = f.phoneExtension; if (p === '-') return '-'; return ext ? `${p} ต่อ ${ext}` : p; })()} />
            <InfoCard title="อีเมล" value={addressFields['2'].email} />
            <InfoCard title="เว็บไซต์" value={addressFields['2'].website} />
          </div>
        </Section>
      )}

      {/* ข้อมูลผู้ติดต่อ */}
      <Section title="ข้อมูลผู้ติดต่อ" className="mt-6">
        {(() => {
          const contactDetails = getContactPersonDetails();
          return (
            <div className="space-y-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="ชื่อ-นามสกุล (ไทย)" value={getContactPersonFullName(false)} />
                <InfoCard title="ชื่อ-นามสกุล (อังกฤษ)" value={getContactPersonFullName(true)} />
                <InfoCard title="ตำแหน่ง" value={contactDetails.position} />
                <InfoCard title="อีเมล" value={contactDetails.email} />
                <InfoCard title="เบอร์โทรศัพท์" value={(function(){ const d = getContactPersonDetails(); const p = d.phone; const ext = d.phoneExtension; if (p === '-') return '-'; return ext ? `${p} ต่อ ${ext}` : p; })()} />
              </div>
              
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
                          <div><span className="font-medium">ชื่อ:</span> {(() => {
                            const getPrenameTh = (c) => {
                              const pre = c.prenameTh || '';
                              if (pre && (pre === 'อื่นๆ' || pre === 'อื่น ๆ')) return c.prenameOther || '';
                              return pre;
                            };
                            const parts = [getPrenameTh(contact), contact.firstNameTh || '', contact.lastNameTh || ''].filter(Boolean);
                            const nameTh = parts.join(' ').trim();
                            return nameTh || '-';
                          })()}</div>
                          <div><span className="font-medium">ตำแหน่ง:</span> {contact.position || '-'}</div>
                          <div><span className="font-medium">อีเมล:</span> {contact.email || '-'}</div>
                          <div><span className="font-medium">โทร:</span> {(function(){ const p = contact.phone || '-'; const ext = contact.phoneExtension || ''; if (p === '-') return '-'; return ext ? `${p} ต่อ ${ext}` : p; })()} </div>
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
          {(() => {
            const employeesValue = (
              formData?.numberOfEmployees ??
              formData?.number_of_employees ??
              formData?.employee_count ??
              formData?.employeeCount ??
              formData?.employees
            );
            return (
              <InfoCard title="จำนวนพนักงาน" value={employeesValue} />
            );
          })()}
          <ProductsCard products={formData?.products || []} />
          <IndustrialGroupsCard 
            title="กลุ่มอุตสาหกรรม" 
            industrialGroups={getSelectedIndustrialGroupsArray()}
            color="blue"
          />
          <IndustrialGroupsCard 
            title="สภาอุตสาหกรรมจังหวัด" 
            industrialGroups={getSelectedProvincialChaptersArray()}
            color="emerald"
          />
        </div>
      </Section>

      {/* ข้อมูลทางการเงิน (ย้ายมาไว้ใต้ข้อมูลธุรกิจ) */}
      <Section title="ข้อมูลทางการเงิน">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard 
            title="ทุนจดทะเบียน (บาท)" 
            value={formData?.registeredCapital ? Number(formData.registeredCapital).toLocaleString() : '-'} 
          />
          <InfoCard 
            title="กำลังการผลิต (ต่อปี)" 
            value={formData?.productionCapacityValue && formData?.productionCapacityUnit 
              ? `${Number(formData.productionCapacityValue).toLocaleString()} ${formData.productionCapacityUnit}` 
              : '-'
            } 
          />
          <InfoCard 
            title="ยอดจำหน่ายในประเทศ (บาท/ปี)" 
            value={formData?.salesDomestic ? Number(formData.salesDomestic).toLocaleString() : '-'} 
          />
          <InfoCard 
            title="ยอดจำหน่ายส่งออก (บาท/ปี)" 
            value={formData?.salesExport ? Number(formData.salesExport).toLocaleString() : '-'} 
          />
          <InfoCard 
            title="สัดส่วนผู้ถือหุ้นไทย (%)" 
            value={formData?.shareholderThaiPercent ? `${Number(formData.shareholderThaiPercent).toFixed(2)}%` : '-'} 
          />
          <InfoCard 
            title="สัดส่วนผู้ถือหุ้นต่างประเทศ (%)" 
            value={formData?.shareholderForeignPercent ? `${Number(formData.shareholderForeignPercent).toFixed(2)}%` : '-'} 
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

      {/* เอกสารแนบพื้นฐาน */}
      <Section title="เอกสารแนบ" className="mt-6">
        <div className="space-y-3">
          <FileCard 
            fileName={getFileName(formData?.companyRegistration)} 
            fileUrl={getFileUrl(formData?.companyRegistration)}
            description="สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล" 
          />
         
        </div>
      </Section>

      {/* เอกสารที่จำเป็น */}
      <Section title="เอกสารที่จำเป็น" className="mt-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                เอกสารที่จำเป็นต้องอัพโหลด
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>เอกสารเหล่านี้จำเป็นสำหรับการสมัครสมาชิก กรุณาตรวจสอบให้แน่ใจว่าได้อัพโหลดครบถ้วน</p>
              </div>
            </div>
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