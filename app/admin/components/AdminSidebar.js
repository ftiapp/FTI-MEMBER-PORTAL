'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'react-hot-toast';

function AdminInfo({ collapsed }) {
  const [admin, setAdmin] = useState(null);
  useEffect(() => {
    async function fetchAdmin() {
      try {
        const res = await fetch('/api/admin/check-session', { cache: 'no-store', next: { revalidate: 0 } });
        const data = await res.json();
        if (data.success && data.admin) setAdmin(data.admin);
      } catch (e) {}
    }
    fetchAdmin();
  }, []);
  if (!admin) return null;
  return (
    <div className={`mt-2 mb-4 px-2 py-2 rounded ${collapsed ? 'hidden' : 'block'} bg-gray-900/70`}> 
      <div className="text-sm text-blue-100 font-semibold">{admin.name || 'Admin'}</div>
      <div className="text-xs text-gray-400 font-mono">{admin.username}</div>
    </div>
  );
}

export { AdminInfo };

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePath, setActivePath] = useState('');
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [pendingProfileUpdates, setPendingProfileUpdates] = useState(0);
  
  // Reset loading state when navigation completes
  useEffect(() => {
    setLoading(false);
    setActivePath('');
  }, [pathname]);

  // Fetch pending verification count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await fetch('/api/admin/pending-verifications-count');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPendingVerifications(data.count);
          }
        }
      } catch (error) {
        console.error('Error fetching pending verifications count:', error);
      }
    };
    const fetchPendingProfileUpdateCount = async () => {
      try {
        const response = await fetch('/api/admin/pending-profile-update-count');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPendingProfileUpdates(data.count);
          }
        }
      } catch (error) {
        console.error('Error fetching pending profile update count:', error);
      }
    };
    fetchPendingCount();
    fetchPendingProfileUpdateCount();
    // Set up interval to refresh count every minute
    const intervalId = setInterval(() => {
      fetchPendingCount();
      fetchPendingProfileUpdateCount();
    }, 600000);
    return () => clearInterval(intervalId);
  }, []);

  // Handle navigation without page reload
  const handleNavigation = (e, path) => {
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
    setTimeout(() => {
      setLoading(false);
      setActivePath('');
    }, 3000);
  };
  
  const menuItems = [
    {
      name: 'แดชบอร์ด',
      path: '/admin/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
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
      name: 'จัดการสมาชิก',
      path: '/admin/dashboard/members',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'ยืนยันตัวตนสมาชิก',
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
      name: 'เปลี่ยนอีเมลผู้ใช้',
      path: '/admin/dashboard/email-change',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'ข้อคิดเห็นเพิ่มเติม',
      path: '/admin/dashboard/contact-messages',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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
  ];
  
  return (
    <aside className={`bg-gray-800 text-white ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out min-h-screen h-full`}>
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <div className={`${collapsed ? 'hidden' : 'block'}`}>
          <h1 className="text-xl font-bold">เมนู</h1>
        </div>
       
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                onClick={(e) => handleNavigation(e, item.path)}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  pathname === item.path ? 'bg-blue-700' : 'hover:bg-gray-700'
                } ${loading && activePath === item.path ? 'opacity-70 cursor-not-allowed' : ''}`}
                aria-disabled={loading && activePath === item.path}
              >
                <span className="text-gray-300">
                  {loading && activePath === item.path ? (
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    item.icon
                  )}
                </span>
                <span className={`ml-3 ${collapsed ? 'hidden' : 'block'}`}>
                  {item.name}
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full border-t border-gray-700">
        <button
          onClick={(e) => {
            e.preventDefault();
            if (loading) return;
            setLoading(true);
            setActivePath('logout');
            logout();
            router.push('/login');
          }}
          className={`flex items-center justify-center w-full p-2 text-xs hover:bg-gray-700 transition-colors ${loading && activePath === 'logout' ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={loading}
          title="ออกจากระบบ"
        >
          {loading && activePath === 'logout' ? (
            <svg className="animate-spin h-4 w-4 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
          {!collapsed && <span className="ml-2">ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  );
}
