"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { formatDate } from "../utils/formatters";

// Use React.memo to prevent unnecessary re-renders
export default memo(RequestDetail, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.selectedRequest?.id === nextProps.selectedRequest?.id &&
    prevProps.editedRequest?.new_firstname === nextProps.editedRequest?.new_firstname &&
    prevProps.editedRequest?.new_lastname === nextProps.editedRequest?.new_lastname &&
    prevProps.comment === nextProps.comment &&
    prevProps.isProcessing === nextProps.isProcessing
  );
});

function RequestDetail({
  selectedRequest,
  editedRequest,
  comment,
  setComment,
  isProcessing,
  onApprove,
  onReject,
  onUpdateNewName,
}) {
  if (!selectedRequest) {
    return (
      <motion.div
        className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center items-center h-64 lg:col-span-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mb-4 text-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <p className="text-lg text-black font-bold">เลือกคำขอแก้ไขข้อมูลเพื่อดูรายละเอียด</p>
        <p className="text-sm text-black font-semibold mt-2">
          คลิกที่รายการด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6 space-y-6 lg:col-span-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-b border-black pb-4">
        <h2 className="text-xl font-bold text-black">รายละเอียดคำขอแก้ไขข้อมูล</h2>
        <p className="text-sm text-black font-medium mt-1">
          คำขอเมื่อ {formatDate(selectedRequest.created_at)}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-bold text-black">ข้อมูลเดิม</h3>
            <div className="mt-2 space-y-2">
              <p className="text-black font-semibold">
                <span className="font-bold text-black">ชื่อ:</span>{" "}
                {selectedRequest.firstname || "-"}
              </p>
              <p className="text-black font-semibold">
                <span className="font-bold text-black">นามสกุล:</span>{" "}
                {selectedRequest.lastname || "-"}
              </p>
              <p className="text-black font-semibold">
                <span className="font-bold text-black">อีเมล:</span> {selectedRequest.email || "-"}
              </p>
              <p className="text-black font-semibold">
                <span className="font-bold text-black">เบอร์โทรศัพท์:</span>{" "}
                {selectedRequest.phone || "-"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-black">ข้อมูลใหม่</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <span className="font-bold text-black min-w-[80px]">ชื่อ:</span>
                {selectedRequest.status === "pending" ? (
                  <input
                    type="text"
                    className="ml-2 px-2 py-1 border border-black rounded text-black w-full"
                    value={editedRequest?.new_firstname || selectedRequest.new_firstname}
                    onChange={(e) => onUpdateNewName("new_firstname", e.target.value)}
                  />
                ) : (
                  <span className="text-black font-semibold">{selectedRequest.new_firstname}</span>
                )}
              </div>
              <div className="flex items-center">
                <span className="font-bold text-black min-w-[80px]">นามสกุล:</span>
                {selectedRequest.status === "pending" ? (
                  <input
                    type="text"
                    className="ml-2 px-2 py-1 border border-black rounded text-black w-full"
                    value={editedRequest?.new_lastname || selectedRequest.new_lastname}
                    onChange={(e) => onUpdateNewName("new_lastname", e.target.value)}
                  />
                ) : (
                  <span className="text-black font-semibold">{selectedRequest.new_lastname}</span>
                )}
              </div>
              <p className="text-black font-semibold">
                <span className="font-bold text-black min-w-[80px] inline-block">อีเมล:</span>{" "}
                {selectedRequest.new_email}
              </p>
              <p className="text-black font-semibold">
                <span className="font-bold text-black min-w-[80px] inline-block">
                  เบอร์โทรศัพท์:
                </span>{" "}
                {selectedRequest.new_phone}
              </p>
            </div>
          </div>
        </div>

        {selectedRequest.status === "pending" && (
          <div className="space-y-4 pt-4 border-t border-black">
            <div>
              <label htmlFor="comment" className="block text-sm font-bold text-black mb-1">
                บันทึกของผู้ดูแลระบบ (ไม่บังคับ)
              </label>
              <textarea
                id="comment"
                rows="2"
                className="w-full px-3 py-2 border border-black rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                placeholder="บันทึกเพิ่มเติมสำหรับผู้ดูแลระบบ"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>

            <div className="flex space-x-4">
              <motion.button
                onClick={onApprove}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isProcessing ? "กำลังดำเนินการ..." : "อนุมัติคำขอ"}
              </motion.button>

              <motion.button
                onClick={onReject}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                ปฏิเสธคำขอ
              </motion.button>
            </div>
          </div>
        )}

        {selectedRequest.status === "approved" && selectedRequest.admin_id && (
          <div className="pt-4 border-t border-black">
            <p className="text-sm text-black font-semibold">
              <span className="font-bold text-black">อนุมัติโดย:</span>{" "}
              {selectedRequest.admin_name || `Admin`}
            </p>
            {selectedRequest.admin_comment && (
              <p className="text-sm text-black font-semibold mt-2">
                <span className="font-bold text-black">บันทึก:</span>{" "}
                {selectedRequest.admin_comment}
              </p>
            )}
            <p className="text-sm text-black font-semibold mt-2">
              <span className="font-bold text-black">เมื่อ:</span>{" "}
              {formatDate(selectedRequest.updated_at)}
            </p>
          </div>
        )}

        {selectedRequest.status === "rejected" && (
          <div className="pt-4 border-t border-black">
            <p className="text-sm text-black font-semibold">
              <span className="font-bold text-black">ปฏิเสธโดย:</span>{" "}
              {selectedRequest.admin_name || `Admin`}
            </p>
            <p className="text-sm text-black font-semibold mt-2">
              <span className="font-bold text-black">เหตุผล:</span> {selectedRequest.reject_reason}
            </p>
            {selectedRequest.admin_comment && (
              <p className="text-sm text-black font-semibold mt-2">
                <span className="font-bold text-black">บันทึก:</span>{" "}
                {selectedRequest.admin_comment}
              </p>
            )}
            <p className="text-sm text-black font-semibold mt-2">
              <span className="font-bold text-black">เมื่อ:</span>{" "}
              {formatDate(selectedRequest.updated_at)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
