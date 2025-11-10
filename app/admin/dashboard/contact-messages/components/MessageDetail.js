"use client";

import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils/date";

export default function MessageDetail({
  selectedMessage,
  responseText,
  setResponseText,
  isSubmitting,
  onMarkAsReplied,
  onSendEmailReply,
}) {
  if (!selectedMessage) {
    return (
      <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
        <div className="flex flex-col items-center justify-center h-96">
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-lg text-gray-600 font-semibold">เลือกข้อความเพื่อดูรายละเอียด</p>
          <p className="text-sm text-gray-500 mt-2">
            คลิกที่ข้อความในรายการด้านซ้ายเพื่อดูข้อมูลเพิ่มเติม
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-800 break-words">{selectedMessage.subject}</h3>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <StatusBadge status={selectedMessage.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <span className="text-xs text-gray-500 block">จาก</span>
                  <span className="font-semibold text-gray-800">{selectedMessage.name}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <span className="text-xs text-gray-500 block">อีเมล</span>
                  <span className="font-semibold text-gray-800 break-all">{selectedMessage.email}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <span className="text-xs text-gray-500 block">เบอร์โทร</span>
                  <span className="font-semibold text-gray-800">{selectedMessage.phone || "-"}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <span className="text-xs text-gray-500 block">วันที่</span>
                  <span className="font-semibold text-gray-800">{formatDate(selectedMessage.created_at)}</span>
                </div>
              </div>
            </div>
            {selectedMessage.status !== "unread" && selectedMessage.read_by_admin_name && (
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <div>
                    <span className="text-xs text-gray-500 block">อ่านโดย</span>
                    <span className="font-semibold text-gray-800">{selectedMessage.read_by_admin_name}</span>
                  </div>
                </div>
              </div>
            )}
            {selectedMessage.status === "replied" && selectedMessage.replied_by_admin_name && (
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <div>
                    <span className="text-xs text-gray-500 block">ตอบกลับโดย</span>
                    <span className="font-semibold text-gray-800">{selectedMessage.replied_by_admin_name}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="p-6 flex-grow overflow-y-auto bg-gray-50">
          <div className="mb-6">
            <h4 className="font-bold text-gray-700 mb-3 text-base flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              ข้อความ
            </h4>
            <div className="bg-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedMessage.message}
              </p>
            </div>
          </div>

          {selectedMessage.admin_response && (
            <div>
              <h4 className="font-bold text-gray-700 mb-3 text-base flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                การตอบกลับของผู้ดูแลระบบ
              </h4>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedMessage.admin_response}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Response Form */}
        <div className="p-6 border-t-2 border-gray-200 bg-white">
          <div className="space-y-4">
            <div>
              <label htmlFor="responseText" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                บันทึกการตอบกลับ
              </label>
              <textarea
                id="responseText"
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 font-medium transition-all"
                placeholder="บันทึกรายละเอียดการตอบกลับ เช่น วิธีการตอบกลับ, เนื้อหาโดยย่อ..."
                value={responseText}
                onChange={(e) => setResponseText(String(e.target.value))}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                ข้อความนี้มีไว้เพื่อแจ้งเตือนว่าได้ทำการตอบกลับเรียบร้อยแล้วเท่านั้น
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onSendEmailReply}
                className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  เปิดอีเมลเพื่อตอบกลับ
                </span>
              </button>

              <button
                onClick={() => onMarkAsReplied(selectedMessage.id)}
                disabled={
                  isSubmitting ||
                  !(responseText && typeof responseText === "string" && responseText.trim())
                }
                className={`flex-1 min-w-[200px] px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-md font-medium ${
                  isSubmitting ||
                  !(responseText && typeof responseText === "string" && responseText.trim())
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:ring-green-500 hover:shadow-lg"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
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
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      บันทึกว่าตอบกลับแล้ว
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}