"use client";

import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { AddressSection } from "../../../shared/address";
import IdCardField from "./IdCardField";
import ThaiNameFields from "./ThaiNameFields";
import EnglishNameFields from "./EnglishNameFields";
import ContactFields from "./ContactFields";
import { useIdCardValidation } from "./hooks/useIdCardValidation";
import { usePrenameHandling } from "./hooks/usePrenameHandling";

export default function ApplicantInfoSection({
  formData,
  setFormData,
  errors,
  industrialGroups,
  provincialChapters,
  isLoading,
  isEditMode,
}) {
  const [subDistricts, setSubDistricts] = useState([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Debug: เพิ่ม useEffect เพื่อ debug formData
  useEffect(() => {
    console.log("=== DEBUG ApplicantInfoSection formData ===");
    console.log("idCardDocument:", formData.idCardDocument);
    console.log("All formData:", formData);
  }, [formData]);

  // Custom hooks
  const { idCardValidation, handleIdCardChange, handleIdCardBlur } = useIdCardValidation(
    formData,
    setFormData,
  );

  const { prenameMapping, handlePrenameThaiChange, handlePrenameEnglishChange } =
    usePrenameHandling(formData, setFormData);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special validation for ID card number - only allow digits
    if (name === "idCardNumber") {
      handleIdCardChange(value, errors);
      return;
    }

    // Thai language validation
    if (name === "firstNameThai" || name === "lastNameThai" || name === "prename_other") {
      const thaiPattern = /^[ก-๙\s\.]*$/;
      if (!thaiPattern.test(value) && value !== "") {
        // Allow input but don't update state
        return;
      }
    }

    // English language validation
    if (
      name === "firstNameEng" ||
      name === "lastNameEng" ||
      name === "prename_en" ||
      name === "prename_other_en"
    ) {
      const engPattern = /^[a-zA-Z\s\.]*$/;
      if (!engPattern.test(value) && value !== "") {
        // Allow input but don't update state
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch address data when subDistrict changes
  useEffect(() => {
    const fetchAddressData = async () => {
      if (!formData.subDistrict || formData.subDistrict.length < 2) {
        return;
      }

      setIsLoadingAddress(true);
      try {
        const response = await fetch(
          `/api/address?subDistrict=${encodeURIComponent(formData.subDistrict)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setSubDistricts(data);

          // If only one result, auto-fill district, province, and postal code
          if (data.length === 1) {
            setFormData((prev) => ({
              ...prev,
              district: data[0].district,
              province: data[0].province,
              postalCode: data[0].postalCode,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching address data:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddressData();
  }, [formData.subDistrict, setFormData]);

  return (
    <div
      data-section="applicant"
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10"
    >
      {/* Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          ข้อมูลผู้สมัคร / Applicant Information
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          ข้อมูลส่วนตัวและที่อยู่ / Personal information and address
        </p>
      </div>

      {/* Content */}
      <div className="px-8 py-8 space-y-8">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            ข้อมูลส่วนตัว
          </h4>

          {/* ID Card Number */}
          <IdCardField
            formData={formData}
            errors={errors}
            idCardValidation={idCardValidation}
            handleIdCardChange={handleIdCardChange}
            handleIdCardBlur={handleIdCardBlur}
            isLoading={isLoading}
            isEditMode={isEditMode}
          />

          {/* Thai Name Fields */}
          <ThaiNameFields
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            handlePrenameThaiChange={handlePrenameThaiChange}
            isLoading={isLoading}
          />

          {/* English Name Fields */}
          <EnglishNameFields
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            handlePrenameEnglishChange={handlePrenameEnglishChange}
            isLoading={isLoading}
          />

          {/* Contact Information */}
          <ContactFields
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            isLoading={isLoading}
          />
        </div>

        {/* Address Information */}
        <AddressSection
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          title="ที่อยู่"
          subtitle="ข้อมูลที่อยู่และการติดต่อ"
        />
      </div>
    </div>
  );
}

ApplicantInfoSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
  industrialGroups: PropTypes.array,
  provincialChapters: PropTypes.array,
  isLoading: PropTypes.bool,
  isEditMode: PropTypes.bool,
};
