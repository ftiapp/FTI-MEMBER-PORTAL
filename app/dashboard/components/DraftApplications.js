"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import { LoadingOverlay } from "./shared";

export default function DraftApplications({
  currentPage = 1,
  itemsPerPage = 5, // เปลี่ยน default เป็น 5
  onPageChange,
  onTotalItemsChange,
  searchQuery = "",
  membershipTypeFilter = "all",
}) {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allDrafts, setAllDrafts] = useState([]); // เก็บข้อมูลทั้งหมดสำหรับ pagination

  // ป้องกัน API calls ซ้ำซ้อน
  const fetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      console.log("✅ DraftApplications - Initial fetch for user:", user.id);
      hasFetchedRef.current = true;
      fetchDrafts();
    }
  }, [user]);

  // เมื่อ currentPage หรือ itemsPerPage เปลี่ยน ให้ทำ pagination ใหม่
  useEffect(() => {
    if (allDrafts.length > 0) {
      console.log("📋 DraftApplications - Paginating data:", {
        currentPage,
        itemsPerPage,
        totalDrafts: allDrafts.length,
      });
      paginateData(allDrafts);
    }
  }, [currentPage, itemsPerPage, allDrafts]);

  // เมื่อ searchQuery หรือ membershipTypeFilter เปลี่ยน ให้ filter ข้อมูล
  useEffect(() => {
    if (allDrafts.length > 0) {
      console.log("🔍 DraftApplications - Filtering data:", {
        searchQuery,
        membershipTypeFilter,
        totalDrafts: allDrafts.length,
      });
      filterAndPaginateData();
    }
  }, [searchQuery, membershipTypeFilter, allDrafts]);

  // ส่ง totalItems กลับไปให้ parent component เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (onTotalItemsChange) {
      onTotalItemsChange(allDrafts.length);
    }
  }, [allDrafts.length, onTotalItemsChange]);

  const fetchDrafts = async () => {
    if (fetchingRef.current) {
      console.log("⏳ DraftApplications - Already fetching, skipping...");
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      console.log("📡 DraftApplications - API call starting...");

      const response = await fetch("/api/membership/get-drafts");
      if (!response.ok) {
        throw new Error("Failed to fetch drafts");
      }
      const data = await response.json();
      console.log("📥 DraftApplications - API response received:", {
        success: !!data.drafts,
        count: data.drafts?.length,
      });

      const fetchedDrafts = data.drafts || [];
      console.log("📋 DraftApplications - Fetched drafts count:", fetchedDrafts.length);

      // ✅ เรียงตามวันที่อัปเดตล่าสุด (ล่าสุดขึ้นก่อน)
      const sortedDrafts = fetchedDrafts.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA; // เรียงจากมากไปน้อย (ล่าสุดก่อน)
      });

      setAllDrafts(sortedDrafts);
      paginateData(sortedDrafts);
    } catch (err) {
      console.error("❌ DraftApplications - Error fetching drafts:", err);
      setError("ไม่สามารถโหลดเอกสารสมัครสมาชิกที่บันทึกร่างไว้");
      setAllDrafts([]);
      setDrafts([]);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      console.log("✅ DraftApplications - Fetch completed");
    }
  };

  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDrafts = data.slice(startIndex, endIndex);

    console.log("Pagination:", {
      totalItems: data.length,
      currentPage,
      itemsPerPage,
      startIndex,
      endIndex,
      paginatedCount: paginatedDrafts.length,
    }); // Debug log

    setDrafts(paginatedDrafts);
  };

  const filterAndPaginateData = () => {
    let filteredDrafts = [...allDrafts];

    // Filter by membership type
    if (membershipTypeFilter !== "all") {
      filteredDrafts = filteredDrafts.filter(draft => draft.memberType.toLowerCase() === membershipTypeFilter.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredDrafts = filteredDrafts.filter(draft => {
        const companyName = draft.companyName || "";
        const taxId = getDraftTaxId(draft) || "";
        const idCard = getDraftIdCard(draft) || "";
        const memberTypeLabel = getMemberTypeFullName(draft.memberType) || "";

        return companyName.toLowerCase().includes(query) ||
               taxId.includes(query) ||
               idCard.includes(query) ||
               memberTypeLabel.toLowerCase().includes(query);
      });
    }

    console.log("Filtered results:", {
      originalCount: allDrafts.length,
      filteredCount: filteredDrafts.length,
      searchQuery,
      membershipTypeFilter,
    });

    // Reset to page 1 if current page is out of bounds
    const maxPage = Math.ceil(filteredDrafts.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      onPageChange && onPageChange(1);
      return;
    }

    paginateData(filteredDrafts);
  };

  const getMemberTypeThai = (type) => {
    const typeMap = {
      oc: "สน",
      ac: "ทน",
      ic: "ทบ",
      am: "สส",
    };
    return typeMap[type] || type;
  };

  const getMemberTypeFullName = (type) => {
    const typeMap = {
      oc: "สมาชิกสามัญ-โรงงาน",
      ac: "สมาชิกสมทบ-นิติบุคคล",
      ic: "สมาชิกสมทบ-บุคคลธรรมดา",
      am: "สมาชิกสามัญ-สมาคมการค้า",
    };
    return typeMap[type] || type;
  };

  // Extract TAX ID from various possible fields in draft data
  const getDraftTaxId = (draft) => {
    const d = draft?.draftData || {};
    const val = d.taxId || d.tax_id || d.taxID || d.companyTaxId || d.vatId || d.vat_id;
    return val && String(val).trim() !== "" ? String(val) : "-";
  };

  // Extract ID Card for IC from various possible fields in draft data
  const getDraftIdCard = (draft) => {
    const d = draft?.draftData || {};
    const val = d.idCardNumber || d.id_card_number || d.idCard || d.id_card;
    return val && String(val).trim() !== "" ? String(val) : "-";
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <LoadingOverlay
        isVisible={true}
        message="กำลังโหลดเอกสารสมัครที่บันทึกร่างไว้..."
        inline={true}
      />
    );
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
          onClick={fetchDrafts}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  if (!allDrafts || allDrafts.length === 0) {
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
          <p className="text-lg font-medium text-gray-600">
            ไม่มีเอกสารสมัครสมาชิกที่บันทึกร่างไว้
          </p>
          <p className="text-sm text-gray-500 mt-1">เมื่อบันทึกร่างเอกสารสมัคร จะแสดงที่นี่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* แสดงข้อมูลสถิติ */}
      {allDrafts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-4 gap-2">
          <span>
            แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, allDrafts.length)}-
            {Math.min(currentPage * itemsPerPage, allDrafts.length)} จาก {allDrafts.length} รายการ
          </span>
          <span className="text-gray-500">
            หน้า {currentPage} จาก {Math.ceil(allDrafts.length / itemsPerPage)}
          </span>
        </div>
      )}

      {/* รายการ drafts */}
      {drafts.map((draft) => (
        <div
          key={`${draft.memberType}-${draft.id}`}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              {/* ชื่อบริษัท (แสดงเป็นหัวข้อหลัก) */}
              <div className="mb-3">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {draft.companyName || "ไม่มีชื่อบริษัท"}
                </h4>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
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
                  <span className="font-semibold">{getIdentifierLabel(draft.memberType)}:</span>
                  <span className="ml-1 font-mono">
                    {draft.memberType === "ic" ? getDraftIdCard(draft) : getDraftTaxId(draft)}
                  </span>
                </div>
              </div>

              {/* ข้อมูลประเภทสมาชิก */}
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full flex-shrink-0">
                  <span className="text-sm font-bold text-yellow-600">
                    {getMemberTypeThai(draft.memberType)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">
                    {getMemberTypeThai(draft.memberType)} -{" "}
                    {getMemberTypeFullName(draft.memberType)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    ขั้นตอนที่ {draft.currentStep} จากทั้งหมด 5 ขั้นตอน
                  </p>
                </div>
              </div>

              {/* วันที่อัปเดต */}
              <div className="md:ml-11 mt-3 md:mt-0">
                <p className="text-xs text-gray-500 flex items-center">
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
                  อัปเดตล่าสุด: {formatDate(draft.updatedAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3 md:ml-4 w-full md:w-auto">
              <Link
                href={`/membership/${draft.memberType}?draftId=${draft.id}`}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-sm"
              >
                ดำเนินการต่อ
              </Link>

              {/* แสดง progress bar */}
              {draft.currentStep && (
                <div className="w-full md:w-28">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span className="font-medium">ความคืบหน้า</span>
                    <span className="font-bold text-blue-600">
                      {Math.round((draft.currentStep / 5) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 shadow-sm"
                      style={{ width: `${(draft.currentStep / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* หากไม่มีข้อมูลในหน้านี้ แต่มีข้อมูลรวม */}
      {drafts.length === 0 && allDrafts.length > 0 && (
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
