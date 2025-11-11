"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import LoadingOverlay from "@/app/dashboard/components/shared/LoadingOverlay";
import TaxIdField from "./TaxIdField";
import AssociationInfoFields from "./AssociationInfoFields";
import { useAssociationInfoFetcher } from "./hooks/useAssociationInfoFetcher";
import { useTaxIdValidation } from "./hooks/useTaxIdValidation";

export default function AssociationBasicInfo({
  formData,
  setFormData,
  errors,
  setErrors,
  isLoading,
  isCheckingTaxId,
  setIsCheckingTaxId,
}) {
  const [isFetchingDBD, setIsFetchingDBD] = useState(false);

  // Custom hooks for business logic
  const {
    validationStatus,
    setValidationStatus,
    handleTaxIdChange,
    checkTaxIdUniqueness,
  } = useTaxIdValidation(formData, setFormData, errors, setErrors);

  const { fetchAssociationInfo, clearAutofilledFields } = useAssociationInfoFetcher(
    formData,
    setFormData,
    setErrors,
    setIsFetchingDBD,
    setValidationStatus
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <LoadingOverlay
        isVisible={isFetchingDBD}
        message="กำลังดึงข้อมูลจากกรมพัฒนาธุรกิจการค้า..."
      />
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-blue-600 px-8 py-6">
          <h3 className="text-xl font-semibold text-white tracking-tight">
            ข้อมูลสมาคม / Association Information
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            กรอกข้อมูลพื้นฐานของสมาคม / Enter basic association information
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 py-8 space-y-8">
          {/* Manual-only mode: autofill selection removed */}

          {/* Association Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
              ข้อมูลพื้นฐาน / Basic Information
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tax ID Field */}
              <TaxIdField
                formData={formData}
                isLoading={isLoading}
                validationStatus={validationStatus}
                handleTaxIdChange={handleTaxIdChange}
              />

              {/* Association Info Fields */}
              <AssociationInfoFields
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
