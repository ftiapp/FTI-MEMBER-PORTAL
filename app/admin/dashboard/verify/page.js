"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import SortableHeader from "./SortableHeader";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";
import ExistingMember from "./existing-member";
import MemberDetailsModal from "./MemberDetailsModal";
import RejectReasonModal from "./RejectReasonModal";

export default function VerifyMembers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "0";

  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showExistingMemberModal, setShowExistingMemberModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // เพิ่ม state สำหรับ search, filter, sort
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTerm, setActiveTerm] = useState(""); // committed term used for fetching
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Status counts for static cards
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Status labels for display
  const statusLabels = {
    0: "รอการอนุมัติ",
    1: "อนุมัติแล้ว",
    2: "ปฏิเสธแล้ว",
  };

  const handleSearchSubmit = (val) => {
    setSearchTerm(val || "");
    setActiveTerm(val || "");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Fetch members when relevant filters change
  useEffect(() => {
    fetchMembers();
  }, [
    pagination.page,
    statusParam,
    dateRange.from,
    dateRange.to,
    sortField,
    sortOrder,
    activeTerm,
  ]);

  // Fetch status counts on component mount
  useEffect(() => {
    fetchStatusCounts();
  }, []);

  /**
   * Fetches members based on status filter
   */
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      let url = `/api/admin/members?page=${pagination.page}&limit=${pagination.limit}&status=${statusParam}`;
      const term = activeTerm || "";
      if (term.length >= 2) url += `&term=${encodeURIComponent(term)}`;
      if (dateRange.from) url += `&from=${dateRange.from}`;
      if (dateRange.to) url += `&to=${dateRange.to}`;
      if (sortField) url += `&sortField=${sortField}`;
      if (sortOrder) url += `&sortOrder=${sortOrder}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("กรุณาเข้าสู่ระบบ");
          router.push("/admin");
          return;
        }
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();

      if (result.success) {
        setMembers(result.data);
        setPagination(result.pagination);
      } else {
        toast.error(result.message || "ไม่สามารถดึงข้อมูลได้");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches status counts for static cards
   */
  const fetchStatusCounts = async () => {
    try {
      const response = await fetch("/api/admin/verify-status-counts");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStatusCounts(result.counts);
        }
      }
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };

  /**
   * Handles pagination page changes
   */
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  /**
   * Opens the member details modal
   */
  const handleViewDetails = (member) => {
    setSelectedMember(member);
  };

  const handleCloseDetails = () => {
    setSelectedMember(null);
  };

  /**
   * Approves a member verification request
   */
  const handleApprove = async (member, approveComment) => {
    try {
      setIsApproving(true);
      // Get the first document ID from the documents array
      const documentId =
        member.documents && member.documents.length > 0 ? member.documents[0].id : null;

      if (!documentId) {
        toast.error("ไม่พบเอกสารสำหรับสมาชิกนี้");
        return;
      }

      const response = await fetch("/api/admin/approve-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: member.id,
          documentId: documentId,
          action: "approve",
          comment: approveComment,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("อนุมัติสมาชิกเรียบร้อยแล้ว");
        fetchMembers();
        fetchStatusCounts();
        setSelectedMember(null);
      } else {
        toast.error(result.message || "ไม่สามารถอนุมัติสมาชิกได้");
      }
    } catch (error) {
      console.error("Error approving member:", error);
      toast.error("เกิดข้อผิดพลาดในการอนุมัติสมาชิก");
    } finally {
      setIsApproving(false);
    }
  };

  /**
   * Rejects an existing member verification request with a reason
   */
  const handleReject = async (reason, comment) => {
    if (!selectedMember) return;

    try {
      setIsRejecting(true);

      console.log("🚫 Rejecting existing member verification:");
      console.log("Member:", selectedMember);
      console.log("Reason:", reason);

      const response = await fetch("/api/admin/verify-existing-member/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedMember.user_id,
          memberCode: selectedMember.MEMBER_CODE,
          companyId: selectedMember.id,
          reason: reason,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("ปฏิเสธการยืนยันสมาชิกเดิมเรียบร้อยแล้ว");
        setShowRejectModal(false);
        fetchMembers();
        fetchStatusCounts();
        setSelectedMember(null);
      } else {
        toast.error(result.message || "ไม่สามารถปฏิเสธการยืนยันสมาชิกเดิมได้");
      }
    } catch (error) {
      console.error("Error rejecting existing member:", error);
      toast.error("เกิดข้อผิดพลาดในการปฏิเสธการยืนยันสมาชิกเดิม");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleOpenReject = () => {
    setShowRejectModal(true);
  };

  const handleCloseReject = () => {
    setShowRejectModal(false);
  };

  const handleExistingMemberSuccess = () => {
    setShowExistingMemberModal(false);
    fetchMembers();
  };

  const handleStatusChange = (status) => {
    router.push(`/admin/dashboard/verify?status=${status}`);
  };

  /**
   * Delete a member (only shown for rejected members)
   */
  const handleDeleteMember = async (memberId) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch("/api/admin/delete-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("ลบข้อมูลสมาชิกเรียบร้อยแล้ว");
        fetchMembers();
      } else {
        toast.error(result.message || "ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
        >
          {/* Header with gradient */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              จัดการสมาชิก
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              สถานะ:{" "}
              <span className="font-semibold text-[#1e3a8a]">{statusLabels[statusParam]}</span>
            </p>
          </div>

          {/* Status Cards */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                statusParam === "0"
                  ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
              }`}
              onClick={() => handleStatusChange("0")}
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
                    รอการอนุมัติ
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statusCounts.pending}</div>
                </div>
                <div
                  className={`p-3 rounded-full ${statusParam === "0" ? "bg-yellow-400" : "bg-gray-200"}`}
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
                statusParam === "1"
                  ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
              }`}
              onClick={() => handleStatusChange("1")}
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
                    อนุมัติแล้ว
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statusCounts.approved}</div>
                </div>
                <div
                  className={`p-3 rounded-full ${statusParam === "1" ? "bg-green-500" : "bg-gray-200"}`}
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

            <div
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                statusParam === "2"
                  ? "border-red-400 bg-gradient-to-br from-red-50 to-rose-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
              }`}
              onClick={() => handleStatusChange("2")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    ปฏิเสธแล้ว
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statusCounts.rejected}</div>
                </div>
                <div
                  className={`p-3 rounded-full ${statusParam === "2" ? "bg-red-500" : "bg-gray-200"}`}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Status filter tabs - Improved design */}
          <div className="flex gap-2 mb-6 bg-gray-50 p-2 rounded-lg">
            <button
              onClick={() => handleStatusChange("0")}
              className={`flex-1 py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
                statusParam === "0"
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
                รอการอนุมัติ
              </div>
            </button>
            <button
              onClick={() => handleStatusChange("1")}
              className={`flex-1 py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
                statusParam === "1"
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
                อนุมัติแล้ว
              </div>
            </button>
            <button
              onClick={() => handleStatusChange("2")}
              className={`flex-1 py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
                statusParam === "2"
                  ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:bg-white hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                ปฏิเสธแล้ว
              </div>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={handleSearchSubmit}
            dateRange={dateRange}
            onDateChange={setDateRange}
            placeholder="ค้นหา: หมายเลขสมาชิก / ชื่อบริษัท / ชื่อ-นามสกุล / อีเมล"
          />

          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#1e3a8a]"></div>
              <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-gray-600 font-medium text-lg">ไม่พบข้อมูลสมาชิก</p>
              <p className="text-gray-500 text-sm mt-1">
                ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูล
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto shadow-md rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider w-40"
                      >
                        การดำเนินการ
                      </th>
                      <SortableHeader
                        field="company_name"
                        label="บริษัท"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={(f, o) => {
                          setSortField(f);
                          setSortOrder(o);
                        }}
                      />
                      <SortableHeader
                        field="name"
                        label="ชื่อ-นามสกุล"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={(f, o) => {
                          setSortField(f);
                          setSortOrder(o);
                        }}
                      />
                      <SortableHeader
                        field="email"
                        label="อีเมล"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={(f, o) => {
                          setSortField(f);
                          setSortOrder(o);
                        }}
                      />
                      <SortableHeader
                        field="created_at"
                        label="วันที่ลงทะเบียน"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={(f, o) => {
                          setSortField(f);
                          setSortOrder(o);
                        }}
                      />
                      <SortableHeader
                        field="Admin_Submit"
                        label="สถานะ"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={(f, o) => {
                          setSortField(f);
                          setSortOrder(o);
                        }}
                      />
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      >
                        ผู้ดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member, index) => (
                      <tr
                        key={member.id}
                        className={`transition-all duration-200 hover:bg-blue-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        {/* Action buttons - NOW FIRST COLUMN */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(member)}
                              className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                              title="ดูรายละเอียด"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
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

                            {/* Delete button for rejected members */}
                            {member.Admin_Submit === 2 && (
                              <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                title="ลบข้อมูล"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                ลบ
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Company info */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {member.company_name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                />
                              </svg>
                              {member.MEMBER_CODE || "ยังไม่มีรหัสสมาชิก"}
                            </div>
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstname} {member.lastname}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {member.email}
                          </div>
                        </td>

                        {/* Registration date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {new Date(member.created_at).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${
                              member.Admin_Submit === 0
                                ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                                : member.Admin_Submit === 1
                                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                                  : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {member.Admin_Submit === 0 ? (
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            ) : member.Admin_Submit === 1 ? (
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                            {member.Admin_Submit === 0
                              ? "รอการอนุมัติ"
                              : member.Admin_Submit === 1
                                ? "อนุมัติแล้ว"
                                : "ปฏิเสธแล้ว"}
                          </span>
                        </td>

                        {/* Admin name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700 flex items-center gap-1">
                            {(member.Admin_Submit === 1 || member.Admin_Submit === 2) &&
                            member.admin_name ? (
                              <>
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {member.admin_name}
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Improved design */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-2">
                  <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    <span className="font-semibold text-[#1e3a8a]">หน้า {pagination.page}</span>
                    <span className="mx-1">จาก</span>
                    <span className="font-semibold text-[#1e3a8a]">{pagination.totalPages}</span>
                    <span className="mx-2">•</span>
                    <span>
                      ทั้งหมด{" "}
                      <span className="font-semibold text-[#1e3a8a]">{pagination.total}</span>{" "}
                      รายการ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        pagination.page === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white shadow-sm hover:shadow-md"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      ย้อนกลับ
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        pagination.page === pagination.totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white hover:from-[#2563eb] hover:to-[#1e3a8a] shadow-sm hover:shadow-md"
                      }`}
                    >
                      ถัดไป
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
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
            </>
          )}
        </motion.div>

        {/* Member Details Modal */}
        {selectedMember && !showExistingMemberModal && !showRejectModal && (
          <MemberDetailsModal
            member={selectedMember}
            onClose={handleCloseDetails}
            onApprove={handleApprove}
            onOpenReject={handleOpenReject}
          />
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <RejectReasonModal onReject={handleReject} onClose={handleCloseReject} />
        )}

        {/* Existing Member Modal */}
        {showExistingMemberModal && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-y-auto border border-gray-200">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">ยืนยันสมาชิกเดิม</h3>
                <button
                  onClick={() => setShowExistingMemberModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <ExistingMember
                  member={selectedMember}
                  onSuccess={handleExistingMemberSuccess}
                  onClose={() => setShowExistingMemberModal(false)}
                />
              </div>
            </div>
          </div>
        )}
      </>
    </AdminLayout>
  );
}
