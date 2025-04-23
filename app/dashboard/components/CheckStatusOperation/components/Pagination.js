import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t border-gray-200">
      <button 
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))} 
        disabled={currentPage === 1}
        className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-700 hover:bg-blue-100 active:bg-blue-200'} transition-colors`}
        aria-label="Previous page"
      >
        <FaChevronLeft size={16} />
      </button>
      
      <div className="flex space-x-2">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          
          // Always show first, last, current, and pages around current
          if (
            pageNumber === 1 || 
            pageNumber === totalPages || 
            pageNumber === currentPage || 
            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`w-8 h-8 rounded-md font-medium ${
                  currentPage === pageNumber 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                } transition-colors`}
              >
                {pageNumber}
              </button>
            );
          }
          
          // Show ellipsis for gaps (only once per gap)
          if (
            (pageNumber === currentPage - 2 && pageNumber > 2) || 
            (pageNumber === currentPage + 2 && pageNumber < totalPages - 1)
          ) {
            return <span key={pageNumber} className="w-8 text-center">...</span>;
          }
          
          // Hide other page numbers
          return null;
        })}
      </div>
      
      <button 
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} 
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-700 hover:bg-blue-100 active:bg-blue-200'} transition-colors`}
        aria-label="Next page"
      >
        <FaChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;