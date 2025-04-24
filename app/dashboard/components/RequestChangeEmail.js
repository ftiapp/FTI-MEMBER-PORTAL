"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function RequestChangeEmail({ userEmail }) {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/request-change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย");
        setRequested(true);
        setCooldown(60); // 60s cooldown (frontend only)
        let timer = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
        // redirect ไปหน้ากรอก OTP
        setTimeout(() => {
          window.location.href = "/dashboard/verify-change-email";
        }, 1000);
      } else {
        toast.error(data.error || "คุณขอเปลี่ยนอีเมลได้ 1 ครั้งใน 7 วัน");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการส่ง OTP");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="mb-2 text-gray-700">อีเมลปัจจุบัน: <b>{userEmail}</b></div>
      <button
        onClick={handleRequest}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        disabled={loading || cooldown > 0}
      >
        {loading ? "กำลังส่ง..." : cooldown > 0 ? `ขอใหม่ได้ใน ${cooldown}s` : "แจ้งเปลี่ยนอีเมล"}
      </button>
      {requested && <div className="mt-2 text-green-600">ส่ง OTP ไปที่อีเมลของคุณแล้ว</div>}
    </div>
  );
}
