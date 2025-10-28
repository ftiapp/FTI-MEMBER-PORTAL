"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import EditAddressForm from "./EditAddressForm";

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
  const isPDF = (u = "") => (u || "").toLowerCase().endsWith(".pdf");
  const isImage = (u = "") => {
    const exts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
    const l = (u || "").toLowerCase();
    return exts.some((ext) => l.endsWith(ext));
  };
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
        className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-96"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-gray-500 font-medium">เลือกคำขอแก้ไขที่อยู่เพื่อดูรายละเอียด</p>
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy, HH:mm น.", { locale: th });
  };

  // Get language label
  const getLanguageLabel = (addrLang) => {
    return addrLang === "en" ? "ภาษาอังกฤษ" : "ภาษาไทย";
  };

  // Map member type code to readable text
  const getMemberTypeName = (typeCode) => {
    const memberTypeMap = {
      "000": "สภาอุตสาหกรรม",
      100: "กลุ่มอุตสาหกรรม",
      200: "สภาอุตสาหกรรมจังหวัด",
    };
    return memberTypeMap[typeCode] || typeCode;
  };

  // Map member subtype code to readable text
  const getMemberSubtypeName = (typeCode) => {
    const memberSubtypeMap = {
      11: "สน (สามัญ-โรงงาน)",
      12: "สส (สามัญ-สมาคมการค้า)",
      21: "ทน (สมทบ-นิติบุคคล)",
      22: "ทบ (สมทบ-บุคคลธรรมดา)",
    };
    return memberSubtypeMap[typeCode] || typeCode;
  };

  // Map address code to readable text
  const getAddressTypeName = (addrCode) => {
    const addressTypeMap = {
      "001": "ที่อยู่สำหรับติดต่อ (ทะเบียน)",
      "002": "ที่อยู่สำหรับจัดส่งเอกสาร",
      "003": "ที่อยู่สำหรับออกใบกำกับภาษี",
    };
    return addressTypeMap[addrCode] || `ที่อยู่รหัส ${addrCode}`;
  };

  // Document type based on address code
  const getDocumentType = (addrCode) => {
    switch (addrCode) {
      case "001":
        return "หนังสือรับรองนิติบุคคลจากกระทรวงพาณิชย์";
      case "003":
        return "ใบทะเบียนภาษีมูลค่าเพิ่ม (แบบ ภ.พ.20)";
      default:
        return "เอกสารแนบ";
    }
  };

  // Format full address
  const formatFullAddress = (address) => {
    if (!address) return "ไม่มีข้อมูล";

    const parts = [];

    if (address.ADDR_NO) parts.push(`เลขที่ ${address.ADDR_NO}`);
    if (address.ADDR_MOO) parts.push(`หมู่ ${address.ADDR_MOO}`);
    if (address.ADDR_SOI) parts.push(`ซอย ${address.ADDR_SOI}`);
    if (address.ADDR_ROAD) parts.push(`ถนน ${address.ADDR_ROAD}`);
    if (address.ADDR_SUB_DISTRICT) parts.push(`แขวง/ตำบล ${address.ADDR_SUB_DISTRICT}`);
    if (address.ADDR_DISTRICT) parts.push(`เขต/อำเภอ ${address.ADDR_DISTRICT}`);
    if (address.ADDR_PROVINCE_NAME) parts.push(`จังหวัด ${address.ADDR_PROVINCE_NAME}`);
    if (address.ADDR_POSTCODE) parts.push(`รหัสไปรษณีย์ ${address.ADDR_POSTCODE}`);

    const contactInfo = [];
    if (address.ADDR_TELEPHONE) contactInfo.push(`โทรศัพท์: ${address.ADDR_TELEPHONE}`);
    if (address.ADDR_FAX) contactInfo.push(`แฟกซ์: ${address.ADDR_FAX}`);
    if (address.ADDR_EMAIL) contactInfo.push(`อีเมล: ${address.ADDR_EMAIL}`);
    if (address.ADDR_WEBSITE) contactInfo.push(`เว็บไซต์: ${address.ADDR_WEBSITE}`);

    return (
      <div>
        <p className="mb-2">{parts.join(" ")}</p>
        {contactInfo.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {contactInfo.map((info, index) => (
              <p key={index}>{info}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Find changes between old and new addresses
  const findChanges = () => {
    const changes = [];

    const fieldLabels = {
      ADDR_NO: "เลขที่",
      ADDR_MOO: "หมู่ที่",
      ADDR_SOI: "ซอย",
      ADDR_ROAD: "ถนน",
      ADDR_SUB_DISTRICT: "แขวง/ตำบล",
      ADDR_DISTRICT: "เขต/อำเภอ",
      ADDR_PROVINCE_NAME: "จังหวัด",
      ADDR_POSTCODE: "รหัสไปรษณีย์",
      ADDR_TELEPHONE: "โทรศัพท์",
      ADDR_FAX: "แฟกซ์",
      ADDR_EMAIL: "อีเมล",
      ADDR_WEBSITE: "เว็บไซต์",
    };

    // Use editedAddress if we're editing, otherwise use newAddress
    // Make sure we have a valid object to compare with
    const compareAddress =
      isEditing || (editedAddress && editedAddress !== newAddress)
        ? editedAddress || {}
        : newAddress || {};

    Object.keys(fieldLabels).forEach((field) => {
      // Safely compare values, handling null/undefined cases
      const oldValue = oldAddress[field];
      const newValue = compareAddress[field];

      if (oldValue !== newValue) {
        changes.push({
          field: fieldLabels[field],
          oldValue: oldValue || "-",
          newValue: newValue || "-",
        });
      }
    });

    return changes;
  };

  // Handle saving edited address
  const handleSaveEdit = (editedData) => {
    // Make sure we have a valid object
    const validEditedData = editedData || {};
    setEditedAddress(validEditedData);
    setIsEditing(false);
    return Promise.resolve(); // Return a resolved promise for the EditAddressForm component
  };

  const changes = findChanges();

  return (
    <motion.div
      className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-bold">รายละเอียดคำขอแก้ไขที่อยู่</h2>
        <p className="text-sm opacity-90">
          {selectedRequest.status === "pending"
            ? "รอการอนุมัติ"
            : selectedRequest.status === "approved"
              ? "อนุมัติแล้ว"
              : selectedRequest.status === "rejected"
                ? "ปฏิเสธแล้ว"
                : selectedRequest.status}
        </p>
      </div>

      {/* Member Info */}
      <div className="p-4 border-b">
        <h3 className="font-bold text-lg mb-2">ข้อมูลสมาชิก</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">รหัสสมาชิก</p>
            <p className="font-medium">{selectedRequest.member_code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ชื่อบริษัท</p>
            <p className="font-medium">{selectedRequest.company_name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">รหัสบุคคล</p>
            <p className="font-medium">{selectedRequest.comp_person_code || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ประเภทสมาชิก</p>
            <p className="font-medium">{getMemberTypeName(selectedRequest.member_type)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">กลุ่มสมาชิก</p>
            <p className="font-medium">{selectedRequest.member_group_code || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ประเภทสมาชิกย่อย</p>
            <p className="font-medium">{getMemberSubtypeName(selectedRequest.type_code)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ประเภทที่อยู่</p>
            <p className="font-medium">{getAddressTypeName(selectedRequest.addr_code)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ภาษา</p>
            <p className="font-medium">{getLanguageLabel(selectedRequest.addr_lang)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">วันที่ขอแก้ไข</p>
            <p className="font-medium">{formatDate(selectedRequest.request_date)}</p>
          </div>
        </div>
      </div>

      {/* Document Display Section */}
      {(selectedRequest.addr_code === "001" || selectedRequest.addr_code === "003") && (
        <div className="p-4 border-b">
          <h3 className="font-bold text-lg mb-2">เอกสารแนบ</h3>

          {selectedRequest.document_url ? (
            <div className="flex flex-col">
              <p className="text-sm text-gray-600 mb-2">
                {getDocumentType(selectedRequest.addr_code)}
              </p>
              <div className="flex items-center space-x-3">
                <a
                  href={selectedRequest.document_url}
                  onClick={(e) => {
                    e.preventDefault();
                    openPreview(selectedRequest.document_url);
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 inline-flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  ดูเอกสาร
                </a>
                {/*
                <a 
                  href={selectedRequest.document_url} 
                  download
                  className="px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  ดาวน์โหลด
                </a> */}
              </div>
            </div>
          ) : (
            <p className="text-red-500">ไม่พบเอกสารแนบ</p>
          )}
        </div>
      )}

      {/* Address Comparison Tabs */}
      <div className="border-b">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "old"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("old")}
          >
            ที่อยู่เดิม
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "new"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("new")}
          >
            ที่อยู่ใหม่
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "diff"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("diff")}
          >
            เปรียบเทียบการเปลี่ยนแปลง
          </button>
        </div>

        <div className="p-4">
          {activeTab === "old" && (
            <div>
              <h3 className="font-bold mb-2">ที่อยู่เดิม</h3>
              {formatFullAddress(oldAddress)}
            </div>
          )}

          {activeTab === "new" && (
            <div>
              <h3 className="font-bold mb-2">ที่อยู่ใหม่</h3>
              {isEditing ? (
                <EditAddressForm
                  addressData={editedAddress || newAddress}
                  addrLang={selectedRequest.addr_lang}
                  onSave={handleSaveEdit}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                />
              ) : (
                <>
                  {formatFullAddress(editedAddress || newAddress)}
                  {selectedRequest.status === "pending" && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                    >
                      แก้ไขข้อมูลที่อยู่
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "diff" && (
            <div>
              <h3 className="font-bold mb-2">การเปลี่ยนแปลง</h3>
              {changes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          ฟิลด์
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          ค่าเดิม
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          ค่าใหม่
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {changes.map((change, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {change.field}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 bg-red-50">
                            {change.oldValue}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 bg-green-50">
                            {change.newValue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">ไม่พบการเปลี่ยนแปลงข้อมูล</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      {selectedRequest.status === "pending" && (
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-1">
              บันทึกช่วยจำ (เฉพาะเจ้าหน้าที่)
            </label>
            <textarea
              id="adminNotes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50"
              rows="3"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="บันทึกช่วยจำสำหรับเจ้าหน้าที่ (เฉพาะแอดมินเท่านั้นที่จะเห็นข้อความนี้)"
            />
          </div>

          <div className="flex space-x-3">
            <motion.button
              className="px-4 py-2 bg-green-600 text-white rounded-md font-medium flex items-center justify-center disabled:opacity-50"
              onClick={() => handleApprove(editedAddress)}
              disabled={isProcessing || isEditing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? (
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
                  กำลังดำเนินการ...
                </>
              ) : (
                "อนุมัติ"
              )}
            </motion.button>

            <motion.button
              className="px-4 py-2 bg-red-600 text-white rounded-md font-medium flex items-center justify-center disabled:opacity-50"
              onClick={onRejectClick}
              disabled={isProcessing || isEditing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ปฏิเสธ
            </motion.button>
          </div>
        </div>
      )}

      {/* Show processed info if not pending */}
      {selectedRequest.status !== "pending" && selectedRequest.processed_date && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-700 mb-2">
            <span className="font-medium">วันที่ดำเนินการ:</span>{" "}
            {formatDate(selectedRequest.processed_date)}
          </div>
          {selectedRequest.approved_by_admin_name && (
            <div className="text-sm text-gray-700 mb-2">
              <span className="font-medium">ดำเนินการโดย:</span>{" "}
              {selectedRequest.approved_by_admin_name}
            </div>
          )}
          {selectedRequest.admin_notes && (
            <div className="text-sm text-gray-700 mb-2">
              <span className="font-medium">บันทึกของผู้ดูแลระบบ:</span>{" "}
              {selectedRequest.admin_notes}
            </div>
          )}
          {selectedRequest.admin_comment && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">เหตุผลที่ปฏิเสธ:</span> {selectedRequest.admin_comment}
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {preview.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative bg-white w-full h-[85vh] max-w-6xl rounded-lg shadow-lg overflow-hidden">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between bg-gray-900 text-white px-4 py-2 z-10">
              <div className="flex items-center gap-3">
                <span className="text-sm opacity-80">ตัวอย่างเอกสาร</span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-700">
                  {preview.type.toUpperCase() || "FILE"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={preview.url}
                  download
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm inline-flex items-center gap-2"
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
                <button
                  onClick={closePreview}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                >
                  ปิด
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="w-full h-full pt-10 bg-gray-50">
              {preview.type === "pdf" && (
                <iframe src={preview.url} className="w-full h-full" title="PDF Preview" />
              )}
              {preview.type === "image" && (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <img
                    src={preview.url}
                    alt="preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              {preview.type === "unknown" && (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-600">
                    ไม่สามารถแสดงตัวอย่างไฟล์นี้ได้ กรุณาดาวน์โหลดไฟล์
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
