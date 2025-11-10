"use client";

import { motion } from "framer-motion";
import { formatDate } from "./addressUtils";

export default function AdminActionsSection({
  selectedRequest,
  adminNotes,
  setAdminNotes,
  isProcessing,
  handleApprove,
  onRejectClick,
  editedAddress,
}) {
  return (
    <>
      {/* Admin Actions */}
      {selectedRequest.status === "pending" && (
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg
                className="w-5 h-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">การดำเนินการของเจ้าหน้าที่</h3>
              <p className="text-sm text-gray-600">ตรวจสอบและอนุมัติคำขอแก้ไขที่อยู่</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm">
            <div className="mb-6">
              <label
                htmlFor="adminNotes"
                className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                บันทึกช่วยจำ (เฉพาะเจ้าหน้าที่)
              </label>
              <textarea
                id="adminNotes"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-yellow-50 transition-colors"
                rows="4"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="บันทึกช่วยจำสำหรับเจ้าหน้าที่ (เฉพาะแอดมินเท่านั้นที่จะเห็นข้อความนี้)..."
              />
            </div>

            <div className="flex gap-4">
              <motion.button
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => handleApprove(editedAddress)}
                disabled={isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    <span>กำลังดำเนินการ...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>อนุมัติ</span>
                  </>
                )}
              </motion.button>

              <motion.button
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={onRejectClick}
                disabled={isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>ปฏิเสธ</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Show processed info if not pending */}
      {selectedRequest.status !== "pending" && selectedRequest.processed_date && (
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">ข้อมูลการดำเนินการ</h3>
              <p className="text-sm text-gray-600">ผลลัพธ์การตรวจสอบและอนุมัติคำขอ</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">วันที่ดำเนินการ</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedRequest.processed_date)}
                  </p>
                </div>
              </div>

              {selectedRequest.approved_by_admin_name && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="w-4 h-4 text-green-600"
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
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">ดำเนินการโดย</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRequest.approved_by_admin_name}
                    </p>
                  </div>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg mt-1">
                    <svg
                      className="w-4 h-4 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">บันทึกของผู้ดูแลระบบ</p>
                    <p className="font-semibold text-gray-900 bg-yellow-50 p-3 rounded-lg">
                      {selectedRequest.admin_notes}
                    </p>
                  </div>
                </div>
              )}

              {selectedRequest.admin_comment && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg mt-1">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">เหตุผลที่ปฏิเสธ</p>
                    <p className="font-semibold text-red-800 bg-red-50 p-3 rounded-lg">
                      {selectedRequest.admin_comment}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
