'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import { useAuth } from '@/app/contexts/AuthContext';

export default function MemberInfo() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    memberSearch: '', // Combined field for search
    memberNumber: '',
    memberType: '',
    companyName: '',
    taxId: '',
    registrationNumber: '',
    address: '',
    province: '',
    postalCode: '',
    phone: '',
    website: '',
    documentType: 'company_registration',
    documentFile: null
  });
  
  const [formErrors, setFormErrors] = useState({
    memberSearch: false,
    memberNumber: false,
    memberType: false,
    companyName: false,
    taxId: false,
    registrationNumber: false,
    address: false,
    province: false,
    postalCode: false,
    phone: false,
    documentFile: false
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [provinceResults, setProvinceResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingProvince, setIsSearchingProvince] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const dropdownRef = useRef(null);
  const provinceDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(event.target)) {
        setProvinceResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchMembers = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/member-search?term=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.success && data.data.companies) {
        console.log('Search results:', data.data.companies);
        setSearchResults(data.data.companies);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching members:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchProvinces = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) {
      setProvinceResults([]);
      return;
    }

    try {
      setIsSearchingProvince(true);
      const response = await fetch(`/api/provinces/search?term=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.success && data.data) {
        setProvinceResults(data.data);
      } else {
        setProvinceResults([]);
      }
    } catch (error) {
      console.error('Error searching provinces:', error);
      setProvinceResults([]);
    } finally {
      setIsSearchingProvince(false);
    }
  };

  // Debounce search to prevent too many API calls
  const debouncedSearch = useRef(
    debounce(async (searchTerm) => {
      await searchMembers(searchTerm);
    }, 300)
  ).current;

  const debouncedProvinceSearch = useRef(
    debounce(async (searchTerm) => {
      await searchProvinces(searchTerm);
    }, 300)
  ).current;
  
  // For debugging purposes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Trigger search for combined memberSearch field
    if (name === 'memberSearch') {
      debouncedSearch(value);
    }

    // Trigger search for province field
    if (name === 'province') {
      debouncedProvinceSearch(value);
    }
  };

  const handleSelectResult = (result) => {
    console.log('Selected result:', result);
    setSelectedResult(result);
    
    // The member type is already mapped in the API
    const memberTypeValue = result.MEMBER_TYPE || '';
    
    // Create a new form data object with the selected values
    const newFormData = {
      ...formData,
      memberSearch: `${result.MEMBER_CODE} - ${result.COMPANY_NAME}`,
      memberNumber: result.MEMBER_CODE || '',
      companyName: result.COMPANY_NAME || '',
      memberType: memberTypeValue,
      taxId: result.TAX_ID || '',
    };
    
    console.log('Setting form data:', newFormData);
    setFormData(newFormData);
    
    // Clear any errors for the fields that were filled
    setFormErrors(prev => ({
      ...prev,
      memberSearch: false,
      memberNumber: false,
      companyName: false,
      memberType: false,
      taxId: false
    }));
    
    setSearchResults([]);
  };

  const handleSelectProvince = (province) => {
    setFormData(prev => ({
      ...prev,
      province: province.name_th
    }));
    
    setFormErrors(prev => ({
      ...prev,
      province: false
    }));
    
    setProvinceResults([]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('ขนาดไฟล์ต้องไม่เกิน 10MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('รองรับเฉพาะไฟล์ PDF, JPG, PNG เท่านั้น');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        documentFile: file
      }));
      
      // Clear the error for document file
      setFormErrors(prev => ({
        ...prev,
        documentFile: false
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check which fields are empty
    const errors = {
      memberSearch: !formData.memberSearch,
      memberNumber: !formData.memberNumber,
      memberType: !formData.memberType,
      companyName: !formData.companyName, 
      taxId: !formData.taxId,
      documentFile: !formData.documentFile
    };
    
    // Update error state
    setFormErrors(errors);
    
    // Check if any required field is empty
    if (errors.memberSearch || errors.memberNumber || errors.memberType || 
        errors.companyName || errors.taxId || errors.documentFile) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create form data for file upload
      const data = new FormData();
      data.append('userId', user?.id || '');
      data.append('memberNumber', formData.memberNumber);
      data.append('memberType', formData.memberType);
      data.append('companyName', formData.companyName);
      data.append('companyType', formData.memberType);
      data.append('registrationNumber', formData.registrationNumber);
      data.append('taxId', formData.taxId);
      data.append('address', formData.address);
      data.append('province', formData.province);
      data.append('postalCode', formData.postalCode);
      data.append('phone', formData.phone);
      data.append('website', formData.website);
      data.append('documentType', formData.documentType);
      data.append('documentFile', formData.documentFile);
      
      // Submit data to API
      const response = await fetch('/api/member/submit', {
        method: 'POST',
        body: data
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('ส่งข้อมูลเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 1-2 วันทำการ');
        
        // Reset form
        setFormData({
          memberSearch: '',
          memberNumber: '',
          memberType: '',
          companyName: '',
          taxId: '',
          registrationNumber: '',
          address: '',
          province: '',
          postalCode: '',
          phone: '',
          website: '',
          documentType: 'company_registration',
          documentFile: null
        });
        
        // Reset errors
        setFormErrors({
          memberSearch: false,
          memberNumber: false,
          memberType: false,
          companyName: false,
          taxId: false,
          registrationNumber: false,
          address: false,
          province: false,
          postalCode: false,
          phone: false,
          documentFile: false
        });
        
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">ยืนยันตัวตนสมาชิกเดิม</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="bg-yellow-100 rounded-full p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium">หากคุณเป็นสมาชิกเดิมของสภาอุตสาหกรรมแห่งประเทศไทย</p>
            <p className="text-sm text-gray-600">กรุณากรอกข้อมูลเพื่อยืนยันตัวตนและเชื่อมโยงบัญชีของคุณ</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเลขสมาชิก - ชื่อบริษัท/องค์กร
            </label>
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                name="memberSearch"
                value={formData.memberSearch}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.memberSearch ? 'border-red-500' : ''} text-gray-900`}
                placeholder="พิมพ์เลขที่สมาชิกหรือชื่อบริษัท/องค์กร"
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                      onClick={() => handleSelectResult(result)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{result.MEMBER_CODE} - <span className="truncate">{result.COMPANY_NAME}</span></div>
                      </div>
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800 font-medium ml-2">
                        {result.MEMBER_TYPE}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {formErrors.memberSearch && (
                <p className="text-red-500 text-xs mt-1">กรุณากรอกหมายเลขสมาชิกหรือชื่อบริษัท/องค์กร</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทสมาชิก
              </label>
              <select 
                name="memberType"
                value={formData.memberType}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.memberType ? 'border-red-500' : ''} text-gray-900 bg-gray-100`}
                disabled
              >
                <option value="">-- เลือกประเภทสมาชิก --</option>
                <option value="สส">สมาชิกสามัญ (สส)</option>
                <option value="สน">สมาชิกวิสามัญ (สน)</option>
                <option value="ทน">สมาชิกไม่มีนิติบุคคล (ทน)</option>
                <option value="ทบ">สมาชิกสมทบ (ทบ)</option>
              </select>
              {formErrors.memberType && (
                <p className="text-red-500 text-xs mt-1">กรุณาเลือกประเภทสมาชิก</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลขประจำตัวผู้เสียภาษี
              </label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.taxId ? 'border-red-500' : ''} text-gray-900 ${selectedResult ? 'bg-gray-100' : ''}`}
                placeholder="เลข 13 หลัก"
                readOnly={!!selectedResult}
              />
              {formErrors.taxId && (
                <p className="text-red-500 text-xs mt-1">กรุณากรอกเลขประจำตัวผู้เสียภาษี</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลขทะเบียนนิติบุคคล
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="เลขทะเบียนนิติบุคคล"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="เบอร์โทรศัพท์"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ที่อยู่
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="ที่อยู่"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จังหวัด
              </label>
              <div className="relative" ref={provinceDropdownRef}>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="จังหวัด"
                  autoComplete="off"
                />
                {isSearchingProvince && (
                  <div className="absolute right-3 top-3">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {provinceResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                    {provinceResults.map((province) => (
                      <div
                        key={province.id}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleSelectProvince(province)}
                      >
                        <div className="font-medium text-gray-900">{province.name_th}</div>
                        <div className="text-xs text-gray-500">{province.name_en}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสไปรษณีย์
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="รหัสไปรษณีย์"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เว็บไซต์
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทเอกสาร
            </label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="company_registration">หนังสือรับรองบริษัท</option>
              <option value="tax_registration">ทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)</option>
              <option value="other">เอกสารอื่นๆ</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อัปโหลดเอกสาร
            </label>
            <div className={`border-2 border-dashed rounded-lg p-4 ${formErrors.documentFile ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="flex flex-col items-center justify-center py-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-500 mb-1">คลิกหรือลากไฟล์มาวางที่นี่</p>
                <p className="text-xs text-gray-400">รองรับไฟล์ PDF, JPG, PNG (ไม่เกิน 10MB)</p>
                
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                
                <button
                  type="button"
                  onClick={() => document.getElementById('file-upload').click()}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  เลือกไฟล์
                </button>
              </div>
              
              {formData.documentFile && (
                <div className="mt-3 flex items-center justify-between bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm truncate max-w-xs">{formData.documentFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, documentFile: null }));
                      document.getElementById('file-upload').value = '';
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {formErrors.documentFile && (
                <p className="text-red-500 text-xs mt-1">กรุณาอัปโหลดเอกสาร</p>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังส่งข้อมูล...
                </div>
              ) : 'ส่งข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
