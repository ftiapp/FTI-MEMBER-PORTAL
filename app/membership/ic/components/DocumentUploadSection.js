'use client';

import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function DocumentUploadSection({ formData, setFormData, errors }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);

  // Debug: เพิ่ม useEffect เพื่อ debug
  useEffect(() => {
    console.log('=== DEBUG DocumentUploadSection ===');
    console.log('formData.idCardDocument:', formData.idCardDocument);
    console.log('selectedFile:', selectedFile);
    console.log('errors:', errors);
  }, [formData.idCardDocument, selectedFile, errors]);

  // Sync local state with formData when component mounts or formData changes
  useEffect(() => {
    if (formData.idCardDocument) {
      setSelectedFile(formData.idCardDocument);
    }
    if (formData.authorizedSignature) {
      setSelectedSignature(formData.authorizedSignature);
    }
  }, [formData.idCardDocument, formData.authorizedSignature]);

  const handleFileChange = (e, documentType) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB');
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ PDF, JPG, JPEG หรือ PNG');
        return;
      }

      if (documentType === 'idCardDocument') {
        setSelectedFile(file);
      } else if (documentType === 'authorizedSignature') {
        setSelectedSignature(file);
      }

      setFormData(prev => ({ ...prev, [documentType]: file }));
    }
  };

  const viewFile = (file) => {
    if (!file) return;

    if (typeof file === 'string') {
      window.open(file, '_blank');
      return;
    }

    const url = URL.createObjectURL(file);
    if (file.type?.startsWith('image/')) {
      const img = new Image();
      img.src = url;
      const w = window.open('');
      w.document.write(img.outerHTML);
    } else {
      window.open(url, '_blank');
    }
  };

  const removeFile = (documentType) => {
    if (documentType === 'idCardDocument') {
      setSelectedFile(null);
    } else if (documentType === 'authorizedSignature') {
      setSelectedSignature(null);
    }

    setFormData(prev => ({ ...prev, [documentType]: null }));

    const fileInput = document.getElementById(documentType);
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
                      onChange={(e) => handleFileChange(e, 'idCardDocument')}
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
                    onClick={() => viewFile(selectedFile)}
                    className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    title="ดูไฟล์"
                  >
                    {ViewIcon}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile('idCardDocument')}
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

      {/* Authorized Signature Upload Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">ลายเซ็นผู้มีอำนาจลงนาม</h3>
        <p className="text-sm text-gray-600 mb-6">กรุณาอัพโหลดรูปลายเซ็นของผู้มีอำนาจลงนาม (จำเป็น)</p>
        
        {/* Required document notification */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">เอกสารที่จำเป็น</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>ลายเซ็นผู้มีอำนาจลงนามจำเป็นสำหรับการสมัครสมาชิก</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Signature upload area */}
        <div className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
          errors?.authorizedSignature ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-orange-400'
        }`}>
          {!selectedSignature ? (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <div className="flex flex-col items-center mt-4">
                <p className="text-sm text-gray-500">
                  ลากไฟล์มาวางที่นี่ หรือ
                </p>
                <label htmlFor="authorizedSignature" className="mt-2 cursor-pointer">
                  <span className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors duration-200">
                    เลือกไฟล์
                  </span>
                  <input
                    id="authorizedSignature"
                    name="authorizedSignature"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'authorizedSignature')}
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
                    {selectedSignature.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedSignature.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => viewFile(selectedSignature)}
                  className="p-2 text-orange-600 bg-orange-100 rounded-full hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
                  title="ดูไฟล์"
                >
                  {ViewIcon}
                </button>
                <button
                  type="button"
                  onClick={() => removeFile('authorizedSignature')}
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
        {errors?.authorizedSignature && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            {ErrorIcon}
            <span className="ml-1">{errors.authorizedSignature}</span>
          </p>
        )}

        {/* Success message */}
        {selectedSignature && !errors?.authorizedSignature && (
          <div className="mt-2 flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            ไฟล์ถูกอัพโหลดเรียบร้อยแล้ว
          </div>
        )}
        
        {/* Image size recommendations and sample file link */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">คำแนะนำการอัปโหลดลายเซ็น:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 mb-3">
                <li>ขนาดภาพที่แนะนำ: ไม่เกิน 2MB</li>
                <li>ความละเอียดที่เหมาะสม: 400x200 - 800x400 พิกเซล</li>
                <li>พื้นหลังควรเป็นสีขาวหรือโปร่งใส</li>
                <li>ลายเซ็นควรชัดเจน ไม่เบลอ</li>
                <li>รองรับไฟล์ PDF, JPG, JPEG, PNG</li>
              </ul>
              <a 
                href="/images/FTI-SIGNATUREsample.jpg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                ดูตัวอย่างลายเซ็น
              </a>
            </div>
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