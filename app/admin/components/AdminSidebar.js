'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

function AdminInfo({ collapsed }) {
  const [admin, setAdmin] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    async function fetchAdmin() {
      try {
        const res = await fetch('/api/admin/check-session', { 
          cache: 'no-store', 
          next: { revalidate: 0 } 
        });
        const data = await res.json();
        if (data.success && data.admin && isMounted) {
          setAdmin(data.admin);
        }
      } catch (error) {
        console.error('Error fetching admin:', error);
      }
    }
    
    fetchAdmin();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  if (!admin) return null;
  
  return (
    <div className={`mt-2 mb-4 px-2 py-2 rounded ${collapsed ? 'hidden' : 'block'} bg-gray-900/70`}> 
      <div className="text-sm text-blue-100 font-semibold">{admin.name || 'Admin'}</div>
      <div className="text-xs text-gray-400 font-mono">{admin.username}</div>
      {admin.admin_level === 5 && (
        <div className="text-xs mt-1 bg-red-600 text-white px-1 py-0.5 rounded">Super Admin</div>
      )}
    </div>
  );
}

export { AdminInfo };

// Logout confirmation dialog component
function LogoutConfirmationDialog({ isOpen, onClose, onConfirm, isLoading }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
        </div>
        
        <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">ยืนยันการออกจากระบบ</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">คุณต้องการออกจากระบบใช่หรือไม่?</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              ยืนยัน
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePath, setActivePath] = useState('');
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [pendingProfileUpdates, setPendingProfileUpdates] = useState(0);
  const [pendingGuestMessages, setPendingGuestMessages] = useState(0);
  const [pendingAddressUpdates, setPendingAddressUpdates] = useState(0);
  const [pendingProductUpdates, setPendingProductUpdates] = useState(0);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [adminLevel, setAdminLevel] = useState(0);
  
  // Reset loading state when navigation completes
  useEffect(() => {
    setLoading(false);
    setActivePath('');
  }, [pathname]);
  
  // ตรวจสอบระดับแอดมิน
  useEffect(() => {
    let isMounted = true;
    
    async function fetchAdminLevel() {
      try {
        const res = await fetch('/api/admin/check-session', { 
          cache: 'no-store', 
          next: { revalidate: 0 } 
        });
        const data = await res.json();
        if (data.success && data.admin && data.admin.admin_level && isMounted) {
          setAdminLevel(data.admin.admin_level);
        }
      } catch (error) {
        console.error('Error fetching admin level:', error);
      }
    }
    
    fetchAdminLevel();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch pending counts
  const fetchPendingCounts = useCallback(async () => {
    const endpoints = [
      { url: '/api/admin/pending-verifications-count', setter: setPendingVerifications },
      { url: '/api/admin/pending-profile-update-count', setter: setPendingProfileUpdates },
      { url: '/api/admin/pending-guest-messages-count', setter: setPendingGuestMessages },
      { url: '/api/admin/pending-address-updates-count', setter: setPendingAddressUpdates },
      { url: '/api/admin/pending-product-updates-count', setter: setPendingProductUpdates },
    ];

    const promises = endpoints.map(async ({ url, setter }) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setter(data.count);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
      }
    });

    await Promise.all(promises);
  }, []);

  useEffect(() => {
    fetchPendingCounts();
    
    // Set up interval to refresh count every 10 minutes
    const intervalId = setInterval(fetchPendingCounts, 600000);
    
    return () => clearInterval(intervalId);
  }, [fetchPendingCounts]);

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
  
  // เมนูสำหรับแอดมินทุกระดับ
  const commonMenuItems = [
    {
      name: 'แดชบอร์ด',
      path: '/admin/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
  ];
  
  // เมนูสำหรับ Super Admin (admin_level 5) เท่านั้น
  const superAdminMenuItems = [
    {
      name: 'กิจกรรมล่าสุด',
      path: '/admin/dashboard/recent-activities',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'จัดการแอดมิน',
      path: '/admin/dashboard/manage-admins',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: 'ตั้งค่าระบบ',
      path: '/admin/dashboard/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      name: 'รีเซ็ตรหัสผ่าน Super Admin',
      path: '/admin/reset-password',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
    },
  ];
  
  // เมนูสำหรับแอดมินทั่วไป (admin_level < 5)
  const regularMenuItems = [
    {
      name: 'จัดการสมาชิก',
      path: '/admin/dashboard/members',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'ยืนยันตัวตนสมาชิกเดิม',
      path: '/admin/dashboard/verify',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      badge: pendingVerifications > 0 ? pendingVerifications : null,
    },
    {
      name: 'แจ้งเปลี่ยนข้อมูลส่วนตัว',
      path: '/admin/dashboard/profile-updates',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      badge: pendingProfileUpdates > 0 ? pendingProfileUpdates : null,
    },
    {
      name: 'จัดการคำขอแก้ไขที่อยู่',
      path: '/admin/address-updates',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badge: pendingAddressUpdates > 0 ? pendingAddressUpdates : null,
    },
    {
      name: 'แจ้งเปลี่ยนสินค้า/บริการสมาชิก',
      path: '/admin/product-updates',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11V7a2 2 0 114 0v4" />
        </svg>
      ),
      badge: pendingProductUpdates > 0 ? pendingProductUpdates : null,
    },
    {
      name: 'เปลี่ยนอีเมลผู้ใช้',
      path: '/admin/dashboard/email-change',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'ข้อความติดต่อ (สมาชิก)',
      path: '/admin/dashboard/contact-messages',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      name: 'ข้อความติดต่อ (บุคคลทั่วไป)',
      path: '/admin/dashboard/guest-messages',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      badge: pendingGuestMessages > 0 ? pendingGuestMessages : null,
    },
  ];
  
  // รวมเมนูตามระดับสิทธิ์
  const menuItems = [
    ...commonMenuItems,
    ...(adminLevel >= 5 ? superAdminMenuItems : regularMenuItems)
  ];
  
  const toggleCollapse = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    setActivePath('logout');
    
    try {
      // Clear user data from storage manually instead of using the logout function
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
      
      // Clear cookies by calling the logout API directly
      await fetch('/api/auth/logout', {
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
  
  return (
    <aside className={`bg-gray-800 text-white ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out min-h-screen h-full flex flex-col`}>
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

      <AdminInfo collapsed={collapsed} />

      <div className="overflow-y-auto flex-grow">
        <nav className="mt-5 px-2">
          {menuItems.map((item, index) => (
            <div key={index} className="mb-2 relative">
              <Link
                href={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  pathname === item.path || (item.path !== '/admin/dashboard' && pathname.startsWith(item.path)) 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${loading && activePath === item.path ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => handleNavigation(e, item.path)}
              >
                <div className="mr-3">{item.icon}</div>
                {!collapsed && (
                  <div className="flex-grow">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                {collapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </div>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto sticky bottom-0 w-full border-t border-gray-700">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (loading) return;
            setShowLogoutConfirmation(true);
          }}
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} w-full p-4 text-base font-medium hover:bg-red-700 bg-gray-700 transition-colors ${loading && activePath === 'logout' ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={loading}
          title="ออกจากระบบ"
        >
          {loading && activePath === 'logout' ? (
            <svg className="animate-spin h-4 w-4 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
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