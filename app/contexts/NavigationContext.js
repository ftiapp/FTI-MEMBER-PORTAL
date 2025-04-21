'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState('');

  // Listen for route changes
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsLoading(true);
    };

    const handleRouteChangeComplete = (url) => {
      setPreviousPath(pathname);
      setIsLoading(false);
    };

    // This is a workaround since Next.js App Router doesn't have built-in events yet
    const originalPush = router.push;
    router.push = function() {
      handleRouteChangeStart();
      return originalPush.apply(router, arguments);
    };

    // Clean up
    return () => {
      router.push = originalPush;
    };
  }, [router, pathname]);

  // Reset loading state when component mounts
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Reset loading state after a timeout (fallback)
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000); // 3 seconds timeout
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Smooth navigation function
  const navigateTo = (url) => {
    setIsLoading(true);
    router.push(url);
  };

  return (
    <NavigationContext.Provider value={{ isLoading, navigateTo, previousPath }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
