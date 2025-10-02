"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

export default function VerifyOTP({
  userId,
  onSuccess,
  onBack,
  title,
  description,
  isNewEmail = false,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [status, setStatus] = useState("idle"); // idle, verifying, success, error
  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef());

  useEffect(() => {
    // Focus on first input when component mounts
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }

    // Timer for OTP expiration
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (index, value) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if current input is filled
    if (value && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // If pasted data is a 6-digit number, fill all inputs
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);

      // Focus the last input
      if (inputRefs[5].current) {
        inputRefs[5].current.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");
    if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
      toast.error("กรุณากรอกรหัส OTP 6 หลักให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    setStatus("verifying");

    try {
      // เลือกใช้ endpoint ที่ถูกต้องตาม prop isNewEmail
      const endpoint = isNewEmail
        ? "/api/user/verify-new-email-otp"
        : "/api/user/verify-change-email-otp";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otpValue,
          userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        toast.success("ยืนยัน OTP สำเร็จ");

        // ส่งข้อมูลกลับไปยัง parent component เพื่อไปยังขั้นตอนถัดไป
        setTimeout(() => {
          onSuccess(data);
        }, 1500);
      } else {
        setStatus("error");
        toast.error(data.error || "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว");
      }
    } catch (error) {
      setStatus("error");
      toast.error("เกิดข้อผิดพลาดในการยืนยัน OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="bg-white rounded-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {title || "ขั้นตอนที่ 2: ยืนยันรหัส OTP"}
        </h2>
        <p className="text-gray-600">
          {description || "กรุณากรอกรหัส OTP 6 หลักที่ส่งไปยังอีเมลของท่าน"}
        </p>
        {timeLeft > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            รหัสจะหมดอายุใน: <span className="font-medium">{formatTime(timeLeft)}</span>
          </p>
        )}
        {timeLeft === 0 && (
          <p className="text-sm text-red-500 mt-2">รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-xl font-semibold border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting || timeLeft === 0}
            />
          ))}
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            disabled={isSubmitting}
          >
            ย้อนกลับ
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || timeLeft === 0}
          >
            {isSubmitting ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          ไม่ได้รับรหัส OTP?{" "}
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 underline"
            disabled={isSubmitting}
          >
            ขอรหัสใหม่
          </button>
        </p>
      </div>
    </div>
  );
}
