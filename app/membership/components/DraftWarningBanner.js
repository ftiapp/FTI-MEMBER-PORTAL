"use client";

import { AlertTriangle, XCircle, Info } from "lucide-react";

/**
 * Component สำหรับแสดง warning banner เมื่อ tax_id/id_card มีอยู่ในระบบแล้ว
 * @param {Object} props
 * @param {string} props.warning - ข้อความ warning
 * @param {string} props.warningType - ประเภท warning: "pending" | "approved" | "info"
 * @param {Function} props.onClose - Callback เมื่อปิด banner
 */
export default function DraftWarningBanner({ warning, warningType = "info", onClose }) {
  if (!warning) return null;

  const styles = {
    pending: {
      bg: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-600",
      Icon: AlertTriangle,
    },
    approved: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-800",
      icon: "text-red-600",
      Icon: XCircle,
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-600",
      Icon: Info,
    },
  };

  const style = styles[warningType] || styles.info;
  const IconComponent = style.Icon;

  return (
    <div
      className={`${style.bg} border-2 rounded-lg p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <IconComponent className={`${style.icon} w-6 h-6 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`${style.text} font-semibold text-base mb-1`}>
            {warningType === "approved" && "⚠️ หมายเลขนี้เป็นสมาชิกแล้ว"}
            {warningType === "pending" && "⏳ หมายเลขนี้อยู่ระหว่างการพิจารณา"}
            {warningType === "info" && "ℹ️ ข้อมูลสำคัญ"}
          </h3>
          <p className={`${style.text} text-sm leading-relaxed`}>{warning}</p>
          <div className="mt-3 flex gap-3">
            <a
              href="/contact"
              className={`${style.text} text-sm font-medium underline hover:no-underline`}
            >
              ติดต่อเจ้าหน้าที่
            </a>
            <a
              href="/dashboard"
              className={`${style.text} text-sm font-medium underline hover:no-underline`}
            >
              กลับหน้าแรก
            </a>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${style.text} hover:opacity-70 transition-opacity`}
            aria-label="ปิด"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
