"use client";

export default function SuccessModal({
  isOpen,
  title = "สำเร็จ",
  message,
  onClose,
  onGoList,
  confirmText = "กลับไปหน้ารายการ",
  cancelText = "ปิด",
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose?.();
        if (e.key === "Enter") onGoList?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all">
        <div className="px-6 pt-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.91a.75.75 0 1 0-1.22-.88l-3.313 4.588-1.497-1.498a.75.75 0 1 0-1.06 1.06l2.12 2.122a.75.75 0 0 0 1.148-.094l3.882-5.298Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
            {message || "ดำเนินการสำเร็จ"}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 border-t px-6 py-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onGoList}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
