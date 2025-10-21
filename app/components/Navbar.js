"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Memoized subcomponents for better performance
const LogoutOverlay = memo(() => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
  >
    <motion.div
      className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-2xl"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div className="relative">
        <div className="animate-spin h-14 w-14 border-4 border-blue-200 border-t-blue-600 rounded-full mb-6"></div>
        <div className="absolute inset-0 h-14 w-14 border-4 border-transparent border-t-blue-400 rounded-full animate-pulse"></div>
      </div>
      <div className="text-gray-800 text-lg font-semibold">กำลังออกจากระบบ...</div>
      <div className="text-gray-500 text-sm mt-2">โปรดรอสักครู่</div>
    </motion.div>
  </motion.div>
));

const LogoutConfirmation = memo(({ onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
  >
    <motion.div
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100"
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">ยืนยันออกจากระบบ</h3>
          <p className="text-gray-500 text-sm">คุณแน่ใจหรือไม่?</p>
        </div>
      </div>
      <p className="text-gray-600 mb-8">การออกจากระบบจะทำให้คุณต้องเข้าสู่ระบบใหม่อีกครั้ง</p>
      <div className="flex justify-end space-x-3">
        <motion.button
          onClick={onCancel}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 border border-gray-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ยกเลิก
        </motion.button>
        <motion.button
          onClick={onConfirm}
          className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ยืนยัน
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
));

// Enhanced logo component
const Logo = memo(() => (
  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
    <Link href="/" className="flex-shrink-0 flex items-center group">
      <div className="relative">
        <Image
          src="/FTI-MasterLogo-Naming_RGB-forLightBG.png"
          alt="สภาอุตสาหกรรมแห่งประเทศไทย (FTI Portal)"
          width={280}
          height={62}
          priority
          className="transition-all duration-300 group-hover:drop-shadow-md"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      </div>
    </Link>
  </motion.div>
));

// Enhanced menu item component
const MenuItem = memo(({ item, isActive, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group
        ${
          isActive
            ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-200"
            : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
        }
      `}
    >
      <span className="relative z-10">{item.name}</span>
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      )}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl"
          layoutId="activeNavBg"
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      )}
    </Link>
  </motion.div>
));

// Enhanced button component
const ActionButton = memo(
  ({ href, children, variant = "primary", external = false, className = "", onClick }) => {
    const baseClasses =
      "px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg relative overflow-hidden group";
    const variants = {
      primary:
        "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5",
      secondary:
        "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300",
      search:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5",
    };

    const Component = external ? "a" : Link;
    const linkProps = external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Component
          {...linkProps}
          onClick={onClick}
          className={`${baseClasses} ${variants[variant]} ${className}`}
        >
          <span className="relative z-10">{children}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Component>
      </motion.div>
    );
  },
);

// Enhanced user menu
const UserMenu = memo(({ user, isOpen, onToggle, onClose, onLogout }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userInfoTabActive = pathname === "/dashboard" && searchParams?.get("tab") === "userinfo";

  return (
    <div className="relative">
      <motion.button
        onClick={onToggle}
        className={`
          p-3 rounded-full shadow-lg transition-all duration-300 border-2
          ${
            userInfoTabActive
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-300 shadow-blue-200"
              : "bg-white text-blue-700 border-blue-200 hover:border-blue-300 hover:shadow-blue-100"
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="เมนูผู้ใช้งาน"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-[10000]"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user.firstname && user.lastname
                      ? `${user.firstname} ${user.lastname}`
                      : "ผู้ใช้งาน"}
                  </p>
                  {user.email && <p className="text-xs text-gray-600 truncate">{user.email}</p>}
                </div>
              </div>
            </div>
            <div className="py-2">
              <Link
                href="/dashboard?tab=userinfo"
                className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                onClick={onClose}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span>ข้อมูลผู้ใช้งาน</span>
              </Link>
              <Link
                href="/ChangeEmail"
                className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                onClick={onClose}
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-200 transition-colors">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 4l-9-6 9-6 9 6-9 6z"
                    />
                  </svg>
                </div>
                <span>แจ้งเปลี่ยนอีเมล</span>
              </Link>
              <Link
                href="/dashboard?tab=contact"
                className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                onClick={onClose}
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-200 transition-colors">
                  <svg
                    className="w-4 h-4 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <span>ติดต่อเรา</span>
              </Link>
              <div className="border-t border-gray-100 my-2"></div>
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center px-6 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const { user, logout, isLoggingOut } = useAuth();

  // Memoized menu items
  const menuItems = useMemo(() => {
    const items = [
      { name: "หน้าแรก", href: "/" },
      { name: "เกี่ยวกับเรา", href: "/about" },
      { name: "ประเภทสมาชิก", href: "/membership" },
      { name: "ติดต่อเรา", href: "/contact" },
    ];

    if (user) {
      // แสดงเฉพาะ "หน้าแรก" และ "เกี่ยวกับเรา" สำหรับผู้ที่ login แล้ว
      const allowedForAuthenticated = new Set(["หน้าแรก", "เกี่ยวกับเรา"]);
      return items.filter((item) => allowedForAuthenticated.has(item.name));
    }

    return items;
  }, [user]);

  const handleLogout = useCallback(() => {
    setShowLogoutConfirmation(true);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      const next = !prev;
      if (!prev) {
        setIsUserMenuOpen(false);
      }
      return next;
    });
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

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => {
      const next = !prev;
      if (!prev) {
        setIsMenuOpen(false);
      }
      return next;
    });
  }, []);

  const closeUserMenu = useCallback(() => {
    setIsUserMenuOpen(false);
  }, []);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }

      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, isUserMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isMenuOpen]);

  // Loading state
  if (!mounted) {
    return (
      <>
        <div className="h-[85px] w-full"></div>
        <nav className="bg-white/95 backdrop-blur-md shadow-lg w-full fixed top-0 left-0 right-0 z-[9999] border-b border-gray-100">
          <div className="container-custom px-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center py-5">
              <div className="w-[280px] h-[62px] bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="lg:hidden p-3">
                <div className="w-7 h-7 bg-gray-300 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </nav>
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isLoggingOut && <LogoutOverlay />}
        {showLogoutConfirmation && (
          <LogoutConfirmation onConfirm={confirmLogout} onCancel={cancelLogout} />
        )}
      </AnimatePresence>

      <div className="h-[85px] w-full"></div>

      <motion.nav
        className="bg-white/95 backdrop-blur-md shadow-lg w-full fixed top-0 left-0 right-0 z-[9999] border-b border-gray-100"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="container-custom px-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-5">
            {/* Logo */}
            <Logo />

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MenuItem item={item} isActive={pathname === item.href} />
                  </motion.div>
                ))}
              </div>

              {user ? (
                <motion.div
                  className="flex items-center space-x-4 pl-6 border-l border-gray-200"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {/* Search Button */}
                  <ActionButton
                    href="https://membersearch.fti.or.th/"
                    variant="search"
                    external={true}
                  >
                    ค้นหาสมาชิก
                  </ActionButton>

                  {/* Management Button */}
                  <ActionButton
                    href="/dashboard?tab=documents"
                    variant="primary"
                    className={
                      pathname === "/dashboard" ? "ring-2 ring-blue-300 ring-offset-2" : ""
                    }
                  >
                    จัดการสมาชิก
                  </ActionButton>

                  {/* User Menu */}
                  <div ref={userMenuRef}>
                    <UserMenu
                      user={user}
                      isOpen={isUserMenuOpen}
                      onToggle={toggleUserMenu}
                      onClose={closeUserMenu}
                      onLogout={handleLogout}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center space-x-4 pl-6 border-l border-gray-200"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <MenuItem
                    item={{ name: "เข้าสู่ระบบ", href: "/login" }}
                    isActive={pathname === "/login"}
                  />
                  <ActionButton href="/register" variant="primary">
                    สมัครสมาชิกเว็บไซต์
                  </ActionButton>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              ref={menuButtonRef}
              className="lg:hidden p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 relative z-[9999]"
              onClick={toggleMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <motion.svg
                className="w-6 h-6 text-blue-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </motion.svg>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence mode="wait">
            {isMenuOpen && (
              <motion.div
                ref={mobileMenuRef}
                className="lg:hidden w-full fixed top-[85px] left-0 right-0 bg-white z-[9998] shadow-2xl border-t-2 border-gray-300 max-h-[calc(100vh-85px)] overflow-y-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="flex flex-col py-4 px-6 space-y-3">
                  {/* ส่วนที่ 1: เมนูหลัก - หน้าแรก / เกี่ยวกับเรา */}
                  <div className="space-y-1">
                    <div className="px-4 mb-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        เมนูหลัก
                      </h3>
                    </div>
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          className={`
                            font-medium transition-all duration-300 px-6 py-3 block rounded-xl relative group
                            ${
                              pathname === item.href
                                ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-200"
                                : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                            }
                          `}
                          onClick={closeMenu}
                        >
                          <span className="relative z-10">{item.name}</span>
                          {pathname !== item.href && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {user ? (
                    <>
                      {/* ส่วนที่ 2: ค้นหาสมาชิก / จัดการสมาชิก */}
                      <div className="space-y-1 pt-3 border-t border-gray-200">
                        <div className="px-4 mb-1">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            บริการสมาชิก
                          </h3>
                        </div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.12 }}
                        >
                          <Link
                            href="https://membersearch.fti.or.th/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-4 py-2.5 rounded-md text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <svg
                              className="w-5 h-5 mr-3 text-emerald-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                              />
                            </svg>
                            <span className="text-sm font-medium">ค้นหาสมาชิก</span>
                          </Link>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.16 }}
                        >
                          <Link
                            href="/dashboard?tab=documents"
                            onClick={closeMenu}
                            className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                              pathname === "/dashboard"
                                ? "text-blue-700 bg-blue-50"
                                : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                            }`}
                          >
                            <svg
                              className="w-5 h-5 mr-3 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7h18M3 12h18M3 17h18"
                              />
                            </svg>
                            <span className="text-sm font-medium">จัดการสมาชิก</span>
                          </Link>
                        </motion.div>
                      </div>

                      {/* ส่วนที่ 3: ไอคอนคน - ข้อมูลส่วนตัว */}
                      <div className="space-y-1 pt-3 border-t border-gray-200">
                        <div className="px-4 mb-1">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            บัญชีของฉัน
                          </h3>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                        >
                          <Link
                            href="/dashboard?tab=userinfo"
                            className="font-medium transition-all duration-300 px-6 py-3 block rounded-xl text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3"
                            onClick={closeMenu}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span>ข้อมูลส่วนตัว</span>
                          </Link>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.12 }}
                        >
                          <Link
                            href="/ChangeEmail"
                            className="font-medium transition-all duration-300 px-6 py-3 block rounded-xl text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3"
                            onClick={closeMenu}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 4l-9-6 9-6 9 6-9 6z"
                              />
                            </svg>
                            <span>แจ้งเปลี่ยนอีเมล</span>
                          </Link>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.14 }}
                        >
                          <Link
                            href="/dashboard?tab=contact"
                            className="font-medium transition-all duration-300 px-6 py-3 block rounded-xl text-gray-700 hover:text-blue-700 hover:bg-blue-50 flex items-center space-x-3"
                            onClick={closeMenu}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span>ติดต่อเรา</span>
                          </Link>
                        </motion.div>

                        <motion.div
                          className="pt-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.16 }}
                        >
                          <button
                            onClick={() => {
                              handleLogout();
                              closeMenu();
                            }}
                            className="text-red-600 hover:text-red-700 transition-colors duration-300 font-medium flex items-center space-x-3 px-6 py-4 rounded-xl hover:bg-red-50 w-full"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                              </svg>
                            </div>
                            <span>ออกจากระบบ</span>
                          </button>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        <Link
                          href="/login"
                          className={`
                            font-medium transition-all duration-300 px-6 py-4 block rounded-xl
                            ${
                              pathname === "/login"
                                ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-200"
                                : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                            }
                          `}
                          onClick={closeMenu}
                        >
                          เข้าสู่ระบบ
                        </Link>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.15 }}
                      >
                        <ActionButton
                          href="/register"
                          variant="primary"
                          className="w-full text-center"
                          onClick={closeMenu}
                        >
                          สมัครสมาชิกเว็บไซต์
                        </ActionButton>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
}
