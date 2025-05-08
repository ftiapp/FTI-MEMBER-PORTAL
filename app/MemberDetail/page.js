'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import MemberDetailComponent from './components/MemberDetailComponent';
import MemberTypeSelector from './components/MemberTypeSelector';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

/**
 * MemberDetail page component
 * Displays detailed information about a member based on the memberCode URL parameter
 */
export default function MemberDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [memberCode, setMemberCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemberType, setSelectedMemberType] = useState(null);
  const [memberTypeCode, setMemberTypeCode] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState(null);
  const { user, isLoading: authLoading } = useAuth();
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };
  
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    tap: { scale: 0.95 }
  };
  
  // Check authentication, authorization, and get member code from URL
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // If user is not logged in, redirect to login page
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent('/MemberDetail' + window.location.search));
      return;
    }
    
    // Get member code and type from URL query parameters if available
    const codeFromUrl = searchParams.get('memberCode');
    const typeFromUrl = searchParams.get('memberType');
    const typeCodeFromUrl = searchParams.get('typeCode');
    const accessToken = sessionStorage.getItem('memberDetailAccess');
    
    if (!codeFromUrl) {
      // If no member code is provided, redirect to dashboard
      router.push('/dashboard');
      return;
    }
    
    // Set member code and type for UI rendering
    setMemberCode(codeFromUrl);
    if (typeFromUrl) {
      setSelectedMemberType(typeFromUrl);
      if (typeCodeFromUrl) {
        setMemberTypeCode(typeCodeFromUrl);
      }
    }
    
    // Check if user is authorized to view this member
    const checkAuthorization = async () => {
      try {
        // First check if we have a valid access token in session storage
        // This token is set when navigating from the dashboard
        if (accessToken && accessToken.includes(codeFromUrl)) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
        
        // If no token or token doesn't match, verify ownership via API
        const response = await fetch(`/api/member/verify-ownership?memberCode=${encodeURIComponent(codeFromUrl)}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();
        
        if (data.success && data.isOwner) {
          setIsAuthorized(true);
          // Store the access token for future use
          sessionStorage.setItem('memberDetailAccess', `${codeFromUrl}_${Date.now()}`);
        } else {
          setAuthError(data.message || 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลสมาชิกนี้');
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setAuthError('ไม่สามารถตรวจสอบสิทธิ์การเข้าถึงได้');
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthorization();
  }, [searchParams, router, user, authLoading]);
  
  const handleBackToDashboard = () => {
    router.push('/dashboard?tab=member');
  };
  
  const handleMemberTypeSelect = (type, code) => {
    setSelectedMemberType(type);
    setMemberTypeCode(code);
    
    // Update URL with the selected type without reloading the page
    const params = new URLSearchParams(window.location.search);
    params.set('memberType', type);
    if (code) {
      params.set('typeCode', code);
    } else {
      params.delete('typeCode');
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };
  
  const handleBackToTypeSelection = () => {
    setSelectedMemberType(null);
    setMemberTypeCode(null);
    
    // Update URL to remove the type parameters
    const params = new URLSearchParams(window.location.search);
    params.delete('memberType');
    params.delete('typeCode');
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };
  
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div 
          className="min-h-screen bg-gray-50 pt-20 pb-12"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          <div className="container mx-auto px-4 py-8">
            {/* Title and description */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-blue-600 mb-2">ข้อมูลสมาชิก</h1>
              <p className="text-gray-600">
                {memberCode && (
                  <span>ข้อมูลสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย </span>
                )}
              </p>
            </motion.div>
            
            {/* Navigation breadcrumb */}
            <nav className="flex items-center mb-6 bg-white p-3 rounded-lg shadow-sm">
              <motion.button
                onClick={handleBackToDashboard}
                className="flex items-center text-blue-600 hover:text-blue-800"
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>แดชบอร์ด</span>
              </motion.button>
              
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">ข้อมูลสมาชิก</span>
              
              {selectedMemberType && (
                <>
                  <span className="mx-2 text-gray-500">/</span>
                  <motion.button
                    onClick={handleBackToTypeSelection}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span>ประเภทสมาชิก</span>
                  </motion.button>
                </>
              )}
            </nav>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            ) : !isAuthorized ? (
              <motion.div 
                className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="font-medium">ไม่สามารถเข้าถึงข้อมูลได้</p>
                <p>{authError || 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลสมาชิกนี้'}</p>
                <button 
                  onClick={handleBackToDashboard}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  กลับไปหน้าแดชบอร์ด
                </button>
              </motion.div>
            ) : memberCode ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {selectedMemberType ? (
                  <div className="space-y-4">
                    <MemberDetailComponent 
                      memberCode={memberCode} 
                      selectedMemberType={selectedMemberType}
                      memberTypeCode={memberTypeCode}
                    />
                  </div>
                ) : (
                  <MemberTypeSelector 
                    memberCode={memberCode} 
                    onSelectType={handleMemberTypeSelect} 
                  />
                )}
              </motion.div>
            ) : (
              <motion.div 
                className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p>ไม่พบรหัสสมาชิกที่ระบุ กรุณากลับไปที่หน้าแดชบอร์ด</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      <Footer />
    </>
  );
}