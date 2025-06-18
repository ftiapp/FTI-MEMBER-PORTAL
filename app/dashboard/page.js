'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from '../components/NotificationBell';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import UpdateMember from './components/UpdateMember/page';
import Wasmember from './components/Wasmember.js/page';
import SubmittedMember from './components/SubmittedMember';
import MemberDetail from './components/MemberDetail/page';
import ContactUs from './components/ContactUs/page';
import RecentActivities from './components/RecentActivities';
import CheckStatusOperation from './components/CheckStatusOperation/page';
import UpgradeMembership from './components/UpgradeMembership';
import MembershipCertificate from './components/MembershipCertificate/page';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // ไม่ตั้งค่าเริ่มต้น ให้ถูกกำหนดจาก URL parameters เท่านั้น
  const [membershipType, setMembershipType] = useState('ทั่วไป');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Create refs for menu items
  const menuRefs = {
    'ติดต่อเรา': useRef(null),
    'ข้อมูลสมาชิก': useRef(null)
  };
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Check URL parameters for tab selection and listen for URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      const messageId = searchParams.get('messageId');
      
      console.log('URL parameters:', { tabParam, messageId });
      
      if (tabParam === 'status') {
        setActiveTab('สถานะการดำเนินการ');
      } else if (tabParam === 'contact') {
        setActiveTab('ติดต่อเรา');
        
        if (messageId && menuRefs['ติดต่อเรา']?.current) {
          console.log('Programmatically clicking Contact Us menu item');
          menuRefs['ติดต่อเรา'].current.click();
        }
      } else if (tabParam === 'member') {
        setActiveTab('ข้อมูลสมาชิก');
        
        if (menuRefs['ข้อมูลสมาชิก']?.current) {
          console.log('Programmatically clicking MemberDetail menu item');
          menuRefs['ข้อมูลสมาชิก'].current.click();
        }
      } else if (tabParam === 'certificatedocument') {
        setActiveTab('เอกสารยืนยันสมาชิก');
        console.log('Setting active tab to เอกสารยืนยันสมาชิก');
      } else if (tabParam === 'wasmember') {
        setActiveTab('ยืนยันสมาชิกเดิม');
        console.log('Setting active tab to ยืนยันสมาชิกเดิม');
      } else if (tabParam === 'updatemember') {
        setActiveTab('อัพเดตสมาชิก');
        console.log('Setting active tab to อัพเดตสมาชิก');
      } else if (tabParam === 'address') {
        setActiveTab('ข้อมูลสมาชิก');
        console.log('Setting active tab to ข้อมูลสมาชิก for address');
        
        if (menuRefs['ข้อมูลสมาชิก']?.current) {
          console.log('Programmatically clicking MemberDetail menu item for address');
          menuRefs['ข้อมูลสมาชิก'].current.click();
        }
      } else if (tabParam === 'profile') {
        setActiveTab('ข้อมูลสมาชิก');
        console.log('Setting active tab to ข้อมูลสมาชิก for profile');
        
        if (menuRefs['ข้อมูลสมาชิก']?.current) {
          console.log('Programmatically clicking MemberDetail menu item for profile');
          menuRefs['ข้อมูลสมาชิก'].current.click();
        }
      } else {
        // ถ้าไม่มีพารามิเตอร์ tab ใน URL ให้ตั้งค่าเริ่มต้นเป็น 'อัพเดตสมาชิก'
        if (!activeTab) {
          setActiveTab('อัพเดตสมาชิก');
          console.log('No tab parameter, setting default tab to อัพเดตสมาชิก');
        }
      }
    };
    
    const handleContactMessageClick = (event) => {
      const { messageId } = event.detail;
      console.log('Contact message clicked event received, messageId:', messageId);
      
      if (menuRefs['ติดต่อเรา']?.current) {
        console.log('Programmatically clicking Contact Us menu item');
        menuRefs['ติดต่อเรา'].current.click();
      }
    };
    
    handleUrlChange();
    
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('contactMessageClicked', handleContactMessageClick);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('contactMessageClicked', handleContactMessageClick);
    };
  }, []);

  const [verificationStatus, setVerificationStatus] = useState({
    isLoading: true,
    submitted: false,
    approved: false,
    rejected: false,
    admin_comment: ''
  });
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user || !user.id) return;
      
      try {
        const response = await fetch(`/api/member/verification-status?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch verification status');
        }
        
        const data = await response.json();
        setVerificationStatus({
          isLoading: false,
          submitted: data.submitted,
          approved: data.approved,
          rejected: data.rejected,
          admin_comment: data.adminComment || ''
        });
        
        if (data.userRole) {
          user.role = data.userRole;
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setVerificationStatus(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };

    fetchVerificationStatus();
  }, [user]);

  if (!user) {
    return null;
  }

  // Dashboard menu items with icons
  const menuItems = [
    {
      name: 'ข้อมูลผู้ใช้งาน',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'ข้อมูลสมาชิก',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'ยืนยันสมาชิกเดิม',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'อัพเกรดสมาชิก',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      name: 'เอกสารยืนยันสมาชิก',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'สถานะการดำเนินการ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      name: 'ติดต่อเรา',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
  ];

  // Simple animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'สถานะการดำเนินการ':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">สถานะการดำเนินการ</h2>
            <CheckStatusOperation />
          </div>
        );
      case 'อัพเดตสมาชิก':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">อัพเดตข้อมูลสมาชิก</h2>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <UpdateMember />
            </div>
          </div>
        );
      case 'เอกสารยืนยันสมาชิก':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">เอกสารยืนยันสมาชิก</h2>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <MembershipCertificate />
            </div>
          </div>
        );
      case 'อัพเกรดสมาชิก':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">อัพเกรดสมาชิก</h2>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <UpgradeMembership />
            </div>
          </div>
        );

      case 'ยืนยันสมาชิกเดิม':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">ยืนยันสมาชิกเดิม</h2>
            <div className="space-y-4 sm:space-y-6">
              <Wasmember />
            </div>
          </div>
        );

      case 'ข้อมูลสมาชิก':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">ข้อมูลสมาชิก</h2>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              {user && user.id ? (
                <MemberDetail userId={user.id} />
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                  <p className="text-gray-600">กำลังโหลดข้อมูลสมาชิก...</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'ข้อมูลผู้ใช้งาน':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">ข้อมูลผู้ใช้งาน</h2>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <UpdateMember />
            </div>
          </div>
        );

      case 'ติดต่อเรา': {
        const searchParams = new URLSearchParams(window.location.search);
        const messageId = searchParams.get('messageId');
        console.log('Dashboard: Rendering ContactUs with messageId:', messageId);
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">ติดต่อเรา</h2>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <ContactUs messageId={messageId} />
            </div>
          </div>
        );
      }
        
      case 'กิจกรรมล่าสุด':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">กิจกรรมล่าสุด</h2>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <RecentActivities />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{activeTab}</h2>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <p>เนื้อหาสำหรับ {activeTab} จะแสดงที่นี่</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        {/* Hero Section - ใช้แบบเดียวกับหน้าอื่น */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24 z-[50]">
          {/* ลด decorative elements ในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}
          
          {/* Dashboard icon - ซ่อนในมือถือ */}
          {!isMobile && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              จัดการสมาชิก
            </h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto text-blue-100">
              จัดการข้อมูลสมาชิกและบริการต่างๆ ของสภาอุตสาหกรรมแห่งประเทศไทย
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
          {/* Dashboard Header */}
          <motion.div 
            className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 relative z-[100]"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                  ยินดีต้อนรับ, {(user.firstname && user.lastname) ? `${user.firstname} ${user.lastname}` : 'สมาชิก'}
                </h2>
                <motion.div 
                  className="w-16 h-1 bg-blue-600 mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: 64 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
                <div className="flex flex-col sm:flex-row sm:items-center mt-4 gap-2">
                  <span className="text-sm sm:text-base text-gray-600">สถานะผู้ใช้งาน:</span>
                  {user.role === 'member' ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium">
                      สมาชิก
                    </span>
                  ) : user.role === 'admin' ? (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                      ผู้ดูแลระบบ
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm font-medium">
                      ผู้ใช้งานทั่วไป
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* กระดิ่งแจ้งเตือน */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="mr-2"
                >
                  <NotificationBell />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Content */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-[150] lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <div 
              className={`
                w-full lg:w-1/4 xl:w-1/5 
                ${sidebarOpen ? 'fixed inset-y-0 left-0 z-[200] w-80 transform translate-x-0' : 'hidden'}
                lg:block lg:relative lg:translate-x-0 lg:z-auto lg:w-1/4 xl:w-1/5
                transition-transform duration-300 ease-in-out
              `}
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden h-full lg:h-auto">
                <div className="bg-blue-700 p-4 sm:p-6 text-white">
                  <h3 className="text-lg sm:text-xl font-bold">เมนูหลัก</h3>
                  <p className="text-blue-100 mt-1 text-sm sm:text-base">จัดการข้อมูลสมาชิกและบริการต่างๆ</p>
                </div>
                
                {/* Mobile sidebar header */}
                <div className="lg:hidden flex justify-between items-center p-4 border-b">
                  <h4 className="text-lg font-bold text-gray-800">เมนู</h4>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="p-3 sm:p-4 max-h-screen overflow-y-auto">
                  <ul className="space-y-1 sm:space-y-2">
                    {menuItems.map((item, index) => (
                      <li key={item.name}>
                        <button
                          ref={menuRefs[item.name] || null}
                          onClick={() => {
                            setSidebarOpen(false);
                            
                            // Update URL based on menu item
                            if (item.name === 'ติดต่อเรา') {
                              const searchParams = new URLSearchParams(window.location.search);
                              const messageId = searchParams.get('messageId');
                              
                              if (messageId) {
                                window.history.pushState({}, '', `/dashboard?tab=contact&messageId=${messageId}`);
                              } else {
                                window.history.pushState({}, '', '/dashboard?tab=contact');
                              }
                            } else if (item.name === 'ข้อมูลสมาชิก') {
                              window.history.pushState({}, '', '/dashboard?tab=member');
                            } else if (item.name === 'เอกสารยืนยันสมาชิก') {
                              window.history.pushState({}, '', '/dashboard?tab=certificatedocument');
                            } else if (item.name === 'สถานะการดำเนินการ') {
                              window.history.pushState({}, '', '/dashboard?tab=status');
                            } else if (item.name === 'ยืนยันสมาชิกเดิม') {
                              window.history.pushState({}, '', '/dashboard?tab=wasmember');
                            } else if (item.name === 'อัพเดตสมาชิก') {
                              window.history.pushState({}, '', '/dashboard?tab=updatemember');
                            }
                            
                            setActiveTab(item.name);
                          }}
                          className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-left ${
                            activeTab === item.name
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className={`flex-shrink-0 ${activeTab === item.name ? 'text-blue-700' : 'text-gray-500'}`}>
                            {item.icon}
                          </span>
                          <span className="text-sm sm:text-base truncate">{item.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full lg:w-3/4 xl:w-4/5">
              {renderTabContent()}
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}