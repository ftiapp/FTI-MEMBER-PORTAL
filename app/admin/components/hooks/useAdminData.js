'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAdminData() {
  const [adminData, setAdminData] = useState(null);
  const [adminLevel, setAdminLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminSession() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/check-session', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        const data = await response.json();
        
        if (data.success && data.admin) {
          setAdminData(data.admin);
          setAdminLevel(data.admin.adminLevel);
        }
      } catch (error) {
        console.error('Error fetching admin session:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAdminSession();
  }, []);

  return { adminData, adminLevel, isLoading };
}

export function usePendingCounts() {
  const [pendingCounts, setPendingCounts] = useState({
    verifications: 0,
    profileUpdates: 0,
    addressUpdates: 0,
    guestMessages: 0,
    productUpdates: 0,
  });

  const fetchPendingCounts = useCallback(async () => {
    const endpoints = [
      { 
        url: '/api/admin/pending-verifications-count', 
        key: 'verifications' 
      },
      { 
        url: '/api/admin/pending-profile-update-count', 
        key: 'profileUpdates' 
      },
      { 
        url: '/api/admin/pending-guest-messages-count', 
        key: 'guestMessages' 
      },
      { 
        url: '/api/admin/pending-address-updates-count', 
        key: 'addressUpdates' 
      },
      { 
        url: '/api/admin/pending-product-updates-count', 
        key: 'productUpdates' 
      },
    ];

    const promises = endpoints.map(async ({ url, key }) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return { key, count: data.count };
          }
        }
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
      }
      return { key, count: 0 };
    });

    const results = await Promise.all(promises);
    const newCounts = { ...pendingCounts };
    
    results.forEach(({ key, count }) => {
      newCounts[key] = count;
    });
    
    setPendingCounts(newCounts);
  }, []);

  useEffect(() => {
    fetchPendingCounts();
    
    // Set up interval to refresh count every 10 minutes
    const intervalId = setInterval(fetchPendingCounts, 600000);
    
    return () => clearInterval(intervalId);
  }, [fetchPendingCounts]);

  return { pendingCounts, fetchPendingCounts };
}