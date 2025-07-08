'use client';

import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import SearchableAddressDropdown from './SearchableAddressDropdown';
import AddressSection from './AddressSection';
import IndustrialGroupSection from './IndustrialGroupSection';

export default function ApplicantInfoSection({ formData, setFormData, errors, industrialGroups, provincialChapters, isLoading }) {
  const [subDistricts, setSubDistricts] = useState([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special validation for ID card number - only allow digits
    if (name === 'idCardNumber') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 13);
      setFormData(prev => ({ ...prev, [name]: onlyDigits }));
      return;
    }
    
    // Thai language validation
    if (name === 'firstNameThai' || name === 'lastNameThai') {
      const thaiPattern = /^[ก-๙\s]*$/;
      if (!thaiPattern.test(value) && value !== '') {
        // Allow input but don't update state
        return;
      }
    }
    
    // English language validation
    if (name === 'firstNameEng' || name === 'lastNameEng') {
      const engPattern = /^[a-zA-Z\s]*$/;
      if (!engPattern.test(value) && value !== '') {
        // Allow input but don't update state
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fetch address data when subDistrict changes
  useEffect(() => {
    const fetchAddressData = async () => {
      if (!formData.subDistrict || formData.subDistrict.length < 2) {
        return;
      }
      
      setIsLoadingAddress(true);
      try {
        const response = await fetch(`/api/address?subDistrict=${encodeURIComponent(formData.subDistrict)}`);
        if (response.ok) {
          const data = await response.json();
          setSubDistricts(data);
          
          // If only one result, auto-fill district, province, and postal code
          if (data.length === 1) {
            setFormData(prev => ({
              ...prev,
              district: data[0].district,
              province: data[0].province,
              postalCode: data[0].postalCode
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching address data:', error);
      } finally {
        setIsLoadingAddress(false);
      }
    };
    
    fetchAddressData();
  }, [formData.subDistrict, setFormData]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">ข้อมูลผู้สมัคร</h2>
        <p className="text-blue-100 text-sm mt-1">ข้อมูลส่วนตัวและที่อยู่</p>
      </div>
      
      {/* Content */}
      <div className="px-8 py-8 space-y-8">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            ข้อมูลส่วนตัว
          </h4>
          
          {/* ID Card Number - Full Width */}
          <div className="mb-6">
            <div className="space-y-2">
              <label htmlFor="idCardNumber" className="block text-sm font-medium text-gray-900">
                เลขบัตรประชาชน
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="idCardNumber"
                name="idCardNumber"
                value={formData.idCardNumber || ''}
                onChange={handleInputChange}
                placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.idCardNumber 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  bg-white
                `}
              />
              {errors?.idCardNumber && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.idCardNumber}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thai First Name */}
            <div className="space-y-2">
              <label htmlFor="firstNameThai" className="block text-sm font-medium text-gray-900">
                ชื่อ (ภาษาไทย)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="firstNameThai"
                name="firstNameThai"
                value={formData.firstNameThai || ''}
                onChange={handleInputChange}
                placeholder="กรอกชื่อภาษาไทย"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.firstNameThai 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  bg-white
                `}
              />
              {errors?.firstNameThai && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.firstNameThai}
                </p>
              )}
            </div>
            
            {/* Thai Last Name */}
            <div className="space-y-2">
              <label htmlFor="lastNameThai" className="block text-sm font-medium text-gray-900">
                นามสกุล (ภาษาไทย)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="lastNameThai"
                name="lastNameThai"
                value={formData.lastNameThai || ''}
                onChange={handleInputChange}
                placeholder="กรอกนามสกุลภาษาไทย"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.lastNameThai 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  bg-white
                `}
              />
              {errors?.lastNameThai && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.lastNameThai}
                </p>
              )}
            </div>

            {/* English First Name */}
            <div className="space-y-2">
              <label htmlFor="firstNameEng" className="block text-sm font-medium text-gray-900">
                ชื่อ (ภาษาอังกฤษ)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="firstNameEng"
                name="firstNameEng"
                value={formData.firstNameEng || ''}
                onChange={handleInputChange}
                placeholder="Enter first name"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.firstNameEng 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  bg-white
                `}
              />
              {errors?.firstNameEng && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.firstNameEng}
                </p>
              )}
            </div>
            
            {/* English Last Name */}
            <div className="space-y-2">
              <label htmlFor="lastNameEng" className="block text-sm font-medium text-gray-900">
                นามสกุล (ภาษาอังกฤษ)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="lastNameEng"
                name="lastNameEng"
                value={formData.lastNameEng || ''}
                onChange={handleInputChange}
                placeholder="Enter last name"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.lastNameEng 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  bg-white
                `}
              />
              {errors?.lastNameEng && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.lastNameEng}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                เบอร์โทรศัพท์
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                placeholder="กรอกเบอร์โทรศัพท์"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.phone 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors?.phone && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phone}
                </p>
              )}
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                อีเมล
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                placeholder="กรอกอีเมล"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.email 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors?.email && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <AddressSection 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors} 
          isLoading={isLoading} 
        />

        {/* Industrial Group and Provincial Chapter */}
        <IndustrialGroupSection
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          industrialGroups={industrialGroups}
          provincialChapters={provincialChapters}
          isLoading={isLoading}
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
  isLoading: PropTypes.bool
};

ApplicantInfoSection.defaultProps = {
  errors: {},
  industrialGroups: [],
  provincialChapters: [],
  isLoading: false
};