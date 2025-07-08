// components/DocumentUploadSection.js
'use client';

import { useState } from 'react';
import FileUploadInput from './FileUploadInput';
import MultipleFileManager from './MultipleFileManager';

export default function DocumentUploadSection({ formData, setFormData, errors }) {
  const [selectedFiles, setSelectedFiles] = useState({
    associationCertificate: null,
    memberList: null
  });

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setSelectedFiles(prev => ({ ...prev, [name]: files[0] }));
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleMultipleFileChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const currentFiles = selectedFiles.productionImages || [];
      const totalFiles = [...currentFiles, ...newFiles].slice(0, 5);
      
      setSelectedFiles(prev => ({ ...prev, productionImages: totalFiles }));
      setFormData(prev => ({ ...prev, productionImages: totalFiles }));
    }
  };

  const removeProductionImage = (index) => {
    const updatedFiles = selectedFiles.productionImages.filter((_, i) => i !== index);
    setSelectedFiles(prev => ({ ...prev, productionImages: updatedFiles }));
    setFormData(prev => ({ ...prev, productionImages: updatedFiles }));
  };



  const viewFile = (file) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        const w = window.open('');
        w.document.write(img.outerHTML);
      } else {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header Section */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          เอกสารประกอบการสมัคร
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          เอกสารประกอบการสมัครสมาชิกสมาคมการค้า (จำเป็นต้องแนบทั้ง 2 รายการ)
        </p>
      </div>
      
      {/* Content Section */}
      <div className="px-8 py-8 space-y-8">
        {/* Association Certificate Upload */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">สำเนาหนังสือรับรองการจดทะเบียนเป็นสมาคมการค้า</h3>
              <p className="text-sm text-gray-500">เอกสารรับรองการจดทะเบียนสมาคมการค้าที่ออกโดยหน่วยงานราชการ</p>
            </div>
          </div>
          <FileUploadInput
            label=""
            name="associationCertificate"
            required={true}
            file={selectedFiles.associationCertificate}
            onChange={handleFileChange}
            onView={viewFile}
            error={errors?.associationCertificate}
          />
        </div>
        
        {/* Member List Upload */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">รายชื่อสมาชิกสมาคม</h3>
              <p className="text-sm text-gray-500">เอกสารแสดงรายชื่อสมาชิกของสมาคมการค้า</p>
            </div>
          </div>
          <FileUploadInput
            label=""
            name="memberList"
            required={true}
            file={selectedFiles.memberList}
            onChange={handleFileChange}
            onView={viewFile}
            error={errors?.memberList}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-yellow-800">
              <strong>หมายเหตุ:</strong> กรุณาแนบเอกสารทั้ง 2 รายการ เพื่อประกอบการพิจารณาการสมัครสมาชิกสมาคมการค้า
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
