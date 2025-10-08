import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

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

    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    ctx.save();
    ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]">
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

const DocumentsSection = ({ application, onViewDocument, type }) => {
  const docs = Array.isArray(application?.documents) ? application.documents : [];

  const [previewFile, setPreviewFile] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const isPDF = (p = "") => (p || "").toLowerCase().endsWith(".pdf");
  const isImage = (p = "") => {
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
    return imageExts.some((ext) => (p || "").toLowerCase().endsWith(ext));
  };

  const canPreview = (p = "") => isPDF(p) || isImage(p);

  // Handle preview
  const handlePreview = (filePath, fileName) => {
    if (canPreview(filePath || fileName)) {
      setPreviewFile({
        path: filePath,
        name: fileName,
        type: isImage(filePath || fileName) ? "image" : "pdf",
      });
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Close preview
  const closePreview = () => {
    setPreviewFile(null);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle zoom
  const handleZoom = (delta, clientX, clientY) => {
    const newZoom = Math.max(0.5, Math.min(5, zoomLevel + delta));

    if (imageRef.current && clientX !== undefined && clientY !== undefined) {
      const rect = imageRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const offsetX = ((clientX - centerX) * (newZoom - zoomLevel)) / zoomLevel;
      const offsetY = ((clientY - centerY) * (newZoom - zoomLevel)) / zoomLevel;

      setPosition((prev) => ({
        x: prev.x - offsetX,
        y: prev.y - offsetY,
      }));
    }

    setZoomLevel(newZoom);
  };

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    handleZoom(delta, e.clientX, e.clientY);
  };

  // Handle drag
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Upload handling
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [replaceTargetId, setReplaceTargetId] = useState(null);
  const [replaceTargetType, setReplaceTargetType] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, type }

  const handleSelectFile = (docId = null, docType = null) => {
    setReplaceTargetId(docId);
    setReplaceTargetType(docType);
    fileInputRef.current?.click();
  };

  // Document type options per membership type
  const getDocumentTypeOptions = () => {
    const typeUpper = String(type).toUpperCase();
    
    const documentTypes = {
      OC: [
        { value: "factoryLicense", label: "ใบอนุญาตประกอบกิจการโรงงาน (รง.4)" },
        { value: "industrialEstateLicense", label: "ใบอนุญาตนิคมอุตสาหกรรม (กนอ.)" },
        { value: "productionImages", label: "รูปภาพการผลิต/เอกสารการผลิต" },
        { value: "companyStamp", label: "รูปตราประทับบริษัท" },
        { value: "authorizedSignature", label: "รูปลายเซ็นผู้มีอำนาจลงนาม" },
        { value: "other", label: "เอกสารอื่นๆ" },
      ],
      AC: [
        { value: "companyRegistration", label: "หนังสือรับรองการจดทะเบียนนิติบุคคล" },
        { value: "productionImages", label: "รูปภาพการผลิต/เอกสารการผลิต" },
        { value: "companyStamp", label: "รูปตราประทับบริษัท" },
        { value: "authorizedSignature", label: "รูปลายเซ็นผู้มีอำนาจลงนาม" },
        { value: "other", label: "เอกสารอื่นๆ" },
      ],
      AM: [
        { value: "associationRegistration", label: "หนังสือรับรองการจดทะเบียนสมาคม" },
        { value: "memberList", label: "รายชื่อสมาชิก" },
        { value: "productionImage", label: "รูปภาพกิจกรรม/เอกสารประกอบ" },
        { value: "companyStamp", label: "รูปตราประทับสมาคม" },
        { value: "authorizedSignature", label: "รูปลายเซ็นผู้มีอำนาจลงนาม" },
        { value: "other", label: "เอกสารอื่นๆ" },
      ],
      IC: [
        { value: "idCardDocument", label: "สำเนาบัตรประชาชน" },
        { value: "companyRegistrationDocument", label: "หนังสือรับรองการจดทะเบียนบริษัท" },
        { value: "taxRegistrationDocument", label: "ทะเบียนภาษี" },
        { value: "authorizedSignature", label: "รูปลายเซ็นผู้มีอำนาจลงนาม" },
        { value: "other", label: "เอกสารอื่นๆ" },
      ],
    };

    return documentTypes[typeUpper] || documentTypes.OC;
  };

  // Map a raw document type to its display label
  const getDocumentTypeLabel = (docType) => {
    const opts = getDocumentTypeOptions();
    const found = opts.find((o) => o.value === docType);
    // Fallback to capitalized type or 'ไม่ระบุ'
    if (!found) {
      if (!docType) return "ไม่ระบุ";
      return docType
        .replace(/([A-Z])/g, " $1")
        .replace(/^\w/, (c) => c.toUpperCase());
    }
    return found.label;
  };

  const handleNewUpload = () => {
    setShowUploadModal(true);
    setSelectedDocType("");
  };

  const handleUploadModalConfirm = () => {
    if (!selectedDocType) {
      toast.error("กรุณาเลือกประเภทเอกสาร");
      return;
    }
    setShowUploadModal(false);
    setReplaceTargetType(selectedDocType);
    fileInputRef.current?.click();
  };

  const isImageDocument = (docType) => {
    return docType === "companyStamp" || docType === "authorizedSignature";
  };

  const getImageEditorTitle = (docType) => {
    if (docType === "companyStamp") return "ปรับแต่งตราประทับบริษัท";
    if (docType === "authorizedSignature") return "ปรับแต่งลายเซ็นผู้มีอำนาจลงนาม";
    return "ปรับแต่งรูปภาพ";
  };

  const handleImageSave = async (blob) => {
    const file = new File([blob], `${replaceTargetType}.png`, { type: "image/png" });
    setShowImageEditor(false);
    setEditingImage(null);
    await performUpload(file);
  };

  const performUpload = async (file) => {
    if (!type || !application?.id) {
      toast.error("ไม่พบข้อมูลใบสมัครหรือตัวประเภท");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("membershipType", String(type).toUpperCase());
      formData.append("applicationId", String(application.id));
      formData.append("documentType", replaceTargetType || "other");
      if (replaceTargetId) formData.append("replaceDocumentId", String(replaceTargetId));

      const res = await fetch("/api/admin/membership-requests/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "อัปโหลดล้มเหลว");
      toast.success(data.message || "อัปโหลดสำเร็จ");
      window.location.reload();
    } catch (e) {
      console.error("Upload failed", e);
      toast.error(e.message || "ไม่สามารถอัปโหลดไฟล์ได้");
    } finally {
      setIsUploading(false);
      setReplaceTargetId(null);
      setReplaceTargetType(null);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if this is an image document type that needs editing
    if (replaceTargetType && isImageDocument(replaceTargetType)) {
      // Check if file is an image
      if (!file.type || !file.type.startsWith("image/")) {
        toast.error("ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ภาพเท่านั้น (JPG, JPEG หรือ PNG)");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      // Open image editor
      setPendingFile(file);
      setEditingImage(file);
      setShowImageEditor(true);
    } else {
      // Direct upload for non-image documents
      await performUpload(file);
    }
  };

  const requestDelete = (doc) => {
    setDeleteTarget({ id: doc.id, name: doc.name, type: doc.type });
    setShowDeleteModal(true);
  };

  const performDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      const params = new URLSearchParams({
        documentId: String(deleteTarget.id),
        membershipType: String(type).toUpperCase(),
        applicationId: String(application.id),
      });
      const res = await fetch(`/api/admin/membership-requests/documents/delete?${params}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "ลบล้มเหลว");
      toast.success("ลบเอกสารสำเร็จ");
      window.location.reload();
    } catch (e) {
      console.error("Delete failed", e);
      toast.error(e.message || "ไม่สามารถลบเอกสารได้");
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Reset zoom and position
  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom in/out buttons
  const zoomIn = () => handleZoom(0.3);
  const zoomOut = () => handleZoom(-0.3);

  // Add event listeners for mouse events
  useEffect(() => {
    if (previewFile) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart, zoomLevel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (previewFile) {
        switch (e.key) {
          case "Escape":
            closePreview();
            break;
          case "+":
          case "=":
            e.preventDefault();
            zoomIn();
            break;
          case "-":
            e.preventDefault();
            zoomOut();
            break;
          case "0":
            e.preventDefault();
            resetZoom();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewFile, zoomLevel]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8 print:hidden">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4 flex items-center justify-between">
        เอกสารแนบ
        <button
          onClick={handleNewUpload}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          title="อัปโหลดเอกสารใหม่"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          อัปโหลดเอกสารใหม่
        </button>
        {/* Keep hidden input for per-type/replace uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
        />
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.length === 0 ? (
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center border border-dashed border-blue-300 rounded-xl p-8 bg-blue-50/50 text-center">
              <svg className="w-12 h-12 text-blue-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-blue-900 font-medium">ยังไม่มีเอกสารแนบ</p>
              <p className="text-sm text-blue-700 mt-1">กดปุ่ม "อัปโหลดเอกสารใหม่" เพื่อเพิ่มเอกสาร</p>
            </div>
          </div>
        ) : (
          docs.map((doc, index) => (
          <div
            key={index}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col gap-3"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 truncate" title={doc.name}>{doc.name}</p>
                {/* Document type badge */}
                {doc.type && (
                  <span
                    title={doc.type}
                    className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {getDocumentTypeLabel(doc.type)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate" title={doc.filePath || "-"}>
                {doc.filePath || "-"}
              </p>
            </div>
            {doc.filePath && (
              <div className="flex flex-wrap gap-2 w-full justify-start border-t border-blue-200 pt-3">
                {canPreview(doc.filePath || doc.name) && (
                  <button
                    onClick={() => handlePreview(doc.filePath, doc.name)}
                    className="flex items-center gap-2 sm:px-3 sm:py-2 px-2 py-1 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    title={
                      isImage(doc.filePath || doc.name) ? "ดูตัวอย่างรูปภาพ" : "ดูตัวอย่าง PDF"
                    }
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    ดู
                  </button>
                )}
                <a
                  href={doc.filePath}
                  download
                  className="flex items-center gap-2 sm:px-3 sm:py-2 px-2 py-1 bg-white border border-blue-300 text-blue-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                  title="ดาวน์โหลดไฟล์"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 10l5 5m0 0l5-5m-5 5V4"
                    />
                  </svg>
                  ดาวน์โหลด
                </a>
                {/* Replace */}
                <button
                  onClick={() => handleSelectFile(doc.id, doc.type)}
                  className="flex items-center gap-2 sm:px-3 sm:py-2 px-2 py-1 bg-amber-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                  title="แทนที่ไฟล์นี้"
                  disabled={isUploading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  แทนที่
                </button>
                {/* Delete */}
                <button
                  onClick={() => requestDelete(doc)}
                  className="flex items-center gap-2 sm:px-3 sm:py-2 px-2 py-1 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  title="ลบไฟล์นี้"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  ลบ
                </button>
              </div>
            )}
          </div>
        ))
        )}
      </div>

      {/* Full-screen Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-screen-lg max-h-screen w-full h-full flex items-center justify-center">
            {/* Top Control Bar - Only show zoom controls for images */}
            {previewFile.type === "image" && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 rounded-lg px-4 py-2 z-10 flex items-center space-x-4">
                <div className="text-white text-sm">ซูม: {Math.round(zoomLevel * 100)}%</div>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={zoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="text-white hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    title="ซูมออก (-)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={resetZoom}
                    className="text-white hover:text-gray-300 text-xs px-2 py-1 bg-gray-600 rounded"
                    title="รีเซ็ต (0)"
                  >
                    รีเซ็ต
                  </button>

                  <button
                    onClick={zoomIn}
                    disabled={zoomLevel >= 5}
                    className="text-white hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    title="ซูมเข้า (+)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-70 rounded-full p-2 z-10"
              title="ปิด (Esc)"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content Container */}
            <div
              className="flex flex-col items-center justify-center w-full h-full overflow-hidden"
              onWheel={previewFile.type === "image" ? handleWheel : undefined}
              onMouseDown={previewFile.type === "image" ? handleMouseDown : undefined}
              style={{
                cursor:
                  previewFile.type === "image" && zoomLevel > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
              }}
            >
              {previewFile.type === "image" ? (
                <img
                  ref={imageRef}
                  src={previewFile.path}
                  alt={previewFile.name}
                  className="max-w-none transition-transform duration-200 ease-out select-none"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                    transformOrigin: "center center",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                  onDoubleClick={() => (zoomLevel === 1 ? handleZoom(1) : resetZoom())}
                  draggable={false}
                />
              ) : (
                <iframe
                  src={previewFile.path}
                  className="w-full h-full border-0 rounded-lg"
                  title={previewFile.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
              )}

              {/* Error fallback */}
              <div className="hidden text-white text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-lg">ไม่สามารถโหลดไฟล์ได้</p>
                <p className="text-sm text-gray-400 mt-2">{previewFile.name}</p>
              </div>
            </div>

            {/* File name and instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md text-center">
              <p className="text-sm font-medium flex items-center justify-center">
                {previewFile.type === "pdf" && (
                  <svg
                    className="w-4 h-4 text-red-400 mr-2"
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
                )}
                {previewFile.name}
              </p>
              {previewFile.type === "image" ? (
                <p className="text-xs text-gray-300 mt-1">
                  Mouse Wheel: ซูม | Double Click: ซูม/รีเซ็ต | Drag: เลื่อนภาพ | Esc: ปิด
                </p>
              ) : (
                <p className="text-xs text-gray-300 mt-1">
                  Esc: ปิด | หากไม่แสดงผล ให้ใช้ปุ่มดาวน์โหลดแทน
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      <ImageEditor
        isOpen={showImageEditor}
        onClose={() => {
          setShowImageEditor(false);
          setEditingImage(null);
          setPendingFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onSave={handleImageSave}
        initialImage={editingImage}
        title={getImageEditorTitle(replaceTargetType)}
      />

      {/* Upload Type Selection Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">เลือกประเภทเอกสาร</h3>
            <p className="text-sm text-gray-600 mb-4">
              กรุณาเลือกประเภทเอกสารที่ต้องการอัปโหลด
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทเอกสาร *
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- เลือกประเภทเอกสาร --</option>
                {getDocumentTypeOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedDocType("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUploadModalConfirm}
                disabled={!selectedDocType}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ดำเนินการต่อ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[75] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบเอกสาร</h3>
            <p className="text-sm text-gray-600 mb-4">คุณต้องการลบเอกสารนี้หรือไม่?</p>
            {deleteTarget && (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="text-sm text-gray-800 font-medium truncate" title={deleteTarget.name}>
                  {deleteTarget.name}
                </div>
                <div className="mt-1 text-xs text-gray-600 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {getDocumentTypeLabel(deleteTarget.type)}
                  </span>
                  <span className="text-gray-400">ID: {deleteTarget.id}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={performDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
