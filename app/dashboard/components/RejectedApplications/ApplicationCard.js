"use client";

import { useRouter } from "next/navigation";

export default function ApplicationCard({ app, getIdentifierLabel, getMembershipTypeLabel, getThaiAbbrev, formatDate }) {
  const router = useRouter();

  const handleViewApplication = () => {
    if (!app.type || !app.id) return;

    // ทุกประเภทสมาชิกให้ใช้หน้าแก้ไขใบสมัครเวอร์ชัน v4 ตามชนิดสมาชิก
    router.push(`/membership/${app.type}/edit-v4/${app.id}`);
  };

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1">
          {/* เลขประจำตัวไว้ด้านบนสุด */}
          <div className="mb-3">
            {/* ชื่อ/บริษัท เป็นหัวข้อหลัก */}
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              {app.name || app.companyName || "ไม่ระบุชื่อ"}
            </h4>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-semibold">{getIdentifierLabel(app.type)}:</span>
              <span className="ml-1 font-mono">{app.identifier || "ไม่ระบุ"}</span>
            </div>
          </div>

          {/* ข้อมูลประเภทสมาชิก */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full flex-shrink-0">
              <span className="text-sm font-bold text-red-600">{getThaiAbbrev(app.type)}</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-lg">{getMembershipTypeLabel(app.type)}</h4>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">สถานะ: {app.statusLabel}</p>
                {app.status === "pending_review" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    ตรวจสอบ
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* วันที่และข้อมูลอื่นๆ */}
          <div className="md:ml-11 mt-3 md:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500">
              <p className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                ปฏิเสธเมื่อ: {formatDate(app.rejectedAt)}
              </p>
              <p className="flex items-center">
                <svg
                  className="w-3 h-3 mr-1 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {app.conversationCount} การสนทนา
              </p>
              {app.resubmissionCount > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  ครั้งที่ {app.resubmissionCount}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 md:ml-4 w-full md:w-auto">
          <button
            onClick={handleViewApplication}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-sm"
          >
            ดูรายละเอียด
          </button>

          {/* แสดงสถานะ */}
          <div className="w-full md:w-28">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span className="font-medium">สถานะ</span>
              <span
                className={`font-bold ${
                  app.status === "pending_review"
                    ? "text-orange-600"
                    : app.status === "pending_fix"
                      ? "text-red-600"
                      : app.status === "resolved"
                        ? "text-green-600"
                        : "text-gray-600"
                }`}
              >
                {app.statusLabel}
              </span>
            </div>
            <div
              className={`w-full rounded-full h-2 ${
                app.status === "pending_review"
                  ? "bg-orange-200"
                  : app.status === "pending_fix"
                    ? "bg-red-200"
                    : app.status === "resolved"
                      ? "bg-green-200"
                      : "bg-gray-200"
              }`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                  app.status === "pending_review"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600"
                    : app.status === "pending_fix"
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : app.status === "resolved"
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : "bg-gradient-to-r from-gray-500 to-gray-600"
                }`}
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
