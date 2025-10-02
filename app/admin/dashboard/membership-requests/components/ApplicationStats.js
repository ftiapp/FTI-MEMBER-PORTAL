import React from "react";
import { STATUS } from "../ีutils/constants";

// Accept optional stats prop from backend. Fallback to per-page calc if not provided.
const ApplicationStats = ({ applications, stats, currentStatus = "all", onClickStatus }) => {
  const hasBackendStats = stats && stats.overall;
  const overall = hasBackendStats ? stats.overall : null;

  const pending = hasBackendStats
    ? overall.pending
    : applications.filter((app) => app.status === STATUS.PENDING).length;
  const approved = hasBackendStats
    ? overall.approved
    : applications.filter((app) => app.status === STATUS.APPROVED).length;
  const rejected = hasBackendStats
    ? overall.rejected
    : applications.filter((app) => app.status === STATUS.REJECTED).length;
  const total = hasBackendStats ? overall.total : applications.length;

  const cardBase = "bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-colors";
  const isActive = (k) => currentStatus === k;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div
        className={`${cardBase} ${isActive("all") ? "border-blue-400 ring-2 ring-blue-100" : "border-blue-100 hover:border-blue-200"}`}
        onClick={() => onClickStatus && onClickStatus("all")}
        role="button"
        tabIndex={0}
      >
        <div className="text-sm text-blue-600">ทั้งหมด</div>
        <div className="text-2xl font-bold text-blue-900">{total}</div>
      </div>
      <div
        className={`${cardBase} ${isActive("pending") ? "border-blue-400 ring-2 ring-blue-100" : "border-blue-100 hover:border-blue-200"}`}
        onClick={() => onClickStatus && onClickStatus("pending")}
        role="button"
        tabIndex={0}
      >
        <div className="text-sm text-blue-600">รอพิจารณา</div>
        <div className="text-2xl font-bold text-blue-700">{pending}</div>
      </div>
      <div
        className={`${cardBase} ${isActive("approved") ? "border-blue-400 ring-2 ring-blue-100" : "border-blue-100 hover:border-blue-200"}`}
        onClick={() => onClickStatus && onClickStatus("approved")}
        role="button"
        tabIndex={0}
      >
        <div className="text-sm text-blue-600">อนุมัติแล้ว</div>
        <div className="text-2xl font-bold text-blue-800">{approved}</div>
      </div>
      <div
        className={`${cardBase} ${isActive("rejected") ? "border-blue-400 ring-2 ring-blue-100" : "border-blue-100 hover:border-blue-200"}`}
        onClick={() => onClickStatus && onClickStatus("rejected")}
        role="button"
        tabIndex={0}
      >
        <div className="text-sm text-blue-600">ปฏิเสธแล้ว</div>
        <div className="text-2xl font-bold text-blue-600">{rejected}</div>
      </div>
    </div>
  );
};

export default ApplicationStats;
