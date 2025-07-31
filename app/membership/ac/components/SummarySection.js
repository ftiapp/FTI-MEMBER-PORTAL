'use client';

import React from 'react';

// Simplified info card with consistent blue theme
const InfoCard = ({ title, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
    <p className="text-sm text-gray-900">{value || '-'}</p>
  </div>
);

// Special card for industrial groups with tags
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

// Representative card - แก้ไข field names
const RepresentativeCard = ({ representative, index }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <div className="mb-2">
      <h4 className="text-sm font-medium text-gray-700">ผู้แทนคนที่ {index + 1}</h4>
      {representative?.isPrimary && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
          ผู้แทนหลัก
        </span>
      )}
    </div>
    
    {representative ? (
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (ไทย)</p>
          <p className="text-sm">
            {/* แก้ไข field names ให้ตรงกับข้อมูลจริง */}
            {(representative.firstNameTh || representative.firstNameThai || '')} {(representative.lastNameTh || representative.lastNameThai || '')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ชื่อ-นามสกุล (อังกฤษ)</p>
          <p className="text-sm">
            {/* แก้ไข field names ให้ตรงกับข้อมูลจริง */}
            {(representative.firstNameEn || representative.firstNameEng || representative.firstNameEnglish || '')} {(representative.lastNameEn || representative.lastNameEng || representative.lastNameEnglish || '')}
          </p>
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
    ) : (
      <p className="text-sm text-gray-500">ไม่มีข้อมูล</p>
    )}
  </div>
);

// Simplified file display with eye icon for viewing
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
          <div className="w-4 h-4 text-blue-500">
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

/**
 * คอมโพเนนต์สำหรับแสดงสรุปข้อมูลการสมัครสมาชิกประเภท AC (สมทบ-นิติบุคคล)
 * @param {Object} props
 * @param {Object} props.formData ข้อมูลฟอร์มทั้งหมด
 * @param {Array} props.industrialGroups ข้อมูลกลุ่มอุตสาหกรรมจาก API
 * @param {Array} props.provincialChapters ข้อมูลสภาอุตสาหกรรมจังหวัดจาก API
 */
export default function SummarySection({ formData, industrialGroups = [], provincialChapters = [] }) {
  // Helper functions
  const getFileName = (fileObj) => {
    if (!fileObj) return 'ไม่ได้อัปโหลด';
    if (typeof fileObj === 'object') {
      if (fileObj instanceof File) return fileObj.name;
      if (fileObj.name) return fileObj.name;
      if (fileObj.file && fileObj.file.name) return fileObj.file.name;
      if (fileObj.fileUrl) return fileObj.name || 'ไฟล์ถูกอัปโหลดแล้ว';
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

  // ฟังก์ชันสำหรับแสดงประเภทธุรกิจที่เลือก
  const getSelectedBusinessTypes = () => {
    if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) {
      return '-';
    }
    
    // กำหนดชื่อประเภทธุรกิจ
    const businessTypeNames = {
      manufacturer: 'ผู้ผลิต',
      distributor: 'ผู้จัดจำหน่าย',
      importer: 'ผู้นำเข้า',
      exporter: 'ผู้ส่งออก',
      service: 'ผู้ให้บริการ',
      other: 'อื่นๆ'
    };
    
    // แปลงจาก object เป็น array ของชื่อประเภทธุรกิจ
    const selectedTypes = Object.keys(formData.businessTypes)
      .map(key => businessTypeNames[key] || key);
    
    // ถ้ามีการเลือกประเภทอื่นๆ และมีรายละเอียดเพิ่มเติม
    if (formData.businessTypes.other && formData.otherBusinessTypeDetail) {
      // แทนที่ 'อื่นๆ' ด้วยรายละเอียดที่ผู้ใช้กรอก
      const otherIndex = selectedTypes.indexOf('อื่นๆ');
      if (otherIndex !== -1) {
        selectedTypes[otherIndex] = `อื่นๆ (${formData.otherBusinessTypeDetail})`;
      }
    }
    
    return selectedTypes.join(', ');
  };
  
  // ฟังก์ชันสำหรับแสดงกลุ่มอุตสาหกรรมที่เลือกแบบ array
  const getSelectedIndustrialGroupsArray = () => {
    if (!formData.industrialGroups || formData.industrialGroups.length === 0) {
      return [];
    }
    
    // แปลงจากรหัสเป็นชื่อกลุ่มอุตสาหกรรมโดยใช้ข้อมูลจาก API
    return formData.industrialGroups.map(groupId => {
      // กรณีที่เป็น object ที่มี name_th อยู่แล้ว
      if (typeof groupId === 'object' && groupId.name_th) {
        return groupId.name_th;
      }
      
      // กรณีที่เป็นชื่ออยู่แล้ว
      if (typeof groupId === 'string' && !groupId.match(/^\d+$/)) {
        return groupId;
      }
      
      // ค้นหาชื่อกลุ่มอุตสาหกรรมจาก API โดยใช้ ID
      const group = industrialGroups.find(g => String(g.id) === String(groupId));
      if (group && group.name_th) {
        return group.name_th;
      }
      
      // ถ้าไม่พบใน API ให้แสดงรหัส
      return `กลุ่มอุตสาหกรรม ${groupId}`;
    });
  };
  
  // ฟังก์ชันสำหรับแสดงสภาอุตสาหกรรมจังหวัด
  const getSelectedProvincialChapters = () => {
    // แสดงข้อมูลสภาอุตสาหกรรมจังหวัดจาก API โดยตรง
    if (!provincialChapters || provincialChapters.length === 0) {
      return [];
    }
    
    // แสดงชื่อสภาอุตสาหกรรมจังหวัดทั้งหมดจาก API
    return provincialChapters.slice(0, 2).map(chapter => chapter.name_th);
  };

  // เตรียมข้อมูลผู้แทนสำหรับแสดงผล
  const representatives = formData.representatives || [];
  // เตรียมข้อมูลผู้ให้ข้อมูล
  const contactPerson = formData.contactPerson || {};

  return (
    <div className="space-y-6">
      {/* ข้อมูลบริษัท */}
      <Section title="ข้อมูลบริษัท">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="ชื่อบริษัท (ไทย)" value={formData.companyName} />
          <InfoCard title="ชื่อบริษัท (อังกฤษ)" value={formData.companyNameEn} />
          <InfoCard title="เลขประจำตัวผู้เสียภาษี" value={formData.taxId} />
          <InfoCard title="อีเมล" value={formData.companyEmail} />
          <InfoCard title="เบอร์โทรศัพท์" value={formData.companyPhone} />
          <InfoCard title="เว็บไซต์" value={formData.companyWebsite} />
        </div>
      </Section>

      {/* ที่อยู่บริษัท - แยกเป็นข้อย่อยๆ เหมือน OC */}
      <Section title="ที่อยู่บริษัท" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="เลขที่" value={formData.addressNumber} />
          <InfoCard title="หมู่" value={formData.moo} />
          <InfoCard title="ซอย" value={formData.soi} />
          <InfoCard title="ถนน" value={formData.road} />
          <InfoCard title="ตำบล/แขวง" value={formData.subDistrict} />
          <InfoCard title="อำเภอ/เขต" value={formData.district} />
          <InfoCard title="จังหวัด" value={formData.province} />
          <InfoCard title="รหัสไปรษณีย์" value={formData.postalCode} />
        </div>
      </Section>

      {/* ข้อมูลผู้ให้ข้อมูล */}
      <Section title="ข้อมูลผู้ให้ข้อมูล" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="ชื่อ-นามสกุล (ไทย)" value={`${contactPerson.firstNameThai || ''} ${contactPerson.lastNameThai || ''}`} />
          <InfoCard title="ชื่อ-นามสกุล (อังกฤษ)" value={`${contactPerson.firstNameEng || ''} ${contactPerson.lastNameEng || ''}`} />
          <InfoCard title="อีเมล" value={contactPerson.email} />
          <InfoCard title="เบอร์โทรศัพท์" value={contactPerson.phone} />
          <InfoCard title="ตำแหน่ง" value={contactPerson.position} />
        </div>
      </Section>

      {/* ข้อมูลผู้แทน */}
      <Section title="ข้อมูลผู้แทนนิติบุคคล" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {representatives.length > 0 ? (
            representatives.map((rep, index) => (
              <RepresentativeCard key={index} representative={rep} index={index} />
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-3">ไม่มีข้อมูลผู้แทน</p>
          )}
        </div>
      </Section>

      {/* ข้อมูลธุรกิจ */}
      <Section title="ข้อมูลธุรกิจ" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="ประเภทธุรกิจ" value={getSelectedBusinessTypes()} />
          <IndustrialGroupsCard title="กลุ่มอุตสาหกรรม" industrialGroups={getSelectedIndustrialGroupsArray()} />
          <ProductsCard products={formData.products || []} />
          <IndustrialGroupsCard title="สภาอุตสาหกรรมจังหวัด" industrialGroups={getSelectedProvincialChapters()} />
        </div>
      </Section>

      {/* เอกสารแนบ */}
      <Section title="เอกสารแนบ" className="mt-6">
        <div className="space-y-3">
          <FileCard 
            fileName={getFileName(formData.companyRegistration)} 
            fileUrl={getFileUrl(formData.companyRegistration)}
            description="สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล" 
          />
        </div>
      </Section>
    </div>
  );
}