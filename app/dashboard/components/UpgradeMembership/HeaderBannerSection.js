import React from "react";

export default function HeaderBannerSection({ memberCount }) {
  return (
    <>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          สมาชิกสภาอุตสาหกรรม
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          เลือกประเภทสมาชิกที่เหมาะสมกับองค์กรของคุณ
        </p>
      </div>

      {/* Preface Banner */}
      <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-blue-600 font-semibold text-base sm:text-lg mb-2">
              พร้อมที่จะเริ่มต้นแล้วหรือยัง?
            </p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              สมาชิก ส.อ.ท.
            </h3>
            <div className="flex items-end space-x-2 sm:space-x-3 mb-3">
              <span className="text-red-600 font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-none">
                {memberCount.toLocaleString("th-TH")}
              </span>
              <span className="text-gray-500 text-base sm:text-lg mb-1">ราย</span>
            </div>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              มาร่วมเป็นส่วนหนึ่งในการขับเคลื่อนอุตสาหกรรมไทย
              พร้อมรับสิทธิประโยชน์ให้ธุรกิจไปได้ไกลยิ่งขึ้น
            </p>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="w-full max-w-sm">
              <svg viewBox="0 0 120 60" className="w-full h-24 sm:h-32">
                <line x1="5" y1="55" x2="115" y2="55" stroke="#93c5fd" strokeWidth="1" />
                <line x1="5" y1="55" x2="5" y2="5" stroke="#93c5fd" strokeWidth="1" />
                <path
                  d="M5 50 L20 48 L35 45 L50 40 L65 42 L80 35 L95 28 L110 15"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-dash"
                  style={{ strokeDasharray: 200, strokeDashoffset: 0 }}
                />
                <circle cx="50" cy="40" r="2.5" fill="#2563eb" />
                <circle cx="80" cy="35" r="2.5" fill="#2563eb" />
                <circle cx="110" cy="15" r="3" fill="#ef4444" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
