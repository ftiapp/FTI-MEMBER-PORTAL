'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  // Create a logout overlay component
  const LogoutOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="flex flex-col items-center">
        <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <div className="text-white text-lg font-semibold">กำลังออกจากระบบ...</div>
      </div>
    </div>
  );
  
  // Logout confirmation dialog component
  const LogoutConfirmation = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-40">
      <motion.div 
        className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-2">ยืนยันออกจากระบบ</h3>
        <p className="text-gray-600 mb-6">คุณต้องการออกจากระบบใช่หรือไม่?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            ยืนยัน
          </button>
        </div>
      </motion.div>
    </div>
  );
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Fix hydration mismatch by only rendering menu after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Add click outside handler to close menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (isMenuOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          menuButtonRef.current &&
          !menuButtonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    // Add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMenuOpen]);

  const { user, logout, isLoggingOut } = useAuth();
  const router = useRouter();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { name: 'หน้าแรก', href: '/' },
    { name: 'เกี่ยวกับเรา', href: '/about' },
    { name: 'บริการของเรา', href: '/services' },
    { name: 'ประเภทสมาชิก', href: '/membership' },
    { name: 'ติดต่อเรา', href: '/contact' },
  ];

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };
  
  const confirmLogout = () => {
    setShowLogoutConfirmation(false);
    logout();
  };
  
  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  // Optimized animation variants for mobile
  const navVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.3, 
        ease: "easeOut",
        type: "tween"
      } 
    }
  };

  const logoVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02, 
      transition: { 
        type: "tween", 
        duration: 0.2,
        ease: "easeOut"
      } 
    }
  };

  const menuVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        delay: 0.1, 
        duration: 0.3,
        type: "tween"
      } 
    }
  };

  const itemVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      transition: {
        type: "tween",
        duration: 0.15
      }
    },
    tap: { 
      scale: 0.97,
      transition: {
        type: "tween",
        duration: 0.1
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02, 
      transition: {
        type: "tween",
        duration: 0.2
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        type: "tween",
        duration: 0.1
      }
    }
  };

  // Simplified mobile menu animations
  const mobileMenuVariants = {
    hidden: { 
      opacity: 0,
      y: -20,
      transition: { 
        duration: 0.2,
        type: "tween",
        ease: "easeInOut"
      }
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.25,
        type: "tween",
        ease: "easeOut"
      }
    }
  };

  const mobileItemVariants = {
    hidden: { 
      opacity: 0, 
      x: -15,
      transition: { 
        duration: 0.15,
        type: "tween"
      }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.2,
        type: "tween"
      }
    }
  };

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <>
        <div className="h-[80px] w-full"></div>
        <nav className="bg-white shadow-md w-full fixed top-0 left-0 right-0 z-[9999]">
          <div className="container-custom px-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center py-4 flex-wrap md:flex-nowrap">
              <div>
                <Link href="/" className="flex-shrink-0 flex items-center">
                  <Image
                    src="/images/FTI-MasterLogo_RGB_forLightBG.png"
                    alt="สภาอุตสาหกรรมแห่งประเทศไทย"
                    width={90}
                    height={45}
                    priority
                    className="mr-3"
                  />
                  <div className="flex flex-col">
                    <span className="text-blue-900 font-semibold text-lg">สภาอุตสาหกรรมแห่งประเทศไทย</span>
                    <span className="text-gray-600 text-sm">The Federation of Thai Industries</span>
                  </div>
                </Link>
              </div>
              <div className="lg:hidden p-2">
                <svg className="w-7 h-7 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            </div>
          </div>
        </nav>
      </>
    );
  }

  return (
    <>
      {/* Show logout overlay when logging out */}
      {isLoggingOut && <LogoutOverlay />}
      
      {/* Show logout confirmation dialog */}
      <AnimatePresence>
        {showLogoutConfirmation && (
          <LogoutConfirmation 
            onConfirm={confirmLogout} 
            onCancel={cancelLogout} 
          />
        )}
      </AnimatePresence>
      
      {/* Add a spacer div to prevent content from being hidden behind the fixed navbar */}
      <div className="h-[80px] w-full"></div>
      <motion.nav 
        className="bg-white shadow-md w-full fixed top-0 left-0 right-0 z-[9999]"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
      <div className="container-custom px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-4 flex-wrap md:flex-nowrap">
          {/* Logo and Organization Name */}
          <motion.div
            variants={logoVariants}
            initial="initial"
            whileHover="hover"
          >
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/images/FTI-MasterLogo_RGB_forLightBG.png"
                alt="สภาอุตสาหกรรมแห่งประเทศไทย"
                width={90}
                height={45}
                priority
                className="mr-3"
              />
              <div className="flex flex-col">
                <span className="text-blue-900 font-semibold text-lg">สภาอุตสาหกรรมแห่งประเทศไทย</span>
                <span className="text-gray-600 text-sm">The Federation of Thai Industries</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <motion.div 
            className="hidden lg:flex items-center space-x-8"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
          >
            {menuItems.map((item) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    href="/ChangeEmail"
                    className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                  >
                    แจ้งเปลี่ยนอีเมล
                  </Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                  >
                    แดชบอร์ด
                  </Link>
                </motion.div>

                <motion.button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  ออกจากระบบ
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    href="/register"
                    className="px-6 py-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 inline-block"
                  >
                    สมัครสมาชิก
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            ref={menuButtonRef}
            className="lg:hidden p-2 relative z-[9999] touch-manipulation"
            onClick={toggleMenu}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "tween", duration: 0.1 }}
            style={{ 
              pointerEvents: 'auto',
              WebkitTapHighlightColor: 'transparent'
            }}
            aria-label="Toggle menu"
          >
            <svg
              className="w-7 h-7 text-blue-900 font-bold"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
            </svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence mode="wait">
          {isMenuOpen && (
            <motion.div 
              ref={mobileMenuRef}
              className="lg:hidden w-full fixed top-[80px] left-0 right-0 bg-white z-[9998] shadow-lg border-t"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ 
                pointerEvents: 'auto',
                height: 'calc(100vh - 80px)',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="flex flex-col py-4">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    variants={mobileItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98, x: 5 }}
                    className="touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-6 py-4 block hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="border-t border-gray-200 mt-2 pt-4">
                  {user ? (
                    <>
                      <motion.div 
                        variants={mobileItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ delay: menuItems.length * 0.05 }}
                        whileTap={{ scale: 0.98, x: 5 }}
                        className="touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Link
                          href="/ChangeEmail"
                          className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-6 py-4 block hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          แจ้งเปลี่ยนอีเมล
                        </Link>
                      </motion.div>
                      <motion.div 
                        variants={mobileItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ delay: (menuItems.length + 1) * 0.05 }}
                        whileTap={{ scale: 0.98, x: 5 }}
                        className="touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Link
                          href="/dashboard"
                          className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-6 py-4 block hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          แดชบอร์ด
                        </Link>
                      </motion.div>

                      <motion.div 
                        className="px-6 py-4"
                        variants={mobileItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ delay: (menuItems.length + 2) * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold w-full transition-colors"
                        >
                          ออกจากระบบ
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div 
                        variants={mobileItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ delay: menuItems.length * 0.05 }}
                        whileTap={{ scale: 0.98, x: 5 }}
                        className="touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Link
                          href="/login"
                          className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-6 py-4 block hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          เข้าสู่ระบบ
                        </Link>
                      </motion.div>
                      <motion.div 
                        className="px-6 py-4" 
                        variants={mobileItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ delay: (menuItems.length + 1) * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Link
                          href="/register"
                          className="px-6 py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white rounded-full font-semibold text-center block w-full transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          สมัครสมาชิก
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
    </>
  );
}