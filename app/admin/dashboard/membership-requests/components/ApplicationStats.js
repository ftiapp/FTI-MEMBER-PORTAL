import React from "react";
import { STATUS } from "../ีutils/constants";

// ใช้ตัวเลขจาก backend stats เท่านั้น เพื่อให้ยอดบนการ์ดนิ่งและไม่เปลี่ยนตามรายการในหน้านั้น
// ถ้า backend ยังไม่ส่ง stats มา ให้แสดง 0 ชั่วคราว (ไม่ fallback ไปนับจาก applications อีกต่อไป)
const ApplicationStats = ({ applications, stats, currentStatus = "all", onClickStatus }) => {
  const hasBackendStats = Boolean(stats && stats.overall);
  const overall = hasBackendStats
    ? stats.overall
    : { pending: 0, approved: 0, rejected: 0, resubmitted: 0, total: 0 };

  const pending = overall.pending;
  const approved = overall.approved;
  const rejected = overall.rejected;
  const resubmitted = overall.resubmitted ?? overall.pending_review ?? 0;
  const total = overall.total;

  const cardBase =
    "bg-white p-3 sm:p-4 rounded-lg shadow-sm border cursor-pointer transition-colors";
  const isActive = (k) => currentStatus === k;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div
        className={`${cardBase} ${isActive("all") ? "border-blue-400 ring-2 ring-blue-100" : "border-blue-100 hover:border-blue-200"}`}
        onClick={() => onClickStatus && onClickStatus("all")}
        role="button"
        tabIndex={0}
      >
        <div className="text-xs sm:text-sm text-blue-600">ทั้งหมด</div>
        <div className="text-xl sm:text-2xl font-bold text-blue-900">{total}</div>
      </div>
      <div
        className={`${cardBase} ${isActive("pending") ? "border-blue-400 ring-2 ring-blue-100" : "border-blue-100 hover:border-blue-200"}`}
        onClick={() => onClickStatus && onClickStatus("pending")}
        role="button"
        tabIndex={0}
      >
        <div className="text-xs sm:text-sm text-blue-600">รอพิจารณา</div>
        <div className="text-xl sm:text-2xl font-bold text-blue-700">{pending}</div>
      </div>
      <div
        className={`${cardBase} ${isActive("approved") ? "border-blue-400 ring-2 ring-blue-100" : "border-blue-100 hover:border-blue-200"}`}
        onClick={() => onClickStatus && onClickStatus("approved")}
        role="button"
        tabIndex={0}
      >
        <div className="text-xs sm:text-sm text-blue-600">อนุมัติแล้ว</div>
        <div className="text-xl sm:text-2xl font-bold text-blue-800">{approved}</div>
      </div>
      <div
        className={`${cardBase} ${isActive("rejected") ? "border-blue-400 ring-2 ring-blue-100" : "border-blue-100 hover:border-blue-200"}`}
        onClick={() => onClickStatus && onClickStatus("rejected")}
        role="button"
        tabIndex={0}
      >
        <div className="text-xs sm:text-sm text-blue-600">ปฏิเสธแล้ว</div>
        <div className="text-xl sm:text-2xl font-bold text-blue-600">{rejected}</div>
      </div>
      <div
        className={`${cardBase} ${isActive("resubmitted") ? "border-purple-400 ring-2 ring-purple-100" : "border-blue-100 hover:border-blue-200"}`}
        onClick={() => onClickStatus && onClickStatus("resubmitted")}
        role="button"
        tabIndex={0}
      >
        <div className="text-xs sm:text-sm text-purple-700">แก้ไขแล้ว (รอตรวจสอบ)</div>
        <div className="text-xl sm:text-2xl font-bold text-purple-800">{resubmitted}</div>
      </div>
    </div>
  );
};

export default ApplicationStats;
