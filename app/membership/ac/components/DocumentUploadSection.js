"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import MultipleSignatoriesSection from "../../oc/components/MultipleSignatories";

export default function DocumentUploadSection({ formData, setFormData, errors, showErrors }) {
  // ใช้ข้อมูลจาก formData เป็นค่าเริ่มต้น
  const [selectedFiles, setSelectedFiles] = useState({
    companyCertificate: formData.companyCertificate || null,
    companyStamp: formData.companyStamp || null,
  });

  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editingType, setEditingType] = useState("");

  // Sync selectedFiles with formData
  useEffect(() => {
    setSelectedFiles({
      companyCertificate: formData.companyCertificate || null,
      companyStamp: formData.companyStamp || null,
    });
  }, [formData]);

  // Handle multiple signatories data
  const handleSignatoriesChange = (signatories) => {
    setFormData((prev) => ({
      ...prev,
      authorizedSignatories: signatories
    }));
  };

  // Image Editor Modal Component
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
          setScale(1);
          setPosition({ x: 0, y: 0 });
        };
        if (typeof initialImage === "string") {
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

      const ctx = canvas.getContext("2d");
      canvas.width = 400;
      canvas.height = 200;

      // Clear canvas
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = "#e9ecef";
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
      ctx.strokeStyle = "#dee2e6";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    };

    const handleMouseDown = (e) => {
      setIsDragging(true);
      const rect = canvasRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left - position.x,
        y: e.clientY - rect.top - position.y,
      });
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left - dragStart.x,
        y: e.clientY - rect.top - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleSave = () => {
      const canvas = canvasRef.current;
      canvas.toBlob((blob) => {
        onSave(blob);
      }, "image/png");
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
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="text-xs text-gray-700 mb-4 bg-blue-50 p-3 rounded leading-5">
            <div className="font-semibold mb-1">คำแนะนำการใช้งาน</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>กรุณาคลิกค้างและลากภาพเพื่อปรับเปลี่ยนตำแหน่ง</li>
              <li>กรุณาใช้แถบเลื่อนเพื่อปรับขนาดภาพให้เหมาะสม (10-300%)</li>
              <li>
                ขนาดที่แนะนำ:
                <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
                  <li>โลโก้/ตราประทับบริษัท: 300 × 300 พิกเซล</li>
                  <li>ลายเซ็นผู้มีอำนาจลงนาม: 120 × 60 พิกเซล</li>
                </ul>
              </li>
              <li>ท่านควรใช้ไฟล์ PNG พื้นหลังโปร่งใสเพื่อผลลัพธ์ที่เหมาะสม</li>
            </ul>
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

  const handleImageEdit = (type, image) => {
    setEditingType(type);
    setEditingImage(image);
    setShowImageEditor(true);
  };

  const handleImageSave = (editedImage) => {
    const file = new File([editedImage], `${editingType}.png`, { type: "image/png" });
    
    if (editingType === "companyStamp") {
      setFormData((prev) => ({ ...prev, companyStamp: file }));
    }
    
    setShowImageEditor(false);
    setEditingImage(null);
    setEditingType("");
  };

  const getImageEditorTitle = (type) => {
    switch (type) {
      case "companyStamp":
        return "ปรับแต่งตราประทับบริษัท";
      default:
        return "ปรับแต่งรูปภาพ";
    }
  };

  // File upload handler
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // File size validation (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("ไฟล์มีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB");
        return;
      }

      // File type validation
      const allowedTypes = {
        companyCertificate: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
        companyStamp: ["image/jpeg", "image/jpg", "image/png"],
      };

      if (allowedTypes[field] && !allowedTypes[field].includes(file.type)) {
        const typeLabels = {
          companyCertificate: "PDF หรือไฟล์ภาพ (JPG, JPEG, PNG)",
          companyStamp: "ไฟล์ภาพเท่านั้น (JPG, JPEG, PNG)",
        };
        alert(`ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือก${typeLabels[field]}`);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  const removeFile = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: null,
    }));
    // Reset file input
    const input = document.getElementById(field);
    if (input) {
      input.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative z-10">
        {/* Header Section */}
        <div className="bg-blue-600 px-8 py-6">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            เอกสารแนบ / Attached Documents
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            อัปโหลดเอกสารประกอบการสมัครสมาชิก
          </p>
        </div>

        <div className="px-8 py-8">
          {/* Company Documents Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">เอกสารบริษัท</h3>
              <p className="text-sm text-gray-600">
                อัปโหลดเอกสารที่เกี่ยวข้องกับบริษัทของท่าน
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Certificate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หนังสือรับรองการจดทะเบียนนิติบุคคล *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {selectedFiles.companyCertificate ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {selectedFiles.companyCertificate.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(selectedFiles.companyCertificate.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile("companyCertificate")}
                        className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex flex-col items-center mt-4">
                        <p className="text-sm text-gray-500">ลากไฟล์มาวางที่นี่ หรือ</p>
                        <label htmlFor="companyCertificate" className="mt-2 cursor-pointer">
                          <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                            เลือกไฟล์
                          </span>
                          <input
                            id="companyCertificate"
                            name="companyCertificate"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, "companyCertificate")}
                            className="hidden"
                          />
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          รองรับไฟล์ PDF, JPG, JPEG, PNG ขนาดไม่เกิน 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {errors?.companyCertificate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.companyCertificate}
                  </p>
                )}
              </div>

              {/* Company Stamp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ตราประทับบริษัท *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {selectedFiles.companyStamp ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {selectedFiles.companyStamp.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(selectedFiles.companyStamp.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleImageEdit("companyStamp", selectedFiles.companyStamp)}
                          className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-100 transition-colors"
                          title="ปรับแต่งรูปภาพ"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile("companyStamp")}
                          className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex flex-col items-center mt-4">
                        <p className="text-sm text-gray-500">ลากไฟล์มาวางที่นี่ หรือ</p>
                        <label htmlFor="companyStamp" className="mt-2 cursor-pointer">
                          <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                            เลือกไฟล์
                          </span>
                          <input
                            id="companyStamp"
                            name="companyStamp"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, "companyStamp")}
                            className="hidden"
                          />
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          รองรับไฟล์ JPG, JPEG, PNG ขนาดไม่เกิน 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {errors?.companyStamp && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.companyStamp}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Multiple Authorized Signatories Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="mx-auto h-10 w-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ข้อมูลผู้มีอำนาจลงนาม</h3>
              <p className="text-sm text-gray-600">
                กรุณากรอกข้อมูลผู้มีอำนาจลงนาม (สูงสุด 4 ท่าน)
              </p>
            </div>

            <MultipleSignatoriesSection
              signatories={formData.authorizedSignatories || []}
              onChange={handleSignatoriesChange}
              errors={errors}
              showErrors={showErrors}
              maxSignatories={4}
            />
          </div>
        </div>
      </div>

      {/* Image Editor Modal */}
      <ImageEditor
        isOpen={showImageEditor}
        onClose={() => {
          setShowImageEditor(false);
          setEditingImage(null);
          setEditingType("");
        }}
        onSave={handleImageSave}
        initialImage={editingImage}
        title={getImageEditorTitle(editingType)}
      />
    </>
  );
}
