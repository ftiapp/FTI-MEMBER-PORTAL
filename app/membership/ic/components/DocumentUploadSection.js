'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Signature Editor Modal Component
const SignatureEditor = ({ isOpen, onClose, onSave, initialImage, title = 'ปรับแต่งลายเซ็น' }) => {
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

    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    ctx.save();
    ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();

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
            className="border border-gray-300 rounded cursor-move block mx-auto"
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
            min="0.1"
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [showSignatureEditor, setShowSignatureEditor] = useState(false);
  const [editingSignature, setEditingSignature] = useState(null);

  const THAI_TO_ENGLISH_PRENAME = {
    'นาย': 'Mr.',
    'นาง': 'Mrs.',
    'นางสาว': 'Miss',
    'อื่นๆ': 'Other'
  };
  const ENGLISH_TO_THAI_PRENAME = {
    'Mr.': 'นาย',
    'Mrs.': 'นาง',
    'Miss': 'นางสาว',
    'Other': 'อื่นๆ'
  };

  const handleAuthorizedPrenameChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev };

      if (field === 'authorizedSignatoryPrenameTh') {
        next.authorizedSignatoryPrenameTh = value;
        next.authorizedSignatoryPrenameEn = THAI_TO_ENGLISH_PRENAME[value] || '';
        if (value !== 'อื่นๆ') {
          next.authorizedSignatoryPrenameOther = '';
          next.authorizedSignatoryPrenameOtherEn = '';
        }
      } else if (field === 'authorizedSignatoryPrenameEn') {
        next.authorizedSignatoryPrenameEn = value;
        next.authorizedSignatoryPrenameTh = ENGLISH_TO_THAI_PRENAME[value] || '';
        if (value !== 'Other') {
          next.authorizedSignatoryPrenameOtherEn = '';
        }
        if ((ENGLISH_TO_THAI_PRENAME[value] || '') !== 'อื่นๆ') {
          next.authorizedSignatoryPrenameOther = '';
        }
      }

      return next;
    });
  };

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

      const isImage = !!file.type && file.type.startsWith('image/');
      const isPdf = (file.type === 'application/pdf') || file.name?.toLowerCase().endsWith('.pdf');

      if (documentType === 'authorizedSignature') {
        if (!isImage) {
          alert('ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ภาพเท่านั้น (JPG, JPEG หรือ PNG)');
          return;
        }
        setEditingSignature(file);
        setShowSignatureEditor(true);
      } else if (documentType === 'idCardDocument') {
        if (!(isImage || isPdf)) {
          alert('ประเภทไฟล์ไม่ถูกต้อง สำเนาบัตรประชาชนรองรับไฟล์ภาพ (JPG, JPEG, PNG) หรือ PDF');
          return;
        }
        setSelectedFile(file);
        setFormData(prev => ({ ...prev, [documentType]: file }));
      }
    }
  };

  const handleSignatureSave = (blob) => {
    const file = new File([blob], 'signature.png', { type: 'image/png' });
    setSelectedSignature(file);
    setFormData(prev => ({ ...prev, authorizedSignature: file }));
    setShowSignatureEditor(false);
    setEditingSignature(null);
  };

  const editSignature = () => {
    if (selectedSignature) {
      setEditingSignature(selectedSignature);
      setShowSignatureEditor(true);
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

  const ErrorIcon = useMemo(() => (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ), []);

  const FileIcon = useMemo(() => (
    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  ), []);

  const ViewIcon = useMemo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ), []);

  const EditIcon = useMemo(() => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ), []);

  const DeleteIcon = useMemo(() => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ), []);

  const UploadIcon = useMemo(() => (
    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ), []);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10" data-section="documents">
        <div className="bg-blue-600 px-8 py-6">
          <h2 className="text-xl font-semibold text-white tracking-tight">เอกสารแนบ</h2>
          <p className="text-blue-100 text-sm mt-1">อัพโหลดสำเนาบัตรประชาชนและลายเซ็น</p>
        </div>
        
        <div className="px-8 py-8">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10h6M7 14h3" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">สำเนาบัตรประชาชน</h3>
              <p className="text-sm text-gray-600">กรุณาอัพโหลดสำเนาบัตรประชาชนพร้อมลายเซ็นรับรองสำเนาถูกต้อง</p>
            </div>

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
            
            <div id="idCardUpload" data-field="idCardDocument" className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
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
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileChange(e, 'idCardDocument')}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      รองรับไฟล์ JPG, JPEG, PNG หรือ PDF ขนาดไม่เกิน 5MB
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
            
            {errors?.idCardDocument && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                {ErrorIcon}
                <span className="ml-1">{errors.idCardDocument}</span>
              </p>
            )}

            {selectedFile && !errors?.idCardDocument && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ไฟล์ถูกอัพโหลดเรียบร้อยแล้ว
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-md font-semibold text-blue-800 mb-2">คำแนะนำการอัพโหลดไฟล์</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• ไฟล์ต้องชัดเจน อ่านได้ง่าย</li>
                <li>• สำเนาต้องมีลายเซ็นรับรองสำเนาถูกต้อง</li>
                <li>• ขนาดไฟล์ไม่เกิน 5MB</li>
                <li>• รองรับไฟล์ JPG, JPEG, PNG หรือ PDF</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="mx-auto h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ลายเซ็นผู้มีอำนาจลงนาม</h3>
              <p className="text-sm text-gray-600">กรุณาอัพโหลดรูปลายเซ็นของผู้มีอำนาจลงนาม (จำเป็น)</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">เอกสารที่จำเป็น</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>ลายเซ็นผู้มีอำนาจลงนามจำเป็นสำหรับการสมัครสมาชิก (จะถูกนำไปแปะในขวาล่างของเอกสาร A4)</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-2">ข้อมูลผู้มีอำนาจลงนาม</h4>
              <p className="text-sm text-gray-600 mb-4">กรุณากรอกชื่อ-นามสกุลของผู้มีอำนาจลงนามทั้งภาษาไทยและอังกฤษ</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="authorizedSignatoryPrenameTh" className="block text-sm font-medium text-gray-700">คำนำหน้า (ภาษาไทย)</label>
                  <select
                    id="authorizedSignatoryPrenameTh"
                    name="authorizedSignatoryPrenameTh"
                    value={formData.authorizedSignatoryPrenameTh || ''}
                    onChange={(e) => handleAuthorizedPrenameChange('authorizedSignatoryPrenameTh', e.target.value)}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPrenameTh ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                  >
                    <option value="" disabled>เลือกคำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                  {errors?.authorizedSignatoryPrenameTh && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>{errors.authorizedSignatoryPrenameTh}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="authorizedSignatoryPrenameEn" className="block text-sm font-medium text-gray-700">คำนำหน้า (ภาษาอังกฤษ)</label>
                  <select
                    id="authorizedSignatoryPrenameEn"
                    name="authorizedSignatoryPrenameEn"
                    value={formData.authorizedSignatoryPrenameEn || ''}
                    onChange={(e) => handleAuthorizedPrenameChange('authorizedSignatoryPrenameEn', e.target.value)}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPrenameEn ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                  >
                    <option value="" disabled>Select prename</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Miss">Miss</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors?.authorizedSignatoryPrenameEn && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>{errors.authorizedSignatoryPrenameEn}
                    </p>
                  )}
                </div>
                {formData.authorizedSignatoryPrenameTh === 'อื่นๆ' && (
                  <div>
                    <label htmlFor="authorizedSignatoryPrenameOther" className="block text-sm font-medium text-gray-700">ระบุคำนำหน้า (ภาษาไทย)</label>
                    <input
                      id="authorizedSignatoryPrenameOther"
                      name="authorizedSignatoryPrenameOther"
                      type="text"
                      value={formData.authorizedSignatoryPrenameOther || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, authorizedSignatoryPrenameOther: e.target.value }))}
                      className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPrenameOther ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                      placeholder="กรอกคำนำหน้าอื่นๆ"
                    />
                    {errors?.authorizedSignatoryPrenameOther && (
                      <p className="mt-1 text-xs text-red-600 flex items-center">
                        <span className="mr-1">*</span>{errors.authorizedSignatoryPrenameOther}
                      </p>
                    )}
                  </div>
                )}
                {formData.authorizedSignatoryPrenameEn === 'Other' && (
                  <div>
                    <label htmlFor="authorizedSignatoryPrenameOtherEn" className="block text-sm font-medium text-gray-700">Specify prename (English)</label>
                    <input
                      id="authorizedSignatoryPrenameOtherEn"
                      name="authorizedSignatoryPrenameOtherEn"
                      type="text"
                      value={formData.authorizedSignatoryPrenameOtherEn || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, authorizedSignatoryPrenameOtherEn: e.target.value }))}
                      className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPrenameOtherEn ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                      placeholder="Enter other prename"
                    />
                    {errors?.authorizedSignatoryPrenameOtherEn && (
                      <p className="mt-1 text-xs text-red-600 flex items-center">
                        <span className="mr-1">*</span>{errors.authorizedSignatoryPrenameOtherEn}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label htmlFor="authorizedSignatoryFirstNameTh" className="block text-sm font-medium text-gray-700">ชื่อ (ภาษาไทย)</label>
                  <input
                    id="authorizedSignatoryFirstNameTh"
                    name="authorizedSignatoryFirstNameTh"
                    data-field="authorizedSignatoryFirstNameTh"
                    type="text"
                    value={formData.authorizedSignatoryFirstNameTh || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorizedSignatoryFirstNameTh: e.target.value }))}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryFirstNameTh ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                    placeholder="เช่น สมชาย"
                  />
                  {errors?.authorizedSignatoryFirstNameTh && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>{errors.authorizedSignatoryFirstNameTh}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="authorizedSignatoryLastNameTh" className="block text-sm font-medium text-gray-700">นามสกุล (ภาษาไทย)</label>
                  <input
                    id="authorizedSignatoryLastNameTh"
                    name="authorizedSignatoryLastNameTh"
                    data-field="authorizedSignatoryLastNameTh"
                    type="text"
                    value={formData.authorizedSignatoryLastNameTh || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorizedSignatoryLastNameTh: e.target.value }))}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryLastNameTh ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                    placeholder="เช่น ใจดี"
                  />
                  {errors?.authorizedSignatoryLastNameTh && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>{errors.authorizedSignatoryLastNameTh}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="authorizedSignatoryFirstNameEn" className="block text-sm font-medium text-gray-700">ชื่อ (อังกฤษ)</label>
                  <input
                    id="authorizedSignatoryFirstNameEn"
                    name="authorizedSignatoryFirstNameEn"
                    data-field="authorizedSignatoryFirstNameEn"
                    type="text"
                    value={formData.authorizedSignatoryFirstNameEn || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorizedSignatoryFirstNameEn: e.target.value }))}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryFirstNameEn ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                    placeholder="e.g. Somchai"
                  />
                  {errors?.authorizedSignatoryFirstNameEn && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>{errors.authorizedSignatoryFirstNameEn}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="authorizedSignatoryLastNameEn" className="block text-sm font-medium text-gray-700">นามสกุล (อังกฤษ)</label>
                  <input
                    id="authorizedSignatoryLastNameEn"
                    name="authorizedSignatoryLastNameEn"
                    data-field="authorizedSignatoryLastNameEn"
                    type="text"
                    value={formData.authorizedSignatoryLastNameEn || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorizedSignatoryLastNameEn: e.target.value }))}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryLastNameEn ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                    placeholder="e.g. Jaidee"
                  />
                  {errors?.authorizedSignatoryLastNameEn && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>{errors.authorizedSignatoryLastNameEn}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="authorizedSignatoryPositionTh" className="block text-sm font-medium text-gray-700">ตำแหน่ง (ภาษาไทย)</label>
                  <input
                    id="authorizedSignatoryPositionTh"
                    name="authorizedSignatoryPositionTh"
                    type="text"
                    value={formData.authorizedSignatoryPositionTh || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorizedSignatoryPositionTh: e.target.value }))}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPositionTh ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                    placeholder="เช่น กรรมการผู้จัดการ"
                  />
                  {errors?.authorizedSignatoryPositionTh && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>{errors.authorizedSignatoryPositionTh}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="authorizedSignatoryPositionEn" className="block text-sm font-medium text-gray-700">ตำแหน่ง (อังกฤษ)</label>
                  <input
                    id="authorizedSignatoryPositionEn"
                    name="authorizedSignatoryPositionEn"
                    type="text"
                    value={formData.authorizedSignatoryPositionEn || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorizedSignatoryPositionEn: e.target.value }))}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${errors?.authorizedSignatoryPositionEn ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                    placeholder="e.g. Managing Director"
                  />
                  {errors?.authorizedSignatoryPositionEn && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">*</span>{errors.authorizedSignatoryPositionEn}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div id="authorizedSignatureUpload" data-field="authorizedSignature" className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
              errors?.authorizedSignature ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
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
                      <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        เลือกไฟล์
                      </span>
                      <input
                        id="authorizedSignature"
                        name="authorizedSignature"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'authorizedSignature')}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      รองรับไฟล์ JPG, JPEG, PNG ขนาดไม่เกิน 5MB
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
                      className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      title="ดูไฟล์"
                    >
                      {ViewIcon}
                    </button>
                    {selectedSignature.type?.startsWith('image/') && (
                      <button
                        type="button"
                        onClick={editSignature}
                        className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                        title="ปรับแต่งลายเซ็น"
                      >
                        {EditIcon}
                      </button>
                    )}
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
            
            {errors?.authorizedSignature && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                {ErrorIcon}
                <span className="ml-1">{errors.authorizedSignature}</span>
              </p>
            )}

            {selectedSignature && !errors?.authorizedSignature && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ไฟล์ถูกอัพโหลดเรียบร้อยแล้ว
              </div>
            )}
            
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
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
                      <h5 className="font-medium text-blue-800 mb-2">🎨 รูปแบบภาพ</h5>
                      <ul className="text-blue-700 space-y-1 text-xs">
                        <li>• <strong>พื้นหลังโปร่งใส</strong> (PNG) หรือสีขาว</li>
                        <li>• ลายเซ็นสีดำหรือสีเข้ม</li>
                        <li>• ความละเอียดชัดเจน ไม่เบลอ</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
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
      </div>

      <SignatureEditor
        isOpen={showSignatureEditor}
        onClose={() => {
          setShowSignatureEditor(false);
          setEditingSignature(null);
        }}
        onSave={handleSignatureSave}
        initialImage={editingSignature}
        title="ปรับแต่งลายเซ็น"
      />
    </>
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