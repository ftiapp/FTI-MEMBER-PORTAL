'use client';

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Memoized subcomponents for better performance
const LogoutOverlay = memo(() => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="flex flex-col items-center">
      <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <div className="text-white text-lg font-semibold">กำลังออกจากระบบ...</div>
    </div>
  </div>
));

const LogoutConfirmation = memo(({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-40">
    <motion.div 
      className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
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
));

// Memoized logo component
const Logo = memo(() => (
  <Link href="/" className="flex-shrink-0 flex items-center">
    <Image
      src="/FTI-MasterLogo-Naming_RGB-forLightBG.png"
      alt="สภาอุตสาหกรรมแห่งประเทศไทย (FTI Portal)"
      width={300}
      height={66}
      priority
    />
  </Link>
));

// Memoized menu item component
const MenuItem = memo(({ item, isActive, onClick }) => (
  <motion.div
    initial={{ scale: 1 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.1 }}
  >
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        text-gray-700 hover:text-blue-900 font-medium transition-all duration-200 relative
        ${isActive ? 'text-blue-900 font-semibold' : ''}
      `}
    >
      {item.name}
      {isActive && (
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-900 rounded-full"
          layoutId="activeIndicator"
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
    </Link>
  </motion.div>
));

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { user, logout, isLoggingOut } = useAuth();

  // Memoized menu items
  const menuItems = useMemo(() => [
    { name: 'หน้าแรก', href: '/' },
    { name: 'เกี่ยวกับเรา', href: '/about' },
 
    { name: 'ประเภทสมาชิก', href: '/membership' },
    { name: 'ติดต่อเรา', href: '/contact' },
  ], []);

  // Optimized event handlers with useCallback
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    setShowLogoutConfirmation(true);
  }, []);
  
  const confirmLogout = useCallback(() => {
    setShowLogoutConfirmation(false);
    logout();
  }, [logout]);
  
  const cancelLogout = useCallback(() => {
    setShowLogoutConfirmation(false);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Optimized click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          menuButtonRef.current &&
          !menuButtonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  // Optimized animation variants (simplified)
  const navVariants = useMemo(() => ({
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
  }), []);

  const mobileMenuVariants = useMemo(() => ({
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
  }), []);

  // Loading state with minimal layout
  if (!mounted) {
    return (
      <>
        <div className="h-[80px] w-full"></div>
        <nav className="bg-white shadow-md w-full fixed top-0 left-0 right-0 z-[9999]">
          <div className="container-custom px-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center py-4">
              <Logo />
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
      {isLoggingOut && <LogoutOverlay />}
      
      <AnimatePresence mode="wait">
        {showLogoutConfirmation && (
          <LogoutConfirmation 
            onConfirm={confirmLogout} 
            onCancel={cancelLogout} 
          />
        )}
      </AnimatePresence>
      
      <div className="h-[80px] w-full"></div>
      <motion.nav 
        className="bg-white shadow-md w-full fixed top-0 left-0 right-0 z-[9999]"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container-custom px-4 max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            >
              <Logo />
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <MenuItem 
                  key={item.name}
                  item={item}
                  isActive={pathname === item.href}
                />
              ))}
              
              {user ? (
                <div className="flex items-center space-x-6">
                  <MenuItem 
                    item={{ name: 'แจ้งเปลี่ยนอีเมล', href: '/ChangeEmail' }}
                    isActive={pathname === '/ChangeEmail'}
                  />
                  
                  {/* จัดการสมาชิก - Most prominent */}
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Link
                      href="/dashboard?tab=documents"
                      className={`
                        px-4 py-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 
                        text-white rounded-lg font-semibold hover:shadow-lg 
                        transition-all duration-200 relative overflow-hidden
                        ${pathname === '/dashboard' ? 'ring-2 ring-blue-300 ring-offset-2' : ''}
                      `}
                    >
                      <span className="relative z-10">จัดการสมาชิก</span>
                      {pathname === '/dashboard' && (
                        <motion.div
                          className="absolute inset-0 bg-white opacity-10"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                      )}
                    </Link>
                  </motion.div>

                  {/* Logout button - icon only */}
                  <motion.button
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 ring-1 ring-gray-200 hover:ring-red-200 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="ออกจากระบบ"
                    aria-label="ออกจากระบบ"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      />
                    </svg>
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <MenuItem 
                    item={{ name: 'เข้าสู่ระบบ', href: '/login' }}
                    isActive={pathname === '/login'}
                  />
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Link
                      href="/register"
                      className="px-6 py-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      สมัครสมาชิก
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              ref={menuButtonRef}
              className="lg:hidden p-2 relative z-[9999]"
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              aria-label="Toggle menu"
            >
              <svg
                className="w-7 h-7 text-blue-900"
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
                  height: 'calc(100vh - 80px)',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div className="flex flex-col py-4">
                  {menuItems.map((item) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={item.href}
                        className={`
                          font-medium transition-colors px-6 py-4 block hover:bg-gray-50 relative
                          ${pathname === item.href ? 'text-blue-900 font-semibold bg-blue-50' : 'text-gray-700 hover:text-blue-900'}
                        `}
                        onClick={closeMenu}
                      >
                        {item.name}
                        {pathname === item.href && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-900"></div>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                  
                  <div className="border-t border-gray-200 mt-2 pt-4">
                    {user ? (
                      <>
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: 0.1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link
                            href="/ChangeEmail"
                            className={`
                              font-medium transition-colors px-6 py-4 block hover:bg-gray-50 relative
                              ${pathname === '/ChangeEmail' ? 'text-blue-900 font-semibold bg-blue-50' : 'text-gray-700 hover:text-blue-900'}
                            `}
                            onClick={closeMenu}
                          >
                            แจ้งเปลี่ยนอีเมล
                            {pathname === '/ChangeEmail' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-900"></div>
                            )}
                          </Link>
                        </motion.div>
                        
                        {/* จัดการสมาชิก - Mobile prominent */}
                        <motion.div 
                          className="px-6 py-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: 0.15 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link
                            href="/dashboard?tab=documents"
                            className={`
                              px-4 py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 
                              text-white rounded-lg font-semibold w-full transition-all block text-center
                              ${pathname === '/dashboard' ? 'ring-2 ring-blue-300 ring-offset-2' : ''}
                            `}
                            onClick={closeMenu}
                          >
                            จัดการสมาชิก
                          </Link>
                        </motion.div>

                        {/* Minimal logout for mobile */}
                        <motion.div 
                          className="px-6 py-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: 0.2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <button
                            onClick={() => {
                              handleLogout();
                              closeMenu();
                            }}
                            className="text-gray-500 hover:text-red-600 transition-colors text-sm flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                              />
                            </svg>
                            <span>ออกจากระบบ</span>
                          </button>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: 0.1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link
                            href="/login"
                            className={`
                              font-medium transition-colors px-6 py-4 block hover:bg-gray-50 relative
                              ${pathname === '/login' ? 'text-blue-900 font-semibold bg-blue-50' : 'text-gray-700 hover:text-blue-900'}
                            `}
                            onClick={closeMenu}
                          >
                            เข้าสู่ระบบ
                            {pathname === '/login' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-900"></div>
                            )}
                          </Link>
                        </motion.div>
                        <motion.div 
                          className="px-6 py-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: 0.15 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link
                            href="/register"
                            className="px-6 py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white rounded-full font-semibold text-center block w-full transition-all"
                            onClick={closeMenu}
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