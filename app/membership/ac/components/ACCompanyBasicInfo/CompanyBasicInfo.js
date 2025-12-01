"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import LoadingOverlay from "@/app/dashboard/components/shared/LoadingOverlay";
import TaxIdField from "./TaxIdField";
import CompanyInfoFields from "./CompanyInfoFields";
import ModeSelection from "./ModeSelection";
import { useCompanyInfoFetcher } from "./hooks/useCompanyInfoFetcher";
import { useTaxIdValidation } from "./hooks/useTaxIdValidation";

export default function CompanyBasicInfo({
  formData,
  setFormData,
  errors,
  setErrors,
  isAutofill,
  setIsAutofill,
  isLoading,
}) {
  const [isFetchingDBD, setIsFetchingDBD] = useState(false);

  // Custom hooks for business logic
  const { validationStatus, setValidationStatus, handleTaxIdChange, checkTaxIdUniqueness } =
    useTaxIdValidation(formData, setFormData, errors, setErrors);

  const { fetchCompanyInfo, clearAutofilledFields } = useCompanyInfoFetcher(
    formData,
    setFormData,
    setErrors,
    setIsFetchingDBD,
    setValidationStatus,
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAutofill = () => {
    const newIsAutofill = !isAutofill;
    setIsAutofill(newIsAutofill);

    if (!newIsAutofill) {
      setValidationStatus({ status: "idle", message: "" });
      setErrors((prev) => ({ ...prev, taxId: undefined }));
      clearAutofilledFields();
      toast("โหมดกรอกข้อมูลเอง: กรุณากรอกข้อมูลบริษัทด้วยตนเอง");
    }
  };

  const handleFetchCompanyInfo = () => {
    if (formData.taxId && formData.taxId.length === 13) {
      fetchCompanyInfo(formData.taxId);
    }
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
            ข้อมูลบริษัท / Company Information
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            กรอกข้อมูลพื้นฐานของบริษัท / Enter basic company information
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 py-8 space-y-8">
          {/* Mode Selection */}
          <ModeSelection isAutofill={isAutofill} toggleAutofill={toggleAutofill} />

          {/* Company Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
              ข้อมูลพื้นฐาน
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tax ID Field */}
              <TaxIdField
                formData={formData}
                isAutofill={isAutofill}
                isLoading={isLoading}
                validationStatus={validationStatus}
                handleTaxIdChange={handleTaxIdChange}
                handleFetchCompanyInfo={handleFetchCompanyInfo}
              />

              {/* Company Info Fields */}
              <CompanyInfoFields
                formData={formData}
                errors={errors}
                isAutofill={isAutofill}
                handleInputChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
