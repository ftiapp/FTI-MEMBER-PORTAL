import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [pageInput, setPageInput] = useState(currentPage);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Update pageInput when currentPage changes externally
  useEffect(() => {
    setPageInput(currentPage);
  }, [currentPage]);
  
  // Update URL when page changes
  const handlePageChange = (page) => {
    // Create a new URLSearchParams object from the current search params
    const params = new URLSearchParams(searchParams.toString());
    
    // Set the page parameter
    params.set('page', page);
    
    // Keep the tab parameter if it exists
    if (!params.has('tab') && searchParams.has('tab')) {
      params.set('tab', searchParams.get('tab'));
    }
    
    // Update the URL
    router.push(`/dashboard?${params.toString()}`);
    
    // Call the original onPageChange function
    onPageChange(page);
  };
  
  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };
  
  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
    } else {
      setPageInput(currentPage);
    }
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t border-gray-200">
      <button 
        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} 
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
                onClick={() => handlePageChange(pageNumber)}
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
        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))} 
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-700 hover:bg-blue-100 active:bg-blue-200'} transition-colors`}
        aria-label="Next page"
      >
        <FaChevronRight size={16} />
      </button>
      
      {/* Page input form */}
      <form onSubmit={handlePageInputSubmit} className="ml-2 flex items-center">
        <span className="text-xs text-gray-700 mr-1">ไปที่:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          onChange={handlePageInputChange}
          className="w-10 h-7 rounded-md border border-gray-300 text-center text-xs focus:ring-blue-500 focus:border-blue-500"
          aria-label="ไปที่หน้า"
        />
        <button
          type="submit"
          className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1"
        >
          ไป
        </button>
      </form>
    </div>
  );
};

export default Pagination;