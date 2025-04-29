'use client';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Pagination component for navigating through pages of results
 * @param {Object} props Component properties
 * @param {number} props.currentPage Current page number
 * @param {number} props.totalPages Total number of pages
 * @param {number} props.totalItems Total number of items
 * @param {number} props.itemsPerPage Number of items per page
 * @param {Function} props.onPageChange Callback for page changes
 */
export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange
}) {
  // Calculate display ranges
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  if (totalItems === 0) return null;
  
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          ก่อนหน้า
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          ถัดไป
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            แสดง <span className="font-medium">{indexOfFirstItem}</span> ถึง <span className="font-medium">{indexOfLastItem}</span> จาก <span className="font-medium">{totalItems}</span> รายการ
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span className="sr-only">หน้าแรก</span>
              <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {/* Page numbers */}
            {[...Array(totalPages).keys()].map(number => {
              const pageNumber = number + 1;
              // Show current page, first page, last page, and pages around current page
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border ${currentPage === pageNumber ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                // Show ellipsis for page gaps
                return (
                  <span
                    key={pageNumber}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
            
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span className="sr-only">หน้าสุดท้าย</span>
              <FaChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}