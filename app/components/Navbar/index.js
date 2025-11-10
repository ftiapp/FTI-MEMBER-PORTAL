"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { AnimatePresence } from "framer-motion";

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
  const pathname = usePathname();
  const menuButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { user, logout } = useAuth();

  // Menu items
  const menuItems = useMemo(() => {
    const items = [
      { name: "หน้าแรก", href: "/" },
      { name: "เกี่ยวกับเรา", href: "/about" },
      { name: "ประเภทสมาชิก", href: "/membership" },
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
        <nav className="bg-white/95 backdrop-blur-md shadow-lg w-full fixed top-0 left-0 right-0 z-[9999] border-b border-gray-100">
          <div className="container-custom px-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center py-4">
              <div className="w-[240px] h-[50px] bg-gray-200 animate-pulse rounded-lg"></div>
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
        {showLogoutModal && <LogoutModal onConfirm={confirmLogout} onCancel={cancelLogout} />}
      </AnimatePresence>

      <div className="h-[120px] w-full"></div>

      <nav className="bg-white/95 backdrop-blur-md shadow-lg w-full fixed top-0 left-0 right-0 z-[9999] border-b border-gray-100">
        <div className="container-custom px-4 max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-3 gap-3">
            {/* Logo */}
            <Logo />

            {/* Main Menu Items */}
            <div className="hidden lg:flex items-center gap-3">
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
                    สมัครสมาชิก
                  </ActionButton>

                  <MenuItem
                    item={{ name: "เข้าสู่ระบบ", href: "/login" }}
                    isActive={pathname === "/login"}
                  />
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={menuButtonRef}
              className="lg:hidden p-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 relative z-[9999]"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-blue-700 transition-transform duration-300"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
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
