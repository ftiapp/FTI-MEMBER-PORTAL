"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "../components/NotificationBell";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { LoadingOverlay } from "./components/shared";
import UpdateMember from "./components/UpdateMember/page";
import Wasmember from "./components/Wasmember.js/page";
import SubmittedMember from "./components/SubmittedMember";
import MemberDetail from "./components/MemberDetail/page";
import ContactUs from "./components/ContactUs/page";
import RecentActivities from "./components/RecentActivities";
import CheckStatusOperation from "./components/CheckStatusOperation/page";
import UpgradeMembership from "./components/UpgradeMembership";
import MembershipCertificate from "./components/MembershipCertificate/page";
import MembershipDocuments from "./components/MembershipDocuments";

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Early return BEFORE any hooks to prevent hook order issues
  if (!user) {
    return <LoadingOverlay isVisible={true} message="กำลังโหลดข้อมูลผู้ใช้..." />;
  }

  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("ข้อมูลผู้ใช้งาน");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Notification state for member updates
  const [hasMemberAlert, setHasMemberAlert] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState(null);
  const [lastSeenLoaded, setLastSeenLoaded] = useState(false);
  // Notification state for membership documents (drafts/submitted)
  const [hasDocsAlert, setHasDocsAlert] = useState(false);
  const [docsLastSeenAt, setDocsLastSeenAt] = useState(null);
  const [docsLastSeenLoaded, setDocsLastSeenLoaded] = useState(false);

  // Create refs for menu items (define refs individually to keep hook order stable)
  const contactMenuRef = useRef(null);
  const memberMenuRef = useRef(null);
  const menuRefs = useMemo(
    () => ({
      "ติดต่อเรา / แจ้งปัญหาการใช้งาน": contactMenuRef,
      ข้อมูลสมาชิก: memberMenuRef,
    }),
    [contactMenuRef, memberMenuRef],
  );

  // Menu items configuration
  const menuItems = [
    //{
    //name: 'ข้อมูลผู้ใช้งาน',
    //tab: 'userinfo',
    //icon: (
    //<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    //</svg>
    // ),
    //},
    {
      name: "ข้อมูลสมาชิก",
      tab: "member",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      name: "ยืนยันสมาชิกเดิม",
      tab: "wasmember",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      name: "สมัครสมาชิก",
      tab: "membership",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      name: "เอกสารสมัครสมาชิก",
      tab: "documents",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    //{
    //name: 'เอกสารยืนยันสมาชิก',
    //tab: 'certificate',
    //icon: (
    //<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    //</svg>
    //),
    //},

    {
      name: "สถานะการดำเนินการ",
      tab: "status",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      name: "ติดต่อเรา / แจ้งปัญหาการใช้งาน",
      tab: "contact",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
  ];

  // Tab to name mapping
  const tabMapping = {
    userinfo: "ข้อมูลผู้ใช้งาน",
    member: "ข้อมูลสมาชิก",
    wasmember: "ยืนยันสมาชิกเดิม",
    membership: "สมัครสมาชิก",
    documents: "เอกสารสมัครสมาชิก",
    certificate: "เอกสารยืนยันสมาชิก",
    status: "สถานะการดำเนินการ",
    contact: "ติดต่อเรา / แจ้งปัญหาการใช้งาน",
  };

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize lastSeenAt from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("member_last_seen_at");
      if (stored) setLastSeenAt(stored);
    } catch (e) {
      // ignore
    }
    setLastSeenLoaded(true);
  }, []);

  // Initialize docsLastSeenAt from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("docs_last_seen_at");
      if (stored) setDocsLastSeenAt(stored);
    } catch (e) {
      // ignore
    }
    setDocsLastSeenLoaded(true);
  }, []);

  // Handle URL parameters (reactive to query changes)
  const searchParams = useSearchParams();
  useEffect(() => {
    try {
      const tabParam = searchParams?.get("tab");
      if (tabParam && tabMapping[tabParam]) {
        setActiveTab(tabMapping[tabParam]);
      } else {
        setActiveTab("ข้อมูลผู้ใช้งาน");
      }
    } catch (e) {
      // ignore
    }
  }, [searchParams, tabMapping]);

  // Extract messageId for Contact tab without computing it during render
  const [contactMessageId, setContactMessageId] = useState(null);
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      setContactMessageId(searchParams.get("messageId"));
    } catch (e) {
      // ignore
    }
  }, []);

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Handle menu click
  const handleMenuClick = (item) => {
    setSidebarOpen(false);
    setActiveTab(item.name);

    // Update URL
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("tab", item.tab);
    window.history.pushState({}, "", `/dashboard?${searchParams.toString()}`);

    // If user opens the member tab, clear the alert and update lastSeenAt
    if (item.tab === "member") {
      const now = new Date().toISOString();
      setHasMemberAlert(false);
      setLastSeenAt(now);
      try {
        localStorage.setItem("member_last_seen_at", now);
      } catch (e) {
        // ignore
      }
    }

    // If user opens the documents tab, clear the documents alert and update docsLastSeenAt
    if (item.tab === "documents") {
      const now = new Date().toISOString();
      setHasDocsAlert(false);
      setDocsLastSeenAt(now);
      try {
        localStorage.setItem("docs_last_seen_at", now);
      } catch (e) {
        // ignore
      }
    }
  };

  // Lightweight polling for latest member updates
  useEffect(() => {
    // Do not start polling until lastSeenAt has been loaded from localStorage
    if (!lastSeenLoaded) return;

    let intervalId;
    let stopped = false;

    const isVisible = () =>
      typeof document !== "undefined" && document.visibilityState === "visible";

    const checkForUpdates = async () => {
      if (!user?.id) return;
      if (!isVisible()) return; // only when tab visible
      try {
        const res = await fetch(`/api/member/approved-companies?userId=${user.id}`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        const companies = Array.isArray(data?.companies) ? data.companies : [];
        if (companies.length === 0) return;

        // Compute latest timestamp from created_at/updated_at
        let latest = null;
        for (const c of companies) {
          const t = c.updated_at || c.created_at;
          if (t) {
            if (!latest || new Date(t) > new Date(latest)) latest = t;
          }
        }
        if (!latest) return;

        // Compare with lastSeenAt; if newer, set alert (only if not currently on member tab)
        const last = lastSeenAt ? new Date(lastSeenAt) : null;
        if (!last || new Date(latest) > last) {
          if (activeTab !== "ข้อมูลสมาชิก") {
            setHasMemberAlert(true);
          }
        }
      } catch (e) {
        // silent fail; keep lightweight
      }
    };

    // Kick off immediately, then at interval
    checkForUpdates();
    intervalId = setInterval(checkForUpdates, 60000); // 60s

    const onVisibility = () => {
      if (stopped) return;
      // When tab becomes visible, perform a quick check
      if (isVisible()) checkForUpdates();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopped = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user?.id, lastSeenAt, activeTab, lastSeenLoaded]);

  // Lightweight polling for latest membership documents updates (drafts and submitted)
  useEffect(() => {
    // Do not start polling until docsLastSeenAt has been loaded
    if (!docsLastSeenLoaded) return;

    let intervalId;
    let stopped = false;

    const isVisible = () =>
      typeof document !== "undefined" && document.visibilityState === "visible";

    const checkDocsUpdates = async () => {
      if (!user?.id) return;
      if (!isVisible()) return; // only when tab visible
      // Avoid duplicate fetching when user is already on Documents tab; the tab component will fetch itself
      if (activeTab === "เอกสารสมัครสมาชิก") return;
      try {
        // Fetch drafts and submitted in parallel
        const params = new URLSearchParams({ page: "1", limit: "1" });
        const [draftRes, submittedRes] = await Promise.all([
          fetch("/api/membership/get-drafts", {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`/api/membership/submitted-applications?${params}`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        let latest = null;

        if (draftRes.ok) {
          const draftData = await draftRes.json();
          const drafts = Array.isArray(draftData?.drafts) ? draftData.drafts : [];
          for (const d of drafts) {
            const t = d.updatedAt || d.createdAt; // drafts usually have updatedAt
            if (t && (!latest || new Date(t) > new Date(latest))) latest = t;
          }
        }

        if (submittedRes.ok) {
          const subData = await submittedRes.json();
          const apps = Array.isArray(subData?.applications) ? subData.applications : [];
          for (const a of apps) {
            const t = a.updatedAt || a.createdAt; // submitted have createdAt and maybe updatedAt
            if (t && (!latest || new Date(t) > new Date(latest))) latest = t;
          }
        }

        if (!latest) return;

        const last = docsLastSeenAt ? new Date(docsLastSeenAt) : null;
        if (!last || new Date(latest) > last) {
          if (activeTab !== "เอกสารสมัครสมาชิก") {
            setHasDocsAlert(true);
          }
        }
      } catch (e) {
        // silent
      }
    };

    // Kickoff and interval
    checkDocsUpdates();
    intervalId = setInterval(checkDocsUpdates, 60000);

    const onVisibility = () => {
      if (stopped) return;
      if (isVisible()) checkDocsUpdates();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopped = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user?.id, docsLastSeenAt, activeTab, docsLastSeenLoaded]);

  // Get user status badge
  const getUserStatusBadge = () => {
    const badges = {
      member: { text: "สมาชิก", color: "bg-green-100 text-green-700" },
      admin: { text: "ผู้ดูแลระบบ", color: "bg-blue-100 text-blue-700" },
    };

    const badge = badges[user.role] || {
      text: "ผู้ใช้งานทั่วไป",
      color: "bg-gray-100 text-gray-700",
    };

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    const contentMap = {
      ข้อมูลผู้ใช้งาน: <UpdateMember />,
      ข้อมูลสมาชิก: user?.id ? (
        <MemberDetail userId={user.id} />
      ) : (
        <LoadingOverlay isVisible={true} message="กำลังโหลดข้อมูลสมาชิก..." />
      ),
      ยืนยันสมาชิกเดิม: <Wasmember />,
      สมัครสมาชิก: <UpgradeMembership />,
      เอกสารสมัครสมาชิก: <MembershipDocuments />,
      เอกสารยืนยันสมาชิก: <MembershipCertificate />,
      สถานะการดำเนินการ: <CheckStatusOperation />,
      "ติดต่อเรา / แจ้งปัญหาการใช้งาน": <ContactUs messageId={contactMessageId} />,
    };

    const content = contentMap[activeTab] || <p>เนื้อหาสำหรับ {activeTab} จะแสดงที่นี่</p>;

    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-4 mb-6">
          <motion.div
            className="h-1 flex-1 bg-gradient-to-r from-transparent to-blue-600 rounded"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ transformOrigin: "right" }}
          />
          <h2 className="text-2xl font-bold text-gray-800 whitespace-nowrap">{activeTab}</h2>
          <motion.div
            className="h-1 flex-1 bg-gradient-to-l from-transparent to-blue-600 rounded"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ transformOrigin: "left" }}
          />
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">{content}</div>
      </motion.div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white pt-32 pb-20">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">จัดการสมาชิก</h1>
              <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                จัดการข้อมูลสมาชิกและบริการต่างๆ ของสภาอุตสาหกรรมแห่งประเทศไทย
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-lg rounded-xl p-6 mb-8"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  ยินดีต้อนรับ,{" "}
                  {user.firstname && user.lastname
                    ? `${user.firstname} ${user.lastname}`
                    : "สมาชิก"}
                </h2>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-gray-600">สถานะ:</span>
                  {getUserStatusBadge()}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                >
                  <svg
                    className="h-6 w-6 text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <NotificationBell />
              </div>
            </div>
          </motion.div>

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <div
              className={`
              w-full lg:w-80 
              ${sidebarOpen ? "fixed inset-y-0 left-0 z-50 w-80" : "hidden lg:block"}
              transition-all duration-300
            `}
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full lg:h-auto">
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">เมนูหลัก</h3>
                      <p className="text-blue-100 mt-1">จัดการข้อมูลและบริการ</p>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="lg:hidden p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <nav className="p-4">
                  <ul className="space-y-2">
                    {menuItems.map((item) => (
                      <li key={item.name}>
                        <button
                          ref={menuRefs[item.name] || null}
                          onClick={() => handleMenuClick(item)}
                          className={`
                            w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left
                            ${
                              activeTab === item.name
                                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm"
                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            }
                          `}
                        >
                          <span
                            className={`flex-shrink-0 ${activeTab === item.name ? "text-blue-600" : "text-gray-500"}`}
                          >
                            {item.icon}
                          </span>
                          <span className="font-medium flex-1 text-left">{item.name}</span>
                          {(item.tab === "member" && hasMemberAlert) ||
                          (item.tab === "documents" && hasDocsAlert) ? (
                            <span
                              aria-label="มีข้อมูลสมาชิกใหม่"
                              className="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-blue-100"
                            />
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">{renderTabContent()}</div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
