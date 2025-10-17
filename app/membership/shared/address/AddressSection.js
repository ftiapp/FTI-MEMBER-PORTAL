"use client";

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { ADDRESS_TYPES, findFirstErrorTab, scrollToAddressSection } from "./addressUtils";
import AddressTabNavigation from "./AddressTabNavigation";
import AddressFields from "./AddressFields";
import AddressLocationFields from "./AddressLocationFields";
import AddressContactFields from "./AddressContactFields";
import useAddressHandlers from "./useAddressHandlers";

/**
 * คอมโพเนนต์หลักสำหรับจัดการที่อยู่ทั้งหมด
 * รองรับ 3 ประเภทที่อยู่: สำนักงาน, จัดส่งเอกสาร, ใบกำกับภาษี
 */
export default function AddressSection({
  formData,
  setFormData,
  errors,
  isAutofill = false,
  title = "ที่อยู่บริษัท / Company Address",
  subtitle = "ข้อมูลที่อยู่และการติดต่อ / Address and contact information",
  showCopyButton = true,
  showEmail = true,
  showWebsite = true,
}) {
  const {
    activeTab,
    setActiveTab,
    currentAddress,
    isLoading,
    handleInputChange,
    handlers,
    fetchFunctions,
  } = useAddressHandlers(formData, setFormData, errors);

  const lastErrorTabRef = useRef(null);

  // Auto-switch to tab with error and scroll
  useEffect(() => {
    const errorTab = findFirstErrorTab(errors);
    
    if (errorTab && errorTab !== activeTab && errorTab !== lastErrorTabRef.current) {
      lastErrorTabRef.current = errorTab;
      setActiveTab(errorTab);
      
      // Scroll to address section after tab switch
      scrollToAddressSection();
    }
  }, [errors, activeTab, setActiveTab]);

  return (
    <div
      data-section="company-address"
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-blue-100 text-sm mt-1">{subtitle}</p>}
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* Tab Navigation with Warning */}
        <AddressTabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          formData={formData}
          setFormData={setFormData}
          showCopyButton={showCopyButton}
        />

        {/* Address Form */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
            <div>
              <h4 className="text-base font-medium text-gray-900">
                {ADDRESS_TYPES[activeTab].label}
              </h4>
              <p className="text-sm text-gray-500">{ADDRESS_TYPES[activeTab].description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Address Fields */}
            <AddressFields
              currentAddress={currentAddress}
              onInputChange={handleInputChange}
              errors={errors}
              isAutofill={isAutofill}
              isLoading={isLoading}
              activeTab={activeTab}
            />

            {/* Location Fields */}
            <AddressLocationFields
              currentAddress={currentAddress}
              handlers={handlers}
              fetchFunctions={fetchFunctions}
              errors={errors}
              isAutofill={isAutofill}
              isLoading={isLoading}
              activeTab={activeTab}
            />

            {/* Contact Fields */}
            <AddressContactFields
              currentAddress={currentAddress}
              onInputChange={handleInputChange}
              errors={errors}
              isLoading={isLoading}
              activeTab={activeTab}
              showEmail={showEmail}
              showWebsite={showWebsite}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

AddressSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
  isAutofill: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showCopyButton: PropTypes.bool,
  showEmail: PropTypes.bool,
  showWebsite: PropTypes.bool,
};

AddressSection.defaultProps = {
  errors: {},
  isAutofill: false,
  title: "ที่อยู่บริษัท / Company Address",
  subtitle: "ข้อมูลที่อยู่และการติดต่อ / Address and contact information",
  showCopyButton: true,
  showEmail: true,
  showWebsite: true,
};
