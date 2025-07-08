'use client';

import { useState } from 'react';
import CompanyBasicInfo from './CompanyBasicInfo';
import CompanyAddressInfo from './CompanyAddressInfo';
import ContactPersonInfo from './ContactPersonInfo';
import IndustrialGroupInfo from './IndustrialGroupInfo';

export default function CompanyInfoSection({ formData, setFormData, errors, setErrors, industrialGroups, provincialChapters }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutofill, setIsAutofill] = useState(true); // เริ่มต้นด้วยโหมด autofill
  const [isCheckingTaxId, setIsCheckingTaxId] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* ข้อมูลบริษัทพื้นฐาน */}
      <CompanyBasicInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        isAutofill={isAutofill}
        setIsAutofill={setIsAutofill}
        isLoading={isLoading}
        isCheckingTaxId={isCheckingTaxId}
      />
      
      {/* ที่อยู่บริษัทและข้อมูลติดต่อ */}
      <CompanyAddressInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        isAutofill={isAutofill}
      />
      
      {/* ข้อมูลผู้ให้ข้อมูล */}
      <ContactPersonInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />
      
      {/* กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด */}
      <IndustrialGroupInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        industrialGroups={industrialGroups}
        provincialChapters={provincialChapters}
        isLoading={isLoading}
      />
    </div>
  );
}
