"use client";

import React from "react";

function EnhancedPagination({
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / (itemsPerPage || 1)));

  // If there's nothing (or only one page) to paginate, hide the controls
  if (!totalItems || totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    if (typeof onPageChange === "function") {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10) || itemsPerPage;
    if (typeof onItemsPerPageChange === "function") {
      onItemsPerPageChange(value);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("ellipsis-end");
      pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (page === "ellipsis-start" || page === "ellipsis-end") {
        return (
          <span key={page + index} className="px-2 text-gray-400">
            ...
          </span>
        );
      }

      const isActive = page === currentPage;

      return (
        <button
          key={page}
          type="button"
          onClick={() => handlePageChange(page)}
          className={`relative inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150
            ${
              isActive
                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-600">
        แสดง
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="mx-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        รายการต่อหน้า จากทั้งหมด {totalItems} รายการ
      </div>

      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center px-2 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ก่อนหน้า
        </button>

        <div className="flex items-center space-x-1 mx-2">{renderPageNumbers()}</div>

        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center px-2 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}

export default EnhancedPagination;
