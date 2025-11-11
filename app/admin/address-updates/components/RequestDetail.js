"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { isPDF, isImage } from "./addressUtils";
import EditAddressForm from "./EditAddressForm";
import MemberInfoSection from "./MemberInfoSection";
import DocumentDisplaySection from "./DocumentDisplaySection";
import AddressComparisonTabs from "./AddressComparisonTabs";
import AdminActionsSection from "./AdminActionsSection";
import PreviewModal from "./PreviewModal";

export default function RequestDetail({
  selectedRequest,
  adminNotes,
  setAdminNotes,
  isProcessing,
  handleApprove,
  onRejectClick,
}) {
  const [activeTab, setActiveTab] = useState("old");
  const [isEditing, setIsEditing] = useState(false);
  const [editedAddress, setEditedAddress] = useState(null);
  const [preview, setPreview] = useState({ open: false, url: "", type: "" });

  // Preview helpers
  const openPreview = (url) => {
    const type = isImage(url) ? "image" : isPDF(url) ? "pdf" : "unknown";
    setPreview({ open: true, url, type });
  };
  const closePreview = () => setPreview({ open: false, url: "", type: "" });

  // Reset editedAddress whenever selectedRequest changes
  useEffect(() => {
    if (selectedRequest) {
      try {
        const parsedNewAddress =
          typeof selectedRequest.new_address === "string"
            ? JSON.parse(selectedRequest.new_address)
            : selectedRequest.new_address || {};
        setEditedAddress(parsedNewAddress);
      } catch (e) {
        console.error("Error setting edited address:", e);
        setEditedAddress({});
      }
    }
  }, [selectedRequest]);

  if (!selectedRequest) {
    return (
      <motion.div
        className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center h-96"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <svg
          className="h-20 w-20 mb-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-black font-semibold text-lg">เลือกคำขอแก้ไขที่อยู่เพื่อดูรายละเอียด</p>
        <p className="text-black text-sm mt-2">คลิกที่รายการด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม</p>
      </motion.div>
    );
  }

  // Parse address JSON
  let oldAddress = {};
  let newAddress = {};

  try {
    oldAddress =
      typeof selectedRequest.old_address === "string"
        ? JSON.parse(selectedRequest.old_address)
        : selectedRequest.old_address || {};
  } catch (e) {
    console.error("Error parsing old address:", e);
  }

  try {
    newAddress =
      typeof selectedRequest.new_address === "string"
        ? JSON.parse(selectedRequest.new_address)
        : selectedRequest.new_address || {};
  } catch (e) {
    console.error("Error parsing new address:", e);
  }

  // Status badge helper
  const getStatusBadge = () => {
    const status = selectedRequest.status;
    const statusConfig = {
      pending: {
        bg: "bg-gradient-to-r from-yellow-100 to-orange-100",
        border: "border-yellow-300",
        text: "text-yellow-800",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        label: "รอการอนุมัติ",
      },
      approved: {
        bg: "bg-gradient-to-r from-green-100 to-emerald-100",
        border: "border-green-300",
        text: "text-green-800",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        label: "อนุมัติแล้ว",
      },
      rejected: {
        bg: "bg-gradient-to-r from-red-100 to-rose-100",
        border: "border-red-300",
        text: "text-red-800",
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        label: "ปฏิเสธแล้ว",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.border} ${config.text} border-2 font-semibold text-sm`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <motion.div
      className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header - Improved with Black Text */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-[#1e3a8a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">รายละเอียดคำขอแก้ไขที่อยู่</h2>
              <p className="text-sm text-black mt-1">ตรวจสอบและดำเนินการกับคำขอแก้ไขที่อยู่</p>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>
      </div>

      {/* Member Info */}
      <MemberInfoSection selectedRequest={selectedRequest} />

      {/* Document Display Section */}
      <DocumentDisplaySection selectedRequest={selectedRequest} onPreviewOpen={openPreview} />

      {/* Address Comparison Tabs */}
      <AddressComparisonTabs
        selectedRequest={selectedRequest}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editedAddress={editedAddress}
        setEditedAddress={setEditedAddress}
        oldAddress={oldAddress}
        newAddress={newAddress}
      />

      {/* Admin Actions */}
      <AdminActionsSection
        selectedRequest={selectedRequest}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        isProcessing={isProcessing}
        handleApprove={handleApprove}
        onRejectClick={onRejectClick}
        editedAddress={editedAddress}
      />

      {/* Preview Modal */}
      <PreviewModal preview={preview} onClose={closePreview} />
    </motion.div>
  );
}
