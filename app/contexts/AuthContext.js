'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  isLoggingOut: false
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // First check localStorage (for persistent login)
    const persistentUser = localStorage.getItem('user');
    if (persistentUser) {
      setUser(JSON.parse(persistentUser));
      setIsLoading(false);
      return;
    }
    
    // Then check sessionStorage (for session-only login)
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData, rememberMe = false) => {
    setUser(userData);
    
    // Always store in sessionStorage for the current session
    sessionStorage.setItem('user', JSON.stringify(userData));
    
    // If rememberMe is true, also store in localStorage for persistent login
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Log the logout event to the server
      await fetch('/api/auth/log-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          event_type: 'logout',
          session_id: sessionStorage.getItem('sessionId') || `${Date.now()}_${user?.id}`,
          user_agent: window.navigator.userAgent
        })
      });
      
      // Clear user data
      setUser(null);
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ไม่ render จนกว่าจะ mount เสร็จ
  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isLoggingOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
