// components/DocumentUploadSection.js
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

// Image Editor Modal Component for Company Stamp and Signature
const ImageEditor = ({ isOpen, onClose, onSave, initialImage, title }) => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (initialImage && isOpen) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Reset position and scale
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      if (typeof initialImage === 'string') {
        img.src = initialImage;
      } else {
        img.src = URL.createObjectURL(initialImage);
      }
    }
  }, [initialImage, isOpen]);

  useEffect(() => {
    if (image && isOpen) {
      drawCanvas();
    }
  }, [image, scale, position, isOpen]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 200;

    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw image
    ctx.save();
    ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();

    // Draw border
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left - dragStart.x,
      y: e.clientY - rect.top - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      onSave(blob);
    }, 'image/png');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        
        <div className="mb-4">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ขนาด: {Math.round(scale * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="text-xs text-gray-600 mb-4 bg-blue-50 p-3 rounded">
          <p>• ลากเพื่อเลื่อนตำแหน่ง</p>
          <p>• ปรับขนาดด้วย slider</p>
          <p>• ขนาดแนะนำ: 120x60 พิกเซล (สำหรับวางในขวาล่างของ A4)</p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DocumentUploadSection({ formData, setFormData, errors }) {
  // ใช้ข้อมูลจาก formData เป็นค่าเริ่มต้นเพื่อให้แสดงไฟล์ที่เคยอัปโหลดไว้
  const [selectedFiles, setSelectedFiles] = useState({
    associationCertificate: formData.associationCertificate || null,
    memberList: formData.memberList || null,
    companyStamp: formData.companyStamp || null,
    authorizedSignature: formData.authorizedSignature || null
  });

  // Image editor states
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editingType, setEditingType] = useState(''); // 'companyStamp' or 'authorizedSignature'

  // Debug: เพิ่ม useEffect เพื่อ debug
  useEffect(() => {
    console.log('=== DEBUG AM DocumentUploadSection ===');
    console.log('formData.companyStamp:', formData.companyStamp);
    console.log('formData.authorizedSignature:', formData.authorizedSignature);
    console.log('selectedFiles:', selectedFiles);
    console.log('errors:', errors);
  }, [formData.companyStamp, formData.authorizedSignature, selectedFiles, errors]);

  // Sync selectedFiles with formData when component mounts or formData changes
  useEffect(() => {
    setSelectedFiles({
      associationCertificate: formData.associationCertificate || null,
      memberList: formData.memberList || null,
      companyStamp: formData.companyStamp || null,
      authorizedSignature: formData.authorizedSignature || null
    });
  }, [formData]);

  const handleFileChange = (e, documentType) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB');
        return;
      }

      // สำหรับ companyStamp และ authorizedSignature บังคับเป็นไฟล์รูปภาพเท่านั้น
      if ((documentType === 'companyStamp' || documentType === 'authorizedSignature')) {
        if (!file.type || !file.type.startsWith('image/')) {
          alert('ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ภาพเท่านั้น (JPG, JPEG หรือ PNG)');
          return;
        }
        
        // เปิด Image Editor สำหรับไฟล์รูปภาพ
        setEditingImage(file);
        setEditingType(documentType);
        setShowImageEditor(true);
      } else {
        // สำหรับเอกสารอื่นๆ รองรับทั้ง PDF และรูปภาพ
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          alert('กรุณาเลือกไฟล์ประเภท PDF, JPG หรือ PNG เท่านั้น');
          return;
        }
        
        console.log(`📁 Selected file for ${documentType}:`, file.name, file.size, file.type);
        
        setSelectedFiles(prev => ({ ...prev, [documentType]: file }));
        setFormData(prev => ({ ...prev, [documentType]: file }));
      }
    }
  };

  const handleImageSave = (blob) => {
    const file = new File([blob], `${editingType}.png`, { type: 'image/png' });
    setSelectedFiles(prev => ({ ...prev, [editingType]: file }));
    setFormData(prev => ({ ...prev, [editingType]: file }));
    setShowImageEditor(false);
    setEditingImage(null);
    setEditingType('');
  };

  const editImage = (documentType) => {
    const file = selectedFiles[documentType];
    if (file) {
      setEditingImage(file);
      setEditingType(documentType);
      setShowImageEditor(true);
    }
  };

  const viewFile = (file) => {
    if (!file) return;

    let url;
    let isImage = false;

    if (typeof file === 'string') {
      url = file;
      try {
        const extension = new URL(url).pathname.split('.').pop().toLowerCase();
        isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension);
      } catch (e) {
        const extension = url.split('.').pop().toLowerCase();
        isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension);
      }
    } else if (file instanceof File) {
      url = URL.createObjectURL(file);
      isImage = file.type.startsWith('image/');
    }

    if (url) {
      if (isImage) {
        const img = new Image();
        img.src = url;
        const w = window.open('');
        w.document.write(`<body style="margin:0; background:#222;"><img src="${url}" style="width:100%; height:auto; max-width:100vw; max-height:100vh; object-fit:contain; margin:auto; display:block;"></body>`);
      } else {
        window.open(url, '_blank');
      }
    }
  };

  const hasFile = (file) => !!file;

  const getFileName = (file) => {
    if (!file) return '';
    if (file instanceof File) {
      return file.name;
    }
    if (typeof file === 'string') {
      try {
        return decodeURIComponent(file.split('/').pop().split('?')[0]);
      } catch (e) {
        return 'ไฟล์ที่อัปโหลด';
      }
    }
    return file.name || 'ไฟล์ที่อัปโหลด';
  };

  const getFileSize = (file) => {
    if (file instanceof File) {
      const size = file.size;
      if (size === 0) return '0 B';
      const i = Math.floor(Math.log(size) / Math.log(1024));
      return `${parseFloat((size / Math.pow(1024, i)).toFixed(2))} ${['B', 'KB', 'MB', 'GB', 'TB'][i]}`;
    }
    return 'ไฟล์ถูกอัปโหลดแล้ว';
  };

  const getImageEditorTitle = (type) => {
    switch(type) {
      case 'companyStamp':
        return 'ปรับแต่งตราประทับสมาคม';
      case 'authorizedSignature':
        return 'ปรับแต่งลายเซ็นผู้มีอำนาจลงนาม';
      default:
        return 'ปรับแต่งรูปภาพ';
    }
  };

  // Error icon component
  const ErrorIcon = useMemo(() => (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ), []);

  // View icon component
  const ViewIcon = useMemo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ), []);

  // Edit icon component
  const EditIcon = useMemo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

  // Helper function for single file upload with drag & drop UI
  const SingleFileUploadZone = ({ title, description, name, file, icon, iconColor, bgColor, error, isImageRequired = false }) => {
    const handleSingleFileChange = (e) => {
      handleFileChange(e, name);
    };

    const removeSingleFile = () => {
      setSelectedFiles(prev => ({ ...prev, [name]: null }));
      setFormData(prev => ({ ...prev, [name]: null }));
    };

    return (
      <div className="max-w-3xl mx-auto mb-8">
        <div className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-white'
        }`}>
          {/* Document header: icon, title, description */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {description}
            </p>
          </div>

          {!hasFile(file) ? (
            <div className="text-center">
              {UploadIcon}
              <div className="flex flex-col items-center mt-4">
                <p className="text-sm text-gray-500">
                  ลากไฟล์มาวางที่นี่ หรือ
                </p>
                <label htmlFor={name} className="mt-2 cursor-pointer">
                  <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200">
                    เลือกไฟล์
                  </span>
                  <input
                    id={name}
                    name={name}
                    type="file"
                    accept={isImageRequired ? ".jpg,.jpeg,.png" : ".pdf,.jpg,.jpeg,.png"}
                    onChange={handleSingleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  {isImageRequired 
                    ? 'รองรับไฟล์ JPG, JPEG, PNG ขนาดไม่เกิน 5MB' 
                    : 'รองรับไฟล์: PDF, JPG, PNG (ขนาดไม่เกิน 5MB)'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-base">{getFileName(file)}</p>
                  <p className="text-sm text-gray-500">{getFileSize(file)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => viewFile(file)}
                  className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  title="ดูไฟล์"
                >
                  {ViewIcon}
                  ดู
                </button>
                {isImageRequired && file && (file.type?.startsWith('image/') || file instanceof File) && (
                  <button
                    type="button"
                    onClick={() => editImage(name)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                    title="ปรับแต่งรูปภาพ"
                  >
                    {EditIcon}
                    ปรับแต่ง
                  </button>
                )}
                <button
                  type="button"
                  onClick={removeSingleFile}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                  title="ลบไฟล์"
                >
                  {DeleteIcon}
                  ลบ
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-center gap-3">
                {ErrorIcon}
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Success message */}
          {hasFile(file) && !error && (
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ไฟล์ถูกอัพโหลดเรียบร้อยแล้ว
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            เอกสารประกอบการสมัคร
          </h2>
          <p className="text-blue-100 text-base mt-2">
            กรุณาอัพโหลดเอกสารที่จำเป็นสำหรับการสมัครสมาชิกสมาคมการค้า
          </p>
        </div>
        
        {/* Content Section */}
        <div className="px-8 py-8 space-y-8">
          {/* Required Documents Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-base font-semibold text-blue-900 mb-2">ข้อมูลสำคัญ</h3>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>โปรดอัพโหลดเอกสารที่จำเป็น</strong> เอกสารต้องเป็นไฟล์ PDF, JPG หรือ PNG ขนาดไม่เกิน 5MB
                </p>
                <p className="text-sm text-blue-800">
                  รายการเอกสารที่ท่านต้องเตรียม: หนังสือรับรองการจดทะเบียนสมาคมการค้า และรายชื่อสมาชิกสมาคม
                </p>
              </div>
            </div>
          </div>

          {/* Document Upload Section - เอกสารทั่วไป */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-blue-200 rounded-full shadow-sm">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-base font-semibold text-blue-800">
                  เอกสารรับรอง
                </span>
              </div>
            </div>

            {/* Association Certificate Upload */}
            <SingleFileUploadZone
              title="สำเนาหนังสือรับรองการจดทะเบียนเป็นสมาคมการค้า"
              description="เอกสารรับรองการจดทะเบียนสมาคมการค้าที่ออกโดยหน่วยงานราชการ พร้อมลายเซ็นสำเนาถูกต้อง"
              name="associationCertificate"
              file={selectedFiles.associationCertificate}
              icon={
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              iconColor="text-blue-600"
              bgColor="bg-blue-100"
              error={errors?.associationCertificate}
            />

            {/* Member List Upload */}
            <SingleFileUploadZone
              title="รายชื่อสมาชิกสมาคม"
              description="เอกสารแสดงรายชื่อสมาชิกของสมาคมการค้า พร้อมลายเซ็นสำเนาถูกต้อง"
              name="memberList"
              file={selectedFiles.memberList}
              icon={
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              iconColor="text-blue-600"
              bgColor="bg-blue-100"
              error={errors?.memberList}
            />
          </div>

          {/* เพิ่มช่องว่างระหว่างส่วน */}
          <div className="h-12"></div>

          {/* Document Upload Section - ตราประทับและลายเซ็น */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-blue-200 rounded-full shadow-sm">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-base font-semibold text-blue-800">
                  ตราประทับและลายเซ็น
                </span>
              </div>
            </div>

            {/* Required Documents Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-8">
              <div className="flex items-center gap-2">
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  จำเป็น
                </span>
                <span className="text-sm text-red-700 font-medium">
                  เอกสารที่จำเป็นสำหรับการสมัครสมาชิก
                </span>
              </div>
            </div>

            {/* Company Stamp Upload - Required */}
            <div className="space-y-3">
              <SingleFileUploadZone
                title="รูปตราประทับสมาคม *"
                description="รูปถ่ายตราประทับของสมาคม หรือรูปลายเซ็นหากไม่มีตราประทับ (จำเป็น)"
                name="companyStamp"
                file={selectedFiles.companyStamp}
                icon={
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
                error={errors?.companyStamp}
                isImageRequired={true}
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-semibold text-blue-800 mb-3">คำแนะนำสำหรับตราประทับสมาคม:</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded border border-blue-100">
                        <h5 className="font-medium text-blue-800 mb-2">📐 ขนาดที่แนะนำ</h5>
                        <ul className="text-blue-700 space-y-1 text-xs">
                          <li>• <strong>300 x 300 พิกเซล</strong> (สำหรับตราประทับแบบกลม)</li>
                          <li>• หรือ 400 x 200 พิกเซล (สำหรับตราประทับแบบสี่เหลี่ยม)</li>
                          <li>• ความละเอียดสูง: 600x600 พิกเซล</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-blue-100">
                        <h5 className="font-medium text-blue-800 mb-2">🎨 คุณภาพภาพ</h5>
                        <ul className="text-blue-700 space-y-1 text-xs">
                          <li>• <strong>พื้นหลังโปร่งใส</strong> (PNG) หรือสีขาว</li>
                          <li>• ตราประทับสีชัดเจน</li>
                          <li>• ความละเอียดชัดเจน ไม่เบลอ</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-white border border-blue-200 rounded p-3 mb-3">
                      <h5 className="font-medium text-blue-800 mb-2">✨ ฟีเจอร์ปรับแต่ง </h5>
                      <p className="text-blue-700 text-xs">
                        หลังอัปโหลดภาพตราประทับ คุณสามารถใช้เครื่องมือปรับแต่งเพื่อ:
                      </p>
                      <ul className="text-blue-700 space-y-1 text-xs mt-1">
                        <li>• <strong>ซูมเข้า/ออก</strong> เพื่อปรับขนาดให้เหมาะสม</li>
                        <li>• <strong>เลื่อนตำแหน่ง</strong> เพื่อจัดตำแหน่งให้ตรงกลาง</li>
                        <li>• <strong>ครอบตัด</strong> เพื่อให้ได้สัดส่วนที่ต้องการ</li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-blue-600">
                        💡 <strong>เคล็ดลับ:</strong> ถ่ายภาพตราประทับบนกระดาษขาวด้วยแสงที่เพียงพอ
                      </div>
                      <a 
                        href="/images/FTI-LOGOsample.jpg" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        ดูตัวอย่าง
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Authorized Signatory Name Fields */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">ข้อมูลผู้มีอำนาจลงนาม</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thai Name Fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-blue-700 border-b border-blue-200 pb-2">ชื่อ-นามสกุล (ภาษาไทย)</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ (ภาษาไทย) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.authorizedSignatoryFirstNameTh || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        authorizedSignatoryFirstNameTh: e.target.value
                      }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors?.authorizedSignatoryFirstNameTh ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="กรอกชื่อผู้มีอำนาจลงนาม"
                    />
                    {errors?.authorizedSignatoryFirstNameTh && (
                      <p className="mt-1 text-sm text-red-600">{errors.authorizedSignatoryFirstNameTh}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.authorizedSignatoryLastNameTh || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        authorizedSignatoryLastNameTh: e.target.value
                      }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors?.authorizedSignatoryLastNameTh ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="กรอกนามสกุลผู้มีอำนาจลงนาม"
                    />
                    {errors?.authorizedSignatoryLastNameTh && (
                      <p className="mt-1 text-sm text-red-600">{errors.authorizedSignatoryLastNameTh}</p>
                    )}
                  </div>
                </div>

                {/* English Name Fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-blue-700 border-b border-blue-200 pb-2">ชื่อ-นามสกุล (ภาษาอังกฤษ)</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.authorizedSignatoryFirstNameEn || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        authorizedSignatoryFirstNameEn: e.target.value
                      }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors?.authorizedSignatoryFirstNameEn ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name in English"
                    />
                    {errors?.authorizedSignatoryFirstNameEn && (
                      <p className="mt-1 text-sm text-red-600">{errors.authorizedSignatoryFirstNameEn}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      นามสกุล (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.authorizedSignatoryLastNameEn || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        authorizedSignatoryLastNameEn: e.target.value
                      }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors?.authorizedSignatoryLastNameEn ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter last name in English"
                    />
                    {errors?.authorizedSignatoryLastNameEn && (
                      <p className="mt-1 text-sm text-red-600">{errors.authorizedSignatoryLastNameEn}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">หมายเหตุ:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>กรุณากรอกชื่อ-นามสกุลของผู้มีอำนาจลงนามให้ครบถ้วนทั้งภาษาไทยและภาษาอังกฤษ</li>
                      <li>ชื่อที่กรอกต้องตรงกับเอกสารทางการและลายเซ็นที่อัปโหลด</li>
                      <li>ข้อมูลนี้จะใช้สำหรับการตรวจสอบและออกเอกสารรับรองสมาชิกภาพ</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Authorized Signature Upload */}
            <div className="space-y-3">
              <SingleFileUploadZone
                title="รูปลายเซ็นผู้มีอำนาจลงนาม *"
                description="รูปถ่ายลายเซ็นของผู้มีอำนาจลงนามของสมาคม (จำเป็น)"
                name="authorizedSignature"
                file={selectedFiles.authorizedSignature}
                icon={
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                }
                iconColor="text-blue-600"
                bgColor="bg-blue-100"
                error={errors?.authorizedSignature}
                isImageRequired={true}
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-semibold text-blue-800 mb-3">คำแนะนำสำหรับลายเซ็นที่จะแปะในขวาล่างของเอกสาร A4:</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded border border-blue-100">
                        <h5 className="font-medium text-blue-800 mb-2">📐 ขนาดที่แนะนำ</h5>
                        <ul className="text-blue-700 space-y-1 text-xs">
                          <li>• <strong>120 x 60 พิกเซล</strong> (อัตราส่วน 2:1)</li>
                          <li>• หรือ 240 x 120 พิกเซล (ความละเอียดสูง)</li>
                          <li>• ขนาดจริงบนกระดาษ: ประมาณ 3 x 1.5 ซม.</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-blue-100">
                        <h5 className="font-medium text-blue-800 mb-2">🎨 คุณภาพภาพ</h5>
                        <ul className="text-blue-700 space-y-1 text-xs">
                          <li>• <strong>พื้นหลังโปร่งใส</strong> (PNG) หรือสีขาว</li>
                          <li>• ลายเซ็นสีดำหรือสีเข้ม</li>
                          <li>• ความละเอียดชัดเจน ไม่เบลอ</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-white border border-blue-200 rounded p-3 mb-3">
                      <h5 className="font-medium text-blue-800 mb-2">✨ ฟีเจอร์ปรับแต่ง </h5>
                      <p className="text-blue-700 text-xs">
                        หลังอัปโหลดภาพลายเซ็น คุณสามารถใช้เครื่องมือปรับแต่งเพื่อ:
                      </p>
                      <ul className="text-blue-700 space-y-1 text-xs mt-1">
                        <li>• <strong>ซูมเข้า/ออก</strong> เพื่อปรับขนาดให้เหมาะสม</li>
                        <li>• <strong>เลื่อนตำแหน่ง</strong> เพื่อจัดตำแหน่งให้ตรงกลาง</li>
                        <li>• <strong>ครอบตัด</strong> เพื่อให้ได้สัดส่วนที่ต้องการ</li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-blue-600">
                        💡 <strong>เคล็ดลับ:</strong> ถ่ายภาพลายเซ็นบนกระดาษขาวด้วยแสงที่เพียงพอ
                      </div>
                      <a 
                        href="/images/FTI-SIGNATUREsample.jpg" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        ดูตัวอย่าง
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-3 text-lg">หมายเหตุสำคัญ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>เอกสารต้องชัดเจน อ่านได้ทุกตัวอักษร</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>ไฟล์ต้องมีขนาดไม่เกิน 5MB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>รองรับไฟล์นามสกุล PDF, JPG, PNG เท่านั้น</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>สำเนาเอกสารต้องมีลายเซ็นรับรองสำเนาถูกต้อง</span>
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="font-medium">กรุณาแนบเอกสารทั้ง 4 รายการที่จำเป็น</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Editor Modal */}
      <ImageEditor
        isOpen={showImageEditor}
        onClose={() => {
          setShowImageEditor(false);
          setEditingImage(null);
          setEditingType('');
        }}
        onSave={handleImageSave}
        initialImage={editingImage}
        title={getImageEditorTitle(editingType)}
      />
    </>
  );
}