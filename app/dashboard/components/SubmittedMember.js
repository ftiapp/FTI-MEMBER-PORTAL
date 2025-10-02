"use client";

import React from "react";

/**
 * SubmittedMember component
 *
 * This component displays a confirmation message to the user after they have submitted
 * their verification information. It informs them that their submission is being reviewed
 * and they will be notified via email when the verification process is complete.
 *
 * @returns {JSX.Element} The SubmittedMember component
 */
export default function SubmittedMember() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">ยืนยันตัวตนสมาชิกเดิม</h2>

      <div className="bg-blue-50 rounded-xl shadow-md p-6 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800">
          ขอขอบคุณที่ท่านส่งข้อมูลในการยืนยันตัวตน
        </h3>
        <p className="mt-2 text-sm text-blue-700">การยืนยันตัวตนสมาชิกเดิมอยู่ระหว่างการตรวจสอบ</p>
        <p className="mt-2 text-sm text-blue-700">
          ขอบคุณที่ทำการยืนยันตัวตน เจ้าหน้าที่กำลังตรวจสอบข้อมูลของท่าน เมื่อการตรวจสอบเสร็จสิ้น
          ท่านจะได้รับการแจ้งเตือนทางอีเมล
        </p>
      </div>
    </div>
  );
}
