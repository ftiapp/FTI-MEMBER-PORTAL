"use client";

export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  startIndex,
  onPageChange,
  language,
}) {
  return (
    <div className="flex items-center justify-between px-2 py-3 bg-gray-50 rounded-md">
      <div className="text-sm text-gray-500">
        {language === "th" ? "แสดง" : "Showing"} {startIndex + 1}-
        {Math.min(startIndex + itemsPerPage, totalItems)}
        {language === "th" ? " จาก " : " of "}
        {totalItems} {language === "th" ? "รายการ" : "items"}
      </div>

      <div className="flex space-x-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100"
          aria-label={language === "th" ? "หน้าแรก" : "First page"}
        >
          &laquo;
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100"
          aria-label={language === "th" ? "หน้าก่อนหน้า" : "Previous page"}
        >
          &lsaquo;
        </button>
        <span className="px-2 py-1 text-sm">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100"
          aria-label={language === "th" ? "หน้าถัดไป" : "Next page"}
        >
          &rsaquo;
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-100"
          aria-label={language === "th" ? "หน้าสุดท้าย" : "Last page"}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
}
