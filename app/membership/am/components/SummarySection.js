// components/SummarySection.js
'use client';

import PropTypes from 'prop-types';
import { useMemo } from 'react';

// Simplified info card with consistent blue theme (เหมือน AC)
const InfoCard = ({ title, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
    <p className="text-sm text-gray-900">{value || '-'}</p>
  </div>
);

// Special card for business types with tags (เหมือน AC แต่สำหรับประเภทธุรกิจ)
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

// List card for industrial groups and provincial councils
const ListCard = ({ title, items }) => {
  const itemsArray = Array.isArray(items) ? items : items ? [items] : [];
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
      {itemsArray.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {itemsArray.map((item, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">ไม่ได้เลือก</p>
      )}
    </div>
  );
};

// Representative card - ปรับแก้ให้รองรับ field names ที่ถูกต้อง
const RepresentativeCard = ({ representative, index }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <div className="mb-2">
      <h4 className="text-sm font-medium text-gray-700">ผู้แทนสมาคมคนที่ {index + 1}</h4>
      {representative?.isPrimary && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
          ผู้แทนหลัก
        </span>
      )}
    </div>
    
    {representative ? (
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (ไทย)</p>
          <p className="text-sm">
            {/* รองรับทั้ง field names เก่าและใหม่ */}
            {representative.firstNameTh || representative.firstNameThai || ''} {representative.lastNameTh || representative.lastNameThai || ''}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (อังกฤษ)</p>
          <p className="text-sm">
            {/* รองรับทั้ง field names เก่าและใหม่ */}
            {representative.firstNameEn || representative.firstNameEng || representative.firstNameEnglish || ''} {representative.lastNameEn || representative.lastNameEng || representative.lastNameEnglish || ''}
          </p>
        </div>
        {representative.position && (
          <div>
            <p className="text-xs text-gray-500">ตำแหน่ง</p>
            <p className="text-sm">{representative.position}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500">อีเมล</p>
          <p className="text-sm">{representative.email || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">เบอร์โทรศัพท์</p>
          <p className="text-sm">{String(representative.phone) || '-'}</p>
        </div>
      </div>
    ) : (
      <p className="text-sm text-gray-500">ไม่มีข้อมูล</p>
    )}
  </div>
);

// Simplified file display (เหมือน AC)
const FileCard = ({ fileName, description, fileUrl }) => (
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
      {fileName !== 'ไม่ได้อัปโหลด' && fileUrl && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 text-green-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
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
        </div>
      )}
    </div>
  </div>
);

// Simplified section with consistent blue theme (เหมือน AC)
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

export default function SummarySection({ formData, industrialGroups, provincialChapters }) {

  // Helper functions
  const getFileName = (file) => {
    if (file && typeof file === 'object' && file.name) {
      return file.name;
    }
    return 'ไม่ได้อัปโหลด';
  };

  const getFileUrl = (file) => {
    if (file && typeof file === 'object') {
      return file.fileUrl || file.cloudinary_url || file.file_path || null;
    }
    return null;
  };

  // ฟังก์ชันสำหรับแสดงประเภทธุรกิจที่เลือกแบบ array (เหมือน AC)
  const getSelectedBusinessTypesArray = () => {
    if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) {
      return [];
    }

    const businessTypeNames = {
      manufacturer: 'ผู้ผลิต',
      distributor: 'ผู้จัดจำหน่าย',
      importer: 'ผู้นำเข้า',
      exporter: 'ผู้ส่งออก',
      service: 'ผู้ให้บริการ',
      other: 'อื่นๆ'
    };

    const types = Object.keys(formData.businessTypes).map(type => {
      if (type === 'other' && formData.otherBusinessTypeDetail) {
        return `อื่นๆ (${formData.otherBusinessTypeDetail})`;
      }
      return businessTypeNames[type] || type;
    });

    return types;
  };

  // ฟังก์ชันสำหรับแสดงกลุ่มอุตสาหกรรมที่เลือก (เหมือน AC)
  const getSelectedIndustrialGroupsArray = () => {
    if (!formData.industrialGroups || formData.industrialGroups.length === 0) {
      return [];
    }
    
    return formData.industrialGroups.map(groupId => {
      // ค้นหาชื่อกลุ่มอุตสาหกรรมจาก industrialGroups prop
      const group = industrialGroups.find(g => String(g.id) === String(groupId));
      return group ? group.name_th : `กลุ่มอุตสาหกรรม ${groupId}`;
    });
  };

  // ฟังก์ชันสำหรับแสดงสภาอุตสาหกรรมจังหวัดที่เลือก (เหมือน AC)
  const getSelectedProvincialChaptersArray = () => {
    if (!formData.provincialCouncils || formData.provincialCouncils.length === 0) {
      return [];
    }
    
    return formData.provincialCouncils.map(chapterId => {
      // ค้นหาชื่อสภาอุตสาหกรรมจังหวัดจาก provincialChapters prop
      const chapter = provincialChapters.find(c => String(c.id) === String(chapterId));
      return chapter ? chapter.name_th : `สภาอุตสาหกรรมจังหวัด ${chapterId}`;
    });
  };

  // จัดรูปแบบตัวเลข
  const formatNumber = (number) => {
    return number ? `${number.toLocaleString()}` : '-';
  };

  // เตรียมข้อมูลผู้แทนสำหรับแสดงผล
  const representatives = formData.representatives || [];

  return (
    <div className="space-y-6">
      {/* ข้อมูลสมาคม */}
      <Section title="ข้อมูลสมาคม">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="ชื่อสมาคม (ไทย)" value={formData.associationName} />
          <InfoCard title="ชื่อสมาคม (อังกฤษ)" value={formData.associationNameEng} />
          <InfoCard title="เลขประจำตัวผู้เสียภาษี" value={formData.taxId} />
          <InfoCard title="เลขทะเบียนสมาคม" value={formData.associationRegistrationNumber} />
          <InfoCard title="อีเมลสมาคม" value={formData.associationEmail} />
          <InfoCard title="เบอร์โทรศัพท์สมาคม" value={formData.associationPhone} />
        </div>
      </Section>

      {/* ที่อยู่สมาคม - แยกเป็นข้อย่อยๆ เหมือน AC */}
      <Section title="ที่อยู่สมาคม" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="เลขที่" value={formData.addressNumber} />
          <InfoCard title="หมู่" value={formData.moo} />
          <InfoCard title="ซอย" value={formData.soi} />
          <InfoCard title="ถนน" value={formData.road || formData.street} />
          <InfoCard title="ตำบล/แขวง" value={formData.subDistrict} />
          <InfoCard title="อำเภอ/เขต" value={formData.district} />
          <InfoCard title="จังหวัด" value={formData.province} />
          <InfoCard title="รหัสไปรษณีย์" value={formData.postalCode} />
        </div>
      </Section>

      {/* ข้อมูลผู้แทนสมาคม */}
      <Section title="ข้อมูลผู้แทนสมาคม" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {representatives.length > 0 ? (
            representatives.map((rep, index) => (
              <RepresentativeCard key={rep.id || index} representative={rep} index={index} />
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-3">ไม่มีข้อมูลผู้แทน</p>
          )}
        </div>
      </Section>

      {/* ข้อมูลธุรกิจ */}
      <Section title="ข้อมูลธุรกิจ" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BusinessTypesCard title="ประเภทธุรกิจ" businessTypes={getSelectedBusinessTypesArray()} />
          <InfoCard title="สินค้า / บริการ" value={
            formData.products?.length > 0 
              ? formData.products.map(p => p.nameTh || p.nameEn).filter(Boolean).join(', ')
              : '-'
          } />
          <InfoCard title="จำนวนสมาชิกสมาคม" value={formData.memberCount || '-'} />
          <ListCard title="กลุ่มอุตสาหกรรม" items={getSelectedIndustrialGroupsArray()} />
          <div className="md:col-span-2">
            <ListCard title="สภาอุตสาหกรรมจังหวัด" items={getSelectedProvincialChaptersArray()} />
          </div>
        </div>
      </Section>

      {/* เอกสารแนบ */}
      <Section title="เอกสารแนบ" className="mt-6">
        <div className="space-y-3">
          <FileCard 
            fileName={getFileName(formData.associationCertificate)} 
            fileUrl={getFileUrl(formData.associationCertificate)}
            description="หนังสือรับรองสมาคม" 
          />
          <FileCard 
            fileName={getFileName(formData.memberList)} 
            fileUrl={getFileUrl(formData.memberList)}
            description="รายชื่อสมาชิก" 
          />
        </div>
      </Section>

      {/* หมายเหตุ */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>หมายเหตุ:</strong> การสมัครสมาชิกจะสมบูรณ์เมื่อท่านได้รับการยืนยันจากทางสภาอุตสาหกรรมแห่งประเทศไทย
          และชำระค่าธรรมเนียมการสมัครเรียบร้อยแล้ว
        </p>
      </div>
    </div>
  );
}

SummarySection.propTypes = {
  formData: PropTypes.object.isRequired,
  industrialGroups: PropTypes.array,
  provincialChapters: PropTypes.array
};