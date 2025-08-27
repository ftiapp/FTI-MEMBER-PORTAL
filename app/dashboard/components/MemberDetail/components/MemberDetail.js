'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import {
  LoadingState,
  ErrorState,
  EmptyState,
  SearchBar,
  FilterSection,
  ApprovedCompaniesTable,
  Pagination,
  MemberDetailView
} from './';

// Import utils
import { formatDate } from './utils';

/**
 * MemberDetail component displays detailed information about an approved member
 * and a table of all approved companies for the current user
 * @param {Object} props Component properties
 * @param {number} props.userId The user ID to fetch member details for
 * @returns {JSX.Element} The MemberDetail component
 */
const MemberDetail = ({ userId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [approvedCompanies, setApprovedCompanies] = useState([]);
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // View state
  const [tableView, setTableView] = useState(true);
  
  // Search and filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 items per page

  // Debounced search term to avoid filtering on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Function to fetch data - memoized with useCallback to prevent unnecessary recreations
  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch approved companies with AbortController for cleanup
      const controller = new AbortController();
      const signal = controller.signal;
      
      const companiesResponse = await fetch(`/api/member/approved-companies?userId=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal
      });

      if (!companiesResponse.ok) {
        throw new Error(`ไม่สามารถดึงข้อมูลบริษัทที่ได้รับการอนุมัติได้ (${companiesResponse.status})`);
      }

      const companiesData = await companiesResponse.json();
      
      if (companiesData && companiesData.companies) {
        setApprovedCompanies(companiesData.companies);
      }
      
      setLoading(false);
      
      return () => controller.abort();
    } catch (err) {
      // Only set error if not an abort error
      if (err.name !== 'AbortError') {
        setError(err.message || 'ไม่สามารถดึงข้อมูลได้');
        setLoading(false);
      }
    }
  }, [userId]);

  // Extract URL parameter checking to a memoized function
  const checkUrlParams = useCallback(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get('view');
      setTableView(viewParam !== 'detail');
    }
  }, []);
  
  useEffect(() => {
    const cleanup = fetchData();
    checkUrlParams();
    
    // Listen for URL changes
    window.addEventListener('popstate', checkUrlParams);
    
    return () => {
      window.removeEventListener('popstate', checkUrlParams);
      // Call cleanup function if it exists
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [fetchData, checkUrlParams]);
  
  // Optimize filtering with memoized date objects and early returns
  const filteredCompanies = useMemo(() => {
    // Early return if no companies
    if (!approvedCompanies.length) return [];
    
    // Prepare date filters once outside the loop
    let filterStartDate, filterEndDate;
    
    if (startDate) {
      filterStartDate = new Date(startDate);
    }
    
    if (endDate) {
      filterEndDate = new Date(endDate);
      filterEndDate.setHours(23, 59, 59, 999); // Set to end of day
    }
    
    // Optimize search term (use debounced and trimmed value)
    const lowerSearchTerm = debouncedSearch.toLowerCase();
    const hasSearchTerm = lowerSearchTerm.length > 0;
    const hasDateFilter = startDate || endDate;
    
    // If no filters are applied, return all companies
    if (!hasSearchTerm && !hasDateFilter) return approvedCompanies;
    
    return approvedCompanies.filter(company => {
      // Skip filtering if company is missing
      if (!company) return false;
      
      // Search by company name or member code (only if search term exists)
      if (hasSearchTerm) {
        const companyName = (company.company_name || '').toLowerCase();
        const memberCode = (company.MEMBER_CODE || '').toString().toLowerCase();
        if (!(companyName.includes(lowerSearchTerm) || memberCode.includes(lowerSearchTerm))) {
          return false;
        }
      }
      
      // Filter by date range (only if date filters exist)
      if (hasDateFilter && company.updated_at) {
        const companyDate = new Date(company.updated_at);
        
        if (filterStartDate && companyDate < filterStartDate) {
          return false;
        }
        
        if (filterEndDate && companyDate > filterEndDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [approvedCompanies, debouncedSearch, startDate, endDate]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  
  // Memoized pagination handler
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  }, [totalPages]);
  
  // Memoized reset filters function
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  }, []);

  // Memoized retry handler
  const handleRetry = useCallback(() => {
    if (userId) {
      setError(null);
      fetchData();
    }
  }, [userId, fetchData]);
  
  // Memoized view toggle function
  const toggleView = useCallback(() => {
    const newView = !tableView;
    setTableView(newView);
    
    // Update URL with view parameter
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('tab', 'member');
    
    if (!newView) {
      searchParams.set('view', 'detail');
    } else {
      searchParams.delete('view');
    }
    
    // Update URL without scrolling to top
    router.push(`/dashboard?${searchParams.toString()}`, { scroll: false });
  }, [tableView, router]);

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  // Empty state
  if (approvedCompanies.length === 0) {
    return <EmptyState />;
  }

  // Render table view or detail view based on state
  return (
    <motion.div 
      className="bg-white shadow rounded-lg p-6 mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Optimize AnimatePresence by using it only when necessary */}
      <AnimatePresence mode="wait" initial={false}>
        {tableView ? (
          <motion.div
            key="table-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FilterSection 
              showFilters={showFilters}
              toggleFilters={() => setShowFilters(!showFilters)}
              startDate={startDate}
              onStartDateChange={(value) => {
                setStartDate(value);
                setCurrentPage(1);
              }}
              endDate={endDate}
              onEndDateChange={(value) => {
                setEndDate(value);
                setCurrentPage(1);
              }}
              resetFilters={resetFilters}
            />
            
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
              }}
            />
            
            <ApprovedCompaniesTable 
              companies={currentItems} 
              formatDate={formatDate}
            />
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCompanies.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </motion.div>
        ) : (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MemberDetailView 
              memberData={memberData || approvedCompanies[0]} 
              onToggleView={toggleView} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MemberDetail;
