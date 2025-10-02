import React from "react";

const RejectModal = ({
  isOpen,
  onClose,
  rejectionReason,
  onReasonChange,
  onConfirm,
  isSubmitting,
  recipientEmail,
  recipientName,
  recipientLoading,
  companyName,
  taxId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />
      <div className="relative mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-start gap-3 border-b border-gray-100 px-6 py-5">
          <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100">
            {/* Warning icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path
                fillRule="evenodd"
                d="M9.401 1.737a2.25 2.25 0 0 1 3.198 0l9.664 9.664c.879.879.879 2.303 0 3.182l-9.664 9.664a2.25 2.25 0 0 1-3.198 0L.737 14.583a2.25 2.25 0 0 1 0-3.182l8.664-8.664ZM12 7.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 1 0 1.5 0V8.25A.75.75 0 0 0 12 7.5Zm0 9a.875.875 0 1 0 0 1.75.875.875 0 0 0 0-1.75Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">ยืนยันการปฏิเสธการสมัครสมาชิก</h3>
            <p className="mt-1 text-sm text-gray-600">
              ตรวจสอบข้อมูลให้ครบถ้วนก่อนดำเนินการ ระบบจะส่งอีเมลแจ้งผลไปยังผู้สมัคร
            </p>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Applicant summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="truncate">
                <span className="text-gray-500">ชื่อบริษัท/ผู้ยื่น:</span>{" "}
                <span className="font-medium">{companyName || "-"}</span>
              </div>
              <div className="truncate">
                <span className="text-gray-500">TAX ID/เลขบัตร:</span>{" "}
                <span className="font-medium">{taxId || "-"}</span>
              </div>
            </div>
          </div>

          {/* Email preview */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="mb-1 font-medium">อีเมลที่จะได้รับการแจ้ง</div>
            {recipientLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-40 animate-pulse rounded bg-amber-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-amber-200" />
              </div>
            ) : (
              <div className="truncate">
                <span className="font-medium">{recipientEmail || "-"}</span>{" "}
                {recipientName && <span className="text-amber-900/80">({recipientName})</span>}
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700">
              เหตุผลในการปฏิเสธ
            </label>
            <textarea
              id="reject-reason"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white/80 p-3 text-sm shadow-inner placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
              rows={4}
              placeholder="โปรดระบุเหตุผลในการปฏิเสธ เช่น เอกสารไม่ครบถ้วน หรือข้อมูลไม่ถูกต้อง"
              value={rejectionReason}
              onChange={(e) => onReasonChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-60"
            disabled={isSubmitting}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
            disabled={isSubmitting || !rejectionReason.trim()}
          >
            {isSubmitting ? "กำลังปฏิเสธและส่งอีเมล..." : "ยืนยันการปฏิเสธ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
