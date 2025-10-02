// Pagination (แบ่งหน้า)
"use client";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center mt-4">
      <nav className="inline-flex -space-x-px">
        <button
          className="px-3 py-1 border rounded-l text-black bg-white hover:bg-gray-100"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ก่อนหน้า
        </button>
        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
          <button
            key={page}
            className={`px-3 py-1 border-t border-b text-black bg-white hover:bg-gray-100 ${page === currentPage ? "font-bold border-blue-500" : ""}`}
            onClick={() => onPageChange(page)}
            disabled={page === currentPage}
          >
            {page}
          </button>
        ))}
        <button
          className="px-3 py-1 border rounded-r text-black bg-white hover:bg-gray-100"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ถัดไป
        </button>
      </nav>
    </div>
  );
}
