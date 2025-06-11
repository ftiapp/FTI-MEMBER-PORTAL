'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing product update requests
 * @returns {Object} - Product update requests state and functions
 */
export function useProductUpdateRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: 'pending',
    search: ''
  });

  // Fetch product update requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        search: filters.search
      });

      const response = await fetch(`/api/admin/product-update/list?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.updates);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      } else {
        setError(data.message || 'ไม่สามารถดึงข้อมูลคำขอแก้ไขข้อมูลสินค้าได้');
        toast.error(data.message || 'ไม่สามารถดึงข้อมูลคำขอแก้ไขข้อมูลสินค้าได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไขข้อมูลสินค้า');
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไขข้อมูลสินค้า');
      console.error('Error fetching product update requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({
      ...prev,
      page: 1 // Reset to first page when filter changes
    }));
  };

  // Approve a product update request
  const approveRequest = async (id, adminNotes) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/product-update/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, admin_notes: adminNotes }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'อนุมัติคำขอสำเร็จ');
        // Refresh the requests list
        fetchRequests();
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาดในการอนุมัติคำขอ');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติคำขอ');
    } finally {
      setLoading(false);
    }
  };

  // Handle reject request
  const handleReject = async (id, rejectReason) => {
    try {
      const response = await fetch('/api/admin/product-update/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, reject_reason: rejectReason })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('ปฏิเสธคำขอแก้ไขข้อมูลสินค้าสำเร็จ');
        fetchRequests(); // Refresh the list
      } else {
        toast.error(data.message || 'ไม่สามารถปฏิเสธคำขอแก้ไขข้อมูลสินค้าได้');
      }

      return data;
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขข้อมูลสินค้า');
      console.error('Error rejecting product update request:', err);
      return { success: false, message: 'เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขข้อมูลสินค้า' };
    }
  };

  // Fetch requests when filters or pagination changes
  useEffect(() => {
    fetchRequests();
  }, [pagination.page, pagination.limit, filters.status, filters.search]);

  return {
    requests,
    loading,
    error,
    pagination,
    filters,
    handlePageChange,
    handleFilterChange,
    approveRequest,
    handleReject,
    refreshRequests: fetchRequests
  };
}
