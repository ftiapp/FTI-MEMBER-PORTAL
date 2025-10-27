"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, MessageSquare } from "lucide-react";

export default function ResubmitModal({ isOpen, onConfirm, onCancel }) {
  const [userMessage, setUserMessage] = useState("");

  const handleConfirm = () => {
    onConfirm(userMessage);
    setUserMessage(""); // Clear after submit
  };

  const handleCancel = () => {
    onCancel();
    setUserMessage(""); // Clear on cancel
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-blue-900">
                    ส่งใบสมัครใหม่
                  </h2>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    คุณแน่ใจหรือไม่ที่จะส่งใบสมัครนี้ใหม่? ระบบจะตรวจสอบและติดต่อกลับภายใน 3-5 วันทำการ
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ข้อความถึงผู้ดูแลระบบ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="กรุณาระบุข้อความเพื่อตอบกลับผู้ดูแลระบบ เช่น การแก้ไขปัญหาที่ระบุไว้ในเหตุผลการปฏิเสธ..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      กรุณาระบุข้อมูลเพื่อให้ผู้ดูแลระบบเข้าใจการแก้ไขปัญหาของคุณ
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-6 py-4 flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!userMessage.trim()}
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-all duration-200 ${
                    userMessage.trim()
                      ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  ยืนยันการส่ง
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
