"use client";

import AssociationBasicInfo from "@/app/membership/am/components/AMAssociationBasicInfo/AssociationBasicInfo";

export default function AssociationBasicInfoWrapper({
  formData,
  setFormData,
  errors,
  setErrors,
  isLoading,
  isCheckingTaxId,
  setIsCheckingTaxId,
}) {
  return (
    <AssociationBasicInfo
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      setErrors={setErrors}
      isLoading={isLoading}
      isCheckingTaxId={isCheckingTaxId}
      setIsCheckingTaxId={setIsCheckingTaxId}
    />
  );
}
