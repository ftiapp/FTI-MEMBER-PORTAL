"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { LoadingOverlay } from "./shared";

export default function ResubmittedApplications({
  currentPage = 1,
  itemsPerPage = 5,
  onPaginationChange,
  onTotalItemsChange,
  searchQuery = "",
  membershipTypeFilter = "all",
}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [allApplications, setAllApplications] = useState([]);

  const fetchingRef = useRef(false);

  useEffect(() => {
    if (allApplications.length === 0) {
      fetchAllApplications();
    }
  }, []);

  useEffect(() => {
    if (allApplications.length > 0) {
      filterAndPaginateApplications();
    }
  }, [allApplications, currentPage, itemsPerPage, searchQuery, membershipTypeFilter]);

  useEffect(() => {
    if (pagination && onTotalItemsChange) {
      onTotalItemsChange(pagination.totalItems || 0);
    }
  }, [pagination, onTotalItemsChange]);

  const fetchAllApplications = async () => {
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: "1",
        limit: "1000",
      });

      const res = await fetch(`/api/membership/resubmitted-applications?${params}`);
      const data = await res.json();

      if (data.success) {
        setAllApplications(data.applications || []);
        setPagination(data.pagination || null);
        if (onPaginationChange) {
          onPaginationChange(data.pagination || null);
        }
      } else {
        setError(data.message || "ไม่สามารถโหลดข้อมูลเอกสารที่แก้ไขแล้วได้");
        setAllApplications([]);
        setPagination(null);
      }
    } catch (e) {
      console.error("Error fetching resubmitted applications:", e);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลเอกสารที่แก้ไขแล้ว");
      setAllApplications([]);
      setPagination(null);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  const filterAndPaginateApplications = () => {
    let filtered = [...allApplications];

    if (membershipTypeFilter !== "all") {
      filtered = filtered.filter(
        (app) => app.memberType.toLowerCase() === membershipTypeFilter.toLowerCase(),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((app) => {
        const name = app.displayName || "";
        const companyName = app.companyNameEn || "";
        const idCard = app.idCardNumber || "";
        const taxId = app.taxId || "";
        return (
          name.toLowerCase().includes(q) ||
          companyName.toLowerCase().includes(q) ||
          idCard.includes(q) ||
          taxId.includes(q)
        );
      });
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filtered.slice(startIndex, endIndex);

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    setApplications(pageItems);
    setPagination({ currentPage, totalItems, totalPages, itemsPerPage });
  };

  const getMemberTypeInfo = (type) => {
    const typeMap = {
      IC: { text: "สมทบ (บุคคลธรรมดา)", code: "ทบ" },
      OC: { text: "สามัญ (โรงงาน)", code: "สน" },
      AC: { text: "สมทบ (นิติบุคคล)", code: "ทน" },
      AM: { text: "สามัญ (สมาคมการค้า)", code: "สส" },
    };
    return typeMap[type] || { text: type, code: type };
  };

  const openDetailPage = (application) => {
    const routes = {
      IC: "/membership/ic/summary",
      OC: "/membership/oc/summary",
      AC: "/membership/ac/summary",
      AM: "/membership/am/summary",
    };
    const route = routes[application.memberType];
    if (route) {
      window.open(`${route}?id=${application.id}`, "_blank");
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: th });
    } catch {
      return "-";
    }
  };

  if (loading) {
    return <LoadingOverlay isVisible={true} message="กำลังโหลดข้อมูล..." inline={true} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchAllApplications}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  if (!applications.length && (!pagination || pagination.totalItems === 0)) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีเอกสารสมัครสมาชิกที่แก้ไขแล้ว</h3>
        <p className="text-sm text-gray-500">ยังไม่มีเอกสารที่ถูกส่งกลับมาแก้ไขแล้วในระบบ</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pagination && pagination.totalItems > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-4 gap-2">
          <span className="text-center sm:text-left">
            แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, pagination.totalItems)}-
            {Math.min(currentPage * itemsPerPage, pagination.totalItems)} จาก {pagination.totalItems} รายการ
          </span>
          <span className="text-center sm:text-right text-gray-500">
            หน้า {currentPage} จาก {Math.ceil(pagination.totalItems / itemsPerPage)}
          </span>
        </div>
      )}

      {applications.map((app) => {
        const memberTypeInfo = getMemberTypeInfo(app.memberType);

        return (
          <div
            key={`${app.memberType}-${app.id}`}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full flex-shrink-0">
                    <span className="text-sm font-bold text-purple-700">{memberTypeInfo.code}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-lg">{memberTypeInfo.text}</h4>
                    <p className="text-sm text-gray-600">
                      ชื่อ/บริษัท: {app.displayName || "ไม่ระบุชื่อ"}
                    </p>
                  </div>
                </div>

                <div className="md:ml-11 mt-3 md:mt-0 text-xs text-gray-500 space-y-1">
                  <p>
                    ส่งครั้งล่าสุด: {formatDateTime(app.createdAt)}
                  </p>
                  {app.updatedAt && (
                    <p>อัปเดตข้อมูล: {formatDateTime(app.updatedAt)}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-3 md:ml-4 w-full md:w-auto">
                <button
                  onClick={() => openDetailPage(app)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-sm"
                >
                  ดูรายละเอียด
                </button>

                <div className="w-full md:w-32">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span className="font-medium">สถานะ</span>
                    <span className="font-bold text-purple-700">แก้ไขแล้ว (รอตรวจสอบ)</span>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 w-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
