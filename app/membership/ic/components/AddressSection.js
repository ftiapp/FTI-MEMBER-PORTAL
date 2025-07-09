'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';
import SearchableDropdown from './SearchableDropdown';

export default function AddressSection({ formData, setFormData, errors, isLoading }) {
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const fetchPostalCode = useCallback(async (subDistrict) => {
    if (!subDistrict || subDistrict.trim() === '') return;
    
    try {
      console.log(`Fetching postal code for subdistrict: ${subDistrict}`);
      const response = await fetch(`/api/postal-code?subDistrict=${encodeURIComponent(subDistrict.trim())}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${response.status} ${errorText}`);
        throw new Error(`ไม่สามารถดึงข้อมูลรหัสไปรษณีย์ได้: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Postal code API response:', data);
      
      if (data.success && data.data && data.data.length > 0) {
        const postalCode = data.data[0].postalCode;
        console.log(`Found postal code: ${postalCode}`);
        
        setFormData(prev => ({
          ...prev,
          postalCode: postalCode
        }));
        toast.success('ดึงรหัสไปรษณีย์สำเร็จ');
      } else {
        console.log(`No postal code found for subdistrict: ${subDistrict}`);
        toast.error('ไม่พบรหัสไปรษณีย์สำหรับตำบล/แขวงนี้');
      }
    } catch (error) {
      console.error('Error fetching postal code:', error);
      toast.error(`ไม่สามารถดึงข้อมูลรหัสไปรษณีย์ได้: ${error.message}`);
    }
  }, [setFormData]);

  const fetchSubDistricts = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];
    
    try {
      const response = await fetch(`/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=subdistrict`);
      if (!response.ok) {
        throw new Error(`ไม่สามารถค้นหาข้อมูลตำบลได้: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching subdistricts:', error);
      return [];
    }
  }, []);

  const fetchDistricts = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];
    
    try {
      const response = await fetch(`/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=district`);
      if (!response.ok) {
        throw new Error(`ไม่สามารถค้นหาข้อมูลอำเภอได้: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }, []);

  const fetchProvinces = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];
    
    try {
      const response = await fetch(`/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=province`);
      if (!response.ok) {
        throw new Error(`ไม่สามารถค้นหาข้อมูลจังหวัดได้: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  }, []);
  
  const fetchPostalCodes = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return [];
    
    try {
      const response = await fetch(`/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=postalCode`);
      if (!response.ok) {
        throw new Error(`ไม่สามารถค้นหาข้อมูลรหัสไปรษณีย์ได้: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching postal codes:', error);
      return [];
    }
  }, []);

  const handleSubDistrictChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, subDistrict: value }));
    
    if (value && value.trim().length > 2) {
      console.log(`Subdistrict changed to: ${value}, fetching postal code...`);
      fetchPostalCode(value);
    }
  }, [setFormData, fetchPostalCode]);
  
  const handleSubDistrictSelect = useCallback((option) => {
    if (!option) return;
    
    console.log('Selected subdistrict option:', option);
    setFormData(prev => ({
      ...prev,
      subDistrict: option.text || option.name || '',
      district: option.district || '',
      province: option.province || '',
      postalCode: option.postalCode || ''
    }));
    toast.success('ดึงข้อมูลที่อยู่สำเร็จ');
  }, [setFormData]);
  
  const handleDistrictChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, district: value }));
  }, [setFormData]);
  
  const handleDistrictSelect = useCallback((option) => {
    if (!option) return;
    
    console.log('Selected district option:', option);
    setFormData(prev => ({
      ...prev,
      district: option.text || option.name || '',
      province: option.province || ''
    }));
  }, [setFormData]);
  
  const handleProvinceChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, province: value }));
  }, [setFormData]);
  
  const handlePostalCodeChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, postalCode: value }));
  }, [setFormData]);
  
  const handlePostalCodeSelect = useCallback((option) => {
    if (!option) return;
    
    console.log('Selected postal code option:', option);
    setFormData(prev => ({
      ...prev,
      subDistrict: option.subdistrict || option.subDistrict || '',
      district: option.district || '',
      province: option.province || '',
      postalCode: option.text || option.postalCode || ''
    }));
    toast.success('ดึงข้อมูลที่อยู่สำเร็จ');
  }, [setFormData]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Address Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          ที่อยู่
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          ข้อมูลที่อยู่และการติดต่อ
        </p>
      </div>
      
      {/* Address Content */}
      <div className="px-8 py-8 space-y-8">
        {/* Address Details Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            รายละเอียดที่อยู่
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Address Number */}
            <div className="space-y-2">
              <label htmlFor="addressNumber" className="block text-sm font-medium text-gray-900">
                บ้านเลขที่
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="addressNumber"
                name="addressNumber"
                value={formData.addressNumber || ''}
                onChange={handleInputChange}
                placeholder="กรอกบ้านเลขที่"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.addressNumber 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  bg-white
                `}
              />
              {errors?.addressNumber && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.addressNumber}
                </p>
              )}
            </div>

            {/* Street */}
            <div className="space-y-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-900">
                ถนน
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street || ''}
                onChange={handleInputChange}
                placeholder="กรอกถนน"
                disabled={isLoading}
                className="
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  border-gray-300 hover:border-gray-400
                "
              />
            </div>

            {/* Sub District */}
            <div className="space-y-2">
              <SearchableDropdown
                label="ตำบล/แขวง"
                placeholder="พิมพ์เพื่อค้นหาตำบล/แขวง"
                value={formData.subDistrict || ''}
                onChange={handleSubDistrictChange}
                onSelect={handleSubDistrictSelect}
                fetchOptions={fetchSubDistricts}
                isRequired={true}
                isReadOnly={false}
                error={errors?.subDistrict}
                disabled={isLoading}
              />
            </div>

            {/* District */}
            <div className="space-y-2">
              <SearchableDropdown
                label="อำเภอ/เขต"
                placeholder="พิมพ์เพื่อค้นหาอำเภอ/เขต"
                value={formData.district || ''}
                onChange={handleDistrictChange}
                onSelect={handleDistrictSelect}
                fetchOptions={fetchDistricts}
                isRequired={true}
                isReadOnly={true}
                error={errors?.district}
              />
            </div>

            {/* Province */}
            <div className="space-y-2">
              <SearchableDropdown
                label="จังหวัด"
                placeholder="พิมพ์เพื่อค้นหาจังหวัด"
                value={formData.province || ''}
                onChange={handleProvinceChange}
                fetchOptions={fetchProvinces}
                isRequired={true}
                isReadOnly={true}
                error={errors?.province}
              />
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <SearchableDropdown
                label="รหัสไปรษณีย์"
                placeholder="รหัสไปรษณีย์"
                value={formData.postalCode || ''}
                onChange={handlePostalCodeChange}
                onSelect={handlePostalCodeSelect}
                fetchOptions={fetchPostalCodes}
                isRequired={true}
                isReadOnly={true}
                error={errors?.postalCode}
                autoFillNote={formData.postalCode ? '* ข้อมูลถูกดึงอัตโนมัติ' : null}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            ข้อมูลติดต่อ
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                โทรศัพท์
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

            {/* Website */}
            <div className="space-y-2 lg:col-span-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-900">
                เว็บไซต์
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website || ''}
                onChange={handleInputChange}
                placeholder="กรอกเว็บไซต์ (ถ้ามี)"
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.website 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors?.website && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.website}
                </p>
              )}
            </div>
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
  isLoading: PropTypes.bool
};

AddressSection.defaultProps = {
  errors: {},
  isLoading: false
};