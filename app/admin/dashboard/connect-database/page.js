"use client";

import { useState, useEffect } from "react";
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
    console.log('🔍 fetchConnectedMembers called with:', { page, q, limit: pagination.limit });
    try {
      setConnectedLoading(true);
      setConnectedError(null);
      
      const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) });
      // API expects 'search' (not 'q') — support when value provided
      if ((q || "").trim() !== "") params.append("search", q.trim());
      
      const url = `/api/admin/connect-database/connected?${params}`;
      console.log('🌐 Fetching URL:', url);

      const response = await fetch(url, {
        credentials: "include",
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error("Failed to fetch connected members");
      }

      const data = await response.json();
      console.log('📊 API Response:', data);
      
      // Support multiple response shapes
      const items = Array.isArray(data) ? data
                  : Array.isArray(data.members) ? data.members
                  : Array.isArray(data.data) ? data.data
                  : [];
      setConnected(items);

      const incomingPag = data.pagination || {};
      const total = incomingPag.total ?? data.total ?? items.length;
      const limit = incomingPag.limit ?? pagination.limit;
      const currentPage = incomingPag.page ?? page;
      const totalPages = incomingPag.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0);
      setPagination({ page: currentPage, limit, total, totalPages });
    } catch (err) {
      console.error('❌ Error:', err);
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
    const newPage = direction === "prev" 
      ? Math.max(1, pagination.page - 1)
      : Math.min(pagination.totalPages, pagination.page + 1);
    fetchConnectedMembers({ page: newPage });
  };

  if (loading && activeTab === "pending") {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
          <span className="block sm:inline"> {error}</span>
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

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">เชื่อมต่อฐานข้อมูล</h1>
            {/* Status Cards */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-md border cursor-pointer transition-colors ${activeTab === "pending" ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}
                onClick={() => handleTabChange("pending")}
              >
                <div className="text-sm text-gray-500">รอเชื่อมต่อ</div>
                <div className="text-2xl font-bold text-gray-900">{members.length}</div>
              </div>
              <div
                className={`p-4 rounded-md border cursor-pointer transition-colors ${activeTab === "connected" ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}
                onClick={() => handleTabChange("connected")}
              >
                <div className="text-sm text-gray-500">เชื่อมต่อแล้ว</div>
                <div className="text-2xl font-bold text-gray-900">{connectedCount}</div>
              </div>
            </div>

            {/* Tab Switch */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => handleTabChange("pending")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "pending" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                รอเชื่อมต่อ
              </button>
              <button
                onClick={() => handleTabChange("connected")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "connected" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                เชื่อมต่อแล้ว
              </button>
            </div>
          </div>

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
        </div>
      </div>
    </AdminLayout>
  );
}
