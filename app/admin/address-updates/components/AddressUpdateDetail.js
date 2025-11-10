"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function AddressUpdateDetail({ update, onClose, onApprove, onReject }) {
  const [comment, setComment] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Parse old and new address JSON
  let oldAddress = {};
  let newAddress = {};

  try {
    oldAddress = JSON.parse(update.old_address);
    newAddress = JSON.parse(update.new_address);
  } catch (e) {
    console.error("Error parsing address data:", e);
  }

  // Format date
  const requestDate = new Date(update.request_date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Map address type code to readable text
  const addressTypeMap = {
    "001": "ที่ตั้งสำนักงาน",
    "002": "ที่ตั้งโรงงาน",
    "003": "ที่อยู่สำหรับจัดส่งเอกสาร",
  };

  const addressType = addressTypeMap[update.type_code] || `ประเภท ${update.type_code}`;

  // Helper function to format address for display
  const formatAddress = (addr) => {
    if (!addr) return "ไม่มีข้อมูล";

    const parts = [];

    if (addr.ADDR_NO) parts.push(addr.ADDR_NO);
    if (addr.ADDR_MOO) parts.push(`หมู่ ${addr.ADDR_MOO}`);
    if (addr.ADDR_SOI) parts.push(addr.ADDR_SOI);
    if (addr.ADDR_ROAD) parts.push(`ถนน${addr.ADDR_ROAD}`);
    if (addr.ADDR_SUB_DISTRICT) parts.push(addr.ADDR_SUB_DISTRICT);
    if (addr.ADDR_DISTRICT) parts.push(addr.ADDR_DISTRICT);
    if (addr.ADDR_PROVINCE_NAME) parts.push(addr.ADDR_PROVINCE_NAME);
    if (addr.ADDR_POSTCODE) parts.push(addr.ADDR_POSTCODE);

    return parts.join(" ");
  };

  // Helper function to display field differences
  const renderFieldComparison = (label, oldField, newField, isHighlighted = false) => {
    const hasChanged = oldField !== newField;
    const oldValue = oldField || "ไม่ระบุ";
    const newValue = newField || "ไม่ระบุ";

    return (
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <span className="text-black text-sm">{label}:</span>
          <div
            className={`p-2 rounded ${hasChanged ? "bg-red-50 border border-red-100" : "bg-gray-50"}`}
          >
            {oldValue}
          </div>
        </div>
        <div>
          <span className="text-black text-sm">{label}:</span>
          <div
            className={`p-2 rounded ${hasChanged ? "bg-green-50 border border-green-100" : "bg-gray-50"}`}
          >
            {newValue}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">รายละเอียดคำขอแก้ไขที่อยู่</h2>
          <button onClick={onClose} className="text-black hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">ข้อมูลคำขอ</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-black">MEMBER_CODE:</p>
              <p className="font-medium">{update.member_code}</p>
            </div>
            <div>
              <p className="text-sm text-black">MEMBER_MAIN_TYPE_CODE:</p>
              <p className="font-medium">{update.member_type}</p>
            </div>
            <div>
              <p className="text-sm text-black">MEMBER_GROUP:</p>
              <p className="font-medium">{update.member_group_code}</p>
            </div>
            <div>
              <p className="text-sm text-black">ประเภทที่อยู่:</p>
              <p className="font-medium">{addressType}</p>
            </div>
            <div>
              <p className="text-sm text-black">วันที่ขอแก้ไข:</p>
              <p className="font-medium">{requestDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ชื่อ-นามสกุล:</p>
              <p className="font-medium">
                {update.firstname && update.lastname
                  ? `${update.firstname} ${update.lastname}`
                  : update.name || "ไม่ระบุ"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">เบอร์โทร:</p>
              <p className="font-medium">
                {update.phone || oldAddress.ADDR_TELEPHONE || "ไม่ระบุ"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">อีเมล:</p>
              <p className="font-medium">{update.email || oldAddress.ADDR_EMAIL || "ไม่ระบุ"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ชื่อบริษัท:</p>
              <p className="font-medium">{update.company_name || "ไม่ระบุ"}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <h3 className="font-semibold text-red-600 mb-2">ที่อยู่เดิม (Old Address)</h3>
            </div>
            <div>
              <h3 className="font-semibold text-green-600 mb-2">ที่อยู่ใหม่ (New Address)</h3>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">ที่อยู่</h4>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <div className="p-3 rounded bg-red-50 border border-red-100">
                  {formatAddress(oldAddress)}
                </div>
              </div>
              <div>
                <div className="p-3 rounded bg-green-50 border border-green-100">
                  {formatAddress(newAddress)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">รายละเอียดที่อยู่</h4>
            {renderFieldComparison("เลขที่", oldAddress.ADDR_NO, newAddress.ADDR_NO)}
            {renderFieldComparison("หมู่", oldAddress.ADDR_MOO, newAddress.ADDR_MOO)}
            {renderFieldComparison("ซอย", oldAddress.ADDR_SOI, newAddress.ADDR_SOI)}
            {renderFieldComparison("ถนน", oldAddress.ADDR_ROAD, newAddress.ADDR_ROAD)}
            {renderFieldComparison(
              "แขวง/ตำบล",
              oldAddress.ADDR_SUB_DISTRICT,
              newAddress.ADDR_SUB_DISTRICT,
            )}
            {renderFieldComparison("เขต/อำเภอ", oldAddress.ADDR_DISTRICT, newAddress.ADDR_DISTRICT)}
            {renderFieldComparison(
              "จังหวัด",
              oldAddress.ADDR_PROVINCE_NAME,
              newAddress.ADDR_PROVINCE_NAME,
            )}
            {renderFieldComparison(
              "รหัสไปรษณีย์",
              oldAddress.ADDR_POSTCODE,
              newAddress.ADDR_POSTCODE,
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">ข้อมูลการติดต่อ</h4>
            {renderFieldComparison(
              "เบอร์โทรศัพท์",
              oldAddress.ADDR_TELEPHONE,
              newAddress.ADDR_TELEPHONE,
            )}
            {renderFieldComparison("โทรสาร", oldAddress.ADDR_FAX, newAddress.ADDR_FAX)}
            {renderFieldComparison("อีเมล", oldAddress.ADDR_EMAIL, newAddress.ADDR_EMAIL)}
            {renderFieldComparison("เว็บไซต์", oldAddress.ADDR_WEBSITE, newAddress.ADDR_WEBSITE)}
          </div>
        </div>

        {showRejectForm ? (
          <div className="mb-6">
            <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 mb-1">
              เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              rows="3"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="กรุณาระบุเหตุผลในการปฏิเสธคำขอแก้ไขที่อยู่"
              required
            ></textarea>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => onReject(update.id, comment)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={!comment.trim()}
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              ปฏิเสธ
            </button>
            <button
              type="button"
              onClick={() => onApprove(update.id)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              อนุมัติ
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
