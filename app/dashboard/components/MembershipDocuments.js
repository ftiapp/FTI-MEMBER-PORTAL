"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingOverlay } from "./shared";
import DraftApplications from "./DraftApplications";
import SubmittedApplications from "./SubmittedApplications";
import RejectedApplicationsV3 from "./RejectedApplicationsV3"; // ← เปลี่ยนเป็น V3
import ApplicationsList from "../../components/member/ApplicationsList";
import ApplicationDetailView from "./ApplicationDetailView";

export default function MembershipDocuments() {
  const [activeSection, setActiveSection] = useState("drafts");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [submittedPagination, setSubmittedPagination] = useState(null);
  
  const isProduction = process.env.NODE_ENV === 'production';

  // เพิ่มตัวเลือกจำนวนรายการต่อหน้า
  const [itemsPerPage, setItemsPerPage] = useState(5); // เปลี่ยนกลับเป็น 5 รายการ
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const detail = searchParams.get("detail");

  // ฟังก์ชันสำหรับรับ totalItems จาก child components
  const handleTotalItemsChange = (total) => {
    console.log('📊 MembershipDocuments - Total items updated:', total);
    setTotalItems(total);
  };

  // ลบ useEffect เดิมที่เรียก API เพื่อนับจำนวน เพราะจะให้ child components ส่งมาแทน

  const handleTabChange = (section) => {
    console.log('🔄 MembershipDocuments - Tab changing to:', section);
    setActiveSection(section);
    setCurrentPage(1); // reset หน้าเป็น 1 เมื่อเปลี่ยน tab
    setTotalItems(0); // reset totalItems เมื่อเปลี่ยน tab
    console.log('✅ MembershipDocuments - Tab changed, states reset');
  };
  
  // Reset to drafts tab if rejected is selected in production
  useEffect(() => {
    if (isProduction && activeSection === 'rejected') {
      setActiveSection('drafts');
    }
  }, [isProduction, activeSection]);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // reset หน้าเป็น 1 เมื่อเปลี่ยนจำนวนรายการ
  };

  // Enhanced Pagination Component
  const EnhancedPagination = ({
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
  }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalItems === 0) return null;

    // สร้าง array ของหน้าที่จะแสดง
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // แสดงหน้าแรก
        pages.push(1);

        // แสดง ... ถ้าจำเป็น
        if (currentPage > 3) {
          pages.push("...");
        }

        // แสดงหน้าปัจจุบันและหน้าข้างเคียง
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
          if (i !== 1 && i !== totalPages) {
            pages.push(i);
          }
        }

        // แสดง ... ถ้าจำเป็น
        if (currentPage < totalPages - 2) {
          pages.push("...");
        }

        // แสดงหน้าสุดท้าย
        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex flex-col items-center justify-between mt-6 pt-4 border-t border-gray-200 space-y-4">
        {/* ข้อมูลสถิติ */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <p className="text-sm text-gray-700 text-center sm:text-left">
            แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
            {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems} รายการ
          </p>

          {/* ตัวเลือกจำนวนรายการต่อหน้า */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">รายการต่อหน้า:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* ปุ่ม Pagination */}
        <div className="flex flex-wrap items-center justify-center gap-1 w-full sm:w-auto">
          {/* ปุ่มหน้าแรก */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={`px-2 sm:px-3 py-2 rounded text-xs sm:text-sm ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="hidden sm:inline">หน้าแรก</span>
            <span className="sm:hidden">««</span>
          </button>

          {/* ปุ่มก่อนหน้า */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 sm:px-3 py-2 rounded text-xs sm:text-sm flex items-center space-x-1 ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">ก่อนหน้า</span>
            <span className="sm:hidden">«</span>
          </button>

          {/* หมายเลขหน้า */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => (typeof page === "number" ? onPageChange(page) : null)}
              disabled={typeof page !== "number"}
              className={`px-2 sm:px-3 py-2 rounded text-xs sm:text-sm min-w-[32px] sm:min-w-[40px] ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : typeof page === "number"
                    ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "bg-transparent text-gray-400 cursor-default"
              }`}
            >
              {page}
            </button>
          ))}

          {/* ปุ่มถัดไป */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-2 sm:px-3 py-2 rounded text-xs sm:text-sm flex items-center space-x-1 ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="hidden sm:inline">ถัดไป</span>
            <span className="sm:hidden">»</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* ปุ่มหน้าสุดท้าย */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-2 sm:px-3 py-2 rounded text-xs sm:text-sm ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="hidden sm:inline">หน้าสุดท้าย</span>
            <span className="sm:hidden">»»</span>
          </button>
        </div>
      </div>
    );
  };

  // If detail parameter exists, show detail view
  if (detail) {
    return <ApplicationDetailView />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => handleTabChange("drafts")}
                className={`flex-1 py-4 px-4 text-center font-medium flex items-center justify-center space-x-2 ${
                  activeSection === "drafts"
                    ? "text-blue-600 border-b-2 border-blue-500 bg-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="hidden sm:inline">เอกสารสมัครสมาชิกที่ยังไม่ส่ง</span>
                <span className="sm:hidden">ยังไม่ส่ง</span>
              </button>

              {/* Show rejected tab only in non-production */}
              {!isProduction && (
                <button
                  onClick={() => handleTabChange("rejected")}
                  className={`flex-1 py-4 px-4 text-center font-medium flex items-center justify-center space-x-2 ${
                    activeSection === "rejected"
                      ? "text-red-600 border-b-2 border-red-500 bg-white"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">เอกสารรอการแก้ไข</span>
                  <span className="sm:hidden">รอแก้ไข</span>
                </button>
              )}

              <button
                onClick={() => handleTabChange("completed")}
                className={`flex-1 py-4 px-4 text-center font-medium flex items-center justify-center space-x-2 ${
                  activeSection === "completed"
                    ? "text-green-600 border-b-2 border-green-500 bg-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="hidden sm:inline">เอกสารสมัครสมาชิกที่ส่งแล้ว</span>
                <span className="sm:hidden">ส่งแล้ว</span>
              </button>
            </nav>
          </div>

          {/* Loading Indicator */}
          {loading && <LoadingOverlay isVisible={true} message="กำลังโหลด..." inline={true} />}

          {/* Content Area */}
          <div className="p-6">
            {activeSection === "drafts" ? (
              <div>
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      เอกสารสมัครสมาชิกทีบันทึกร่าง
                    </h2>
                    
                   
                  </div>
                </div>

                <DraftApplications
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onTotalItemsChange={handleTotalItemsChange}
                />

                <EnhancedPagination
                  totalItems={totalItems}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            ) : !isProduction && activeSection === "rejected" ? (
              <div>
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
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
                    <h2 className="text-xl font-bold text-gray-900">เอกสารรอการแก้ไข</h2>
                    
                  </div>
                </div>

                {/* V3: ใช้ระบบ Conversations ใหม่ - มี pagination ในตัวแล้ว */}
                <RejectedApplicationsV3 />
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">เอกสารสมัครสมาชิกที่ส่งแล้ว</h2>
                   
                  </div>
                </div>

                <SubmittedApplications
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onPaginationChange={setSubmittedPagination}
                  onTotalItemsChange={handleTotalItemsChange}
                />

                <EnhancedPagination
                  totalItems={submittedPagination?.totalItems || totalItems}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-medium text-gray-900">ต้องการความช่วยเหลือ?</h3>
                <p className="text-gray-600 text-sm">หากมีปัญหาหรือสงสัยเรื่องการสมัครสมาชิก</p>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium flex items-center space-x-2 w-full sm:w-auto justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 3 6V5z"
                />
              </svg>
              <span>ติดต่อเรา</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
