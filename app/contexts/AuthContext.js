"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  isLoggingOut: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Function to get cookie value
  const getCookie = (name) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  useEffect(() => {
    setMounted(true);

    // Check if we have a token cookie (this means we're logged in)
    const hasTokenCookie = getCookie("token") !== null;
    const rememberMeCookie = getCookie("rememberMe");
    const isRemembered = rememberMeCookie === "1";

    // First check localStorage (for persistent login)
    const persistentUser = localStorage.getItem("user");
    if (persistentUser && (hasTokenCookie || isRemembered)) {
      try {
        setUser(JSON.parse(persistentUser));
        setIsLoading(false);
        return;
      } catch (e) {
        console.error("Error parsing stored user data:", e);
        localStorage.removeItem("user");
      }
    }

    // Then check sessionStorage (for session-only login)
    const storedUser = sessionStorage.getItem("user");
    if (storedUser && hasTokenCookie) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing session user data:", e);
        sessionStorage.removeItem("user");
      }
    }

    // If we have a token but no user data, try to fetch the user data
    if (hasTokenCookie && !user) {
      const fetchUserData = async () => {
        try {
          const response = await fetch("/api/auth/me", {
            credentials: "include",
          });

          if (response.status === 401 && typeof window !== "undefined") {
            const path = window.location.pathname;
            if (path.startsWith("/admin")) {
              window.location.href = "/admin/login";
            } else {
              window.location.href = "/login";
            }
            return;
          }

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);

            // Store user data based on remember me preference
            sessionStorage.setItem("user", JSON.stringify(userData.user));
            if (isRemembered) {
              localStorage.setItem("user", JSON.stringify(userData.user));
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (userData, rememberMe = false) => {
    setUser(userData);

    // Always store in both sessionStorage and localStorage
    // This ensures the user stays logged in after refresh (F5)
    sessionStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("user", JSON.stringify(userData));

    // rememberMe flag is used for cookie expiration:
    // - true: 30 days
    // - false: 3 days
    // But we always store user data in localStorage to prevent logout on refresh
  };

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      // Log the logout event to the server
      await fetch("/api/auth/log-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          event_type: "logout",
          session_id: sessionStorage.getItem("sessionId") || `${Date.now()}_${user?.id}`,
          user_agent: window.navigator.userAgent,
        }),
      });

      // Clear user data from storage
      setUser(null);
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberedEmail");

      // Clear cookies by calling the logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Important for cookies
      });

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, still clear local data
      setUser(null);
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
      router.push("/");
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
