'use client';

import { useState } from 'react';
import FileUploadInput from './FileUploadInput';

/**
 * คอมโพเนนต์สำหรับอัพโหลดเอกสารในฟอร์มสมัครสมาชิกประเภท AC (สมทบ-นิติบุคคล)
 * @param {Object} props
 * @param {Object} props.formData ข้อมูลฟอร์มทั้งหมด
 * @param {Function} props.setFormData ฟังก์ชันสำหรับอัพเดทข้อมูลฟอร์ม
 * @param {Object} props.errors ข้อผิดพลาดของฟอร์ม
 */
export default function DocumentUploadSection({ formData, setFormData, errors }) {
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleRemoveFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
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

        {/* Document Upload Fields */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล</h3>
                <p className="text-sm text-gray-500">ออกโดยกระทรวงพาณิชย์ อายุไม่เกิน 6 เดือน</p>
              </div>
            </div>
            
            <FileUploadInput
              label=""
              name="companyRegistration"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              error={errors.companyRegistration}
              value={formData.companyRegistration}
              onRemove={() => handleRemoveFile('companyRegistration')}
              onView={() => viewFile(formData.companyRegistration)}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
