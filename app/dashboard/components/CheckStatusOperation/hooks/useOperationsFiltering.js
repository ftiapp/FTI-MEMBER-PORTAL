import { useState, useEffect } from 'react';

/**
 * Custom hook to handle filtering and pagination of operations
 * @param {Array} operations - The operations to filter
 * @param {string} search - The search query
 * @param {string} statusFilter - The status filter
 * @param {string} typeFilter - The type filter
 * @param {Array} dateRange - The date range filter
 * @returns {Object} - The filtered operations and pagination data
 */
const useOperationsFiltering = (operations, search, statusFilter, typeFilter, dateRange) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredOperations, setFilteredOperations] = useState([]);
  const itemsPerPage = 3;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, dateRange]);

  // Apply filters
  useEffect(() => {
    const filtered = operations.filter(op => {
      // Search by subject, company_name, MEMBER_CODE, description
      const searchLower = search.toLowerCase();
      const matchesSearch =
        (!searchLower ||
          (op.subject && op.subject.toLowerCase().includes(searchLower)) ||
          (op.company_name && op.company_name.toLowerCase().includes(searchLower)) ||
          (op.MEMBER_CODE && op.MEMBER_CODE.toLowerCase().includes(searchLower)) ||
          (op.description && op.description.toLowerCase().includes(searchLower))
        );
        
      // Get operation type
      const opType = op.type || 
        (op.title?.includes('ยืนยันสมาชิกเดิม') ? 'ยืนยันสมาชิกเดิม' : 
         op.title === 'ติดต่อเจ้าหน้าที่' ? 'ติดต่อเจ้าหน้าที่' : 'แก้ไขข้อมูลส่วนตัว');
        
      // Filter by type
      const matchesType = !typeFilter || opType === typeFilter;
      
      // Filter by status - only apply status filters that are relevant to the current type
      let matchesStatus = true;
      if (statusFilter) {
        // For contact messages, only allow unread, read, replied statuses
        if (opType === 'ติดต่อเจ้าหน้าที่') {
          if (!['unread', 'read', 'replied', 'none', 'error'].includes(statusFilter)) {
            matchesStatus = false;
          } else {
            matchesStatus = op.status === statusFilter;
          }
        } 
        // For verifications, only allow pending, approved, rejected statuses
        else if (opType === 'ยืนยันสมาชิกเดิม') {
          if (!['pending', 'approved', 'rejected'].includes(statusFilter)) {
            matchesStatus = false;
          } else {
            matchesStatus = op.status === statusFilter;
          }
        }
        // For other types, apply the filter normally
        else {
          matchesStatus = op.status === statusFilter;
        }
      }
      
      // Filter by date
      let matchesDate = true;
      if (dateRange[0]) {
        matchesDate = matchesDate && new Date(op.created_at) >= new Date(dateRange[0]);
      }
      if (dateRange[1]) {
        matchesDate = matchesDate && new Date(op.created_at) <= new Date(dateRange[1] + 'T23:59:59');
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    setFilteredOperations(filtered);
  }, [operations, search, statusFilter, typeFilter, dateRange]);

  // Calculate pagination
  const indexOfLastOperation = currentPage * itemsPerPage;
  const indexOfFirstOperation = indexOfLastOperation - itemsPerPage;
  const currentOperations = filteredOperations.slice(indexOfFirstOperation, indexOfLastOperation);
  const totalPages = Math.ceil(filteredOperations.length / itemsPerPage);

  return {
    currentOperations,
    totalPages,
    currentPage,
    setCurrentPage
  };
};

export default useOperationsFiltering;
