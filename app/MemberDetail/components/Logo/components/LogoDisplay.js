'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaDownload, FaSpinner } from 'react-icons/fa';

export default function LogoDisplay({ logoData, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!logoData) return null;

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    setShowConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = logoData.logo_url;
    link.download = `company-logo-${logoData.member_code}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Logo image */}
        <motion.div 
          className={`
            w-48 h-48 
            ${logoData.display_mode === 'circle' ? 'rounded-full' : 'rounded-lg'} 
            border border-gray-200
            overflow-hidden
            shadow-md
          `}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src={logoData.logo_url} 
            alt="Company Logo" 
            className="w-full h-full object-cover" 
          />
        </motion.div>
        
        {/* Logo information */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">โลโก้บริษัท</h3>
            <p className="text-sm text-gray-500">
              รูปแบบการแสดงผล: {logoData.display_mode === 'circle' ? 'วงกลม' : 'สี่เหลี่ยม'}
            </p>
            <p className="text-sm text-gray-500">
              อัปโหลดเมื่อ: {new Date(logoData.created_at).toLocaleString('th-TH')}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <FaDownload className="mr-1" /> ดาวน์โหลด
            </button>
            
            <button
              onClick={handleDeleteClick}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center text-sm"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <FaSpinner className="animate-spin mr-1" />
              ) : (
                <FaTrash className="mr-1" />
              )}
              ลบโลโก้
            </button>
          </div>
        </div>
      </div>
      
      {/* Confirmation dialog */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-2">ยืนยันการลบโลโก้</h3>
            <p className="mb-4">คุณต้องการลบโลโก้บริษัทนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้</p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                disabled={isDeleting}
              >
                ยกเลิก
              </button>
              
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" /> กำลังลบ...
                  </span>
                ) : (
                  'ยืนยันการลบ'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
