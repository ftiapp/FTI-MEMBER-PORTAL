'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import OptimizedFileUploader from '../../../../components/OptimizedFileUploader';
import { toast } from 'react-hot-toast';

/**
 * ตัวอย่างการใช้งาน OptimizedFileUploader ในหน้า Wasmember
 * สามารถใช้เป็นตัวอย่างในการอัปเดต MemberInfoForm หรือ EditMemberForm
 */
export default function OptimizedUploadExample({ userId }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadComplete = (result) => {
    setIsLoading(false);
    
    if (result.success) {
      // เพิ่มไฟล์ที่อัปโหลดสำเร็จเข้าไปในรายการ
      const newFiles = result.uploadResults
        .filter(file => file.success)
        .map(file => ({
          url: file.url,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          public_id: file.public_id
        }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // แสดงข้อความสำเร็จ
      toast.success(`อัปโหลดสำเร็จ ${newFiles.length} ไฟล์`);
    } else {
      // แสดงข้อความผิดพลาด
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
    }
  };

  const handleDeleteFile = (index) => {
    // สร้าง array ใหม่โดยลบไฟล์ที่ index ที่กำหนด
    const updatedFiles = [...uploadedFiles];
    updatedFiles.splice(index, 1);
    setUploadedFiles(updatedFiles);
    
    toast.success('ลบไฟล์เรียบร้อยแล้ว');
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4 text-blue-800">ตัวอย่างการอัปโหลดไฟล์แบบประสิทธิภาพสูง</h2>
      
      {/* คำอธิบาย */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-blue-700">
          ระบบนี้ช่วยเพิ่มประสิทธิภาพการอัปโหลดไฟล์ PDF โดย:
        </p>
        <ul className="list-disc list-inside mt-2 text-blue-600 text-sm">
          <li>บีบอัดไฟล์ PDF และรูปภาพก่อนอัปโหลด (ลดขนาดได้ 30-70%)</li>
          <li>อัปโหลดตรงจากเบราว์เซอร์ไป Cloudinary (ไม่ผ่านเซิร์ฟเวอร์)</li>
          <li>จำกัดการอัปโหลดพร้อมกันเพื่อความเสถียร</li>
          <li>แสดงความคืบหน้าแบบ real-time</li>
        </ul>
      </div>
      
      {/* คอมโพเนนต์อัปโหลด */}
      <OptimizedFileUploader
        userId={userId}
        documentType="member_verification"
        folder="member_verification"
        maxConcurrent={2}
        acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
        maxFileSize={5}
        onUploadComplete={handleUploadComplete}
      />
      
      {/* แสดงรายการไฟล์ที่อัปโหลดแล้ว */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">ไฟล์ที่อัปโหลดแล้ว</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="divide-y divide-gray-200">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-md mr-3">
                      {file.fileType?.includes('pdf') ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{file.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : 'ไม่ทราบขนาด'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                    <button 
                      onClick={() => handleDeleteFile(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* คำแนะนำการใช้งาน */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">วิธีใช้งานในโปรเจค</h3>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
          <li>นำคอมโพเนนต์ OptimizedFileUploader มาใช้แทน SingleFileUploadZone ในฟอร์มต่างๆ</li>
          <li>ตั้งค่า Cloudinary Upload Preset แบบ unsigned ที่ Cloudinary Dashboard</li>
          <li>ปรับค่า cloud_name และ upload_preset ในไฟล์ app/utils/optimizedUpload.js</li>
          <li>ใช้ onUploadComplete callback เพื่อรับผลลัพธ์การอัปโหลด</li>
        </ol>
      </div>
    </motion.div>
  );
}
