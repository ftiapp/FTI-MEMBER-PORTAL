"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function MemberDetailsModal({
  member,
  onClose,
  onApprove,
  onOpenReject,
  showActions = true,
}) {
  const [approveComment, setApproveComment] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("other");
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Check if file is an image
  const isImageFile = (fileName) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
    return imageExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
  };

  // Check if file is a PDF
  const isPDFFile = (fileName) => {
    return fileName.toLowerCase().endsWith(".pdf");
  };

  // Check if file can be previewed
  const canPreview = (fileName) => {
    return isImageFile(fileName) || isPDFFile(fileName);
  };

  // Handle image preview
  const handlePreviewImage = (filePath, fileName) => {
    if (canPreview(fileName)) {
      setPreviewImage({
        path: filePath,
        name: fileName,
        type: isImageFile(fileName) ? "image" : "pdf",
      });
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Close image preview
  const closeImagePreview = () => {
    setPreviewImage(null);
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
    if (previewImage) {
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
      if (previewImage) {
        switch (e.key) {
          case "Escape":
            closeImagePreview();
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
  }, [previewImage, zoomLevel]);

  // Handle approve action
  const handleApprove = async () => {
    if (onApprove) {
      setIsApproving(true);
      try {
        await onApprove(member, approveComment);
      } catch (error) {
        console.error("Error approving member:", error);
      } finally {
        setIsApproving(false);
      }
    }
  };

  // Handle reject action
  const handleReject = async () => {
    if (onOpenReject) {
      setIsRejecting(true);
      try {
        await onOpenReject(member);
      } catch (error) {
        console.error("Error rejecting member:", error);
      } finally {
        setIsRejecting(false);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#1e3a8a] bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
          <div className="px-6 py-4 border-b border-[#1e3a8a] border-opacity-20 flex justify-between items-center bg-[#1e3a8a] text-white">
            <h3 className="text-lg font-semibold">รายละเอียดสมาชิก</h3>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-3 text-[#1e3a8a] border-b pb-1 border-gray-200">
                  ข้อมูลบริษัท
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-800">
                    <span className="font-medium text-[#1e3a8a]">รหัสสมาชิก:</span>{" "}
                    {member.MEMBER_CODE || "ยังไม่มีรหัสสมาชิก"}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium text-[#1e3a8a]">ชื่อบริษัท:</span>{" "}
                    {member.company_name}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium text-[#1e3a8a]">ประเภทธุรกิจ:</span>{" "}
                    {member.company_type}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium text-[#1e3a8a]">เลขประจำตัวผู้เสียภาษี:</span>{" "}
                    {member.tax_id}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-3 text-[#1e3a8a] border-b pb-1 border-gray-200">
                  ข้อมูลผู้ส่งคำขอ
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-800">
                    <span className="font-medium text-[#1e3a8a]">ชื่อ-นามสกุล:</span>{" "}
                    {member.firstname} {member.lastname}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium text-[#1e3a8a]">โทรศัพท์:</span>{" "}
                    {member.phone || "-"}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium text-[#1e3a8a]">อีเมล:</span>{" "}
                    {member.email ? (
                      <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                        {member.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3 text-[#1e3a8a] border-b pb-1 border-gray-200">
                เอกสาร
              </h4>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-600">อัปโหลดไฟล์เพิ่มเติมให้สมาชิก</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  อัปโหลดไฟล์
                </button>
              </div>
              {member.documents && member.documents.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="bg-blue-50 p-3 mb-3 rounded-md border border-blue-200">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      <p className="text-blue-700 font-medium">
                        เอกสารทั้งหมดสำหรับรหัสสมาชิก:{" "}
                        <span className="font-bold">
                          {member.MEMBER_CODE || "ยังไม่มีรหัสสมาชิก"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#1e3a8a] text-white">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        >
                          ชื่อเอกสาร
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        >
                          รหัสสมาชิก
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        >
                          สถานะ
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        >
                          วันที่อัปโหลด
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider"
                        >
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {member.documents.map((doc, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex items-center">
                              {isImageFile(doc.file_name) && (
                                <svg
                                  className="w-4 h-4 text-green-500 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                              {isPDFFile(doc.file_name) && (
                                <svg
                                  className="w-4 h-4 text-red-500 mr-2"
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
                              {doc.file_name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <span className="font-medium">
                              {doc.MEMBER_CODE || member.MEMBER_CODE || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                doc.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : doc.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {doc.status === "pending"
                                ? "รอการอนุมัติ"
                                : doc.status === "approved"
                                  ? "อนุมัติแล้ว"
                                  : "ปฏิเสธแล้ว"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {doc.uploaded_at
                              ? new Date(doc.uploaded_at).toLocaleDateString("th-TH")
                              : "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {/* Preview Button for Images and PDFs */}
                              {canPreview(doc.file_name) && (
                                <button
                                  onClick={() => handlePreviewImage(doc.file_path, doc.file_name)}
                                  className="text-indigo-600 hover:text-white font-medium px-2 py-1 bg-indigo-100 hover:bg-indigo-600 rounded-md transition-colors flex items-center"
                                  title={
                                    isImageFile(doc.file_name)
                                      ? "ดูตัวอย่างรูปภาพ"
                                      : "ดูตัวอย่าง PDF"
                                  }
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                              )}

                              {/* Download Button */}
                              <a
                                href={doc.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1e3a8a] hover:text-white font-medium px-2 py-1 bg-[#1e3a8a] bg-opacity-10 rounded-md hover:bg-[#1e3a8a] transition-colors flex items-center"
                                title="ดาวน์โหลด"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                  ไม่พบเอกสาร
                </p>
              )}
            </div>

            {/* Admin Comments */}
            {member.admin_comment && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h4 className="text-md font-semibold mb-2">ความคิดเห็นจากผู้ดูแลระบบ</h4>
                <p className="text-gray-700">{member.admin_comment}</p>
              </div>
            )}

            {/* Rejection Reason */}
            {member.reject_reason && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <h4 className="text-md font-semibold mb-2 text-red-700">เหตุผลที่ปฏิเสธ</h4>
                <p className="text-red-700">{member.reject_reason}</p>
              </div>
            )}

            {/* Action Buttons for Pending Members */}
            {showActions && member.Admin_Submit === 0 && (
              <div className="mt-6 flex justify-end space-x-3">
                <div className="flex-1">
                  <label
                    htmlFor="approveComment"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ความคิดเห็น (ไม่บังคับ)
                  </label>
                  <textarea
                    id="approveComment"
                    value={approveComment}
                    onChange={(e) => setApproveComment(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="ใส่ความคิดเห็นเพิ่มเติม (จะแสดงให้สมาชิกเห็น)"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="flex-1 justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {isApproving ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        กำลังอนุมัติ...
                      </>
                    ) : (
                      "อนุมัติ"
                    )}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isRejecting}
                    className="flex-1 justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-[#1e3a8a] hover:bg-[#1e3a8a] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isRejecting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        กำลังปฏิเสธ...
                      </>
                    ) : (
                      "ปฏิเสธ"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[70] px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">อัปโหลดไฟล์เพิ่มเติม</h3>
                  <p className="text-sm text-gray-500 mt-0.5">บันทึกเป็น approved โดยอัตโนมัติ</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* File Upload Area */}
            <div className="space-y-4">
              <div className="relative">
                <label 
                  htmlFor="file-upload" 
                  className="block w-full cursor-pointer"
                >
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-700 group-hover:text-blue-600">
                          คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          รองรับ PDF, JPG, PNG • สามารถเลือกหลายไฟล์พร้อมกัน
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  multiple
                  onChange={(e) => setUploadFile(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Selected Files Display */}
              {uploadFile && uploadFile.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-blue-900">
                      เลือกแล้ว {uploadFile.length} ไฟล์
                    </p>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Array.from(uploadFile).map((file, idx) => (
                      <div key={idx} className="text-xs text-blue-700 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="truncate">{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => {
                  if (!uploadFile || uploadFile.length === 0) {
                    toast.error("กรุณาเลือกไฟล์");
                    return;
                  }
                  try {
                    setIsUploading(true);
                    const files = Array.from(uploadFile);
                    let successCount = 0;
                    
                    for (const file of files) {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("userId", String(member.user_id));
                      formData.append("memberCode", member.MEMBER_CODE || "");
                      formData.append("documentType", "other");

                      const res = await fetch("/api/admin/verify-upload", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        successCount++;
                      } else {
                        console.error(`Failed to upload ${file.name}:`, data.message);
                      }
                    }
                    
                    if (successCount > 0) {
                      toast.success(`อัปโหลดสำเร็จ ${successCount} ไฟล์`);
                      window.location.reload();
                    } else {
                      throw new Error("ไม่สามารถอัปโหลดไฟล์ได้");
                    }
                  } catch (error) {
                    console.error("Upload failed", error);
                    toast.error(error.message || "อัปโหลดไม่สำเร็จ");
                  } finally {
                    setIsUploading(false);
                  }
                }}
                disabled={isUploading || !uploadFile || uploadFile.length === 0}
                className="px-6 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>กำลังอัปโหลด...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>อัปโหลด</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Image/PDF Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4">
          <div className="relative max-w-screen-lg max-h-screen w-full h-full flex items-center justify-center">
            {/* Top Control Bar - Only show zoom controls for images */}
            {previewImage.type === "image" && (
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
              onClick={closeImagePreview}
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
              onWheel={previewImage.type === "image" ? handleWheel : undefined}
              onMouseDown={previewImage.type === "image" ? handleMouseDown : undefined}
              style={{
                cursor:
                  previewImage.type === "image" && zoomLevel > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
              }}
            >
              {previewImage.type === "image" ? (
                <img
                  ref={imageRef}
                  src={previewImage.path}
                  alt={previewImage.name}
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
                  src={previewImage.path}
                  className="w-full h-full border-0 rounded-lg"
                  title={previewImage.name}
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
                <p className="text-sm text-gray-400 mt-2">{previewImage.name}</p>
              </div>
            </div>

            {/* File name and instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-md text-center">
              <p className="text-sm font-medium flex items-center justify-center">
                {previewImage.type === "pdf" && (
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
                {previewImage.name}
              </p>
              {previewImage.type === "image" ? (
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
    </>
  );
}
