'use client';

import { useState } from 'react';
import CompanyBasicInfo from './CompanyBasicInfo';
import CompanyAddressInfo from './CompanyAddressInfo';
import ContactPersonInfo from './ContactPersonInfo';
import IndustrialGroupInfo from './IndustrialGroupInfo';

/**
 * คอมโพเนนต์สำหรับกรอกข้อมูลบริษัทในฟอร์มสมัครสมาชิกประเภท AC (สมทบ-นิติบุคคล)
 * @param {Object} props
 * @param {Object} props.formData ข้อมูลฟอร์มทั้งหมด
 * @param {Function} props.setFormData ฟังก์ชันสำหรับอัพเดทข้อมูลฟอร์ม
 * @param {Object} props.errors ข้อผิดพลาดของฟอร์ม
 * @param {Function} props.setErrors ฟังก์ชันสำหรับอัพเดทข้อผิดพลาด
 */
export default function CompanyInfoSection({ formData, setFormData, errors, setErrors }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutofill, setIsAutofill] = useState(true); // เริ่มต้นด้วยโหมด autofill
  const [isCheckingTaxId, setIsCheckingTaxId] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // ลบข้อผิดพลาดเมื่อมีการแก้ไขข้อมูล
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // ลบข้อผิดพลาดเมื่อมีการแก้ไขข้อมูล
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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
        setErrors={setErrors}
        isAutofill={isAutofill}
      />
      
      {/* ข้อมูลผู้ให้ข้อมูล */}
      <ContactPersonInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
      />
      
      {/* กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด */}
      <IndustrialGroupInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
      />
    </div>
  );
}
