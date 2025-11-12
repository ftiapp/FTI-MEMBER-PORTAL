"use client";

import { useState, useEffect, useRef } from "react";
import "./styles/animations.css";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "./AdminSidebar";
import { useAdminData } from "./hooks/useAdminData";
import { useNavigation } from "./hooks/useNavigation";
import { MenuIcons } from "./MenuIcons";
import LogoutConfirmationDialog from "./LogoutConfirmationDialog";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const { loading: navLoading, activePath, handleLogout } = useNavigation();

  // Set page title based on current path
  useEffect(() => {
    const pathSegments = pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];

    let title = "";
    switch (lastSegment) {
      case "admin":
        title = "แดชบอร์ด";
        break;

      case "verifications":
        title = "ยืนยันตัวตนสมาชิก";
        break;
      case "contact-messages":
        title = "ข้อคิดเห็นเพิ่มเติม";
        break;
      case "recent-activities":
        title = "กิจกรรมล่าสุด";
        break;
      case "settings":
        title = "ตั้งค่าระบบ";
        break;
      default:
        title = "FTI-Portal Management";
    }

    setPageTitle(title);
  }, [pathname]);

  // Use the optimized hook for admin data
  const { adminData: adminSessionData, isLoading } = useAdminData();

  // Update local state when admin data changes
  useEffect(() => {
    if (adminSessionData) {
      setAdminData(adminSessionData);
      setLoading(false);
    } else if (!isLoading && !adminSessionData) {
      // If not loading and no admin data, redirect to login
      router.push("/admin", { scroll: false });
    }
  }, [adminSessionData, isLoading, router]);

  // Handle link clicks to prevent full page reloads
  const handleLinkClick = (e, href) => {
    e.preventDefault();
    // ใช้ scroll: false เพื่อป้องกันการเลื่อนหน้าไปด้านบนเมื่อมีการนำทาง
    router.push(href, { scroll: false });
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  if (loading || !adminData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 fade-in">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute inset-0 rounded-full h-12 w-12 border-2 border-blue-200 animate-ping opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-20 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div
          className={`relative flex flex-col w-72 sm:w-80 max-w-sm h-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 shadow-2xl transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h2 className="text-white font-semibold text-lg">เมนู</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-slate-700/50 transition-colors"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <AdminSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-xl z-10 border-b border-slate-700/50">
          <div className="px-2 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center min-w-0 flex-1">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 md:hidden"
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div className="flex items-center ml-2 sm:ml-0 min-w-0">
                  <img
                    src="\FTI-MasterLogo_RGB-White.png"
                    alt="FTI Logo"
                    className="h-8 sm:h-10 w-auto flex-shrink-0"
                  />
                  {/* Hide text on mobile, show on md+ */}
                  <div className="hidden md:block ml-3 mr-4">
                    <div className="font-semibold text-sm text-white">
                      สภาอุตสาหกรรมแห่งประเทศไทย
                    </div>
                    <div className="text-xs text-slate-300">The Federation of Thai Industries</div>
                  </div>
                  {/* Page title - hide on mobile, show on lg+ */}
                  <div className="hidden lg:block border-l-2 border-slate-500 pl-4 ml-4">
                    <h1 className="text-lg xl:text-xl font-semibold text-white truncate">
                      {pageTitle}
                    </h1>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Admin badge - hide name on mobile */}
                <div className="hidden sm:flex flex-shrink-0">
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200 border border-slate-600">
                    <span className="mr-1 sm:mr-2 h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 animate-pulse"></span>
                    {adminData?.name ? (
                      <>
                        <span className="hidden lg:inline">{adminData.name}</span>
                        <span className="hidden lg:inline mx-2 text-blue-400">|</span>
                        <span className="text-blue-700 font-mono">{adminData.username}</span>
                      </>
                    ) : (
                      adminData?.username || "Admin"
                    )}
                  </span>
                </div>
                {/* Logout button - icon only on mobile */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (navLoading) return;
                    setShowLogoutConfirmation(true);
                  }}
                  className={`flex items-center justify-center px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 border border-red-500/50 transition-all duration-200 ${navLoading && activePath === "logout" ? "menu-item-loading cursor-not-allowed" : ""}`}
                  disabled={navLoading}
                  title="ออกจากระบบ"
                >
                  <span className="flex-shrink-0">{MenuIcons.logout}</span>
                  <span className="hidden sm:inline ml-1">ออกจากระบบ</span>
                </button>

                <div className="hidden sm:block">
                  <button className="flex max-w-xs items-center rounded-full bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      {adminData?.username?.charAt(0) || "A"}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Show page title on mobile at top of content */}
            <h1 className="lg:hidden text-xl font-semibold text-white mb-3 px-2">{pageTitle}</h1>
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl rounded-2xl p-3 sm:p-4 lg:p-6 page-transition border border-slate-700/50">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        isLoading={navLoading && activePath === "logout"}
        onConfirm={handleLogout}
      />
    </div>
  );
}
