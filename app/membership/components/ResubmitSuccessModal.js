"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function ResubmitSuccessModal({ isOpen, onClose, membershipType }) {
  const getMembershipTypeLabel = (type) => {
    const labels = {
      oc: "สามัญ-โรงงาน (OC)",
      ac: "สมทบ-นิติบุคคล (AC)",
      am: "สามัญ-สมาคมการค้า (AM)",
      ic: "สมทบ-บุคคลธรรมดา (IC)",
    };
    return labels[type] || type.toUpperCase();
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Icon */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-block"
                >
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-900 mt-6"
                >
                  ส่งใบสมัครใหม่สำเร็จ!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mt-2"
                >
                  ใบสมัครของคุณถูกส่งเรียบร้อยแล้ว
                </motion.p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">ประเภทสมาชิก:</span>{" "}
                    {getMembershipTypeLabel(membershipType)}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <p>ระบบได้รับใบสมัครของคุณแล้ว</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <p>ส่งอีเมลยืนยันไปยังอีเมลของคุณแล้ว</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <p>เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 3-5 วันทำการ</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">หมายเหตุ:</span>{" "}
                    คุณสามารถตรวจสอบสถานะใบสมัครได้ที่เมนู "สมาชิกภาพของฉัน"
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-6 py-4 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  กลับไปหน้าหลัก
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
