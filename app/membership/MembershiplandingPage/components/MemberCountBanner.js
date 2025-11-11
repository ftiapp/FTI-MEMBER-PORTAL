"use client";

import { useState, useEffect } from "react";

export default function MemberCountBanner() {
  const [memberCount, setMemberCount] = useState(0);

  // Animated counter for member count
  useEffect(() => {
    const target = 16000;
    const duration = 1500;
    const start = performance.now();
    let rafId;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setMemberCount(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl bg-white shadow mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left: question and copy */}
        <div className="p-6 md:p-8">
          <p className="text-blue-600 font-semibold text-lg mb-2">
            พร้อมที่จะเริ่มต้นแล้วหรือยัง?
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">สมาชิก ส.อ.ท.</h3>
          <div className="flex items-end space-x-3 mb-3">
            <span className="text-red-600 font-extrabold text-4xl md:text-5xl leading-none">
              {memberCount.toLocaleString("th-TH")}
            </span>
            <span className="text-red-500 mb-1">ราย</span>
          </div>
          <p className="text-gray-700">
            มาร่วมเป็นส่วนหนึ่งในการขับเคลื่อน อุตสาหกรรมไทย พร้อมรับสิทธิประโยชน์
          </p>
          <p className="text-gray-700">ให้ธุรกิจไปได้ไกลยิ่งขึ้น</p>
        </div>
        {/* Right: tiny upward graph with animation */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <svg viewBox="0 0 120 60" className="w-full h-32">
              {/* axes */}
              <line x1="5" y1="55" x2="115" y2="55" stroke="#93c5fd" strokeWidth="1" />
              <line x1="5" y1="55" x2="5" y2="5" stroke="#93c5fd" strokeWidth="1" />
              {/* sparkline path */}
              <path
                d="M5 50 L20 48 L35 45 L50 40 L65 42 L80 35 L95 28 L110 15"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-dash"
                style={{ strokeDasharray: 200, strokeDashoffset: 0 }}
              />
              {/* dots */}
              <circle cx="50" cy="40" r="2.5" fill="#2563eb" />
              <circle cx="80" cy="35" r="2.5" fill="#2563eb" />
              <circle cx="110" cy="15" r="3" fill="#ef4444" />
            </svg>
          </div>
        </div>
      </div>

      {/* styled-jsx animation */}
      <style jsx>{`
        @keyframes dash {
          0% {
            stroke-dashoffset: 220;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .animate-dash {
          animation: dash 2s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}