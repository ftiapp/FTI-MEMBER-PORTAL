'use client';

import { useState, useRef, useEffect } from 'react';
import { FaUpload, FaImage, FaCircle, FaSquare, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function LogoUploader({ memberCode, existingLogo = null, onUpdate, onCancel }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(existingLogo?.logo_url || null);
  const [displayMode, setDisplayMode] = useState(existingLogo?.display_mode || 'circle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPEG, PNG, GIF, WebP)');
      return;
    }
    
    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`ขนาดไฟล์ต้องไม่เกิน ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file && !existingLogo) {
      setError('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // If there's an existing logo and no new file, just update the display mode
      if (existingLogo && !file) {
        const response = await fetch('/api/member/logo/update-display', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            id: existingLogo.id,
            displayMode: displayMode
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setSuccess(true);
          onUpdate({
            ...existingLogo,
            display_mode: displayMode
          });
        } else {
          setError(data.error || 'เกิดข้อผิดพลาดในการอัปเดตรูปแบบการแสดงผล');
        }
        
        setIsSubmitting(false);
        return;
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('memberCode', memberCode);
      formData.append('displayMode', displayMode);
      
      // If updating existing logo, include the ID
      if (existingLogo) {
        formData.append('existingId', existingLogo.id);
      }
      
      // Upload the file
      const response = await fetch('/api/member/logo/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        onUpdate(data.data);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการอัปโหลดโลโก้');
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError(err.message || 'ไม่สามารถอัปโหลดโลโก้ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">อัปโหลดโลโก้บริษัท</h3>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">บันทึกข้อมูลเรียบร้อยแล้ว</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo preview */}
        <div className="flex flex-col items-center">
          <div className={`
            w-48 h-48 
            ${displayMode === 'circle' ? 'rounded-full' : 'rounded-lg'} 
            border-2 border-dashed border-gray-300 
            flex items-center justify-center 
            overflow-hidden
            bg-gray-50
            ${preview ? 'border-solid border-blue-300' : ''}
          `}>
            {preview ? (
              <img 
                src={preview} 
                alt="Logo preview" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <FaImage className="text-gray-400 text-5xl" />
            )}
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center"
          >
            <FaUpload className="mr-2" /> 
            {existingLogo ? 'เปลี่ยนโลโก้' : 'เลือกไฟล์'}
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
          />
          
          <p className="text-sm text-gray-500 mt-2">
            รองรับไฟล์ JPEG, PNG, GIF, WebP ขนาดไม่เกิน 5MB
          </p>
        </div>
        
        {/* Display mode selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">รูปแบบการแสดงผล</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="displayMode"
                value="circle"
                checked={displayMode === 'circle'}
                onChange={() => setDisplayMode('circle')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center">
                <FaCircle className="text-blue-600 mr-1" /> วงกลม
              </span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="displayMode"
                value="square"
                checked={displayMode === 'square'}
                onChange={() => setDisplayMode('square')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center">
                <FaSquare className="text-blue-600 mr-1" /> สี่เหลี่ยม
              </span>
            </label>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center"
            disabled={isSubmitting}
          >
            <FaTimes className="mr-1" /> ยกเลิก
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <FaSpinner className="animate-spin mr-2" /> กำลังบันทึก...
              </span>
            ) : (
              <span className="flex items-center">
                <FaSave className="mr-1" /> บันทึก
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
