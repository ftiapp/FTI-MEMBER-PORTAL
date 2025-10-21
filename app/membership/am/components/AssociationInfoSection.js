"use client";

import { useState } from "react";
import AssociationBasicInfo from "./AssociationBasicInfo";
import { AddressSection } from "../../shared/address";
import ContactPersonInfo from "./ContactPersonInfo";
import IndustrialGroupSection from "../../components/IndustrialGroupSection";
import { useIndustrialGroups } from "../../hooks/useIndustrialGroups";

export default function AssociationInfoSection({ formData, setFormData, errors, setErrors }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingTaxId, setIsCheckingTaxId] = useState(false);

  // Fetch industrial groups and provincial chapters from MSSQL
  const {
    industrialGroups,
    provincialChapters,
    isLoading: isLoadingGroups,
  } = useIndustrialGroups();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* ข้อมูลสมาคมพื้นฐาน */}
      <AssociationBasicInfo
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        isLoading={isLoading}
        isCheckingTaxId={isCheckingTaxId}
        setIsCheckingTaxId={setIsCheckingTaxId}
      />

      {/* ที่อยู่สมาคมและข้อมูลติดต่อ */}
      <AddressSection
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        title="ที่อยู่สมาคม"
        subtitle="ข้อมูลที่อยู่และการติดต่อของสมาคม"
      />

      {/* ข้อมูลผู้ให้ข้อมูล */}
      <ContactPersonInfo formData={formData} setFormData={setFormData} errors={errors} />

      {/* กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด */}
      <IndustrialGroupSection
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        industrialGroups={industrialGroups}
        provincialChapters={provincialChapters}
        isLoading={isLoadingGroups}
      />
    </div>
  );
}
