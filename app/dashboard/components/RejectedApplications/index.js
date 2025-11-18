"use client";

import { useState, useEffect } from "react";
import { LoadingOverlay } from "../shared";
import ApplicationCard from "./ApplicationCard";
import PaginationBar from "./PaginationBar";
import EmptyState from "./EmptyState";

/**
 * Rejected Applications List V3
 *
 * Simple, clean list of rejected applications
 * Click to view details and conversations
 */

export default function RejectedApplicationsV3({ searchQuery = "", membershipTypeFilter = "all" }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allApplications, setAllApplications] = useState([]); // Store all applications for filtering
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (allApplications.length === 0) {
      fetchApplications();
    } else {
      filterApplications();
    }
  }, [pagination.page, searchQuery, membershipTypeFilter]);

  useEffect(() => {
    if (allApplications.length > 0 && (searchQuery || membershipTypeFilter !== "all")) {
      filterApplications();
    }
  }, [allApplications, searchQuery, membershipTypeFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/membership/rejected-applications-v4?page=${pagination.page}&limit=${pagination.limit}`,
      );
      const result = await response.json();

      if (result.success) {
        // Store all applications for filtering
        setAllApplications(result.data || []);

        // If no filtering is applied, show the paginated results directly
        if (!searchQuery && membershipTypeFilter === "all") {
          setApplications(result.data || []);
          setPagination((prev) => ({
            ...prev,
            ...result.pagination,
          }));
        }
      } else {
        setError(result.message || "ไม่สามารถโหลดข้อมูลได้");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filteredApps = [...allApplications];

    // Filter by membership type
    if (membershipTypeFilter !== "all") {
      filteredApps = filteredApps.filter(
        (app) => app.type?.toLowerCase() === membershipTypeFilter.toLowerCase(),
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredApps = filteredApps.filter((app) => {
        const displayName = app.name || ""; // API returns 'name', not 'displayName'
        const companyName = app.companyName || "";
        const idCardNumber = app.identifier || ""; // API returns 'identifier', not 'idCardNumber'
        const taxId = app.identifier || ""; // Same field
        const memberType = app.type || ""; // API returns 'type', not 'memberType'

        return (
          displayName.toLowerCase().includes(query) ||
          companyName.toLowerCase().includes(query) ||
          idCardNumber.includes(query) ||
          taxId.includes(query) ||
          memberType.toLowerCase().includes(query)
        );
      });
    }

    console.log("Filtered rejected applications:", {
      originalCount: allApplications.length,
      filteredCount: filteredApps.length,
      searchQuery,
      membershipTypeFilter,
    });

    // Manual pagination for filtered results
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedApps = filteredApps.slice(startIndex, endIndex);

    setApplications(paginatedApps);
    setPagination((prev) => ({
      ...prev,
      total: filteredApps.length,
      totalPages: Math.ceil(filteredApps.length / prev.limit),
    }));
  };

  const getMembershipTypeLabel = (type) => {
    const typeMap = {
      oc: "สมาชิกสามัญ-โรงงาน",
      ac: "สมาชิกสมทบ-นิติบุคคล",
      ic: "สมาชิกสมทบ-บุคคลธรรมดา",
      am: "สมาชิกสามัญ-สมาคมการค้า",
    };
    return typeMap[type] || type;
  };

  // Get identifier label based on member type
  const getIdentifierLabel = (memberType) => {
    const labels = {
      ic: "เลขบัตรประจำตัวประชาชน",
      oc: "ทะเบียนนิติบุคคล",
      ac: "ทะเบียนนิติบุคคล",
      am: "ทะเบียนนิติบุคคล",
    };
    return labels[memberType] || "เลขประจำตัว";
  };

  const getMembershipTypeBadge = (type) => {
    const badges = {
      oc: "bg-blue-100 text-blue-800",
      ac: "bg-purple-100 text-purple-800",
      am: "bg-green-100 text-green-800",
      ic: "bg-yellow-100 text-yellow-800",
    };
    return badges[type] || "bg-gray-100 text-gray-800";
  };

  // Thai abbreviations for member types
  const getThaiAbbrev = (type) => {
    const key = typeof type === "string" ? type.toLowerCase() : type;
    const map = { ic: "ทบ", oc: "สน", ac: "ทน", am: "สส" };
    return map[key] || type;
  };

  const getStatusBadge = (status) => {
    if (status === "pending_review") {
      return "bg-orange-100 text-orange-800 border border-orange-200";
    } else if (status === "pending_fix") {
      return "bg-red-100 text-red-800 border border-red-200";
    } else if (status === "resolved") {
      return "bg-green-100 text-green-800 border border-green-200";
    }
    return "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getStatusIcon = (status) => {
    if (status === "pending_review") {
      return (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    } else if (status === "pending_fix") {
      return (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      );
    } else if (status === "resolved") {
      return (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return <LoadingOverlay isVisible={true} message="กำลังโหลดข้อมูล..." inline={true} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchApplications}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>ลองใหม่</span>
          </button>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* แสดงข้อมูลสถิติ */}
      {pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-4 gap-2">
          <span>
            แสดง {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} จาก {pagination.total}{" "}
            รายการ
          </span>
          <span className="text-gray-500">
            หน้า {pagination.page} จาก {Math.ceil(pagination.total / pagination.limit)}
          </span>
        </div>
      )}

      {/* รายการใบสมัคร */}
      {applications.map((app) => (
        <ApplicationCard
          key={`${app.type}-${app.id}`}
          app={app}
          getIdentifierLabel={getIdentifierLabel}
          getMembershipTypeLabel={getMembershipTypeLabel}
          getThaiAbbrev={getThaiAbbrev}
          formatDate={formatDate}
        />
      ))}

      {/* หากไม่มีข้อมูลในหน้านี้ แต่มีข้อมูลรวม */}
      {applications.length === 0 && pagination.total > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>ไม่มีข้อมูลในหน้านี้</p>
          <button
            onClick={() => handlePageChange(1)}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            กลับไปหน้าแรก
          </button>
        </div>
      )}

      {/* Pagination */}
      <PaginationBar pagination={pagination} onPageChange={handlePageChange} />
    </div>
  );
}
