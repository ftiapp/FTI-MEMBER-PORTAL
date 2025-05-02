'use client';

import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Pagination component for navigating through multiple pages of data
 * @param {Object} props Component properties
 * @param {number} props.currentPage Current active page number
 * @param {number} props.totalPages Total number of pages
 * @param {number} props.totalItems Total number of items across all pages
 * @param {number} props.itemsPerPage Number of items shown per page
 * @param {Function} props.onPageChange Callback for page change
 * @returns {JSX.Element|null} The pagination UI or null if no items exist
 */
const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  if (totalItems <= 0) return null;
  
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <motion.div 
      className="mt-4 flex items-center justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex-1 flex justify-between sm:hidden">
        <motion.button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          whileHover={currentPage !== 1 ? { scale: 1.05, backgroundColor: "#f9fafb" } : {}}
          whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
        >
          ก่อนหน้า
        </motion.button>
        <motion.button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          whileHover={currentPage !== totalPages ? { scale: 1.05, backgroundColor: "#f9fafb" } : {}}
          whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
        >
          ถัดไป
        </motion.button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-sm text-gray-700">
            แสดง <span className="font-medium">{indexOfFirstItem}</span> ถึง <span className="font-medium">{indexOfLastItem}</span> จาก <span className="font-medium">{totalItems}</span> รายการ
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <motion.button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
              whileHover={currentPage !== 1 ? { scale: 1.1, backgroundColor: "#f9fafb" } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.9 } : {}}
            >
              <span className="sr-only">หน้าแรก</span>
              <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
            </motion.button>
            
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
                  <motion.button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border ${currentPage === pageNumber ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                    whileHover={currentPage !== pageNumber ? { scale: 1.1, backgroundColor: "#f9fafb" } : {}}
                    whileTap={{ scale: 0.9 }}
                    initial={currentPage === pageNumber ? { scale: 1.1 } : { scale: 1 }}
                    animate={currentPage === pageNumber ? 
                      { scale: 1, backgroundColor: "#eff6ff", borderColor: "#3b82f6" } : 
                      { scale: 1 }
                    }
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {pageNumber}
                  </motion.button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                // Show ellipsis for page gaps
                return (
                  <motion.span
                    key={pageNumber}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    ...
                  </motion.span>
                );
              }
              return null;
            })}
            
            <motion.button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
              whileHover={currentPage !== totalPages ? { scale: 1.1, backgroundColor: "#f9fafb" } : {}}
              whileTap={currentPage !== totalPages ? { scale: 0.9 } : {}}
            >
              <span className="sr-only">หน้าสุดท้าย</span>
              <FaChevronRight className="h-5 w-5" aria-hidden="true" />
            </motion.button>
          </nav>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Pagination;