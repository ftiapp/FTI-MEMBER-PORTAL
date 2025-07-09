// components/DocumentUploadSection.js
'use client';

import { useState, useEffect } from 'react';

export default function DocumentUploadSection({ formData, setFormData, errors }) {
  // ใช้ข้อมูลจาก formData เป็นค่าเริ่มต้นเพื่อให้แสดงไฟล์ที่เคยอัปโหลดไว้
  const [selectedFiles, setSelectedFiles] = useState({
    associationCertificate: formData.associationCertificate || null,
    memberList: formData.memberList || null
  });

  // Sync selectedFiles with formData when component mounts or formData changes
  useEffect(() => {
    setSelectedFiles({
      associationCertificate: formData.associationCertificate || null,
      memberList: formData.memberList || null
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
  const SingleFileUploadZone = ({ title, description, name, file, icon, iconColor, bgColor, error }) => {
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
      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all duration-300">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 ${bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
              {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {title}
            </h3>
            <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
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
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-white transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-base text-gray-700 mb-3 font-medium">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</p>
                <p className="text-sm text-gray-500">รองรับไฟล์: PDF, JPG, PNG (ขนาดไม่เกิน 5MB)</p>
              </div>
            </div>
          )}

          {/* File Preview */}
          {hasFile(file) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base">{getFileName(file)}</p>
                    <p className="text-sm text-gray-500">{getFileSize(file)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => viewFile(file)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                    title="ดูไฟล์"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    ดูไฟล์
                  </button>
                  <button
                    type="button"
                    onClick={removeSingleFile}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                    title="ลบไฟล์"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ลบไฟล์
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          เอกสารประกอบการสมัคร
        </h2>
        <p className="text-blue-100 text-base mt-2">
          กรุณาอัพโหลดเอกสารที่จำเป็นสำหรับการสมัครสมาชิกสมาคมการค้า
        </p>
      </div>
      
      {/* Content Section */}
      <div className="px-8 py-8 space-y-8">
        {/* Required Documents Notice */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-base font-semibold text-amber-800 mb-2">ข้อมูลสำคัญ</h3>
              <p className="text-sm text-amber-700 mb-2">
                <strong>โปรดอัพโหลดเอกสารที่จำเป็น</strong> เอกสารต้องเป็นไฟล์ PDF, JPG หรือ PNG ขนาดไม่เกิน 5MB
              </p>
              <p className="text-sm text-amber-700">
                รายการเอกสารที่ท่านต้องเตรียม: หนังสือรับรองการจดทะเบียนสมาคมการค้า และรายชื่อสมาชิกสมาคม
              </p>
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-base font-semibold text-blue-800">
                อัปโหลดเอกสารประกอบการสมัคร
              </span>
            </div>
          </div>

          {/* Association Certificate Upload */}
          <SingleFileUploadZone
            title="สำเนาหนังสือรับรองการจดทะเบียนเป็นสมาคมการค้า"
            description="เอกสารรับรองการจดทะเบียนสมาคมการค้าที่ออกโดยหน่วยงานราชการ พร้อมลายเซ็นสำเนาถูกต้อง"
            name="associationCertificate"
            file={selectedFiles.associationCertificate}
            icon={
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            iconColor="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            error={errors?.associationCertificate}
          />

          {/* Member List Upload */}
          <SingleFileUploadZone
            title="รายชื่อสมาชิกสมาคม"
            description="เอกสารแสดงรายชื่อสมาชิกของสมาคมการค้า พร้อมลายเซ็นสำเนาถูกต้อง"
            name="memberList"
            file={selectedFiles.memberList}
            icon={
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            iconColor="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            error={errors?.memberList}
          />
        </div>

        {/* Additional Information */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-3 text-lg">หมายเหตุสำคัญ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>เอกสารต้องชัดเจน อ่านได้ทุกตัวอักษร</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>ไฟล์ต้องมีขนาดไม่เกิน 5MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>รองรับไฟล์นามสกุล PDF, JPG, PNG เท่านั้น</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>สำเนาเอกสารต้องมีลายเซ็นรับรองสำเนาถูกต้อง</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="font-medium">กรุณาแนบเอกสารทั้ง 2 รายการที่จำเป็น</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}