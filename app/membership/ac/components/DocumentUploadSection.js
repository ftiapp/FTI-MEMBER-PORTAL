'use client';

import { useState, useEffect } from 'react';
import FileUploadInput from './FileUploadInput';

/**
 * คอมโพเนนต์สำหรับอัพโหลดเอกสารในฟอร์มสมัครสมาชิกประเภท AC (สมทบ-นิติบุคคล)
 * @param {Object} props
 * @param {Object} props.formData ข้อมูลฟอร์มทั้งหมด
 * @param {Function} props.setFormData ฟังก์ชันสำหรับอัพเดทข้อมูลฟอร์ม
 * @param {Object} props.errors ข้อผิดพลาดของฟอร์ม
 */
export default function DocumentUploadSection({ formData, setFormData, errors }) {
  // ใช้ข้อมูลจาก formData เป็นค่าเริ่มต้นเพื่อให้แสดงไฟล์ที่เคยอัปโหลดไว้
  const [selectedFiles, setSelectedFiles] = useState({
    companyRegistration: formData.companyRegistration || null,
  });

  // Sync selectedFiles with formData when component mounts or formData changes
  useEffect(() => {
    setSelectedFiles({
      companyRegistration: formData.companyRegistration || null,
    });
  }, [formData]);

  // Helper function to create consistent file object
  const createFileObject = (file) => {
    return {
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const fileObj = createFileObject(files[0]);
      
      setSelectedFiles(prev => ({ ...prev, [name]: fileObj }));
      setFormData(prev => ({ ...prev, [name]: fileObj }));
    }
  };

  const handleRemoveFile = (fieldName) => {
    setSelectedFiles(prev => ({ ...prev, [fieldName]: null }));
    setFormData(prev => ({ ...prev, [fieldName]: null }));
  };

  const viewFile = (fileObj) => {
    if (fileObj) {
      const file = fileObj.file || fileObj; // Handle both old and new format
      if (file && file.type && file.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        const w = window.open('');
        w.document.write(img.outerHTML);
      } else if (file) {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
      }
    }
  };

  // Helper function to check if file exists
  const hasFile = (fileObj) => {
    return fileObj && (fileObj.file || fileObj.name);
  };

  // Helper function to get file name
  const getFileName = (fileObj) => {
    if (!fileObj) return '';
    return fileObj.name || (fileObj.file && fileObj.file.name) || 'ไฟล์ที่อัปโหลด';
  };

  // Helper function to get file size
  const getFileSize = (fileObj) => {
    if (!fileObj) return '';
    const size = fileObj.size || (fileObj.file && fileObj.file.size);
    return size ? `${(size / 1024 / 1024).toFixed(2)} MB` : 'ไฟล์ถูกอัปโหลดแล้ว';
  };

  // Helper function for single file upload with drag & drop UI
  const SingleFileUploadZone = ({ title, description, name, file, icon, iconColor, bgColor }) => {
    const handleSingleFileChange = (e) => {
      const { files } = e.target;
      if (files && files[0]) {
        const fileObj = createFileObject(files[0]);
        setSelectedFiles(prev => ({ ...prev, [name]: fileObj }));
        setFormData(prev => ({ ...prev, [name]: fileObj }));
      }
    };

    const removeSingleFile = () => {
      setSelectedFiles(prev => ({ ...prev, [name]: null }));
      setFormData(prev => ({ ...prev, [name]: null }));
    };

    return (
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {description}
            </p>
          </div>

          {/* Upload Area */}
          {!hasFile(file) && (
            <div className="relative">
              <input
                type="file"
                name={name}
                onChange={handleSingleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-2">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</p>
                <p className="text-xs text-gray-500">รองรับไฟล์: PDF, JPG, PNG (ขนาดไม่เกิน 5MB)</p>
              </div>
            </div>
          )}

          {/* File Preview */}
          {hasFile(file) && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{getFileName(file)}</p>
                    <p className="text-xs text-gray-500">{getFileSize(file)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => viewFile(file)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="ดูไฟล์"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={removeSingleFile}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบไฟล์"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.companyRegistration && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{errors.companyRegistration}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          เอกสารประกอบการสมัคร
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          กรุณาอัพโหลดเอกสารที่จำเป็นสำหรับการสมัครสมาชิกประเภทสมทบ-นิติบุคคล (ทน)
        </p>
      </div>
      
      {/* Content Section */}
      <div className="px-8 py-8 space-y-8">
        {/* Required Documents Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>โปรดอัพโหลดเอกสารที่จำเป็น</strong> เอกสารต้องเป็นไฟล์ PDF, JPG หรือ PNG ขนาดไม่เกิน 5MB
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                รายการเอกสารที่ท่านต้องเตรียม บัตรประจำตัวประชาชน พร้อม ลายเซ็นสำเนาถูกต้อง
              </p>
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-blue-800">
                อัปโหลดเอกสารประกอบการสมัคร
              </span>
            </div>
          </div>

          {/* Company Registration Upload */}
          <SingleFileUploadZone
            title="สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล"
            description="ออกโดยกระทรวงพาณิชย์ อายุไม่เกิน 6 เดือน พร้อมลายเซ็นสำเนาถูกต้อง"
            name="companyRegistration"
            file={selectedFiles.companyRegistration}
            icon={
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
          />
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">หมายเหตุสำคัญ</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• เอกสารต้องชัดเจน อ่านได้ทุกตัวอักษร</li>
                <li>• ไฟล์ต้องมีขนาดไม่เกิน 5MB</li>
                <li>• รองรับไฟล์นามสกุล PDF, JPG, PNG เท่านั้น</li>
                <li>• สำเนาเอกสารต้องมีลายเซ็นรับรองสำเนาถูกต้อง</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}