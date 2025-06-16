'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for managing address update requests with optimized caching
 * 
 * Features:
 * - Client-side caching with TTL to reduce API calls
 * - Status-based request fetching
 * - Search functionality
 * - Pagination support
 * - Approve and reject functionality with cache invalidation
 */
export default function useAddressUpdateRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 5,
    page: 1,
    totalPages: 0
  });
  
  // Cache state
  const [cache, setCache] = useState({});
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
  
  /**
   * Generate a cache key based on current filter parameters
   */
  const getCacheKey = useCallback((status, page, search) => {
    return `address_updates_${status || 'all'}_${page}_${search || 'nosearch'}`;
  }, []);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback((cacheKey) => {
    if (!cache[cacheKey]) return false;
    const now = new Date().getTime();
    return now - cache[cacheKey].timestamp < CACHE_TTL;
  }, [cache]);

  /**
   * Fetch address update requests from API or cache
   */
  const fetchRequests = useCallback(async (status, page = 1, search = '', skipCache = false) => {
    try {
      setLoading(true);
      
      const cacheKey = getCacheKey(status, page, search);
      
      // Check cache first unless skipCache is true
      if (!skipCache && isCacheValid(cacheKey)) {
        const cachedData = cache[cacheKey].data;
        setRequests(cachedData.updates || []);
        if (cachedData.pagination) {
          setPagination(cachedData.pagination);
        }
        setLoading(false);
        return;
      }
      
      // สร้าง URL พร้อมพารามิเตอร์
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      if (search) {
        params.append('search', search);
      }
      
      const url = `/api/admin/address-update/list?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('กรุณาเข้าสู่ระบบ');
          router.push('/admin/login');
          return;
        }
        
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch address updates: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.success === true) {
        if (Array.isArray(data.updates)) {
          setRequests(data.updates);
          
          // อัปเดตข้อมูลการแบ่งหน้า
          if (data.pagination) {
            setPagination(data.pagination);
          }
          
          // Update cache
          setCache(prevCache => ({
            ...prevCache,
            [cacheKey]: {
              data: data,
              timestamp: new Date().getTime()
            }
          }));
        } else {
          setRequests([]);
        }
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching address updates:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไขที่อยู่');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [router, pagination.limit, getCacheKey, isCacheValid, cache]);

  /**
   * Invalidate cache for a specific status
   */
  const invalidateCache = useCallback((status) => {
    setCache(prevCache => {
      const newCache = { ...prevCache };
      // Remove all cache entries that match the status
      Object.keys(newCache).forEach(key => {
        if (key.startsWith(`address_updates_${status}`)) {
          delete newCache[key];
        }
      });
      return newCache;
    });
  }, []);

  /**
   * Handle approving an address update request
   */
  const approveRequest = useCallback(async (editedAddress) => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      // Prepare request body with edited address data if provided
      const requestBody = {
        id: selectedRequest.id,
        admin_notes: adminNotes
      };
      
      // If editedAddress is provided and different from original, include it in the request
      if (editedAddress) {
        requestBody.edited_address = editedAddress;
      }
      
      const response = await fetch('/api/admin/address-update/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve address update request');
      }
      
      toast.success('อนุมัติคำขอแก้ไขที่อยู่สำเร็จ');
      setSelectedRequest(null);
      
      // Invalidate cache for both pending and approved status
      invalidateCache('pending');
      invalidateCache('approved');
      
      // Refetch the current status data
      return true;
    } catch (error) {
      console.error('Error approving address update request:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติคำขอแก้ไขที่อยู่');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedRequest, adminNotes, invalidateCache]);
  
  /**
   * Handle rejecting an address update request
   */
  const rejectRequest = useCallback(async () => {
    if (!selectedRequest || !rejectReason) {
      toast.error('กรุณาระบุเหตุผลในการปฏิเสธ');
      return false;
    }
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/address-update/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedRequest.id,
          reason: rejectReason,
          admin_notes: adminNotes
        }),
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject address update request');
      }
      
      toast.success('ปฏิเสธคำขอแก้ไขที่อยู่สำเร็จ');
      setSelectedRequest(null);
      setShowRejectModal(false);
      
      // Invalidate cache for both pending and rejected status
      invalidateCache('pending');
      invalidateCache('rejected');
      
      // Refetch the current status data
      return true;
    } catch (error) {
      console.error('Error rejecting address update request:', error);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขที่อยู่');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedRequest, rejectReason, adminNotes, invalidateCache]);

  /**
   * Helper function to get status name
   */
  const getStatusName = useCallback((statusValue) => {
    switch (statusValue) {
      case 'pending': return 'รอการอนุมัติ';
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ปฏิเสธแล้ว';
      default: return statusValue;
    }
  }, []);

  // Return all necessary state and handlers
  return {
    requests,
    loading,
    selectedRequest,
    adminNotes,
    rejectReason,
    isProcessing,
    showRejectModal,
    searchTerm,
    pagination,
    fetchRequests,
    setSelectedRequest,
    setAdminNotes,
    setRejectReason,
    setShowRejectModal,
    setSearchTerm,
    approveRequest,
    rejectRequest,
    getStatusName
  };
}
