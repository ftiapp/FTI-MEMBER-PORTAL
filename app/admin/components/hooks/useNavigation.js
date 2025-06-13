'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function useNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activePath, setActivePath] = useState('');

  // Reset loading state when navigation completes
  useEffect(() => {
    setLoading(false);
    setActivePath('');
  }, [pathname]);

  // Handle navigation without page reload
  const handleNavigation = useCallback((e, path) => {
    e.preventDefault();
    
    // Prevent navigation if already loading
    if (loading) return;
    
    // Set loading state and active path
    setLoading(true);
    setActivePath(path);
    
    // Navigate to the new path
    router.push(path);
    
    // Add a timeout as a fallback to reset loading state
    // in case the navigation effect doesn't trigger
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setActivePath('');
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [loading, router]);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    setActivePath('logout');
    
    try {
      // Call admin logout API
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Redirect directly to admin login page
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still redirect to admin page
      router.push('/admin');
    }
  }, [router]);

  return {
    pathname,
    loading,
    activePath,
    handleNavigation,
    handleLogout
  };
}