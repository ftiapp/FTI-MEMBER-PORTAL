'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by only rendering menu after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    { name: 'หน้าแรก', href: '/' },
    { name: 'เกี่ยวกับเรา', href: '/about' },
    { name: 'บริการของเรา', href: '/services' },
    { name: 'ประเภทสมาชิก', href: '/membership' },
    { name: 'ติดต่อเรา', href: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Animation variants
  const navVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const logoVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 10 } }
  };

  const menuVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.2, duration: 0.5 } }
  };

  const itemVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
    tap: { scale: 0.95 }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.nav 
      className="bg-white shadow-md w-full"
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
          {mounted && (
            <motion.button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
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
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mounted && isMenuOpen && (
            <motion.div 
              className="lg:hidden py-4 border-t w-full"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-4 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                {user ? (
                  <>
                    <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/ChangeEmail"
                        className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-4 block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        แจ้งเปลี่ยนอีเมลล์
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/dashboard"
                        className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-4 block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        แดชบอร์ด
                      </Link>
                    </motion.div>
                    <motion.div 
                      className="px-4"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ออกจากระบบ
                      </motion.button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/login"
                        className="text-gray-700 hover:text-blue-900 font-medium transition-colors px-4 block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        เข้าสู่ระบบ
                      </Link>
                    </motion.div>
                    <motion.div className="px-4" whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/register"
                        className="px-6 py-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white rounded-full font-semibold text-center inline-block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        สมัครสมาชิก
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
