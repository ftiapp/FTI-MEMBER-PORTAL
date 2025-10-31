"use client";

import { useState, useEffect, useRef } from "react";
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

  // ป้องกัน API calls ซ้ำซ้อน
  const fetchingRef = useRef(false);
  const lastFetchParamsRef = useRef(null);

  useEffect(() => {
    // สร้าง unique key สำหรับ fetch parameters
    const fetchKey = `${userId}-${currentPage}-${itemsPerPage}`;

    // ถ้ากำลัง fetch อยู่ หรือ parameters เหมือนเดิม ไม่ต้อง fetch ใหม่
    if (fetchingRef.current || lastFetchParamsRef.current === fetchKey) {
      console.log("🚫 SubmittedApplications - Skip duplicate fetch:", fetchKey);
      return;
    }

    console.log("✅ SubmittedApplications - Fetching with params:", {
      userId,
      currentPage,
      itemsPerPage,
    });
    lastFetchParamsRef.current = fetchKey;
    fetchApplications();
  }, [userId, currentPage, itemsPerPage]);

  // ส่ง totalItems กลับไปให้ parent component เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (pagination && onTotalItemsChange) {
      onTotalItemsChange(pagination.totalItems || 0);
    }
  }, [pagination, onTotalItemsChange]);

  const fetchApplications = async () => {
    if (fetchingRef.current) {
      console.log("⏳ SubmittedApplications - Already fetching, skipping...");
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      console.log("📡 SubmittedApplications - API call starting...");

      const params = new URLSearchParams({
        page: currentPage?.toString() || "1",
        limit: itemsPerPage?.toString() || "10",
      });

      const response = await fetch(`/api/membership/submitted-applications?${params}`);
      const data = await response.json();

      console.log("📥 SubmittedApplications - API response received:", {
        success: data.success,
        count: data.applications?.length,
        totalItems: data.pagination?.totalItems,
      });

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
      console.error("❌ SubmittedApplications - Error fetching applications:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setApplications([]);
      setPagination(null);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      console.log("✅ SubmittedApplications - Fetch completed");
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-4 gap-2">
          <span className="text-center sm:text-left">
            แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, pagination.totalItems)}-
            {Math.min(currentPage * itemsPerPage, pagination.totalItems)} จาก{" "}
            {pagination.totalItems} รายการ
          </span>
          <span className="text-center sm:text-right text-gray-500">
            หน้า {currentPage} จาก {Math.ceil(pagination.totalItems / itemsPerPage)}
          </span>
        </div>
      )}

      {/* รายการใบสมัคร */}
      {applications.map((app) => {
        const memberTypeInfo = getMemberTypeInfo(app.memberType);
        const statusBadge = getStatusBadge(app.status);

        return (
          <div
            key={`${app.memberType}-${app.id}`}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-1">
                {/* ข้อมูลประเภทสมาชิก */}
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                    <span className={`text-sm font-bold ${memberTypeInfo.iconColor}`}>
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
                    <h4 className="font-medium text-gray-900 text-lg">{memberTypeInfo.text}</h4>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-600">
                        ชื่อ: {app.displayName || "ไม่ระบุชื่อ"}
                      </p>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}
                      >
                        {statusBadge.text}
                      </div>
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
                      ส่งเมื่อ:{" "}
                      {format(new Date(app.createdAt), "dd/MM/yyyy HH:mm", { locale: th })}
                    </p>
                    {app.updatedAt && (
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        อัปเดต:{" "}
                        {format(new Date(app.updatedAt), "dd/MM/yyyy HH:mm", { locale: th })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3 md:ml-4 w-full md:w-auto">
                <button
                  onClick={() => openDetailPage(app)}
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
                        app.status === 0
                          ? "text-yellow-600"
                          : app.status === 1
                            ? "text-green-600"
                            : app.status === 2
                              ? "text-red-600"
                              : "text-gray-600"
                      }`}
                    >
                      {statusBadge.text}
                    </span>
                  </div>
                  <div
                    className={`w-full rounded-full h-2 ${
                      app.status === 0
                        ? "bg-yellow-200"
                        : app.status === 1
                          ? "bg-green-200"
                          : app.status === 2
                            ? "bg-red-200"
                            : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                        app.status === 0
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                          : app.status === 1
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : app.status === 2
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : "bg-gradient-to-r from-gray-500 to-gray-600"
                      }`}
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
