"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

// Import components
import Logo from "./Logo.js";
import MenuItem from "./MenuItem.js";
import ActionButton from "./ActionButton.js";
import UserMenu from "./UserMenu.js";
import LogoutModal from "./LogoutModal.js";
import MobileMenu from "./MobileMenu.js";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const pathname = usePathname();
  const menuButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { user, logout } = useAuth();

  // Menu items
  const menuItems = useMemo(() => {
    const items = [
      { name: "หน้าแรก", href: "/" },
      { name: "ประเภทสมาชิก", href: "/membership" },
      {
        name: "แบบฟอร์มต่างๆ",
        href: "https://drive.google.com/drive/folders/1xrkRrJvav_Org6DPSYDKuONooWO8ADcI",
        external: true,
      },
    ];

    // "ติดต่อเรา" removed for guest users to prevent UI crowding

    return items;
  }, [user]);

  const handleLogout = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const confirmLogout = useCallback(() => {
    setShowLogoutModal(false);
    logout();
  }, [logout]);

  const cancelLogout = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track window scroll position for nav animations
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setScrollY(window.scrollY || 0);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
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
    };

    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

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
        <div className="h-[120px] w-full"></div>
        <nav className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none">
          <div className="container-custom px-4 max-w-[1500px] mx-auto">
            <div className="flex justify-center items-center py-3">
              <div className="pointer-events-auto w-full lg:w-auto">
                <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-full px-4 py-2 flex items-center justify-between gap-3">
                  <div className="w-[180px] h-[40px] bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
                    <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-full"></div>
                    <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-full"></div>
                    <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-full"></div>
                  </div>
                  <div className="lg:hidden p-2">
                    <div className="w-7 h-7 bg-gray-300 animate-pulse rounded" />
                  </div>
                </div>
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
        {showLogoutModal && <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />}
      </AnimatePresence>

      <div className="h-[120px] w-full"></div>

      <nav className="fixed top-0 left-0 right-0 z-[9999] flex justify-center">
        <div className="container-custom px-4 max-w-[1500px] mx-auto">
          <div className="flex justify-center items-start pt-3">
            <motion.div
              className="pointer-events-auto w-full lg:w-auto"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <motion.div
                className="bg-white/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center justify-between gap-3 shadow-sm border border-gray-100"
                animate={{
                  boxShadow:
                    scrollY >= 120
                      ? "0 18px 45px rgba(15,23,42,0.28)"
                      : "0 6px 18px rgba(15,23,42,0.12)",
                  paddingInline: scrollY >= 120 ? 20 : 16,
                  paddingBlock: scrollY >= 120 ? 10 : 8,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {/* Logo */}
                <motion.div
                  className="flex-shrink-0"
                  animate={{
                    y: scrollY >= 120 ? -8 : 0,
                    opacity: scrollY >= 120 ? 0.9 : 1,
                    scale: scrollY >= 120 ? 0.9 : 1,
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Logo />
                </motion.div>

                {/* Main Menu Items */}
                <div className="hidden lg:flex items-center gap-2.5">
                  {menuItems.map((item) => (
                    <MenuItem key={item.name} item={item} isActive={pathname === item.href} />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
                  {user ? (
                    <>
                      {/* Search Button */}
                      <ActionButton
                        href="https://membersearch.fti.or.th/"
                        variant="search"
                        external={true}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        ค้นหาสมาชิก
                      </ActionButton>

                      {/* Payment Button */}
                      <ActionButton
                        href="https://epayment.fti.or.th/"
                        variant="secondary"
                        external={true}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        ชำระเงินออนไลน์
                      </ActionButton>

                      {/* Management Button */}
                      <ActionButton
                        href="/dashboard?tab=documents"
                        variant="primary"
                        className={
                          pathname === "/dashboard" ? "ring-2 ring-blue-300 ring-offset-2" : ""
                        }
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        จัดการสมาชิก
                      </ActionButton>

                      {/* User Menu */}
                      <UserMenu user={user} onLogout={handleLogout} />
                    </>
                  ) : (
                    <>
                      {/* Search Button for Guest */}
                      <ActionButton
                        href="https://membersearch.fti.or.th/"
                        variant="search"
                        external={true}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        ค้นหาสมาชิก
                      </ActionButton>

                      {/* Payment Button for Guest */}
                      <ActionButton
                        href="https://epayment.fti.or.th/"
                        variant="secondary"
                        external={true}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        ชำระเงินออนไลน์
                      </ActionButton>

                      <ActionButton href="/register" variant="primary">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                        สมัครสมาชิกเว็บไซต์
                      </ActionButton>

                      <MenuItem
                        item={{ name: "เข้าสู่ระบบ", href: "/login" }}
                        isActive={pathname === "/login"}
                      />
                    </>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                  ref={menuButtonRef}
                  className="lg:hidden relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200"
                  onClick={toggleMenu}
                  aria-label="Toggle menu"
                  animate={isMenuOpen ? "open" : "closed"}
                >
                  <motion.span
                    className="absolute h-0.5 w-5 bg-blue-800"
                    style={{ left: "50%", top: "35%", x: "-50%", y: "-50%" }}
                    variants={{
                      open: { rotate: 45, top: "50%" },
                      closed: { rotate: 0, top: "35%" },
                    }}
                    transition={{ duration: 0.25 }}
                  />
                  <motion.span
                    className="absolute h-0.5 w-5 bg-blue-800"
                    style={{ left: "50%", top: "50%", x: "-50%", y: "-50%" }}
                    variants={{
                      open: { opacity: 0 },
                      closed: { opacity: 1 },
                    }}
                    transition={{ duration: 0.25 }}
                  />
                  <motion.span
                    className="absolute h-0.5 w-5 bg-blue-800"
                    style={{ left: "50%", top: "65%", x: "-50%", y: "-50%" }}
                    variants={{
                      open: { rotate: -45, top: "50%" },
                      closed: { rotate: 0, top: "65%" },
                    }}
                    transition={{ duration: 0.25 }}
                  />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence mode="wait">
            {isMenuOpen && (
              <div ref={mobileMenuRef}>
                <MobileMenu
                  menuItems={menuItems}
                  user={user}
                  pathname={pathname}
                  onClose={closeMenu}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
}
