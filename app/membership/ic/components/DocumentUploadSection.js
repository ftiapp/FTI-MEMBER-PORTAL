'use client';

import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function DocumentUploadSection({ formData, setFormData, errors }) {
  const [selectedFile, setSelectedFile] = useState(formData.idCardDocument || null);

  // Debug: เพิ่ม useEffect เพื่อ debug
  useEffect(() => {
    console.log('=== DEBUG DocumentUploadSection ===');
    console.log('formData.idCardDocument:', formData.idCardDocument);
    console.log('selectedFile:', selectedFile);
    console.log('errors:', errors);
  }, [formData.idCardDocument, selectedFile, errors]);

  // Sync selectedFile with formData when component mounts or formData changes
  useEffect(() => {
    if (formData.idCardDocument && !selectedFile) {
      setSelectedFile(formData.idCardDocument);
    }
  }, [formData.idCardDocument, selectedFile]);

  // Handle file change
  const handleFileChange = (e) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      console.log('File selected:', file.name, file.size, file.type);
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ PDF, JPG, JPEG หรือ PNG');
        return;
      }
      
      // Update local state
      setSelectedFile(file);
      
      // Update form data
      setFormData(prev => {
        const updated = { ...prev, idCardDocument: file };
        console.log('Updated formData with file:', updated);
        return updated;
      });
    }
  };

  // View uploaded file
  const viewFile = () => {
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(selectedFile);
        const w = window.open('');
        w.document.write(img.outerHTML);
      } else {
        const url = URL.createObjectURL(selectedFile);
        window.open(url, '_blank');
      }
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    console.log('Removing file');
    setSelectedFile(null);
    setFormData(prev => {
      const updated = { ...prev, idCardDocument: null };
      console.log('Updated formData after removing file:', updated);
      return updated;
    });
    
    // Clear the file input
    const fileInput = document.getElementById('idCardDocument');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Error icon component
  const ErrorIcon = useMemo(() => (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ), []);

  // File icon component
  const FileIcon = useMemo(() => (
    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  ), []);

  // View icon component
  const ViewIcon = useMemo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ), []);

  // Delete icon component
  const DeleteIcon = useMemo(() => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ), []);

  // Upload icon component
  const UploadIcon = useMemo(() => (
    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ), []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
      {/* Header */}
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-xl font-semibold text-white tracking-tight">เอกสารแนบ</h2>
        <p className="text-blue-100 text-sm mt-1">อัพโหลดสำเนาบัตรประชาชน</p>
      </div>
      
      {/* Content */}
      <div className="px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">สำเนาบัตรประชาชน</h3>
          <p className="text-sm text-gray-600 mb-6">กรุณาอัพโหลดสำเนาบัตรประชาชนพร้อมลายเซ็นรับรองสำเนาถูกต้อง</p>
          
          {/* Document notification */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">รายการเอกสารที่ท่านต้องเตรียม</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>บัตรประจำตัวประชาชน พร้อมลายเซ็นสำเนาถูกต้อง</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* File upload area */}
          <div className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
            errors?.idCardDocument ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
          }`}>
            {!selectedFile ? (
              <div className="text-center">
                {UploadIcon}
                <div className="flex flex-col items-center mt-4">
                  <p className="text-sm text-gray-500">
                    ลากไฟล์มาวางที่นี่ หรือ
                  </p>
                  <label htmlFor="idCardDocument" className="mt-2 cursor-pointer">
                    <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      เลือกไฟล์
                    </span>
                    <input
                      id="idCardDocument"
                      name="idCardDocument"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    รองรับไฟล์ PDF, JPG, JPEG, PNG ขนาดไม่เกิน 5MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {FileIcon}
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={viewFile}
                    className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    title="ดูไฟล์"
                  >
                    {ViewIcon}
                  </button>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                    title="ลบไฟล์"
                  >
                    {DeleteIcon}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Error message */}
          {errors?.idCardDocument && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              {ErrorIcon}
              <span className="ml-1">{errors.idCardDocument}</span>
            </p>
          )}

          {/* File upload progress or success message */}
          {selectedFile && !errors?.idCardDocument && (
            <div className="mt-2 flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ไฟล์ถูกอัพโหลดเรียบร้อยแล้ว
            </div>
          )}
          
          {/* Additional file upload instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">คำแนะนำการอัพโหลดไฟล์</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• ไฟล์ต้องชัดเจน อ่านได้ง่าย</li>
              <li>• สำเนาต้องมีลายเซ็นรับรองสำเนาถูกต้อง</li>
              <li>• ขนาดไฟล์ไม่เกิน 5MB</li>
              <li>• รองรับไฟล์ PDF, JPG, JPEG, PNG</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

DocumentUploadSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object
};

DocumentUploadSection.defaultProps = {
  errors: {}
};