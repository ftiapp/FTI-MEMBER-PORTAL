'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { uploadFilesWithConcurrencyLimit } from '../../../../../utils/optimizedUpload';

/**
 * คอมโพเนนต์ MemberInfoForm ที่ปรับปรุงให้ใช้ optimizedUpload
 * แทนที่จะใช้ในตัวอย่างนี้ คุณสามารถนำโค้ดส่วนที่เกี่ยวข้องกับการอัปโหลดไปปรับใช้ใน MemberInfoForm เดิมได้
 */
export default function OptimizedMemberInfoForm({
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  selectedResult,
  setSelectedResult,
  onSubmit,
  showSubmitButton = true,
  submitButtonText = 'เพิ่มบริษัท',
  isSubmitting = false,
  verifiedCompanies = {},
  selectedCompanies = []
}) {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  
  // ฟังก์ชันสำหรับค้นหาบริษัท
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!formData.memberSearch || formData.memberSearch.trim() === '') {
      setFormErrors(prev => ({ ...prev, memberSearch: true }));
      return;
    }
    
    setIsSearching(true);
    setSearchResults([]);
    setShowResults(true);
    
    try {
      const response = await fetch(`/api/member/search?query=${encodeURIComponent(formData.memberSearch)}`);
      const data = await response.json();
      
      if (data.success) {
        // กรองผลลัพธ์ที่ถูกเลือกไปแล้วออก
        const filteredResults = data.results.filter(result => {
          const code = (result.MEMBER_CODE || '').trim();
          // ตรวจสอบว่าไม่อยู่ในรายการที่เลือกไปแล้ว และไม่อยู่ในรายการที่ไม่สามารถเลือกได้
          return !selectedCompanies.includes(code) && !verifiedCompanies[code];
        });
        
        setSearchResults(filteredResults);
      } else {
        toast.error(data.message || 'ไม่พบข้อมูล');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('เกิดข้อผิดพลาดในการค้นหา');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // ฟังก์ชันสำหรับเลือกบริษัทจากผลการค้นหา
  const handleSelectCompany = (company) => {
    setSelectedResult(company);
    setFormData({
      ...formData,
      memberNumber: company.MEMBER_CODE || '',
      compPersonCode: company.COMP_PERSON_CODE || '',
      registCode: company.REGIST_CODE || '',
      memberType: company.MEMBER_TYPE_CODE || '',
      companyName: company.COMP_NAME_TH || '',
      taxId: company.TAX_ID || '',
      documentFile: null
    });
    setShowResults(false);
  };
  
  // ฟังก์ชันสำหรับอัปโหลดเอกสาร
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // ตรวจสอบประเภทไฟล์
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(fileExt)) {
      toast.error('กรุณาอัปโหลดไฟล์ PDF หรือรูปภาพเท่านั้น');
      setFormErrors(prev => ({ ...prev, documentFile: true }));
      return;
    }
    
    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
      setFormErrors(prev => ({ ...prev, documentFile: true }));
      return;
    }
    
    try {
      // แสดงสถานะกำลังอัปโหลด
      toast.loading('กำลังอัปโหลดและบีบอัดไฟล์...', { id: 'upload' });
      
      // ใช้ฟังก์ชันอัปโหลดที่มีการบีบอัดและจำกัดการอัปโหลดพร้อมกัน
      const results = await uploadFilesWithConcurrencyLimit(
        [file],
        'member_verification',
        1, // maxConcurrent
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      // ตรวจสอบผลลัพธ์
      if (results[0]?.success) {
        toast.success('อัปโหลดไฟล์สำเร็จ', { id: 'upload' });
        
        // เก็บข้อมูลไฟล์ใน state
        setFormData(prev => ({
          ...prev,
          documentFile: {
            url: results[0].url,
            public_id: results[0].public_id,
            fileName: results[0].fileName,
            fileType: results[0].fileType,
            fileSize: results[0].fileSize
          }
        }));
        
        // ล้างข้อผิดพลาด
        setFormErrors(prev => ({ ...prev, documentFile: false }));
      } else {
        toast.error('อัปโหลดไฟล์ไม่สำเร็จ', { id: 'upload' });
        console.error('Upload error:', results[0]?.error);
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปโหลดไฟล์', { id: 'upload' });
    } finally {
      setUploadProgress(null);
    }
  };
  
  // ฟังก์ชันสำหรับลบไฟล์
  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, documentFile: null }));
    // ล้างค่า input file
    const fileInput = document.getElementById('documentFile');
    if (fileInput) fileInput.value = '';
  };
  
  // ฟังก์ชันสำหรับส่งฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    const errors = {
      memberNumber: !formData.memberNumber,
      memberType: !formData.memberType,
      companyName: !formData.companyName,
      taxId: !formData.taxId,
      documentFile: !formData.documentFile
    };
    
    setFormErrors(errors);
    
    // ถ้ามีข้อผิดพลาด ให้แสดงข้อความ
    if (Object.values(errors).some(error => error)) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    // ส่งข้อมูลไปยังฟังก์ชัน onSubmit
    onSubmit(formData);
  };
  
  // ปิดผลการค้นหาเมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) &&
          searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4 text-blue-800">ค้นหาและยืนยันสมาชิกเดิม</h2>
      
      {/* ส่วนค้นหาบริษัท */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative" ref={searchRef}>
          <label htmlFor="memberSearch" className="block text-sm font-medium text-gray-700 mb-1">
            ค้นหาบริษัทสมาชิก
          </label>
          <div className="flex">
            <input
              type="text"
              id="memberSearch"
              className={`block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                formErrors.memberSearch ? 'border-red-500' : ''
              }`}
              placeholder="ค้นหาด้วยชื่อบริษัท หรือรหัสสมาชิก"
              value={formData.memberSearch}
              onChange={(e) => {
                setFormData({ ...formData, memberSearch: e.target.value });
                setFormErrors({ ...formErrors, memberSearch: false });
              }}
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSearching}
            >
              {isSearching ? (
                <motion.div 
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                'ค้นหา'
              )}
            </button>
          </div>
          {formErrors.memberSearch && (
            <p className="mt-1 text-sm text-red-600">กรุณากรอกคำค้นหา</p>
          )}
          
          {/* ผลการค้นหา */}
          {showResults && (
            <div 
              ref={resultsRef}
              className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"
            >
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  <motion.div 
                    className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="mt-2">กำลังค้นหา...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((result, index) => {
                    const memberCode = (result.MEMBER_CODE || '').trim();
                    const isNonSelectable = verifiedCompanies[memberCode];
                    const status = isNonSelectable || '';
                    
                    return (
                      <li 
                        key={index} 
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${isNonSelectable ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isNonSelectable && handleSelectCompany(result)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{result.COMP_NAME_TH}</p>
                            <p className="text-sm text-gray-600">รหัสสมาชิก: {result.MEMBER_CODE}</p>
                            {result.TAX_ID && (
                              <p className="text-sm text-gray-600">เลขประจำตัวผู้เสียภาษี: {result.TAX_ID}</p>
                            )}
                          </div>
                          {isNonSelectable && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {status === 'approved' ? 'ยืนยันแล้ว' : 'รอการอนุมัติ'}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>ไม่พบข้อมูล</p>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
      
      {/* ฟอร์มข้อมูลบริษัท */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
          <div className="sm:col-span-1">
            <label htmlFor="memberNumber" className="block text-sm font-medium text-gray-700">
              รหัสสมาชิก <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="memberNumber"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                formErrors.memberNumber ? 'border-red-500' : ''
              }`}
              value={formData.memberNumber}
              onChange={(e) => {
                setFormData({ ...formData, memberNumber: e.target.value });
                setFormErrors({ ...formErrors, memberNumber: false });
              }}
              readOnly={!!selectedResult}
            />
            {formErrors.memberNumber && (
              <p className="mt-1 text-sm text-red-600">กรุณากรอกรหัสสมาชิก</p>
            )}
          </div>
          
          <div className="sm:col-span-1">
            <label htmlFor="memberType" className="block text-sm font-medium text-gray-700">
              ประเภทสมาชิก <span className="text-red-500">*</span>
            </label>
            <select
              id="memberType"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                formErrors.memberType ? 'border-red-500' : ''
              }`}
              value={formData.memberType}
              onChange={(e) => {
                setFormData({ ...formData, memberType: e.target.value });
                setFormErrors({ ...formErrors, memberType: false });
              }}
              disabled={!!selectedResult}
            >
              <option value="">เลือกประเภทสมาชิก</option>
              <option value="OC">สน (OC) - สามัญ-โรงงาน</option>
              <option value="AM">สส (AM) - สามัญ-สมาคมการค้า</option>
              <option value="AC">ทน (AC) - สมทบ-นิติบุคคล</option>
            </select>
            {formErrors.memberType && (
              <p className="mt-1 text-sm text-red-600">กรุณาเลือกประเภทสมาชิก</p>
            )}
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              ชื่อบริษัท <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                formErrors.companyName ? 'border-red-500' : ''
              }`}
              value={formData.companyName}
              onChange={(e) => {
                setFormData({ ...formData, companyName: e.target.value });
                setFormErrors({ ...formErrors, companyName: false });
              }}
              readOnly={!!selectedResult}
            />
            {formErrors.companyName && (
              <p className="mt-1 text-sm text-red-600">กรุณากรอกชื่อบริษัท</p>
            )}
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
              เลขประจำตัวผู้เสียภาษี <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="taxId"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                formErrors.taxId ? 'border-red-500' : ''
              }`}
              value={formData.taxId}
              onChange={(e) => {
                setFormData({ ...formData, taxId: e.target.value });
                setFormErrors({ ...formErrors, taxId: false });
              }}
              readOnly={!!selectedResult}
            />
            {formErrors.taxId && (
              <p className="mt-1 text-sm text-red-600">กรุณากรอกเลขประจำตัวผู้เสียภาษี</p>
            )}
          </div>
          
          {/* ส่วนอัปโหลดเอกสาร */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อัปโหลดเอกสารยืนยัน <span className="text-red-500">*</span>
            </label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              formErrors.documentFile ? 'border-red-500' : 'border-gray-300'
            }`}>
              <div className="space-y-1 text-center">
                {formData.documentFile ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-2">
                      {formData.documentFile.fileType?.includes('pdf') ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{formData.documentFile.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {formData.documentFile.fileSize ? `${(formData.documentFile.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <a 
                        href={formData.documentFile.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        ดูเอกสาร
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        ลบเอกสาร
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex justify-center text-sm text-gray-600">
                      <label htmlFor="documentFile" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>อัปโหลดไฟล์</span>
                        <input 
                          id="documentFile" 
                          name="documentFile" 
                          type="file" 
                          className="sr-only" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG ไม่เกิน 5MB</p>
                    
                    {/* แสดงความคืบหน้าการอัปโหลด */}
                    {uploadProgress && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${uploadProgress.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadProgress.percentage}% - {uploadProgress.currentFile}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            {formErrors.documentFile && (
              <p className="mt-1 text-sm text-red-600">กรุณาอัปโหลดเอกสารยืนยัน</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              เอกสารที่ใช้ยืนยัน เช่น หนังสือรับรองบริษัท, ใบเสร็จค่าสมาชิก, เอกสารแสดงความเป็นสมาชิก
            </p>
          </div>
        </div>
        
        {/* ปุ่มส่งฟอร์ม */}
        {showSubmitButton && (
          <div className="mt-6">
            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <motion.div 
                    className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  กำลังดำเนินการ...
                </div>
              ) : submitButtonText}
            </button>
          </div>
        )}
      </form>
    </motion.div>
  );
}
