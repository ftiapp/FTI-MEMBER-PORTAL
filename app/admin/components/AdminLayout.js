'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

/**
 * Admin Layout Component
 * 
 * This component provides a consistent layout for admin pages with a sidebar navigation
 * and header showing admin information.
 */
export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminInfo, setAdminInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch admin info on component mount
  useEffect(() => {
    fetchAdminInfo();
  }, []);
  
  /**
   * Fetches the current admin's information
   */
  const fetchAdminInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/info');
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('กรุณาเข้าสู่ระบบ');
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch admin info');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAdminInfo(result.admin);
      } else {
        toast.error(result.message || 'ไม่สามารถดึงข้อมูลผู้ดูแลระบบได้');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error fetching admin info:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแลระบบ');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handles admin logout
   */
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('ออกจากระบบสำเร็จ');
        router.push('/admin');
      } else {
        toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  };
  
  // Menu items configuration
  const menuItems = [
    {
      title: 'ยืนยันสมาชิกเดิม',
      href: '/admin/dashboard/verify',
      submenu: [
        { title: 'รอการอนุมัติ', href: '/admin/dashboard/verify?status=0' },
        { title: 'อนุมัติแล้ว', href: '/admin/dashboard/verify?status=1' },
        { title: 'ปฏิเสธแล้ว', href: '/admin/dashboard/verify?status=2' }
      ]
    },
    {
      title: 'อัพเดตสมาชิก',
      href: '/admin/dashboard/update',
    }
  ];
  
  // Check if the current path matches a menu item or its submenu
  const isActiveMenu = (item) => {
    if (pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some(subItem => pathname.startsWith(subItem.href.split('?')[0]));
    }
    return false;
  };
  
  // Check if submenu should be expanded
  const isSubmenuExpanded = (item) => {
    if (!item.submenu) return false;
    return isActiveMenu(item);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a8a]"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1e3a8a] shadow-md"> {/* Navy blue background */}
        <div className="p-4 border-b border-blue-900">
          <h1 className="text-xl font-bold text-white">FTI-Portal Admin</h1>
        </div>
        
        <nav className="mt-4">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className="mb-1">
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-white hover:bg-blue-800 transition-colors ${isActiveMenu(item) ? 'bg-blue-700 font-medium' : ''}`}
                >
                  <span>{item.title}</span>
                </Link>
                
                {item.submenu && (
                  <ul className={`ml-4 border-l border-blue-700 ${isSubmenuExpanded(item) ? 'block' : 'hidden'}`}>
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link 
                          href={subItem.href}
                          className={`flex items-center px-4 py-2 text-sm text-blue-100 hover:bg-blue-800 transition-colors ${pathname === subItem.href || pathname.includes(subItem.href) ? 'bg-[#1e3a8a] font-medium' : ''}`}
                        >
                          <span>{subItem.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#1e3a8a] shadow-md z-10"> {/* Navy blue header */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-white">
              หน้าควบคุมผู้ดูแลระบบ
            </h1>
            
            <div className="flex items-center space-x-4">
              {adminInfo && (
                <div className="text-sm text-white">
                  <span>Admin ID: </span>
                  <span className="font-medium">{adminInfo.id}</span>
                  {adminInfo.level === 5 && (
                    <span className="ml-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-bold">
                      SuperAdmin
                    </span>
                  )}
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-white text-[#1e3a8a] text-sm font-medium rounded-md hover:bg-gray-100 transition-colors shadow-sm"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
