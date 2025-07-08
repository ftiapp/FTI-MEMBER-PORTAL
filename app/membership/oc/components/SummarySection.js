'use client';

import React from 'react';

// Helper component for displaying each piece of information
const SummaryItem = ({ label, value, isEven }) => (
  <div className={`${isEven ? 'bg-gray-50' : 'bg-white'} px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || '-'}</dd>
  </div>
);

// Helper component for creating a section
const SummaryCard = ({ title, children }) => (
  <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
    <div className="px-4 py-5 sm:px-6 bg-gray-50">
      <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
    </div>
    <div className="border-t border-gray-200">
      <dl>{children}</dl>
    </div>
  </div>
);

export default function SummarySection({ formData, businessTypes, industrialGroups, provincialChapters }) {
  // --- Helper Functions ---
  const getFileName = (file) => (file?.name ? file.name : 'ไม่ได้อัพโหลด');

  const getSelectedItemsName = (ids, items) => {
    if (!ids || ids.length === 0) return 'ไม่ได้เลือก';
    if (!items || items.length === 0) return ids.join(', ');
    return ids.map(id => items.find(item => String(item.id) === String(id))?.name_th || id).join(', ');
  };
  
  const getSelectedBusinessTypes = () => {
    if (!formData.businessTypes || Object.keys(formData.businessTypes).length === 0) return 'ไม่ได้เลือก';
    
    // Convert object to array of selected business type IDs
    const selectedTypes = Object.keys(formData.businessTypes);
    
    // Map IDs to names using the businessTypes prop
    return selectedTypes.map(typeId => {
      const businessType = businessTypes.find(type => type.id === typeId);
      return businessType ? businessType.nameTh : typeId;
    }).join(', ');
  };

  // --- Data for Rendering ---
  const companyInfo = [
    { label: 'ชื่อบริษัท (ภาษาไทย)', value: formData.companyName },
    { label: 'ชื่อบริษัท (ภาษาอังกฤษ)', value: formData.companyNameEng },
    { label: 'เลขประจำตัวผู้เสียภาษี', value: formData.taxId },
    { label: 'ที่อยู่', value: `${formData.addressNumber} ${formData.street}, ${formData.subDistrict}, ${formData.district}, ${formData.province} ${formData.postalCode}` },
    { label: 'อีเมล', value: formData.companyEmail },
    { label: 'เบอร์โทรศัพท์', value: formData.companyPhone },
  ];

  const representativeInfo = formData.representatives.map((rep, index) => ([
    { label: `ชื่อผู้แทน ${index + 1} (ไทย)`, value: `${rep.firstNameThai} ${rep.lastNameThai}` },
    { label: `ชื่อผู้แทน ${index + 1} (อังกฤษ)`, value: `${rep.firstNameEnglish} ${rep.lastNameEnglish}` },
    { label: 'ตำแหน่ง', value: rep.position },
    { label: 'อีเมล', value: rep.email },
    { label: 'เบอร์โทรศัพท์', value: rep.phone },
  ])).flat();

  // ฟังก์ชันสำหรับแปลงรายการสินค้าให้เป็นข้อความ
  const getProductsText = () => {
    if (!formData.products || !Array.isArray(formData.products) || formData.products.length === 0) {
      return 'ไม่ได้ระบุ';
    }
    
    return formData.products
      .map(product => product.nameTh || product.nameEn || 'ไม่ได้ระบุชื่อ')
      .filter(name => name.trim() !== '')
      .join(', ') || 'ไม่ได้ระบุ';
  };

  const businessInfo = [
    { label: 'ประเภทธุรกิจ', value: getSelectedBusinessTypes() },
    { label: 'สินค้าและบริการ', value: getProductsText() },
  ];

  const industrialInfo = [
      { label: 'กลุ่มอุตสาหกรรม', value: getSelectedItemsName(formData.industrialGroupIds, industrialGroups) },
      { label: 'สภาอุตสาหกรรมจังหวัด', value: getSelectedItemsName(formData.provincialChapterIds, provincialChapters) },
  ];

  const documentsInfo = [
    { label: 'หนังสือรับรองบริษัท', value: getFileName(formData.companyRegistration) },
    { label: 'Company Profile', value: getFileName(formData.companyProfile) },
    { label: 'บัญชีรายชื่อผู้ถือหุ้น', value: getFileName(formData.shareholderList) },
    { label: 'ทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)', value: getFileName(formData.vatRegistration) },
    { label: 'สำเนาบัตรประชาชน (ผู้มีอำนาจ)', value: getFileName(formData.idCard) },
    { label: 'หนังสือมอบอำนาจ', value: getFileName(formData.authorityLetter) },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">สรุปข้อมูลการสมัครสมาชิก</h2>
      
      <SummaryCard title="ข้อมูลบริษัท">
        {companyInfo.map((item, index) => <SummaryItem key={index} {...item} isEven={index % 2 !== 0} />)}
      </SummaryCard>

      <SummaryCard title="ข้อมูลผู้แทน">
        {representativeInfo.map((item, index) => <SummaryItem key={index} {...item} isEven={index % 2 !== 0} />)}
      </SummaryCard>

      <SummaryCard title="ข้อมูลธุรกิจ">
        {businessInfo.map((item, index) => <SummaryItem key={index} {...item} isEven={index % 2 !== 0} />)}
      </SummaryCard>

      <SummaryCard title="กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด">
        {industrialInfo.map((item, index) => <SummaryItem key={index} {...item} isEven={index % 2 !== 0} />)}
      </SummaryCard>

      <SummaryCard title="เอกสารแนบ">
        {documentsInfo.map((item, index) => <SummaryItem key={index} {...item} isEven={index % 2 !== 0} />)}
      </SummaryCard>
    </div>
  );
}
