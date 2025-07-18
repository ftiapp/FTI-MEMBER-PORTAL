'use client';

import { useState } from 'react';
import AssociationBasicInfo from './AssociationBasicInfo';
import AssociationAddressInfo from './AssociationAddressInfo';
import ContactPersonInfo from './ContactPersonInfo';
import IndustrialGroupInfo from './IndustrialGroupInfo';

export default function AssociationInfoSection({ formData, setFormData, errors, setErrors }) {
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
      {/* ข้อมูลสมาคมพื้นฐาน */}
      <AssociationBasicInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        isAutofill={isAutofill}
        setIsAutofill={setIsAutofill}
        isLoading={isLoading}
        isCheckingTaxId={isCheckingTaxId}
        setIsCheckingTaxId={setIsCheckingTaxId}
      />
      
      {/* ที่อยู่สมาคมและข้อมูลติดต่อ */}
      <AssociationAddressInfo
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
      />
    </div>
  );
}