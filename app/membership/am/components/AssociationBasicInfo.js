'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function AssociationBasicInfo({ 
  formData, 
  setFormData, 
  errors, 
  setErrors, 
  isAutofill, 
  setIsAutofill,
  isLoading,
  isCheckingTaxId
}) {
  // เพิ่ม state สำหรับ throttling
  const [isThrottled, setIsThrottled] = useState(false);
  const lastFetchTime = useRef(0);
  const throttleTime = 5000; // 5 วินาที
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkTaxIdUniqueness = async (taxId) => {
    if (!taxId || taxId.length !== 13) return;

    try {
      const response = await fetch(`/api/am-membership/check-tax-id?taxId=${taxId}`);
      const data = await response.json();
      
      if (!data.isUnique) {
        setErrors(prev => ({ ...prev, taxId: data.message }));
        toast.error(data.message);
        return false;
      }
      
      // ถ้า Tax ID ไม่ซ้ำ ให้ล้างข้อความ error
      setErrors(prev => ({ ...prev, taxId: undefined }));
      return true;
    } catch (error) {
      console.error('Error checking tax ID uniqueness:', error);
      toast.error('เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี');
      return false;
    }
  };

  const handleTaxIdChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, taxId: value }));
    
    if (value.length === 13) {
      checkTaxIdUniqueness(value);
      if (isAutofill) {
        fetchAssociationInfo(value);
      }
    }
  };

  const fetchAssociationInfo = async (taxId) => {
    if (!taxId || taxId.length !== 13) return;
    
    // ตรวจสอบ throttling
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    
    if (timeSinceLastFetch < throttleTime) {
      const remainingTime = Math.ceil((throttleTime - timeSinceLastFetch) / 1000);
      toast.error(`กรุณารอ ${remainingTime} วินาทีก่อนดึงข้อมูลอีกครั้ง`);
      return;
    }
    
    // บันทึกเวลาที่ดึงข้อมูลล่าสุด
    lastFetchTime.current = now;
    setIsThrottled(true);
    
    // ตั้งเวลาให้สามารถกดได้อีกครั้งหลังจากเวลาที่กำหนด
    setTimeout(() => {
      setIsThrottled(false);
    }, throttleTime);

    try {
      const response = await fetch(`https://openapi.dbd.go.th/api/v1/juristic_person/${taxId}`);
      
      if (!response.ok) {
        throw new Error('ไม่พบข้อมูลนิติบุคคล');
      }
      
      const data = await response.json();
      
      if (data && data.status?.code === '1000' && data.data && data.data.length > 0) {
        const associationData = data.data[0]['cd:OrganizationJuristicPerson'];
        const address = associationData['cd:OrganizationJuristicAddress']?.['cr:AddressType'];
        
        setFormData(prev => ({
          ...prev,
          associationName: associationData['cd:OrganizationJuristicNameTH'] || '',
          addressNumber: address?.['cd:AddressNo'] || '',
          street: address?.['cd:Road'] || '',
          subDistrict: address?.['cd:CitySubDivision']?.['cr:CitySubDivisionTextTH'] || '',
          district: address?.['cd:City']?.['cr:CityTextTH'] || '',
          province: address?.['cd:CountrySubDivision']?.['cr:CountrySubDivisionTextTH'] || ''
        }));
        
        setErrors(prev => ({
          ...prev,
          taxId: '',
          associationName: ''
        }));
        
        toast.success('ดึงข้อมูลสำเร็จ');
        
        if (address?.['cd:CitySubDivision']?.['cr:CitySubDivisionTextTH']) {
          fetchPostalCode(address['cd:CitySubDivision']['cr:CitySubDivisionTextTH']);
        }
      } else {
        toast.error(data.status?.description || 'ไม่พบข้อมูลนิติบุคคล');
      }
    } catch (error) {
      console.error('Error fetching association info:', error);
      toast.error('ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const fetchPostalCode = async (subDistrict) => {
    try {
      const response = await fetch(`/api/postal-code?subDistrict=${encodeURIComponent(subDistrict)}`);
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลรหัสไปรษณีย์ได้');
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          postalCode: data.data[0].postalCode
        }));
      }
    } catch (error) {
      console.error('Error fetching postal code:', error);
    }
  };

  const toggleAutofill = () => {
    setIsAutofill(!isAutofill);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          ข้อมูลสมาคม
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          กรอกข้อมูลพื้นฐานของสมาคม
        </p>
      </div>
      
      {/* Content Section */}
      <div className="px-8 py-8 space-y-8">
        {/* Mode Selection Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">
            วิธีการกรอกข้อมูล
          </h4>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="autofill"
                name="fillMode"
                checked={isAutofill}
                onChange={toggleAutofill}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <label 
                htmlFor="autofill" 
                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
              >
                ดึงข้อมูลอัตโนมัติ
              </label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="manual"
                name="fillMode"
                checked={!isAutofill}
                onChange={toggleAutofill}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <label 
                htmlFor="manual" 
                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
              >
                กรอกข้อมูลเอง
              </label>
            </div>
          </div>
        </div>
        
        {/* Association Information Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100">
            ข้อมูลพื้นฐาน
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tax ID Field */}
            <div className="space-y-2">
              <label 
                htmlFor="taxId" 
                className="block text-sm font-medium text-gray-900"
              >
                เลขประจำตัวผู้เสียภาษี
                <span className="text-red-500 ml-1">*</span>
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId || ''}
                  onChange={handleTaxIdChange}
                  maxLength={13}
                  required
                  placeholder="0000000000000"
                  className={`
                    w-full px-4 py-3 text-sm
                    border rounded-lg
                    bg-white
                    placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${errors.taxId 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${isAutofill ? 'pr-24' : ''}
                  `}
                />
                
                {isAutofill && (
                  <button
                    type="button"
                    onClick={() => fetchAssociationInfo(formData.taxId)}
                    disabled={isLoading || isCheckingTaxId || !formData.taxId || formData.taxId.length !== 13 || isThrottled}
                    className="
                      absolute right-2 top-2 
                      px-3 py-1.5 
                      bg-blue-600 hover:bg-blue-700 
                      text-white text-xs font-medium
                      rounded-md
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    "
                  >
                    {isLoading ? 'กำลังดึง...' : isThrottled ? 'รอสักครู่...' : 'ดึงข้อมูล'}
                  </button>
                )}
              </div>
              
              {errors.taxId && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.taxId}
                </p>
              )}
            </div>

            {/* Association Name Field */}
            <div className="space-y-2">
              <label 
                htmlFor="associationName" 
                className="block text-sm font-medium text-gray-900"
              >
                ชื่อสมาคม
                <span className="text-red-500 ml-1">*</span>
              </label>
              
              <input
                type="text"
                id="associationName"
                name="associationName"
                value={formData.associationName || ''}
                onChange={handleInputChange}
                required
                readOnly={isAutofill}
                placeholder="ชื่อสมาคม"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.associationName 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${isAutofill && formData.associationName
                    ? 'bg-blue-50 text-gray-700 cursor-default border-blue-200'
                    : 'bg-white'
                  }
                `}
              />
              
              {errors.associationName && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.associationName}
                </p>
              )}
              
              {isAutofill && formData.associationName && (
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ข้อมูลถูกดึงอัตโนมัติ
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
