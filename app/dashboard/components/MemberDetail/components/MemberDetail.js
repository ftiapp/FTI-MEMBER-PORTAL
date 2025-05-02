'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const itemsPerPage = 10; // Increased from 5 to 10 for better viewing experience

  // Function to fetch data - defined outside useEffect so it can be called from handleRetry
  const fetchData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching data for userId:', userId);
      
      // Fetch approved companies
      const companiesResponse = await fetch(`/api/member/approved-companies?userId=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
      });

      if (!companiesResponse.ok) {
        console.error('API response not OK:', companiesResponse.status, companiesResponse.statusText);
        throw new Error(`ไม่สามารถดึงข้อมูลบริษัทที่ได้รับการอนุมัติได้ (${companiesResponse.status})`);
      }

      const companiesData = await companiesResponse.json();
      console.log('Approved companies data received:', companiesData);
      
      if (companiesData && companiesData.companies) {
        setApprovedCompanies(companiesData.companies);
      }
      
      // Fetch member details (if needed in the future)
      // Here you would fetch member data and set it with setMemberData
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'ไม่สามารถดึงข้อมูลได้');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Check URL parameters for view mode
    const checkUrlParams = () => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const viewParam = searchParams.get('view');
        
        if (viewParam === 'detail') {
          setTableView(false);
        } else {
          setTableView(true);
        }
      }
    };
    
    checkUrlParams();
    
    // Listen for URL changes
    window.addEventListener('popstate', checkUrlParams);
    
    return () => {
      window.removeEventListener('popstate', checkUrlParams);
    };
  }, [userId]);
  
  // Filter companies based on search and filters
  const filteredCompanies = useMemo(() => {
    return approvedCompanies.filter(company => {
      // Search by company name
      const matchesSearch = company.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by date range
      let matchesDateRange = true;
      if (startDate && endDate) {
        const companyDate = new Date(company.updated_at);
        const filterStartDate = new Date(startDate);
        const filterEndDate = new Date(endDate);
        filterEndDate.setHours(23, 59, 59, 999); // Set to end of day
        
        matchesDateRange = companyDate >= filterStartDate && companyDate <= filterEndDate;
      } else if (startDate) {
        const companyDate = new Date(company.updated_at);
        const filterStartDate = new Date(startDate);
        matchesDateRange = companyDate >= filterStartDate;
      } else if (endDate) {
        const companyDate = new Date(company.updated_at);
        const filterEndDate = new Date(endDate);
        filterEndDate.setHours(23, 59, 59, 999); // Set to end of day
        matchesDateRange = companyDate <= filterEndDate;
      }
      
      return matchesSearch && matchesDateRange;
    });
  }, [approvedCompanies, searchTerm, startDate, endDate]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Handle retry when loading failed
  const handleRetry = () => {
    if (userId) {
      setError(null);
      setLoading(true);
      fetchData();
    }
  };
  
  // Toggle between table view and detail view
  const toggleView = () => {
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
    
    // Use shallow routing to update URL without full page reload
    router.push(`/dashboard?${searchParams.toString()}`, undefined, { shallow: true });
  };

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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      layout
    >
      <AnimatePresence mode="wait">
        {tableView ? (
          <motion.div
            key="table-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
            transition={{ duration: 0.3 }}
          >
            <MemberDetailView 
              memberData={memberData || approvedCompanies[0]} 
              onToggleView={toggleView} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add global animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        button:active {
          transform: translateY(1px);
        }
      `}</style>
    </motion.div>
  );
};

export default MemberDetail;