"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TestRememberMe() {
  const [cookieData, setCookieData] = useState({});
  const [localStorageData, setLocalStorageData] = useState({});
  const [sessionStorageData, setSessionStorageData] = useState({});
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
    // Read all cookies
    const cookies = {};
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name) cookies[name] = value;
      });
      setCookieData(cookies);

      // Read localStorage
      const localData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const value = localStorage.getItem(key);
          localData[key] = value;
        } catch (e) {
          localData[key] = `Error: ${e.message}`;
        }
      }
      setLocalStorageData(localData);

      // Read sessionStorage
      const sessionData = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        try {
          const value = sessionStorage.getItem(key);
          sessionData[key] = value;
        } catch (e) {
          sessionData[key] = `Error: ${e.message}`;
        }
      }
      setSessionStorageData(sessionData);
    }
  }, []);

  const handleClearCookies = () => {
    // Clear all cookies
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      });

      // Refresh the page
      window.location.reload();
    }
  };

  const handleClearStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handleTestLogin = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          rememberMe: true,
        }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Login failed. Please check the console for details.");
        console.error("Login failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during test login:", error);
      alert("Error during test login. See console for details.");
    }
  };

  const handleTestLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Logout failed. Please check the console for details.");
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during test logout:", error);
      alert("Error during test logout. See console for details.");
    }
  };

  const handleFetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");

      if (response.ok) {
        const data = await response.json();
        alert("User data fetched successfully: " + JSON.stringify(data, null, 2));
      } else {
        alert("Failed to fetch user data. Please check the console for details.");
        console.error("Failed to fetch user data:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Error fetching user data. See console for details.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Remember Me Functionality Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={handleTestLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
            >
              Test Login (with Remember Me)
            </button>

            <button
              onClick={handleTestLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full"
            >
              Test Logout
            </button>

            <button
              onClick={handleFetchUserData}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full"
            >
              Fetch User Data
            </button>

            <button
              onClick={handleClearCookies}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 w-full"
            >
              Clear All Cookies
            </button>

            <button
              onClick={handleClearStorage}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 w-full"
            >
              Clear localStorage/sessionStorage
            </button>

            <Link
              href="/login"
              className="block text-center bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 w-full"
            >
              Go to Login Page
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>

          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">Cookies</h3>
            <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">{JSON.stringify(cookieData, null, 2)}</pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">localStorage</h3>
            <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">{JSON.stringify(localStorageData, null, 2)}</pre>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-2">sessionStorage</h3>
            <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">{JSON.stringify(sessionStorageData, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How to Test "Remember Me" Functionality</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Click "Test Login" to simulate login with Remember Me enabled</li>
          <li>Verify that token, rememberMe, and userEmail cookies are set</li>
          <li>Verify that user data is stored in both localStorage and sessionStorage</li>
          <li>Click "Fetch User Data" to test the /api/auth/me endpoint</li>
          <li>Close the browser and reopen this page - your login state should persist</li>
          <li>Click "Test Logout" to clear all authentication data</li>
          <li>Verify that cookies are cleared and storage is emptied</li>
        </ol>
      </div>
    </div>
  );
}
