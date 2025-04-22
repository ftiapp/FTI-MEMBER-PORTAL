'use client';

import { useState, useEffect } from 'react';
import { FaFile, FaUpload, FaTimesCircle } from 'react-icons/fa';

export default function FileUploadField({ 
  label, 
  name, 
  accept = '.pdf,.jpg,.jpeg,.png', 
  value, 
  onChange,
  hasError,
  errorMessage = 'กรุณาอัพโหลดไฟล์เอกสาร',
  helpText = 'รองรับไฟล์ PDF, JPG, JPEG, PNG ขนาดไม่เกิน 5MB'
}) {
  const [fileName, setFileName] = useState('');

  // Sync fileName with value prop from parent (reset filename when parent reset)
  useEffect(() => {
    if (!value) setFileName('');
    // ถ้า value เป็นไฟล์จริงและอยากโชว์ชื่อไฟล์: else if (value && value.name) setFileName(value.name);
  }, [value]);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 5MB');
        e.target.value = null;
        return;
      }
      
      // Check file type
      const fileExt = file.name.split('.').pop().toLowerCase();
      const allowedTypes = accept.split(',').map(type => type.trim().replace('.', ''));
      
      if (!allowedTypes.includes(fileExt)) {
        alert(`ไฟล์ประเภท ${fileExt} ไม่ได้รับการสนับสนุน กรุณาอัพโหลดไฟล์ประเภท ${allowedTypes.join(', ')}`);
        e.target.value = null;
        return;
      }
      
      setFileName(file.name);
      onChange(name, file);
    }
  };
  
  const clearFile = () => {
    setFileName('');
    onChange(name, null);
  };
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      
      {!fileName ? (
        <div className={`border-2 border-dashed rounded-lg p-4 text-center ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'}`}>
          <input
            type="file"
            id={name}
            name={name}
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor={name}
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <FaUpload className="text-gray-400 text-2xl mb-2" />
            <span className="text-sm text-gray-500 mb-1">คลิกเพื่ออัพโหลดเอกสาร</span>
            <span className="text-xs text-gray-400">{helpText}</span>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaFile className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-700 truncate max-w-xs">{fileName}</span>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="text-gray-400 hover:text-red-500"
            >
              <FaTimesCircle />
            </button>
          </div>
        </div>
      )}
      
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}