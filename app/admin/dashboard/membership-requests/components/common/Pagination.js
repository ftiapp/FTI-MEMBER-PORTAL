import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-blue-50 border-t border-blue-100">
      <div className="text-sm text-blue-700">
        หน้า {currentPage} จาก {totalPages}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 text-sm rounded ${
            currentPage === 1
              ? "bg-blue-100 text-blue-400 cursor-not-allowed"
              : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
          }`}
        >
          ก่อนหน้า
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 text-sm rounded ${
            currentPage === totalPages
              ? "bg-blue-100 text-blue-400 cursor-not-allowed"
              : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
          }`}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default Pagination;
