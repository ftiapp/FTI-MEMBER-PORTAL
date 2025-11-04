"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "./shared";

/**
 * Rejected Applications List V3
 *
 * Simple, clean list of rejected applications
 * Click to view details and conversations
 */

export default function RejectedApplicationsV3({
  searchQuery = "",
  membershipTypeFilter = "all",
}) {
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

  const router = useRouter();

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
        `/api/membership/rejected-applications-v3?page=${pagination.page}&limit=${pagination.limit}`,
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
      filteredApps = filteredApps.filter(app => app.type?.toLowerCase() === membershipTypeFilter.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredApps = filteredApps.filter(app => {
        const displayName = app.name || ""; // API returns 'name', not 'displayName'
        const companyName = app.companyName || "";
        const idCardNumber = app.identifier || ""; // API returns 'identifier', not 'idCardNumber'
        const taxId = app.identifier || ""; // Same field
        const memberType = app.type || ""; // API returns 'type', not 'memberType'

        return displayName.toLowerCase().includes(query) ||
               companyName.toLowerCase().includes(query) ||
               idCardNumber.includes(query) ||
               taxId.includes(query) ||
               memberType.toLowerCase().includes(query);
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
    setPagination(prev => ({
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

  const handleViewApplication = (app) => {
    // Navigate to edit/view page with conversations
    router.push(`/membership/${app.type}/edit-rejected/${app.id}`);
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
    return (
      <div className="text-center py-16">
        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีใบสมัครที่ถูกปฏิเสธ</h3>
          <p className="text-gray-600 text-center">เมื่อมีใบสมัครที่ถูกปฏิเสธ จะแสดงที่นี่</p>
        </div>
      </div>
    );
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
        <div
          key={`${app.type}-${app.id}`}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              {/* เลขประจำตัวไว้ด้านบนสุด */}
              <div className="mb-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-semibold">{getIdentifierLabel(app.type)}:</span>
                  <span className="ml-1 font-mono">{app.identifier || "ไม่ระบุ"}</span>
                </div>
              </div>

              {/* ข้อมูลประเภทสมาชิก */}
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full flex-shrink-0">
                  <span className="text-sm font-bold text-red-600">{getThaiAbbrev(app.type)}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">
                    {getMembershipTypeLabel(app.type)}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">สถานะ: {app.statusLabel}</p>
                    {app.status === "pending_review" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        ตรวจสอบ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* วันที่และข้อมูลอื่นๆ */}
              <div className="md:ml-11 mt-3 md:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500">
                  <p className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    ปฏิเสธเมื่อ: {formatDate(app.rejectedAt)}
                  </p>
                  <p className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-1 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {app.conversationCount} การสนทนา
                  </p>
                  {app.resubmissionCount > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ครั้งที่ {app.resubmissionCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3 md:ml-4 w-full md:w-auto">
              <button
                onClick={() => handleViewApplication(app)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-sm"
              >
                ดูรายละเอียด
              </button>

              {/* แสดงสถานะ */}
              <div className="w-full md:w-28">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span className="font-medium">สถานะ</span>
                  <span
                    className={`font-bold ${
                      app.status === "pending_review"
                        ? "text-orange-600"
                        : app.status === "pending_fix"
                          ? "text-red-600"
                          : app.status === "resolved"
                            ? "text-green-600"
                            : "text-gray-600"
                    }`}
                  >
                    {app.statusLabel}
                  </span>
                </div>
                <div
                  className={`w-full rounded-full h-2 ${
                    app.status === "pending_review"
                      ? "bg-orange-200"
                      : app.status === "pending_fix"
                        ? "bg-red-200"
                        : app.status === "resolved"
                          ? "bg-green-200"
                          : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                      app.status === "pending_review"
                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                        : app.status === "pending_fix"
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : app.status === "resolved"
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : "bg-gradient-to-r from-gray-500 to-gray-600"
                    }`}
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            แสดง <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>{" "}
            ถึง{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            จาก <span className="font-medium">{pagination.total}</span> รายการ
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              ก่อนหน้า
            </button>

            {[...Array(pagination.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              const isCurrent = pagination.page === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                    isCurrent
                      ? "z-10 bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
