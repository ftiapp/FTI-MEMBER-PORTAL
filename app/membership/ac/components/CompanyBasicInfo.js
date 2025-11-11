"use client";

import CompanyBasicInfo from '@/app/membership/ac/components/ACCompanyBasicInfo/CompanyBasicInfo';

export default function CompanyBasicInfoWrapper({
  formData,
  setFormData,
  errors,
  setErrors,
  isAutofill,
  setIsAutofill,
  isLoading,
}) {
  return (
    <CompanyBasicInfo
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      setErrors={setErrors}
      isAutofill={isAutofill}
      setIsAutofill={setIsAutofill}
      isLoading={isLoading}
    />
  );
}
