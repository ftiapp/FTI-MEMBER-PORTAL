"use client";

import { motion } from "framer-motion";

export default function RejectedApplicationHeader({ rejectedApp, membershipTypeLabel }) {
  if (!rejectedApp) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold text-red-900 mb-2">ใบสมัครถูกปฏิเสธ</h2>

          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600">ประเภทสมาชิก: </span>
              <span className="text-sm font-medium text-gray-900">{membershipTypeLabel}</span>
            </div>

            {rejectedApp.applicationName && (
              <div>
                <span className="text-sm text-gray-600">ชื่อ: </span>
                <span className="text-sm font-medium text-gray-900">
                  {rejectedApp.applicationName}
                </span>
              </div>
            )}

            {rejectedApp.rejectedAt && (
              <div>
                <span className="text-sm text-gray-600">วันที่ปฏิเสธ: </span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(rejectedApp.rejectedAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {rejectedApp.resubmissionCount > 0 && (
              <div>
                <span className="text-sm text-gray-600">จำนวนครั้งที่ส่งใหม่: </span>
                <span className="text-sm font-medium text-orange-600">
                  {rejectedApp.resubmissionCount} ครั้ง
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
