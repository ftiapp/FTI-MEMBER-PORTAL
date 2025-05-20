'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaFileUpload, FaFilePdf, FaFileAlt, FaTrash, FaSpinner } from 'react-icons/fa';

/**
 * Document upload component for address update forms
 * 
 * @param {Object} props Component properties
 * @param {string} props.addrCode The address code (001, 002, 003)
 * @param {Function} props.onFileChange Function to call when file is selected or removed
 * @param {Object} props.itemVariants Animation variants
 */
export default function DocumentUpload({ addrCode, onFileChange, itemVariants }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Get document type requirements based on address code
  const getDocumentTypeInfo = (code) => {
    switch (code) {
      case '001':
        return {
          required: true,
          label: 'หนังสือรับรองนิติบุคคลจากกระทรวงพาณิชย์',
          acceptTypes: '.pdf'
        };
      case '003':
        return {
          required: true,
          label: 'ใบทะเบียนภาษีมูลค่าเพิ่ม (แบบ ภ.พ.20)',
          acceptTypes: '.pdf'
        };
      default:
        return {
          required: false,
          label: '',
          acceptTypes: ''
        };
    }
  };

  // Get document info for current address type
  const documentInfo = getDocumentTypeInfo(addrCode);
  
  // If document not required for this address type, don't render anything
  if (!documentInfo.required) {
    return null;
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      if (fileExt !== 'pdf') {
        setUploadError('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
        setFile(null);
        onFileChange(null);
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError('ขนาดไฟล์ต้องไม่เกิน 5MB');
        setFile(null);
        onFileChange(null);
        return;
      }
      
      setFile(selectedFile);
      setUploadError('');
      onFileChange(selectedFile);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setUploadError('');
    onFileChange(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div 
      className="col-span-2 mt-4 border-t pt-4"
      variants={itemVariants}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        เอกสารแนบ
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <p className="text-sm text-gray-700 mb-2">
          <span className="text-red-500">*</span> {documentInfo.label}
        </p>
        
        {!file ? (
          <div className="mt-2">
            <label 
              htmlFor="document-upload" 
              className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none"
            >
              <span className="flex flex-col items-center space-y-2">
                <FaFileUpload className="w-6 h-6 text-gray-500" />
                <span className="font-medium text-gray-600">
                  คลิกเพื่ออัปโหลดไฟล์ PDF
                </span>
                <span className="text-xs text-gray-500">
                  (ขนาดไฟล์สูงสุด: 5MB)
                </span>
              </span>
              <input
                id="document-upload"
                name="document-upload"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
            <div className="flex items-center space-x-2">
              <FaFilePdf className="text-red-500 text-xl" />
              <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                {file.name}
              </span>
              <span className="text-xs text-gray-500">
                ({Math.round(file.size / 1024)} KB)
              </span>
            </div>
            
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
              disabled={isUploading}
            >
              {isUploading ? (
                <FaSpinner className="animate-spin text-blue-500" />
              ) : (
                <FaTrash className="text-red-500" />
              )}
            </button>
          </div>
        )}
        
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">
            {uploadError}
          </p>
        )}
      </div>
    </motion.div>
  );
}
