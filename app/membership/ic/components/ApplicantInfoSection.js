"use client";

import ApplicantInfoSection from '@/app/membership/ic/components/ICApplicantInfo/ApplicantInfoSection';

export default function ApplicantInfoSectionWrapper({
  formData,
  setFormData,
  errors,
  industrialGroups,
  provincialChapters,
  isLoading,
}) {
  return (
    <ApplicantInfoSection
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      industrialGroups={industrialGroups}
      provincialChapters={provincialChapters}
      isLoading={isLoading}
    />
  );
}
