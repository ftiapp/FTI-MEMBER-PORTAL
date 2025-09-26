'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadFilesWithConcurrencyLimit, saveFileToDatabase } from '../utils/optimizedUpload';

/**
 * คอมโพเนนต์สำหรับอัปโหลดไฟล์ที่มีการบีบอัดและจำกัดการอัปโหลดพร้อมกัน
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {Function} props.onUploadComplete - ฟังก์ชันที่จะเรียกเมื่ออัปโหลดเสร็จสิ้น
 * @param {number} props.userId - ID ของผู้ใช้
 * @param {string} props.documentType - ประเภทของเอกสาร
 * @param {string} props.folder - โฟลเดอร์ปลายทางใน Cloudinary
 * @param {number} props.maxConcurrent - จำนวนไฟล์สูงสุดที่อัปโหลดพร้อมกัน
 * @param {string[]} props.acceptedFileTypes - ประเภทไฟล์ที่ยอมรับ
 * @param {number} props.maxFileSize - ขนาดไฟล์สูงสุดในหน่วย MB
 * @returns {JSX.Element}
 */
export default function OptimizedFileUploader({
  onUploadComplete,
  userId,
  documentType = 'document',
  folder = 'address_documents',
  maxConcurrent = 2,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxFileSize = 5, // MB
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [uploadResults, setUploadResults] = useState([]);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // ฟังก์ชันสำหรับเลือกไฟล์
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // ตรวจสอบประเภทไฟล์
    const invalidFiles = selectedFiles.filter(file => {
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      return !acceptedFileTypes.includes(fileExt);
    });
    
    // ตรวจสอบขนาดไฟล์
    const oversizedFiles = selectedFiles.filter(file => {
      return file.size > maxFileSize * 1024 * 1024;
    });
    
    if (invalidFiles.length > 0) {
      setError(`ไฟล์ต่อไปนี้มีประเภทไม่ถูกต้อง: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    if (oversizedFiles.length > 0) {
      setError(`ไฟล์ต่อไปนี้มีขนาดเกิน ${maxFileSize} MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setFiles(selectedFiles);
    setError(null);
  };
  
  // ฟังก์ชันสำหรับอัปโหลดไฟล์
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('กรุณาเลือกไฟล์ก่อนอัปโหลด');
      return;
    }
    
    setUploading(true);
    setError(null);
    setProgress({ completed: 0, total: files.length, percentage: 0 });
    
    try {
      // อัปโหลดไฟล์พร้อมจำกัดจำนวนการอัปโหลดพร้อมกัน
      const results = await uploadFilesWithConcurrencyLimit(
        files,
        folder,
        maxConcurrent,
        (progressData) => {
          setProgress(progressData);
        }
      );
      
      setUploadResults(results);
      
      // บันทึกข้อมูลไฟล์ลงในฐานข้อมูล
      const savePromises = results
        .filter(result => result.success)
        .map(result => saveFileToDatabase(result, userId, documentType));
      
      const saveResults = await Promise.all(savePromises);
      
      // เรียกฟังก์ชัน callback เมื่ออัปโหลดเสร็จสิ้น
      if (onUploadComplete) {
        onUploadComplete({
          uploadResults: results,
          saveResults,
          success: results.every(r => r.success) && saveResults.every(r => r.success)
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(`เกิดข้อผิดพลาดในการอัปโหลด: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  // ฟังก์ชันสำหรับล้างไฟล์ที่เลือก
  const handleClear = () => {
    setFiles([]);
    setUploadResults([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-blue-600">อัปโหลดไฟล์แบบประสิทธิภาพสูง</h2>
      
      {/* ส่วนเลือกไฟล์ */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          เลือกไฟล์ ({acceptedFileTypes.join(', ')}, สูงสุด {maxFileSize} MB)
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept={acceptedFileTypes.join(',')}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploading}
        />
      </div>
      
      {/* แสดงไฟล์ที่เลือก */}
      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">ไฟล์ที่เลือก ({files.length})</h3>
          <ul className="text-sm text-gray-600 bg-gray-50 rounded-md p-2 max-h-32 overflow-y-auto">
            {files.map((file, index) => (
              <li key={index} className="py-1">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* แสดงข้อผิดพลาด */}
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}
      
      {/* แสดงความคืบหน้า */}
      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>กำลังอัปโหลด... ({progress.completed}/{progress.total})</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          {progress.currentFile && (
            <div className="text-xs text-gray-500 mt-1">
              ไฟล์ปัจจุบัน: {progress.currentFile}
            </div>
          )}
        </div>
      )}
      
      {/* แสดงผลลัพธ์การอัปโหลด */}
      {uploadResults.length > 0 && !uploading && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">ผลลัพธ์การอัปโหลด</h3>
          <div className="text-sm bg-gray-50 rounded-md p-2">
            <div className="text-green-600">
              สำเร็จ: {uploadResults.filter(r => r.success).length} ไฟล์
            </div>
            {uploadResults.filter(r => !r.success).length > 0 && (
              <div className="text-red-600">
                ไม่สำเร็จ: {uploadResults.filter(r => !r.success).length} ไฟล์
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* ปุ่มดำเนินการ */}
      <div className="flex space-x-2">
        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium disabled:bg-blue-300"
        >
          {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
        </button>
        <button
          onClick={handleClear}
          disabled={uploading || (files.length === 0 && uploadResults.length === 0)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium disabled:bg-gray-100 disabled:text-gray-400"
        >
          ล้าง
        </button>
      </div>
      
      {/* คำอธิบายเพิ่มเติม */}
      <div className="mt-4 text-xs text-gray-500">
        <p>* ไฟล์จะถูกบีบอัดก่อนอัปโหลดเพื่อเพิ่มความเร็ว</p>
        <p>* อัปโหลดพร้อมกันสูงสุด {maxConcurrent} ไฟล์</p>
      </div>
    </div>
  );
}
