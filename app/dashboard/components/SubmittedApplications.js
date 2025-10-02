"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { LoadingOverlay } from "./shared";

export default function SubmittedApplications({
  userId,
  currentPage = 1,
  itemsPerPage = 5, // เปลี่ยน default เป็น 5
  onPaginationChange,
  onTotalItemsChange,
}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [userId, currentPage, itemsPerPage]);

  // ส่ง totalItems กลับไปให้ parent component เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (pagination && onTotalItemsChange) {
      onTotalItemsChange(pagination.totalItems || 0);
    }
  }, [pagination, onTotalItemsChange]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage?.toString() || "1",
        limit: itemsPerPage?.toString() || "10",
      });

      const response = await fetch(`/api/membership/submitted-applications?${params}`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.applications || []);
        setPagination(data.pagination || null);

        // ส่ง pagination data กลับไปยัง parent component
        if (onPaginationChange) {
          onPaginationChange(data.pagination);
        }
      } else {
        setError(data.message || "ไม่สามารถโหลดข้อมูลได้");
        setApplications([]);
        setPagination(null);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setApplications([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: "รอพิจารณา", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      1: { text: "อนุมัติ", color: "bg-green-100 text-green-800 border-green-200" },
      2: { text: "ปฏิเสธ", color: "bg-red-100 text-red-800 border-red-200" },
    };
    return (
      statusMap[status] || {
        text: "ไม่ทราบสถานะ",
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    );
  };

  const getMemberTypeInfo = (type) => {
    const typeMap = {
      IC: {
        text: "สมทบ (บุคคลธรรมดา)",
        color: "bg-blue-50 border-blue-200",
        iconColor: "text-blue-600",
      },
      OC: {
        text: "สามัญ (โรงงาน)",
        color: "bg-green-50 border-green-200",
        iconColor: "text-green-600",
      },
      AC: {
        text: "สมทบ (นิติบุคคล)",
        color: "bg-purple-50 border-purple-200",
        iconColor: "text-purple-600",
      },
      AM: {
        text: "สามัญ (สมาคมการค้า)",
        color: "bg-orange-50 border-orange-200",
        iconColor: "text-orange-600",
      },
    };
    return (
      typeMap[type] || {
        text: type,
        color: "bg-gray-50 border-gray-200",
        iconColor: "text-gray-600",
      }
    );
  };

  const openDetailPage = (application) => {
    // เปิดหน้า SummarySection ในแท็บใหม่ตามประเภทสมาชิก
    const memberTypeRoutes = {
      IC: "/membership/ic/summary",
      OC: "/membership/oc/summary",
      AC: "/membership/ac/summary",
      AM: "/membership/am/summary",
    };

    const route = memberTypeRoutes[application.memberType];
    if (route) {
      // เปิดในแท็บใหม่พร้อมส่ง ID ของใบสมัคร
      window.open(`${route}?id=${application.id}`, "_blank");
    }
  };

  if (loading) {
    return <LoadingOverlay isVisible={true} message="กำลังโหลดข้อมูล..." inline={true} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg
            className="w-12 h-12 mx-auto mb-4"
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
          <p className="text-lg font-medium">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchApplications}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  if (applications.length === 0 && (!pagination || pagination.totalItems === 0)) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีเอกสารสมัครสมาชิกที่ส่งแล้ว</h3>
        <p className="text-sm text-gray-500">
          คุณยังไม่มีเอกสารสมัครที่ส่งไปแล้ว หรือเอกสารสมัครสมาชิกของคุณยังไม่ได้รับการพิจารณา
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* แสดงข้อมูลสถิติ */}
      {pagination && pagination.totalItems > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
          <span>
            แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, pagination.totalItems)}-
            {Math.min(currentPage * itemsPerPage, pagination.totalItems)} จาก{" "}
            {pagination.totalItems} รายการ
          </span>
          <span>
            หน้า {currentPage} จาก {Math.ceil(pagination.totalItems / itemsPerPage)}
          </span>
        </div>
      )}

      {/* รายการใบสมัคร */}
      <div className="space-y-6">
        {applications.map((app) => {
          const memberTypeInfo = getMemberTypeInfo(app.memberType);
          const statusBadge = getStatusBadge(app.status);

          return (
            <div
              key={`${app.memberType}-${app.id}`}
              className={`bg-white rounded-lg shadow-sm border-2 ${memberTypeInfo.color} overflow-hidden`}
            >
              {/* Header */}
              <div className="bg-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      <span className={`text-lg font-bold ${memberTypeInfo.iconColor}`}>
                        {app.memberType === "IC"
                          ? "ทบ"
                          : app.memberType === "OC"
                            ? "สน"
                            : app.memberType === "AC"
                              ? "ทน"
                              : app.memberType === "AM"
                                ? "สส"
                                : app.memberType}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {app.displayName || "ไม่ระบุชื่อ"}
                      </h3>
                      <p className="text-blue-100 text-sm">{memberTypeInfo.text}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}
                      >
                        {statusBadge.text}
                      </div>
                      <p className="text-blue-100 text-xs mt-1">
                        ส่งเมื่อ {format(new Date(app.createdAt), "dd MMM yyyy", { locale: th })}
                      </p>
                    </div>

                    <button
                      onClick={() => openDetailPage(app)}
                      className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
                    >
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>

              {/* เพิ่มข้อมูลเพิ่มเติมในส่วน Body */}
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">รหัสใบสมัคร:</span>
                    <span className="ml-1 text-gray-600">{app.id}</span>
                  </div>
                  {app.identifier && (
                    <div>
                      <span className="font-medium text-gray-700">เลขประจำตัว:</span>
                      <span className="ml-1 text-gray-600">{app.identifier}</span>
                    </div>
                  )}
                  {app.updatedAt && (
                    <div>
                      <span className="font-medium text-gray-700">อัปเดตล่าสุด:</span>
                      <span className="ml-1 text-gray-600">
                        {format(new Date(app.updatedAt), "dd/MM/yyyy HH:mm", { locale: th })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* หากไม่มีข้อมูลในหน้านี้ แต่มีข้อมูลรวม */}
      {applications.length === 0 && pagination && pagination.totalItems > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>ไม่มีข้อมูลในหน้านี้</p>
          <button
            onClick={() => onPageChange && onPageChange(1)}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            กลับไปหน้าแรก
          </button>
        </div>
      )}
    </div>
  );
}
