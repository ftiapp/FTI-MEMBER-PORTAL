'use client';

import { useState, useEffect } from 'react';
import SearchableDropdown from './SearchableDropdown';

export default function ApplicantInfoSection({
  formData,
  errors,
  handleChange,
  handleCheckboxChange,
  industryGroups,
  provinceChapters,
  isLoading,
  showErrorNotification = false
}) {
  const [showAllIndustryGroups, setShowAllIndustryGroups] = useState(false);
  const [showAllProvinceChapters, setShowAllProvinceChapters] = useState(false);

  // Auto scroll to first error
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const errorFields = Object.keys(errors);
      const firstErrorField = errorFields[0];
      const firstErrorElement = document.getElementById(firstErrorField);

      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        // Optional: Focus on the input field
        firstErrorElement.focus();
      }
    }
  }, [errors]);

  const displayedIndustryGroups = showAllIndustryGroups
    ? industryGroups
    : industryGroups?.slice(0, 10) || [];

  const displayedProvinceChapters = showAllProvinceChapters
    ? provinceChapters
    : provinceChapters?.slice(0, 10) || [];

  const handleIndustryGroupsChange = (values) => {
    handleChange({
      target: {
        name: 'selectedIndustryGroups',
        value: values
      }
    });
  };

  const handleProvinceChaptersChange = (values) => {
    handleChange({
      target: {
        name: 'selectedProvinceChapters',
        value: values
      }
    });
  };

  // Error tooltip component
  const ErrorTooltip = ({ error }) => (
    <div className="absolute top-0 right-0 -mt-1 -mr-1 z-10">
      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-xs">
        <div className="relative">
          {error}
          {/* Arrow pointing down-left */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">ข้อมูลผู้สมัคร</h2>

      {/* เลขบัตรประชาชน - แยกเป็น field เดี่ยว */}
      <div className="w-full md:w-1/2 relative">
        <label htmlFor="idCardNumber" className="block text-sm font-medium text-gray-700 mb-1">
          เลขบัตรประชาชน <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="idCardNumber"
          name="idCardNumber"
          value={formData.idCardNumber || ''}
          onChange={(e) => {
            // อนุญาตให้กรอกเฉพาะตัวเลขเท่านั้น
            const value = e.target.value.replace(/[^0-9]/g, '');
            handleChange({
              target: {
                name: 'idCardNumber',
                value
              }
            });
          }}
          className={`w-full px-3 py-2 border ${
            errors?.idCardNumber ? 'border-red-500' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
          placeholder="เลขบัตรประชาชน 13 หลัก"
          maxLength={13}
          disabled={isLoading}
        />
        {errors?.idCardNumber && <ErrorTooltip error={errors.idCardNumber} />}
        <p className="text-xs text-gray-500 mt-1">กรอกเฉพาะตัวเลข 13 หลัก</p>
      </div>

      {/* ชื่อ-นามสกุล ภาษาไทย */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">ชื่อ-นามสกุล (ภาษาไทย)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="firstNameThai" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ <span className="text-red-500">*</span>
              <span className="text-xs text-red-500 ml-1">(ไม่ต้องใส่คำนำหน้า)</span>
            </label>
            <input
              type="text"
              id="firstNameThai"
              name="firstNameThai"
              value={formData.firstNameThai || ''}
              onChange={(e) => {
                // อนุญาตให้กรอกเฉพาะภาษาไทยเท่านั้น
                const value = e.target.value.replace(/[^ก-๙\s]/g, '');
                handleChange({
                  target: {
                    name: 'firstNameThai',
                    value
                  }
                });
              }}
              className={`w-full px-3 py-2 border ${
                errors?.firstNameThai ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="ชื่อ (ภาษาไทย)"
              disabled={isLoading}
            />
            {errors?.firstNameThai && <ErrorTooltip error={errors.firstNameThai} />}
            <p className="text-xs text-gray-500 mt-1">กรอกเฉพาะภาษาไทยเท่านั้น</p>
          </div>
          
          <div className="relative">
            <label htmlFor="lastNameThai" className="block text-sm font-medium text-gray-700 mb-1">
              นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastNameThai"
              name="lastNameThai"
              value={formData.lastNameThai || ''}
              onChange={(e) => {
                // อนุญาตให้กรอกเฉพาะภาษาไทยเท่านั้น
                const value = e.target.value.replace(/[^ก-๙\s]/g, '');
                handleChange({
                  target: {
                    name: 'lastNameThai',
                    value
                  }
                });
              }}
              className={`w-full px-3 py-2 border ${
                errors?.lastNameThai ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="นามสกุล (ภาษาไทย)"
              disabled={isLoading}
            />
            {errors?.lastNameThai && <ErrorTooltip error={errors.lastNameThai} />}
            <p className="text-xs text-gray-500 mt-1">กรอกเฉพาะภาษาไทยเท่านั้น</p>
          </div>
        </div>
      </div>

      {/* ชื่อ-นามสกุล ภาษาอังกฤษ */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">ชื่อ-นามสกุล (ภาษาอังกฤษ)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="firstNameEnglish" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ
              <span className="text-xs text-red-500 ml-1">(ไม่ต้องใส่คำนำหน้า)</span>
            </label>
            <input
              type="text"
              id="firstNameEnglish"
              name="firstNameEnglish"
              value={formData.firstNameEnglish || ''}
              onChange={(e) => {
                // อนุญาตให้กรอกเฉพาะภาษาอังกฤษเท่านั้น
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                handleChange({
                  target: {
                    name: 'firstNameEnglish',
                    value
                  }
                });
              }}
              className={`w-full px-3 py-2 border ${
                errors?.firstNameEnglish ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="First Name"
              disabled={isLoading}
            />
            {errors?.firstNameEnglish && <ErrorTooltip error={errors.firstNameEnglish} />}
            <p className="text-xs text-gray-500 mt-1">กรอกเฉพาะภาษาอังกฤษเท่านั้น</p>
          </div>

          <div className="relative">
            <label htmlFor="lastNameEnglish" className="block text-sm font-medium text-gray-700 mb-1">
              นามสกุล
            </label>
            <input
              type="text"
              id="lastNameEnglish"
              name="lastNameEnglish"
              value={formData.lastNameEnglish || ''}
              onChange={(e) => {
                // อนุญาตให้กรอกเฉพาะภาษาอังกฤษเท่านั้น
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                handleChange({
                  target: {
                    name: 'lastNameEnglish',
                    value
                  }
                });
              }}
              className={`w-full px-3 py-2 border ${
                errors?.lastNameEnglish ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="Last Name"
              disabled={isLoading}
            />
            {errors?.lastNameEnglish && <ErrorTooltip error={errors.lastNameEnglish} />}
            <p className="text-xs text-gray-500 mt-1">กรอกเฉพาะภาษาอังกฤษเท่านั้น</p>
          </div>
        </div>
      </div>

      {/* กลุ่มอุตสาหกรรม และ สภาอุตสาหกรรมจังหวัด */}
      <div className="mb-2 text-sm text-gray-600 italic">
        หากท่านไม่ประสงค์เข้าร่วมกลุ่มอุตสาหกรรมหรือสภาอุตสาหกรรมจังหวัด สามารถเว้นว่างไว้ได้
      </div>

      {/* กลุ่มอุตสาหกรรม */}
      <SearchableDropdown
        label="กลุ่มอุตสาหกรรม"
        placeholder="เลือกกลุ่มอุตสาหกรรม"
        type="industry"
        value={formData.selectedIndustryGroups || []}
        onChange={handleIndustryGroupsChange}
        multiple={true}
        required={false}
        error={errors?.selectedIndustryGroups}
        className="mb-4"
        disabled={isLoading}
      />

      {/* สภาอุตสาหกรรมจังหวัด */}
      <SearchableDropdown
        label="สภาอุตสาหกรรมจังหวัด"
        placeholder="เลือกสภาอุตสาหกรรมจังหวัด"
        type="province"
        value={formData.selectedProvinceChapters || []}
        onChange={handleProvinceChaptersChange}
        multiple={true}
        required={false}
        error={errors?.selectedProvinceChapters}
        className="mb-4"
        disabled={isLoading}
      />

      {/* ข้อความแจ้งเตือนเกี่ยวกับเอกสารที่ต้องเตรียม */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">รายการเอกสารที่ท่านต้องเตรียม</h3>
        <p className="text-sm text-blue-700">บัตรประจำตัวประชาชน พร้อม ลายเซ็นสำเนาถูกต้อง</p>
      </div>
    </div>
  );
}