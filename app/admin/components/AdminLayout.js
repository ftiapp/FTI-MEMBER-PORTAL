'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Set page title based on current path
  useEffect(() => {
    const pathSegments = pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    let title = '';
    switch(lastSegment) {
      case 'admin':
        title = 'แดชบอร์ด';
        break;
      case 'members':
        title = 'จัดการสมาชิก';
        break;
      case 'verifications':
        title = 'ยืนยันตัวตนสมาชิก';
        break;
      case 'contact-messages':
        title = 'ข้อคิดเห็นเพิ่มเติม';
        break;
      case 'recent-activities':
        title = 'กิจกรรมล่าสุด';
        break;
      case 'settings':
        title = 'ตั้งค่าระบบ';
        break;
      default:
        title = 'FTI-Portal Management';
    }
    
    setPageTitle(title);
  }, [pathname]);
  
  // ตรวจสอบสถานะการเข้าสู่ระบบของ admin จาก cookie
  useEffect(() => {
    async function checkAdminSession() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/check-session', {
          // ใช้ cache: 'no-store' เพื่อป้องกันการใช้ข้อมูลเก่าจาก cache
          cache: 'no-store',
          // ใช้ next: { revalidate: 0 } เพื่อให้ข้อมูลถูกดึงใหม่ทุกครั้ง
          next: { revalidate: 0 }
        });
        const data = await response.json();
        
        if (data.success && data.admin) {
          setAdminData(data.admin);
        } else {
          // ถ้าไม่มี session ให้ redirect ไปหน้า admin login
          router.push('/admin', { scroll: false });
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
        router.push('/admin', { scroll: false });
      } finally {
        setLoading(false);
      }
    }
    
    checkAdminSession();
  }, [router]);
  
  // Handle link clicks to prevent full page reloads
  const handleLinkClick = (e, href) => {
    e.preventDefault();
    // ใช้ scroll: false เพื่อป้องกันการเลื่อนหน้าไปด้านบนเมื่อมีการนำทาง
    router.push(href, { scroll: false });
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };
  
  if (loading || !adminData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-20 transition-opacity ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="relative flex flex-col w-80 max-w-sm h-full bg-gray-800 shadow-xl">
          <AdminSidebar />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex items-center px-2 lg:px-0">
                  <h1 className="text-2xl font-semibold text-gray-800">{pageTitle}</h1>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <span className="mr-2 h-2 w-2 rounded-full bg-blue-500"></span>
                    {adminData?.name ? (
                      <>
                        {adminData.name}
                        <span className="mx-2 text-blue-400">|</span>
                        <span className="text-blue-700 font-mono">{adminData.username}</span>
                      </>
                    ) : (
                      adminData?.username || 'Admin'
                    )}
                  </span>
                </div>
                <div className="ml-4 flex items-center md:ml-6">
                  <div className="relative">
                    <button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                        {adminData?.username?.charAt(0) || 'A'}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="bg-white shadow-sm rounded-lg p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
