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
        className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col justify-center items-center h-96 lg:col-span-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 mb-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg text-gray-600 font-semibold">เลือกคำขอแก้ไขข้อมูลเพื่อดูรายละเอียด</p>
        <p className="text-sm text-gray-500 mt-2">
          คลิกที่รายการด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6 lg:col-span-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">รายละเอียดคำขอแก้ไขข้อมูล</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              คำขอเมื่อ {formatDate(selectedRequest.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Data */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ข้อมูลเดิม
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <span className="text-xs text-gray-500 block">ชื่อ</span>
                  <span className="text-sm font-semibold text-gray-700">{selectedRequest.firstname || "-"}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <span className="text-xs text-gray-500 block">นามสกุล</span>
                  <span className="text-sm font-semibold text-gray-700">{selectedRequest.lastname || "-"}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <span className="text-xs text-gray-500 block">อีเมล</span>
                  <span className="text-sm font-semibold text-gray-700">{selectedRequest.email || "-"}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <span className="text-xs text-gray-500 block">เบอร์โทรศัพท์</span>
                  <span className="text-sm font-semibold text-gray-700">{selectedRequest.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* New Data */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ข้อมูลใหม่
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="flex-1">
                  <span className="text-xs text-blue-600 block mb-1">ชื่อ</span>
                  {selectedRequest.status === "pending" ? (
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editedRequest?.new_firstname || selectedRequest.new_firstname}
                      onChange={(e) => onUpdateNewName("new_firstname", e.target.value)}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-800">{selectedRequest.new_firstname}</span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="flex-1">
                  <span className="text-xs text-blue-600 block mb-1">นามสกุล</span>
                  {selectedRequest.status === "pending" ? (
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={editedRequest?.new_lastname || selectedRequest.new_lastname}
                      onChange={(e) => onUpdateNewName("new_lastname", e.target.value)}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-800">{selectedRequest.new_lastname}</span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <span className="text-xs text-blue-600 block">อีเมล</span>
                  <span className="text-sm font-semibold text-gray-800">{selectedRequest.new_email}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <span className="text-xs text-blue-600 block">เบอร์โทรศัพท์</span>
                  <span className="text-sm font-semibold text-gray-800">{selectedRequest.new_phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedRequest.status === "pending" && (
          <div className="space-y-4 pt-4 border-t-2 border-gray-200">
            <div>
              <label htmlFor="comment" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                บันทึกของผู้ดูแลระบบ (ไม่บังคับ)
              </label>
              <textarea
                id="comment"
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 font-medium"
                placeholder="บันทึกเพิ่มเติมสำหรับผู้ดูแลระบบ..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={onApprove}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isProcessing ? "กำลังดำเนินการ..." : "อนุมัติคำขอ"}
              </motion.button>

              <motion.button
                onClick={onReject}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                ปฏิเสธคำขอ
              </motion.button>
            </div>
          </div>
        )}

        {selectedRequest.status === "approved" && selectedRequest.admin_id && (
          <div className="pt-4 border-t-2 border-gray-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-700 font-semibold">
                  <span className="font-bold text-green-700">อนุมัติโดย:</span>{" "}
                  {selectedRequest.admin_name || `Admin`}
                </p>
                {selectedRequest.admin_comment && (
                  <p className="text-sm text-gray-700 font-semibold">
                    <span className="font-bold text-green-700">บันทึก:</span>{" "}
                    {selectedRequest.admin_comment}
                  </p>
                )}
                <p className="text-sm text-gray-700 font-semibold flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-bold text-green-700">เมื่อ:</span>{" "}
                  {formatDate(selectedRequest.updated_at)}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedRequest.status === "rejected" && (
          <div className="pt-4 border-t-2 border-gray-200 bg-red-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-700 font-semibold">
                  <span className="font-bold text-red-700">ปฏิเสธโดย:</span>{" "}
                  {selectedRequest.admin_name || `Admin`}
                </p>
                <p className="text-sm text-gray-700 font-semibold">
                  <span className="font-bold text-red-700">เหตุผล:</span> {selectedRequest.reject_reason}
                </p>
                {selectedRequest.admin_comment && (
                  <p className="text-sm text-gray-700 font-semibold">
                    <span className="font-bold text-red-700">บันทึก:</span>{" "}
                    {selectedRequest.admin_comment}
                  </p>
                )}
                <p className="text-sm text-gray-700 font-semibold flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-bold text-red-700">เมื่อ:</span>{" "}
                  {formatDate(selectedRequest.updated_at)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}