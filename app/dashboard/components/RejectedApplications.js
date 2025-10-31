"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "./shared";

export default function RejectedApplications({
  currentPage = 1,
  itemsPerPage = 5,
  onPageChange,
  onTotalItemsChange,
}) {
  const [rejectedApps, setRejectedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();

  // ป้องกัน API calls ซ้ำซ้อน
  const fetchingRef = useRef(false);
  const lastFetchParamsRef = useRef(null);

  useEffect(() => {
    // สร้าง unique key สำหรับ fetch parameters
    const fetchKey = `${currentPage}-${itemsPerPage}`;

    // ถ้ากำลัง fetch อยู่ หรือ parameters เหมือนเดิม ไม่ต้อง fetch ใหม่
    if (fetchingRef.current || lastFetchParamsRef.current === fetchKey) {
      console.log("🚫 RejectedApplications - Skip duplicate fetch:", fetchKey);
      return;
    }

    console.log("✅ RejectedApplications - Fetching with params:", { currentPage, itemsPerPage });
    lastFetchParamsRef.current = fetchKey;
    fetchRejectedApplications();
  }, [currentPage, itemsPerPage]);

  // ส่ง totalItems กลับไปให้ parent component เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (onTotalItemsChange) {
      onTotalItemsChange(totalItems);
    }
  }, [totalItems, onTotalItemsChange]);

  const fetchRejectedApplications = async () => {
    if (fetchingRef.current) {
      console.log("⏳ RejectedApplications - Already fetching, skipping...");
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      console.log("📡 RejectedApplications - API call starting (v2 - no Reject_DATA)...");
      const response = await fetch(`/api/membership/rejected-applications-v2`);
      const result = await response.json();

      console.log("📥 RejectedApplications - API response received:", {
        success: result.success,
        count: result.data?.length,
        totalItems: result.pagination?.totalItems || result.totalItems,
      });

      if (result.success) {
        setRejectedApps(result.data || []);
        setTotalItems(result.pagination?.totalItems || result.totalItems || 0);
      } else {
        setError(result.message || "Failed to fetch rejected applications");
        setRejectedApps([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("❌ RejectedApplications - Error fetching:", error);
      setError("Failed to fetch rejected applications");
      setRejectedApps([]);
      setTotalItems(0);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      console.log("✅ RejectedApplications - Fetch completed");
    }
  };

  const handleEditApplication = (app) => {
    // Navigate directly to the membership type specific edit form (v2 - uses Main table ID)
    const membershipType = app.membership_type; // v2 API returns 'membership_type'
    const editUrl = `/membership/${membershipType}/edit-rejected/${app.id}`;
    router.push(editUrl);
  };

  const handleCancelApplication = async (app) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกใบสมัครนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) {
      return;
    }

    try {
      const response = await fetch(`/api/membership/rejected-applications/${app.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("ยกเลิกใบสมัครเรียบร้อยแล้ว");
        fetchRejectedApplications(); // Refresh the list
      } else {
        alert("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Error cancelling application:", error);
      alert("เกิดข้อผิดพลาดในการยกเลิกใบสมัคร");
    }
  };

  const getMembershipTypeLabel = (type) => {
    const labels = {
      oc: "สามัญ-โรงงาน (OC)",
      ac: "สมทบ-นิติบุคคล (AC)",
      am: "สามัญ-สมาคมการค้า (AM)",
      ic: "สมทบ-บุคคลธรรมดา (IC)",
    };
    return labels[type] || (type ? type.toUpperCase() : "N/A");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          onClick={fetchRejectedApplications}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  if (rejectedApps.length === 0 && totalItems === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
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
          <p className="text-lg font-medium text-gray-600">ไม่มีเอกสารที่รอการแก้ไข</p>
          <p className="text-sm text-gray-500 mt-1">เมื่อมีใบสมัครที่ถูกปฏิเสธ จะแสดงที่นี่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* แสดงข้อมูลสถิติ */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-4 gap-2">
          <span className="text-center sm:text-left">
            แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
            {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems} รายการ
          </span>
          <span className="text-center sm:text-right text-gray-500">
            หน้า {currentPage} จาก {Math.ceil(totalItems / itemsPerPage)}
          </span>
        </div>
      )}

      {/* รายการใบสมัครที่ถูกปฏิเสธ */}
      {rejectedApps.map((app) => (
        <div
          key={app.id}
          className="bg-white border border-red-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-red-600"
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
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app.application_name || "ใบสมัครสมาชิก"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getMembershipTypeLabel(app.membership_type)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">เลขประจำตัว:</p>
                    <p className="text-sm text-gray-600">{app.identifier || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">วันที่ปฏิเสธ:</p>
                    <p className="text-sm text-gray-600">{formatDate(app.created_at)}</p>
                  </div>
                </div>

                {app.rejection_reason && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">เหตุผลการปฏิเสธ:</p>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">{app.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {/* เพิ่มข้อมูลเพิ่มเติมถ้ามี */}
                {app.additional_notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">หมายเหตุ:</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                      <p className="text-sm text-gray-600">{app.additional_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleCancelApplication(app)}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors w-full sm:w-auto"
              >
                ยกเลิกใบสมัคร
              </button>
              <button
                onClick={() => handleEditApplication(app)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
              >
                แก้ไขและส่งใหม่
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* หากไม่มีข้อมูลในหน้านี้ แต่มีข้อมูลรวม */}
      {rejectedApps.length === 0 && totalItems > 0 && (
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
