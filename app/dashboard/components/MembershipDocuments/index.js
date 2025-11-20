"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { LoadingOverlay } from "../shared";
import DraftApplications from "../DraftApplications";
import SubmittedApplications from "../SubmittedApplications";
import RejectedApplicationsV3 from "../RejectedApplications/index";
import ResubmittedApplications from "../ResubmittedApplications";
import ApplicationDetailView from "../ApplicationDetailView";
import EnhancedPagination from "./EnhancedPagination";

export default function MembershipDocuments() {
  const { user } = useAuth();
  const userId = user?.id;

  console.log("👤 MembershipDocuments - Auth state:", {
    hasUser: !!user,
    userId: userId,
    user: user,
  });
  const [activeSection, setActiveSection] = useState("drafts");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [submittedPagination, setSubmittedPagination] = useState(null);

  const isProduction = process.env.NODE_ENV === "production";

  // เพิ่มตัวเลือกจำนวนรายการต่อหน้า
  const [itemsPerPage, setItemsPerPage] = useState(5); // เปลี่ยนกลับเป็น 5 รายการ
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const detail = searchParams.get("detail");

  // ฟังก์ชันสำหรับรับ totalItems จาก child components
  const handleTotalItemsChange = (total) => {
    console.log("📊 MembershipDocuments - Total items updated:", total);
    setTotalItems(total);
  };

  // ลบ useEffect เดิมที่เรียก API เพื่อนับจำนวน เพราะจะให้ child components ส่งมาแทน

  const handleTabChange = (section) => {
    console.log("🔄 MembershipDocuments - Tab changing to:", section);
    setActiveSection(section);
    setCurrentPage(1); // reset หน้าเป็น 1 เมื่อเปลี่ยน tab
    setTotalItems(0); // reset totalItems เมื่อเปลี่ยน tab
    console.log("✅ MembershipDocuments - Tab changed, states reset");
  };

  // Reset to drafts tab if rejected is selected in production
  useEffect(() => {
    if (isProduction && activeSection === "rejected") {
      setActiveSection("drafts");
    }
  }, [isProduction, activeSection]);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // reset หน้าเป็น 1 เมื่อเปลี่ยนจำนวนรายการ
  };

  // Add search and filter states after existing useState declarations
  const [searchQuery, setSearchQuery] = useState("");
  const [membershipTypeFilter, setMembershipTypeFilter] = useState("all");

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
            <nav className="flex flex-wrap">
              <button
                onClick={() => handleTabChange("drafts")}
                className={`flex-1 min-w-[150px] py-4 px-4 text-center font-medium flex items-center justify-center space-x-2 ${
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
                <span className="hidden sm:inline">เอกสารที่บันทึกร่างไว้</span>
                <span className="sm:hidden">ยังไม่ส่ง</span>
              </button>

              {/* Show rejected tab only in non-production */}
              {!isProduction && (
                <button
                  onClick={() => handleTabChange("rejected")}
                  className={`flex-1 min-w-[150px] py-4 px-4 text-center font-medium flex items-center justify-center space-x-2 ${
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

              {/* Resubmitted applications tab */}
              <button
                onClick={() => handleTabChange("resubmitted")}
                className={`flex-1 min-w-[150px] py-4 px-4 text-center font-medium flex items-center justify-center space-x-2 ${
                  activeSection === "resubmitted"
                    ? "text-purple-600 border-b-2 border-purple-500 bg-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0114-7.5M19 5A9 9 0 015 12.5"
                  />
                </svg>
                <span className="hidden sm:inline">เอกสารที่แก้ไขแล้ว</span>
                <span className="sm:hidden">แก้ไขแล้ว</span>
              </button>

              <button
                onClick={() => handleTabChange("completed")}
                className={`flex-1 min-w-[150px] py-4 px-4 text-center font-medium flex items-center justify-center space-x-2 ${
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

          {/* Search and Filter UI - ส่วนที่ปรับปรุงใหม่ */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อบริษัทหรือเลขทะเบียน"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="sm:w-48 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <select
                  value={membershipTypeFilter}
                  onChange={(e) => setMembershipTypeFilter(e.target.value)}
                  className="block w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                >
                  <option value="all">ประเภทสมาชิก: ทั้งหมด</option>
                  <option value="OC">สามัญ-โรงงาน (สน)</option>
                  <option value="AM">สามัญ-สมาคมการค้า (สส)</option>
                  <option value="AC">สมทบ-นิติบุคคล (ทน)</option>
                  <option value="IC">สมทบ-บุคคลธรรมดา (ทบ)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || membershipTypeFilter !== "all") && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">กรองโดย:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    ค้นหา: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )}
                {membershipTypeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    ประเภท: {membershipTypeFilter}
                    <button
                      onClick={() => setMembershipTypeFilter("all")}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setMembershipTypeFilter("all");
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  ล้างทั้งหมด
                </button>
              </div>
            )}
          </div>

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
                  searchQuery={searchQuery}
                  membershipTypeFilter={membershipTypeFilter}
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
                <RejectedApplicationsV3
                  searchQuery={searchQuery}
                  membershipTypeFilter={membershipTypeFilter}
                />
              </div>
            ) : activeSection === "resubmitted" ? (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0114-7.5M19 5A9 9 0 015 12.5"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">เอกสารสมัครสมาชิกที่แก้ไขแล้ว</h2>
                    <p className="text-sm text-gray-600">
                      เอกสารที่ท่านได้แก้ไขและส่งกลับมาแล้ว อยู่ระหว่างรอตรวจสอบจากเจ้าหน้าที่
                    </p>
                  </div>
                </div>

                <ResubmittedApplications
                  searchQuery={searchQuery}
                  membershipTypeFilter={membershipTypeFilter}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
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
                  userId={userId}
                  searchQuery={searchQuery}
                  membershipTypeFilter={membershipTypeFilter}
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
