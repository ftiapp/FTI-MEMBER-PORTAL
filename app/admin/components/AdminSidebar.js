"use client";

import { useState, useCallback, useEffect } from "react";
import "./styles/animations.css";
import AdminInfo from "./AdminInfo";
import LogoutConfirmationDialog from "./LogoutConfirmationDialog";
import MenuItem from "./MenuItem";
import LoadingSpinner from "./LoadingSpinner";
import { getMenuItems } from "./MenuConfig";
import { MenuIcons } from "./MenuIcons";
import { useAdminData, usePendingCounts } from "./hooks/useAdminData";
import { useNavigation } from "./hooks/useNavigation";

function AdminSidebar({ onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [contactUnreadCount, setContactUnreadCount] = useState(0);
  const [allowedMenuPaths, setAllowedMenuPaths] = useState(null);

  // Custom hooks
  const { adminData, isLoading } = useAdminData();
  const { pendingCounts } = usePendingCounts();
  const { pathname, loading, activePath, handleNavigation, handleLogout } = useNavigation();

  // Wrap handleNavigation to call onNavigate callback
  const handleMenuNavigation = (event, path) => {
    handleNavigation(event, path);
    if (onNavigate) {
      onNavigate();
    }
  };

  // ดึงค่า adminLevel โดยตรงจาก adminData
  const adminLevel = adminData?.adminLevel || 0;

  // แสดงค่า adminLevel ในคอนโซล
  console.log("AdminSidebar - adminData:", adminData);
  console.log("AdminSidebar - adminLevel:", adminLevel);

  // Get menu items based on admin level and pending counts
  const baseMenuItems = getMenuItems(adminLevel, pendingCounts);

  // Load allowed menus from DB so per-admin menu permissions work
  useEffect(() => {
    let cancelled = false;

    const fetchAllowedMenus = async () => {
      try {
        // SuperAdmin sees all menus; no need to filter
        if (adminLevel >= 5) {
          setAllowedMenuPaths(null);
          return;
        }

        const res = await fetch("/api/admin/allowed-menus", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch allowed menus");
        }

        const paths = new Set(
          (Array.isArray(data.data) ? data.data : [])
            .map((m) => (m && m.path ? String(m.path) : null))
            .filter(Boolean),
        );

        // Always keep dashboard root visible
        paths.add("/admin/dashboard");

        if (!cancelled) {
          setAllowedMenuPaths(paths);
        }
      } catch (err) {
        // If fetching fails, fall back to current menu logic to avoid breaking navigation
        if (!cancelled) {
          setAllowedMenuPaths(null);
        }
      }
    };

    fetchAllowedMenus();

    return () => {
      cancelled = true;
    };
  }, [adminLevel]);

  // Override badge for member contact messages with live unread count
  const menuItems = baseMenuItems
    .filter((item) => {
      if (!allowedMenuPaths) return true;
      return allowedMenuPaths.has(item.path);
    })
    .map((item) =>
      item.path === "/admin/dashboard/contact-messages"
        ? {
            ...item,
            badge: contactUnreadCount > 0 ? contactUnreadCount : null,
          }
        : item,
    );

  const toggleCollapse = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  // Animation state for sidebar
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch unread member contact messages count for sidebar badge
  useEffect(() => {
    let intervalId = null;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/admin/contact-messages/unread-count");
        if (res.ok) {
          const data = await res.json();
          setContactUnreadCount(typeof data.unread === "number" ? data.unread : 0);
        }
      } catch (err) {
        // ignore errors to avoid affecting sidebar rendering
      }
    };

    fetchUnreadCount();
    intervalId = setInterval(fetchUnreadCount, 10 * 60 * 1000); // every 10 minutes

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // If still loading admin data, show a simple loading indicator
  if (isLoading) {
    return (
      <aside className="bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white w-72 min-h-screen h-full flex items-center justify-center fade-in">
        <LoadingSpinner size={8} color="white" />
      </aside>
    );
  }

  return (
    <aside
      className={`bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white ${collapsed ? "w-20" : "w-72"} transition-all duration-300 ease-in-out min-h-screen h-full flex flex-col ${mounted ? "fade-in" : ""}`}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-slate-700/50">
        <div className={`flex items-center ${collapsed ? "justify-center w-full" : ""}`}>
          {!collapsed && (
            <div className="ml-3">
              <div className="font-semibold text-sm text-slate-200">Menu</div>
            </div>
          )}
        </div>
        <button
          onClick={toggleCollapse}
          className={`text-gray-300 p-1 rounded-full hover:bg-slate-700/50 transition-colors ${collapsed ? "hidden" : "block"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Admin Info */}
      <AdminInfo collapsed={collapsed} adminData={adminData} />

      {/* Menu Items */}
      <div className="overflow-y-auto flex-grow">
        <nav className="mt-5 px-2">
          {loading && !activePath
            ? // Show skeleton loading when initial loading
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="mb-2 px-4 py-2 rounded-md bg-slate-700/30 bg-opacity-40 menu-item-loading border border-slate-600/20"
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-3 rounded-md bg-slate-600/40"></div>
                      {!collapsed && <div className="w-24 h-4 rounded-md bg-slate-600/40"></div>}
                    </div>
                  </div>
                ))
            : menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  item={item}
                  pathname={pathname}
                  collapsed={collapsed}
                  loading={loading}
                  activePath={activePath}
                  onNavigation={handleMenuNavigation}
                />
              ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="mt-auto sticky bottom-0 w-full border-t border-slate-700/50">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (loading) return;
            setShowLogoutConfirmation(true);
          }}
          className={`flex items-center ${collapsed ? "justify-center" : "px-4"} w-full p-4 text-base font-medium hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 bg-gradient-to-r from-red-500/20 to-red-600/20 transition-all duration-200 border-t border-slate-700/50 ${loading && activePath === "logout" ? "menu-item-loading cursor-not-allowed" : ""}`}
          disabled={loading}
          title="ออกจากระบบ"
        >
          {loading && activePath === "logout" ? (
            <LoadingSpinner size={4} color="gray" />
          ) : (
            MenuIcons.logout
          )}
          {!collapsed && <span className="ml-3 text-white">ออกจากระบบ</span>}
        </button>

        <LogoutConfirmationDialog
          isOpen={showLogoutConfirmation}
          onClose={() => setShowLogoutConfirmation(false)}
          isLoading={loading}
          onConfirm={handleLogout}
        />
      </div>
    </aside>
  );
}

export default AdminSidebar;
