'use client';

import { useState, useCallback, useEffect } from 'react';
import './styles/animations.css';
import AdminInfo from './AdminInfo';
import LogoutConfirmationDialog from './LogoutConfirmationDialog';
import MenuItem from './MenuItem';
import LoadingSpinner from './LoadingSpinner';
import { getMenuItems } from './MenuConfig';
import { MenuIcons } from './MenuIcons';
import { useAdminData, usePendingCounts } from './hooks/useAdminData';
import { useNavigation } from './hooks/useNavigation';

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  
  // Custom hooks
  const { adminData, isLoading } = useAdminData();
  const { pendingCounts } = usePendingCounts();
  const { pathname, loading, activePath, handleNavigation, handleLogout } = useNavigation();
  
  // ดึงค่า adminLevel โดยตรงจาก adminData
  const adminLevel = adminData?.adminLevel || 0;
  
  // แสดงค่า adminLevel ในคอนโซล
  console.log('AdminSidebar - adminData:', adminData);
  console.log('AdminSidebar - adminLevel:', adminLevel);
  
  // Get menu items based on admin level and pending counts
  const menuItems = getMenuItems(adminLevel, pendingCounts);
  
  const toggleCollapse = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);
  
  // Animation state for sidebar
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // If still loading admin data, show a simple loading indicator
  if (isLoading) {
    return (
      <aside className="bg-gray-800 text-white w-64 min-h-screen h-full flex items-center justify-center fade-in">
        <LoadingSpinner size={8} color="white" />
      </aside>
    );
  }
  
  return (
    <aside className={`bg-gray-800 text-white ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out min-h-screen h-full flex flex-col ${mounted ? 'fade-in' : ''}`}>
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
          {!collapsed && (
            <div className="ml-3">
              <div className="font-semibold text-sm">Menu</div>
            </div>
          )}
        </div>
        <button
          onClick={toggleCollapse}
          className={`text-white p-1 rounded-full hover:bg-gray-700 ${collapsed ? 'hidden' : 'block'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Admin Info */}
      <AdminInfo collapsed={collapsed} adminData={adminData} />

      {/* Menu Items */}
      <div className="overflow-y-auto flex-grow">
        <nav className="mt-5 px-2">
          {loading && !activePath ? (
            // Show skeleton loading when initial loading
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="mb-2 px-4 py-2 rounded-md bg-gray-700 bg-opacity-40 menu-item-loading">
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-3 rounded-md bg-gray-600"></div>
                  {!collapsed && <div className="w-24 h-4 rounded-md bg-gray-600"></div>}
                </div>
              </div>
            ))
          ) : (
            menuItems.map((item, index) => (
              <MenuItem
                key={index}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                loading={loading}
                activePath={activePath}
                onNavigation={handleNavigation}
              />
            ))
          )}
        </nav>
      </div>
      
      {/* Logout Button */}
      <div className="mt-auto sticky bottom-0 w-full border-t border-gray-700">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (loading) return;
            setShowLogoutConfirmation(true);
          }}
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} w-full p-4 text-base font-medium hover:bg-red-700 bg-gray-700 transition-colors ${loading && activePath === 'logout' ? 'menu-item-loading cursor-not-allowed' : ''}`}
          disabled={loading}
          title="ออกจากระบบ"
        >
          {loading && activePath === 'logout' ? (
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