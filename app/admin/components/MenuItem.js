"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./styles/animations.css";

function MenuItem({ item, pathname, collapsed, loading, activePath, onNavigation }) {
  const isActive =
    pathname === item.path || (item.path !== "/admin/dashboard" && pathname.startsWith(item.path));
  const isLoading = loading && activePath === item.path;

  // Animation state for menu item entrance
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div className={`mb-2 relative ${mounted ? "menu-item-enter" : ""}`}>
      <Link
        href={item.path}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg"
            : "text-gray-200 hover:bg-gradient-to-r hover:from-gray-600/30 hover:to-gray-700/30 hover:text-white"
        } ${isLoading ? "menu-item-loading cursor-not-allowed" : ""}`}
        onClick={(e) => onNavigation(e, item.path)}
      >
        <div className="mr-3">
          {isLoading ? (
            <div className="flex items-center justify-center w-5 h-5">
              <span className="loading-dot"></span>
              <span className="loading-dot"></span>
              <span className="loading-dot"></span>
            </div>
          ) : (
            item.icon
          )}
        </div>
        {!collapsed && (
          <div className="flex-grow">
            <span>{item.name}</span>
            {item.badge && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm border border-red-400/50">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </div>
        )}
        {collapsed && item.badge && (
          <span className="absolute -top-1 -right-1 inline-block w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm border border-red-400/50" />
        )}
      </Link>
    </div>
  );
}

export default MenuItem;
