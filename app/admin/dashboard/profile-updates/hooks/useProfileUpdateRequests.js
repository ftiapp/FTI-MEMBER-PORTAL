"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

// Global state for caching profile update requests by status
const profileUpdateCache = {
  pending: { data: null, timestamp: 0 },
  approved: { data: null, timestamp: 0 },
  rejected: { data: null, timestamp: 0 },
  all: { data: null, timestamp: 0 },
};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export function useProfileUpdateRequests(initialStatus = "pending") {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(initialStatus);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch requests with caching
  const fetchRequests = useCallback(async (requestStatus) => {
    try {
      setLoading(true);

      // Check if we have valid cached data
      const cache = profileUpdateCache[requestStatus];
      const now = Date.now();

      if (cache.data && now - cache.timestamp < CACHE_EXPIRATION) {
        setRequests(cache.data);
        setLoading(false);
        return;
      }

      // No valid cache, fetch from API
      const response = await fetch(`/api/admin/profile-updates?status=${requestStatus}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile update requests");
      }

      const data = await response.json();

      // Update cache
      profileUpdateCache[requestStatus] = {
        data: data.requests,
        timestamp: now,
      };

      setRequests(data.requests);
    } catch (error) {
      console.error("Error fetching profile update requests:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไขข้อมูล");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle status change
  const handleStatusChange = useCallback(
    (newStatus) => {
      setStatus(newStatus);
      fetchRequests(newStatus);
    },
    [fetchRequests],
  );

  // Approve request
  const approveRequest = useCallback(
    async (requestId, comment, newFirstname, newLastname) => {
      setIsProcessing(true);
      try {
        const response = await fetch("/api/admin/approve-profile-update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            comment,
            new_firstname: newFirstname,
            new_lastname: newLastname,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to approve profile update request");
        }

        toast.success("อนุมัติคำขอแก้ไขข้อมูลสำเร็จ");

        // Invalidate cache for both current status and approved status
        profileUpdateCache[status].timestamp = 0;
        profileUpdateCache["approved"].timestamp = 0;

        // Refetch current status data
        await fetchRequests(status);

        return true;
      } catch (error) {
        console.error("Error approving profile update request:", error);
        toast.error("เกิดข้อผิดพลาดในการอนุมัติคำขอแก้ไขข้อมูล");
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [status, fetchRequests],
  );

  // Reject request
  const rejectRequest = useCallback(
    async (requestId, reason, comment) => {
      setIsProcessing(true);
      try {
        const response = await fetch("/api/admin/reject-profile-update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            reason,
            comment,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to reject profile update request");
        }

        toast.success("ปฏิเสธคำขอแก้ไขข้อมูลสำเร็จ");

        // Invalidate cache for both current status and rejected status
        profileUpdateCache[status].timestamp = 0;
        profileUpdateCache["rejected"].timestamp = 0;

        // Refetch current status data
        await fetchRequests(status);

        return true;
      } catch (error) {
        console.error("Error rejecting profile update request:", error);
        toast.error("เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขข้อมูล");
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [status, fetchRequests],
  );

  // Initial fetch
  useEffect(() => {
    fetchRequests(status);
  }, [status, fetchRequests]);

  return {
    requests,
    loading,
    status,
    isProcessing,
    handleStatusChange,
    approveRequest,
    rejectRequest,
    refreshRequests: () => fetchRequests(status),
  };
}
