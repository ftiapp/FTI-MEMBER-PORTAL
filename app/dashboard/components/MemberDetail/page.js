'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaIdCard, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaFileAlt, 
  FaIdBadge, 
  FaRegAddressCard, 
  FaDownload,
  FaEye,
  FaSpinner,
  FaExclamationCircle,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTable
} from 'react-icons/fa';

/**
 * MemberDetail component displays detailed information about an approved member
 * and a table of all approved companies for the current user
 * @param {Object} props Component properties
 * @param {number} props.userId The user ID to fetch member details for
 */
export default function MemberDetail({ userId }) {
  const { user } = useAuth();
  const [approvedCompanies, setApprovedCompanies] = useState([]);
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // View state
  const [tableView, setTableView] = useState(true);
  
  // Search and filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [companyTypeFilter, setCompanyTypeFilter] = useState('');
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
  }, [userId]);
  
  // Filter companies based on search and filters
  const filteredCompanies = useMemo(() => {
    return approvedCompanies.filter(company => {
      // Search by company name
      const matchesSearch = company.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by company type
      const matchesType = !companyTypeFilter || company.company_type === companyTypeFilter;
      
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
      
      return matchesSearch && matchesType && matchesDateRange;
    });
  }, [approvedCompanies, searchTerm, companyTypeFilter, startDate, endDate]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  
  // Get unique company types for filter dropdown
  const companyTypes = useMemo(() => {
    const types = approvedCompanies.map(company => company.company_type).filter(Boolean);
    return [...new Set(types)];
  }, [approvedCompanies]);
  
  // Handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setCompanyTypeFilter('');
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
    setTableView(!tableView);
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear() + 543; // Convert to Buddhist Era (BE)
    return `${day}/${month}/${year}`;
  };

  // Component definitions
  // LoadingState component
  const LoadingState = () => (
    <motion.div 
      className="bg-white shadow rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="py-16 flex flex-col items-center justify-center text-gray-600">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <FaSpinner className="text-blue-600 mb-3" size={28} />
        </motion.div>
        <motion.p 
          className="font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          กำลังโหลดข้อมูล...
        </motion.p>
      </div>
    </motion.div>
  );

  // ErrorState component
  const ErrorState = ({ message, onRetry }) => (
    <motion.div 
      className="bg-white shadow rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-red-200 rounded-lg">
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <FaExclamationCircle className="text-red-500 mb-3" size={28} />
        </motion.div>
        <motion.p 
          className="font-medium mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}
        </motion.p>
        <motion.button 
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          ลองใหม่อีกครั้ง
        </motion.button>
      </div>
    </motion.div>
  );

  // EmptyState component
  const EmptyState = () => (
    <motion.div 
      className="bg-white shadow rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-gray-200 rounded-lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FaExclamationCircle className="text-gray-400 mb-3" size={28} />
        </motion.div>
        <motion.p 
          className="font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          ไม่พบข้อมูลบริษัทที่ได้รับการอนุมัติ
        </motion.p>
      </div>
    </motion.div>
  );

  // SearchBar component
  const SearchBar = ({ searchTerm, onSearchChange }) => (
    <motion.div 
      className="mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FaSearch className="h-5 w-5 text-gray-400" />
          </motion.div>
        </div>
        <motion.input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="ค้นหาชื่อบริษัท..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
          initial={{ width: "95%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );

  // FilterSection component
  const FilterSection = ({ 
    showFilters, 
    toggleFilters, 
    companyTypeFilter, 
    onCompanyTypeChange, 
    companyTypes, 
    startDate, 
    onStartDateChange, 
    endDate, 
    onEndDateChange, 
    resetFilters 
  }) => (
    <motion.div 
      className="mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <motion.h2 
            className="text-xl font-semibold text-blue-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            รายการบริษัทที่ได้รับการอนุมัติ
          </motion.h2>
          <motion.p
            className="text-xs text-gray-600 mt-1"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            แสดงรายการบริษัทที่ได้รับการอนุมัติจากสภาอุตสาหกรรมแห่งประเทศไทย คุณสามารถค้นหาและกรองข้อมูลได้ตามต้องการ
          </motion.p>
        </div>
        <motion.button
          onClick={toggleFilters}
          className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          whileHover={{ scale: 1.05, backgroundColor: "#dbeafe" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FaFilter className="mr-1" size={14} />
          <span>{showFilters ? 'ซ่อนตัวกรอง' : 'ตัวกรอง'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="mb-4 p-4 bg-gray-50 rounded-lg"
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto", overflow: "visible" }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Company Type Filter */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="companyType" className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภทบริษัท
                </label>
                <motion.select
                  id="companyType"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={companyTypeFilter}
                  onChange={(e) => onCompanyTypeChange(e.target.value)}
                  whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                >
                  <option value="">ทั้งหมด</option>
                  {companyTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </motion.select>
              </motion.div>
              
              {/* Start Date Filter */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่อนุมัติ (จาก)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <motion.input
                    type="date"
                    id="startDate"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                  />
                </div>
              </motion.div>
              
              {/* End Date Filter */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่อนุมัติ (ถึง)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <motion.input
                    type="date"
                    id="endDate"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                  />
                </div>
              </motion.div>
            </motion.div>
            
            {/* Reset Filters Button */}
            <motion.div 
              className="mt-4 flex justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.95 }}
              >
                รีเซ็ตตัวกรอง
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // ApprovedCompaniesTable component
  const ApprovedCompaniesTable = ({ companies, formatDate }) => (
    <motion.div 
      className="overflow-x-auto rounded-lg shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.div 
        className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex items-center">
          <motion.div 
            className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
          >
            <FaBuilding className="text-blue-600" size={16} />
          </motion.div>
          <div>
           
            <motion.p 
              className="text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              พบ {companies.length} รายการบริษัทที่ได้รับการอุมัติ
            </motion.p>

          </div>
        </div>
      </motion.div>
      <table className="min-w-full divide-y divide-gray-200 border-collapse">
        <motion.thead 
          className="bg-blue-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              หมายเลขสมาชิก
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              ชื่อบริษัท
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              ประเภทสมาชิก
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              TAX ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              วันที่อนุมัติ
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              สถานะ
            </th>
          </tr>
        </motion.thead>
        <motion.tbody 
          className="bg-white divide-y divide-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {companies.length > 0 ? (
            companies.map((company, index) => (
              <motion.tr 
                key={company.id} 
                className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-blue-50 hover:bg-blue-100'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ backgroundColor: "#eff6ff", scale: 1.01 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                  {company.MEMBER_CODE || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">
                  {company.company_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                  {company.company_type || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                  {company.tax_id || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                  {formatDate(company.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <motion.span 
                    className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 shadow-sm"
                    whileHover={{ scale: 1.05, backgroundColor: "#dcfce7" }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <FaCheckCircle className="mr-1 mt-0.5" size={12} />
                    อนุมัติ
                  </motion.span>
                </td>
              </motion.tr>
            ))
          ) : (
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <td colSpan="6" className="px-6 py-10 text-center">
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaSearch className="text-gray-300 mb-3" size={24} />
                  </motion.div>
                  <motion.p 
                    className="text-gray-500 font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
                  </motion.p>
                </div>
              </td>
            </motion.tr>
          )}
        </motion.tbody>
      </table>
    </motion.div>
  );

  // Pagination component
  const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
    const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    return totalItems > 0 ? (
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
    ) : null;
  };

  // MemberDetailView component
  const MemberDetailView = ({ memberData, onToggleView }) => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">ข้อมูลสมาชิก</h2>
        <div className="flex items-center">
          <button
            onClick={onToggleView}
            className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            <FaTable className="mr-1" size={14} />
            <span>ดูแบบตาราง</span>
          </button>
        </div>
      </div>
      
      {/* Member Code and Status */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {memberData.MEMBER_CODE && (
            <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
              <FaIdCard className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-xs text-blue-700">หมายเลขสมาชิก</p>
                <p className="text-sm font-medium">{memberData.MEMBER_CODE}</p>
              </div>
            </div>
          )}
        </div>
        <div>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            อนุมัติ
          </span>
        </div>
      </div>
      
      {/* Company Information */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-3 text-gray-700 border-b pb-2">ข้อมูลบริษัท</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <FaBuilding className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">ชื่อบริษัท</p>
              <p className="text-sm text-gray-900">{memberData.company_name || '-'}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <FaBuilding className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">ประเภทบริษัท</p>
              <p className="text-sm text-gray-900">{memberData.company_type || '-'}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <FaRegAddressCard className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">เลขประจำตัวผู้เสียภาษี</p>
              <p className="text-sm text-gray-900">{memberData.tax_id || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  // Check if we have approved companies
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
              companyTypeFilter={companyTypeFilter}
              onCompanyTypeChange={(value) => {
                setCompanyTypeFilter(value);
                setCurrentPage(1);
              }}
              companyTypes={companyTypes}
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
              totalItems={filteredCompanies.length}
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
}