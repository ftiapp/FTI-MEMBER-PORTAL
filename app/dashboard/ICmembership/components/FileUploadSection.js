'use client';

import { useState } from 'react';
import { formatFileSize } from '../utils/fileUtils';

export default function FileUploadSection({
  formData,
  errors,
  handleFileChange
}) {
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // สร้าง event object ที่มีโครงสร้างเหมือนกับ event จาก input type="file"
      const fileEvent = {
        target: {
          name: 'idCardFile',
          files: [e.dataTransfer.files[0]]
        }
      };
      handleFileChange(fileEvent);
    }
  };
  
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e);
    }
  };
  
  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">เอกสารแนบ</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          สำเนาบัตรประชาชนพร้อมเซ็นกำกับ <span className="text-red-500">*</span>
        </label>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${errors.idCardFile ? 'border-red-500 bg-red-50' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {formData.idCardFile ? (
            <div className="w-full">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">{formData.idCardFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(formData.idCardFile.size)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {/* ปุ่มดูไฟล์ (รูปดวงตา) */}
                  <button
                    type="button"
                    onClick={() => {
                      // สร้าง URL object สำหรับไฟล์
                      const fileUrl = URL.createObjectURL(formData.idCardFile);
                      // เปิดไฟล์ในแท็บใหม่
                      window.open(fileUrl, '_blank');
                    }}
                    className="text-blue-500 hover:text-blue-700"
                    title="ดูไฟล์"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  {/* ปุ่มลบไฟล์ */}
                  <button
                    type="button"
                    onClick={() => handleFileChange({ target: { name: 'idCardFile', files: [] } })}
                    className="text-red-500 hover:text-red-700"
                    title="ลบไฟล์"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="text-sm text-gray-600 mb-2">ลากไฟล์มาวางที่นี่ หรือ</p>
              <label className="cursor-pointer bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                <span>เลือกไฟล์</span>
                <input
                  type="file"
                  name="idCardFile"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 5MB</p>
            </>
          )}
        </div>
        
        {errors.idCardFile && (
          <p className="mt-1 text-sm text-red-500">{errors.idCardFile}</p>
        )}
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              กรุณาแนบสำเนาบัตรประชาชนที่มีการเซ็นชื่อกำกับและเขียนว่า "ใช้สำหรับสมัครสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยเท่านั้น" เอกสารต้องชัดเจนและครบถ้วน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
