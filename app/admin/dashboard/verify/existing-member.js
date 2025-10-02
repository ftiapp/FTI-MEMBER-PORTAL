"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function ExistingMember({ member, onSuccess, onClose }) {
  const [memberCode, setMemberCode] = useState("");
  const [mssqlData, setMssqlData] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // ตรวจสอบ MEMBER_CODE จากฐานข้อมูล MSSQL
  const checkMemberCode = async () => {
    if (!memberCode.trim()) {
      toast.error("กรุณาระบุรหัสสมาชิก");
      return;
    }

    try {
      setIsChecking(true);
      const response = await fetch(
        `/api/admin/check-member-code?code=${encodeURIComponent(memberCode.trim())}`,
      );
      const result = await response.json();

      if (result.success) {
        setMssqlData(result.data);
        toast.success("พบข้อมูลสมาชิกในระบบ");
      } else {
        toast.error(result.message || "ไม่พบข้อมูลสมาชิกในระบบ");
        setMssqlData(null);
      }
    } catch (error) {
      console.error("Error checking member code:", error);
      toast.error("เกิดข้อผิดพลาดในการตรวจสอบรหัสสมาชิก");
    } finally {
      setIsChecking(false);
    }
  };

  // ยืนยันสมาชิกเดิม
  const verifyExistingMember = async () => {
    if (!mssqlData) {
      toast.error("กรุณาตรวจสอบรหัสสมาชิกก่อน");
      return;
    }

    try {
      setIsVerifying(true);
      const response = await fetch("/api/admin/verify-existing-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: member.id,
          memberCode: memberCode.trim(),
          companyId: member.company ? member.company.id : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("ยืนยันสมาชิกเดิมสำเร็จ");
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message || "ไม่สามารถยืนยันสมาชิกเดิมได้");
      }
    } catch (error) {
      console.error("Error verifying existing member:", error);
      toast.error("เกิดข้อผิดพลาดในการยืนยันสมาชิกเดิม");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">ยืนยันสมาชิกเดิม</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="memberCode" className="block text-sm font-medium text-gray-700 mb-1">
          รหัสสมาชิก (MEMBER_CODE)
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            id="memberCode"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={memberCode}
            onChange={(e) => setMemberCode(e.target.value)}
            placeholder="ระบุรหัสสมาชิก"
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-300"
            onClick={checkMemberCode}
            disabled={isChecking || !memberCode.trim()}
          >
            {isChecking ? "กำลังตรวจสอบ..." : "ตรวจสอบ"}
          </button>
        </div>
      </div>

      {mssqlData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-2">ข้อมูลสมาชิกจากระบบ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">รหัสสมาชิก:</p>
              <p className="font-medium">{mssqlData.MEMBER_CODE}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ชื่อบริษัท:</p>
              <p className="font-medium">{mssqlData.COMPANY_NAME}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">เลขประจำตัวผู้เสียภาษี:</p>
              <p className="font-medium">{mssqlData.TAX_ID}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ประเภทสมาชิก:</p>
              <p className="font-medium">{mssqlData.MEMBER_TYPE_CODE}</p>
            </div>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-green-300"
              onClick={verifyExistingMember}
              disabled={isVerifying}
            >
              {isVerifying ? "กำลังยืนยัน..." : "ยืนยันสมาชิกเดิม"}
            </button>
            {onClose && (
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                onClick={onClose}
                disabled={isVerifying}
              >
                ยกเลิก
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
