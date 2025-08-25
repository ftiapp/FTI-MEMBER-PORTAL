'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import SearchableDropdown from '../../oc/components/SearchableDropdown';

export default function AssociationAddressInfo({ 
  formData, 
  setFormData, 
  errors, 
  isAutofill 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('2'); // Default to document delivery address

  // Address types configuration
  const addressTypes = {
    '1': { label: 'ที่อยู่สำนักงาน', color: 'blue' },
    '2': { label: 'ที่อยู่จัดส่งเอกสาร', color: 'blue' },
    '3': { label: 'ที่อยู่ใบกำกับภาษี', color: 'blue' }
  };

  // Initialize address data if not exists
  useEffect(() => {
    if (!formData.addresses) {
      setFormData(prev => ({
        ...prev,
        addresses: {
          '1': { addressType: '1' },
          '2': { addressType: '2' },
          '3': { addressType: '3' }
        }
      }));
    }
  }, [formData.addresses, setFormData]);

  // Auto-switch to tab with errors for better UX
 useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) return;
    // Find first address error and switch to that tab
    const addressErrorKeys = Object.keys(errors).filter(key => key.startsWith('addresses.'))
    if (addressErrorKeys.length > 0) {
      const firstErrorKey = addressErrorKeys[0];
      const match = firstErrorKey.match(/addresses\.(\d+)\./); // Extract address type from error key
      if (match && match[1]) {
        const errorTab = match[1];
        const doScroll = () => {
          const addressSection = document.querySelector('[data-section="company-address"]') || 
                                 document.querySelector('.company-address') ||
                                 document.querySelector('h3')?.closest('.bg-white');
          if (addressSection) {
            addressSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        };
        if (errorTab !== activeTab) {
          setActiveTab(errorTab);
          setTimeout(doScroll, 100);
        } else {
          setTimeout(doScroll, 100);
        }
      }
    }
  }, [errors]);

  // Copy address from document delivery (type 2) to other types
  const copyAddressFromDocumentDelivery = (targetType) => {
    const documentAddress = formData.addresses?.['2'];
    if (!documentAddress) {
      toast.error('กรุณากรอกที่อยู่จัดส่งเอกสารก่อน');
      return;
    }
    setFormData(prev => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [targetType]: {
          ...documentAddress,
          addressType: targetType
        }
      }
    }));
    toast.success(`คัดลอกที่อยู่ไปยัง${addressTypes[targetType].label}สำเร็จ`);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [activeTab]: {
          ...prev.addresses?.[activeTab],
          [name]: value
        }
      }
    }));
  };

  const fetchPostalCode = useCallback(async (subDistrict) => {
    if (!subDistrict || subDistrict.trim() === '') return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/postal-code?subDistrict=${encodeURIComponent(subDistrict.trim())}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ไม่สามารถดึงข้อมูลรหัสไปรษณีย์ได้: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        const postalCode = data.data[0].postalCode;
        
        setFormData(prev => ({
          ...prev,
          postalCode: postalCode
        }));
        // ลดการแจ้งเตือนซ้ำ ๆ: ไม่ต้องแสดง toast สำเร็จทุกครั้ง
      } else {
        // แสดงเฉพาะกรณีไม่พบข้อมูล
        toast.error('ไม่พบรหัสไปรษณีย์สำหรับตำบล/แขวงนี้');
      }
    } catch (error) {
      console.error('Error fetching postal code:', error);
      toast.error(`ไม่สามารถดึงข้อมูลรหัสไปรษณีย์ได้: ${error.message}`);
    } finally {
      setIsLoading(false);
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
    setFormData(prev => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [activeTab]: {
          ...prev.addresses?.[activeTab],
          subDistrict: value
        }
      }
    }));
    // หยุดเรียก API ระหว่างพิมพ์เพื่อลดการ fetch รัว ๆ
    // จะทำการ autofill ผ่าน onSelect แทน (เมื่อผู้ใช้เลือกจาก dropdown)
  }, [setFormData, fetchPostalCode, activeTab]);
  
  const handleSubDistrictSelect = useCallback((option) => {
    if (!option) return;
    
    setFormData(prev => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [activeTab]: {
          ...prev.addresses?.[activeTab],
          subDistrict: option.text || option.name || '',
          district: option.district || '',
          province: option.province || '',
          postalCode: option.postalCode || ''
        }
      }
    }));
    // ลดการแจ้งเตือนเพื่อป้องกัน toast เด้งรัว ๆ ระหว่างใช้งาน
  }, [setFormData, activeTab]);
  
  const handleDistrictChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [activeTab]: {
          ...prev.addresses?.[activeTab],
          district: value
        }
      }
    }));
  }, [setFormData, activeTab]);
  
  const handleDistrictSelect = useCallback((option) => {
    if (!option) return;
    
    setFormData(prev => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [activeTab]: {
          ...prev.addresses?.[activeTab],
          district: option.text || option.name || '',
          province: option.province || ''
        }
      }
    }));
  }, [setFormData, activeTab]);
  
  const handleProvinceChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [activeTab]: {
          ...prev.addresses?.[activeTab],
          province: value
        }
      }
    }));
  }, [setFormData, activeTab]);
  
  const handlePostalCodeChange = useCallback((value) => {
    setFormData(prev => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [activeTab]: {
          ...prev.addresses?.[activeTab],
          postalCode: value
        }
      }
    }));
  }, [setFormData, activeTab]);
  
  const handlePostalCodeSelect = useCallback((option) => {
    if (!option) return;
    
    setFormData(prev => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        [activeTab]: {
          ...prev.addresses?.[activeTab],
          subDistrict: option.subdistrict || option.subDistrict || '',
          district: option.district || '',
          province: option.province || '',
          postalCode: option.text || option.postalCode || ''
        }
      }
    }));
    // ไม่ต้องแสดง toast สำเร็จเพื่อลดการรบกวนผู้ใช้
  }, [setFormData, activeTab]);

  // Get current address data
  const getCurrentAddress = () => {
    return formData.addresses?.[activeTab] || { addressType: activeTab };
  };

  const currentAddress = getCurrentAddress();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Address Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          ที่อยู่สมาคม
        </h3>
      </div>
      
      {/* ข้อความเตือนหลัก */}
      <div className="px-8 pt-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">
                หมายเหตุสำคัญ
              </h4>
              <div className="mt-1 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>บังคับ: กรุณากรอกที่อยู่ให้ครบทั้ง <strong>ทั้ง 3 ประเภท</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Address Type Tabs */}
      <div className="px-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['2', '1', '3'].map((type) => {
            const config = addressTypes[type];
            const isActive = activeTab === type;
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? `bg-${config.color}-600 text-white shadow-sm` 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }
                `}
              >
                <span>{config.label}</span>
                {type === '2' && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-1">
                    หลัก
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Copy Address Buttons */}
      {(activeTab === '1' || activeTab === '3') && (
        <div className="px-8 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  คัดลอกที่อยู่จากที่อยู่จัดส่งเอกสาร
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyAddressFromDocumentDelivery(activeTab)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>คัดลอก</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                เลขที่
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="addressNumber"
                name="addressNumber"
                value={currentAddress?.addressNumber || ''}
                onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                placeholder="เลขที่"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.addressNumber 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${isAutofill && formData.addressNumber
                    ? 'bg-blue-50 text-gray-700 cursor-default border-blue-200'
                    : 'bg-white'
                  }
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
              {isAutofill && formData.addressNumber && (
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ข้อมูลถูกดึงอัตโนมัติ
                </p>
              )}
            </div>

            {/* Building */}
            <div className="space-y-2">
              <label htmlFor="building" className="block text-sm font-medium text-gray-900">
                อาคาร/หมู่บ้าน
              </label>
              <input
                type="text"
                id="building"
                name="building"
                value={currentAddress?.building || ''}
                onChange={(e) => handleInputChange('building', e.target.value)}
                placeholder="ชื่ออาคาร หรือ หมู่บ้าน"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  border-gray-300 hover:border-gray-400
                  ${isAutofill && currentAddress?.building
                    ? 'bg-blue-50 text-gray-700 cursor-default border-blue-200'
                    : 'bg-white'
                  }
                `}
              />
              {isAutofill && currentAddress?.building && (
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ข้อมูลถูกดึงอัตโนมัติ
                </p>
              )}
            </div>

            {/* Moo */}
            <div className="space-y-2">
              <label htmlFor="moo" className="block text-sm font-medium text-gray-900">
                หมู่
              </label>
              <input
                type="text"
                id="moo"
                name="moo"
                value={currentAddress?.moo || ''}
                onChange={(e) => handleInputChange('moo', e.target.value)}
                placeholder="หมู่ที่"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  border-gray-300 hover:border-gray-400
                  ${isAutofill && formData.moo
                    ? 'bg-blue-50 text-gray-700 cursor-default border-blue-200'
                    : 'bg-white'
                  }
                `}
              />
              {isAutofill && formData.moo && (
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ข้อมูลถูกดึงอัตโนมัติ
                </p>
              )}
            </div>

            {/* Soi */}
            <div className="space-y-2">
              <label htmlFor="soi" className="block text-sm font-medium text-gray-900">
                ซอย
              </label>
              <input
                type="text"
                id="soi"
                name="soi"
                value={currentAddress?.soi || ''}
                onChange={(e) => handleInputChange('soi', e.target.value)}
                placeholder="ซอย"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  border-gray-300 hover:border-gray-400
                  ${isAutofill && formData.soi
                    ? 'bg-blue-50 text-gray-700 cursor-default border-blue-200'
                    : 'bg-white'
                  }
                `}
              />
              {isAutofill && formData.soi && (
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ข้อมูลถูกดึงอัตโนมัติ
                </p>
              )}
            </div>

            {/* Road */}
            <div className="space-y-2">
              <label htmlFor="road" className="block text-sm font-medium text-gray-900">
                ถนน
              </label>
              <input
                type="text"
                id="road"
                name="road"
                value={currentAddress?.road || ''}
                onChange={(e) => handleInputChange('road', e.target.value)}
                placeholder="ถนน"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  border-gray-300 hover:border-gray-400
                  ${isAutofill && formData.road
                    ? 'bg-blue-50 text-gray-700 cursor-default border-blue-200'
                    : 'bg-white'
                  }
                `}
              />
              {isAutofill && formData.road && (
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ข้อมูลถูกดึงอัตโนมัติ
                </p>
              )}
            </div>

            {/* Sub District */}
            <div className="space-y-2">
              <SearchableDropdown
                label="ตำบล/แขวง"
                placeholder="พิมพ์เพื่อค้นหาตำบล/แขวง"
                value={currentAddress?.subDistrict || ''}
                onChange={handleSubDistrictChange}
                onSelect={handleSubDistrictSelect}
                fetchOptions={fetchSubDistricts}
                isRequired={true}
                isReadOnly={false}
                error={errors?.subDistrict}
                autoFillNote={isAutofill && formData.subDistrict ? '* ข้อมูลถูกดึงอัตโนมัติ' : null}
                disabled={isLoading}
              />
            </div>

            {/* District */}
            <div className="space-y-2">
              <SearchableDropdown
                label="อำเภอ/เขต"
                placeholder="พิมพ์เพื่อค้นหาอำเภอ/เขต"
                value={currentAddress?.district || ''}
                onChange={handleDistrictChange}
                onSelect={handleDistrictSelect}
                fetchOptions={fetchDistricts}
                isRequired={true}
                isReadOnly={true}
                error={errors?.district}
                autoFillNote={isAutofill && formData.district ? '* ข้อมูลถูกดึงอัตโนมัติ' : null}
              />
            </div>

            {/* Province */}
            <div className="space-y-2">
              <SearchableDropdown
                label="จังหวัด"
                placeholder="พิมพ์เพื่อค้นหาจังหวัด"
                value={currentAddress?.province || ''}
                onChange={handleProvinceChange}
                fetchOptions={fetchProvinces}
                isRequired={true}
                isReadOnly={true}
                error={errors?.province}
                autoFillNote={isAutofill && formData.province ? '* ข้อมูลถูกดึงอัตโนมัติ' : null}
              />
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <SearchableDropdown
                label="รหัสไปรษณีย์"
                placeholder="พิมพ์เพื่อค้นหารหัสไปรษณีย์"
                value={currentAddress?.postalCode || ''}
                onChange={handlePostalCodeChange}
                onSelect={handlePostalCodeSelect}
                fetchOptions={fetchPostalCodes}
                isRequired={true}
                isReadOnly={false}
                error={errors?.postalCode}
                autoFillNote={isAutofill && formData.postalCode ? '* ข้อมูลถูกดึงอัตโนมัติ' : null}
                disabled={isLoading}
              />
            </div>
          </div>
          {/* Contact fields merged into the same card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Association Phone */}
            <div className="lg:col-span-2 space-y-2">
              <label htmlFor="associationPhone" className="block text-sm font-medium text-gray-900">
                โทรศัพท์
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <input
                    type="tel"
                    id="associationPhone"
                    name="associationPhone"
                    value={currentAddress?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    placeholder="02-123-4567"
                    className={`
                      w-full px-4 py-3 text-sm
                      border rounded-lg
                      bg-white
                      placeholder-gray-400
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${errors?.associationPhone 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    id="associationPhoneExtension"
                    name="associationPhoneExtension"
                    value={currentAddress?.phoneExtension || ''}
                    onChange={(e) => handleInputChange('phoneExtension', e.target.value)}
                    placeholder="ต่อ (ถ้ามี)"
                    className="w-full px-4 py-3 text-sm border rounded-lg bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 hover:border-gray-400"
                  />
                </div>
              </div>
              {errors?.associationPhone && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.associationPhone}
                </p>
              )}
            </div>

            {/* Association Email */}
            <div className="space-y-2">
              <label htmlFor="associationEmail" className="block text-sm font-medium text-gray-900">
                อีเมล
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                id="associationEmail"
                name="associationEmail"
                value={currentAddress?.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="association@example.com"
                className={`
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors?.associationEmail 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              />
              {errors?.associationEmail && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.associationEmail}
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
                value={currentAddress?.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
                className="
                  w-full px-4 py-3 text-sm
                  border rounded-lg
                  bg-white
                  placeholder-gray-400
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  border-gray-300 hover:border-gray-400
                "
              />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

