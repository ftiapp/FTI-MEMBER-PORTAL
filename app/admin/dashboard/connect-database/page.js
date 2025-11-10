"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import components
import LoadingSpinner from "./components/LoadingSpinner";
import LoadingOverlay from "./components/LoadingOverlay";
import SuccessModal from "./components/SuccessModal";
import ConfirmationModal from "./components/ConfirmationModal";
import PendingMembersTable from "./components/PendingMembersTable";
import ConnectedMembersTable from "./components/ConnectedMembersTable";
import { formatThaiDate } from "./components/utils";

export default function ConnectDatabasePage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingOverlayOpen, setLoadingOverlayOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState({ open: false, memberCode: "", companyName: "" });
  // Connected tab states
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'connected'
  const [connected, setConnected] = useState([]);
  const [connectedLoading, setConnectedLoading] = useState(false);
  const [connectedError, setConnectedError] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  // Pending search and connected count
  const [pendingSearch, setPendingSearch] = useState("");
  const [connectedCount, setConnectedCount] = useState(0);

  useEffect(() => {
    fetchApprovedMembers();
    // prefetch connected count for cards
    const prefetchConnectedCount = async () => {
      const response = await fetch(`/api/admin/connect-database/connected?page=1&limit=1`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setConnectedCount(data.pagination?.total || 0);
      }
    };
    prefetchConnectedCount();
  }, []);

  const fetchApprovedMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/connect-database/list", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch approved members");
      }

      const data = await response.json();
      setMembers(data.members || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  // Fetch connected members with search/pagination
  const fetchConnectedMembers = async ({ page = 1, q = search }) => {
    console.log("🔍 fetchConnectedMembers called with:", { page, q, limit: pagination.limit });
    try {
      setConnectedLoading(true);
      setConnectedError(null);

      const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) });
      // API expects 'search' (not 'q') — support when value provided
      if ((q || "").trim() !== "") params.append("search", q.trim());

      const url = `/api/admin/connect-database/connected?${params}`;
      console.log("🌐 Fetching URL:", url);

      const response = await fetch(url, {
        credentials: "include",
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch connected members");
      }

      const data = await response.json();
      console.log("📊 API Response:", data);

      // Support multiple response shapes
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.members)
          ? data.members
          : Array.isArray(data.data)
            ? data.data
            : [];
      setConnected(items);

      const incomingPag = data.pagination || {};
      const total = incomingPag.total ?? data.total ?? items.length;
      const limit = incomingPag.limit ?? pagination.limit;
      const currentPage = incomingPag.page ?? page;
      const totalPages = incomingPag.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0);
      setPagination({ page: currentPage, limit, total, totalPages });
    } catch (err) {
      console.error("❌ Error:", err);
      setConnectedError(err.message);
    } finally {
      setConnectedLoading(false);
    }
  };

  const handleConfirmConnect = async () => {
    if (!selectedMember) return;

    setConnecting((prev) => ({ ...prev, [selectedMember.id]: true }));
    setLoadingOverlayOpen(true);

    try {
      const response = await fetch("/api/admin/connect-database/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          memberId: selectedMember.id,
          memberType: selectedMember.member_type,
          taxId: selectedMember.tax_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to connect member");
      }

      const result = await response.json();

      // Resolve company name from API response or member data
      const resolvedCompanyName =
        result?.memberData?.COMPANY_NAME ||
        selectedMember?.company_name_th ||
        selectedMember?.company_name_en ||
        "";

      // Close modal first
      setShowModal(false);
      setSelectedMember(null);

      // Show success modal with details
      setSuccessInfo({
        open: true,
        memberCode: result.memberCode,
        companyName: resolvedCompanyName,
      });

      // Refresh the list
      fetchApprovedMembers();
      if (activeTab === "connected") {
        fetchConnectedMembers({ page: 1 });
      }
    } catch (err) {
      toast.error(
        <div>
          <div className="font-medium">เกิดข้อผิดพลาด</div>
          <div className="text-sm">{err.message}</div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
    } finally {
      setConnecting((prev) => ({ ...prev, [selectedMember.id]: false }));
      setLoadingOverlayOpen(false);
    }
  };

  const handleCloseModal = () => {
    if (!connecting[selectedMember?.id]) {
      setShowModal(false);
      setSelectedMember(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "connected") {
      fetchConnectedMembers({ page: 1 });
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleSearchSubmit = (value) => {
    fetchConnectedMembers({ page: 1, q: value || search });
  };

  const handlePagination = (direction) => {
    const newPage =
      direction === "prev"
        ? Math.max(1, pagination.page - 1)
        : Math.min(pagination.totalPages, pagination.page + 1);
    fetchConnectedMembers({ page: newPage });
  };

  if (loading && activeTab === "pending") {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#1e3a8a]"></div>
          <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ToastContainer />
      <LoadingOverlay isOpen={loadingOverlayOpen} />
      <SuccessModal
        isOpen={successInfo.open}
        memberCode={successInfo.memberCode}
        companyName={successInfo.companyName}
        onClose={() => setSuccessInfo({ open: false, memberCode: "", companyName: "" })}
      />
      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmConnect}
        member={selectedMember}
        isLoading={connecting[selectedMember?.id]}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
      >
        {/* Header with gradient */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg
              className="w-7 h-7 text-[#1e3a8a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
            เชื่อมต่อฐานข้อมูล
          </h1>
          <p className="text-sm text-gray-500 mt-1">จัดการการเชื่อมต่อสมาชิกเข้ากับฐานข้อมูลหลัก</p>
        </div>

        {/* Status Cards */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              activeTab === "pending"
                ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
            }`}
            onClick={() => handleTabChange("pending")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  รอเชื่อมต่อ
                </div>
                <div className="text-3xl font-bold text-gray-900">{members.length}</div>
              </div>
              <div
                className={`p-3 rounded-full ${activeTab === "pending" ? "bg-yellow-400" : "bg-gray-200"}`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              activeTab === "connected"
                ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
            }`}
            onClick={() => handleTabChange("connected")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  เชื่อมต่อแล้ว
                </div>
                <div className="text-3xl font-bold text-gray-900">{connectedCount}</div>
              </div>
              <div
                className={`p-3 rounded-full ${activeTab === "connected" ? "bg-green-500" : "bg-gray-200"}`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switch - Improved design */}
        <div className="flex gap-2 mb-6 bg-gray-50 p-2 rounded-lg">
          <button
            onClick={() => handleTabChange("pending")}
            className={`flex-1 py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
              activeTab === "pending"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              รอเชื่อมต่อ ({members.length})
            </div>
          </button>
          <button
            onClick={() => handleTabChange("connected")}
            className={`flex-1 py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
              activeTab === "connected"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              เชื่อมต่อแล้ว ({connectedCount})
            </div>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === "pending" && (
          <PendingMembersTable
            members={members}
            connecting={connecting}
            pendingSearch={pendingSearch}
            onConnect={handleConnect}
            onSearchChange={setPendingSearch}
          />
        )}

        {activeTab === "connected" && (
          <ConnectedMembersTable
            connected={connected}
            connectedLoading={connectedLoading}
            connectedError={connectedError}
            search={search}
            onSearchChange={handleSearch}
            onSearchSubmit={handleSearchSubmit}
            pagination={pagination}
            onPrevPage={() => handlePagination("prev")}
            onNextPage={() => handlePagination("next")}
          />
        )}
      </motion.div>
    </AdminLayout>
  );
}
