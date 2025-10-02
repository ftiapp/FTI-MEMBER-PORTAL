"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";
import { motion } from "framer-motion";
import UpdateList from "./components/UpdateList";
import UpdateDetail from "./components/UpdateDetail";
import SearchBar from "./components/SearchBar";
import Pagination from "./components/Pagination";

const PAGE_SIZE = 5;
const TABS = [
  { key: "pending", label: "รออนุมัติ" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ปฏิเสธ" },
];

export default function UpdateMembers() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [comment, setComment] = useState("");
  const [memberData, setMemberData] = useState({
    MEMBER_CODE: "",
    company_name: "",
    company_type: "",
    registration_number: "",
    tax_id: "",
    address: "",
    province: "",
    postal_code: "",
    phone: "",
    website: "",
    admin_comment: "",
    MEMBER_DATE: "",
  });

  // Reference to previous search term for animation control
  const prevSearchRef = useRef(searchTerm);

  // Fetch members when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
    fetchMembers();
    // eslint-disable-next-line
  }, [activeTab, searchTerm]);

  // Initialize memberData when a member is selected
  useEffect(() => {
    if (selectedMember) {
      setMemberData({
        MEMBER_CODE: selectedMember.MEMBER_CODE || "",
        company_name: selectedMember.company_name || "",
        company_type: selectedMember.company_type || "",
        registration_number: selectedMember.registration_number || "",
        tax_id: selectedMember.tax_id || "",
        address: selectedMember.address || "",
        province: selectedMember.province || "",
        postal_code: selectedMember.postal_code || "",
        phone: selectedMember.phone || "",
        website: selectedMember.website || "",
        admin_comment: selectedMember.admin_comment || "",
        MEMBER_DATE: (selectedMember.MEMBER_DATE || "").toString().slice(0, 10),
      });
    }
  }, [selectedMember]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/search-members?status=${activeTab}`;
      if (searchTerm.length >= 2) {
        url += `&term=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      if (result.success) {
        setMembers(result.data || []);
      } else {
        toast.error(result.message || "ไม่สามารถค้นหาข้อมูลได้");
        setMembers([]);
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการค้นหาข้อมูล");
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectMember = async (member) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/member-details?id=${member.id}`);
      if (!response.ok) throw new Error("Failed to fetch member details");
      const result = await response.json();
      if (result.success) {
        setSelectedMember(result.data);
        setComment(result.data.admin_comment || "");
      } else {
        toast.error(result.message || "ไม่สามารถดึงข้อมูลสมาชิกได้");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/update-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMember.id,
          status: "approved",
          admin_comment: comment,
        }),
      });
      const res = await response.json();
      if (res.success) {
        toast.success("อนุมัติสมาชิกเรียบร้อย");
        setSelectedMember(null);
        fetchMembers();
      } else {
        toast.error(res.message || "ไม่สามารถอนุมัติได้");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการอนุมัติ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/update-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMember.id,
          status: "rejected",
          admin_comment: comment,
        }),
      });
      const res = await response.json();
      if (res.success) {
        toast.success("ปฏิเสธสมาชิกเรียบร้อย");
        setSelectedMember(null);
        fetchMembers();
      } else {
        toast.error(res.message || "ไม่สามารถปฏิเสธได้");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการปฏิเสธ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/admin/update-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedMember.id,
          ...memberData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("อัพเดตข้อมูลสมาชิกเรียบร้อยแล้ว");
        setSelectedMember(null);
        setMembers(
          members.map((m) =>
            m.id === selectedMember.id
              ? { ...m, company_name: memberData.company_name, MEMBER_CODE: memberData.MEMBER_CODE }
              : m,
          ),
        );
        fetchMembers();
      } else {
        toast.error(result.message || "ไม่สามารถอัพเดตข้อมูลสมาชิกได้");
      }
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("เกิดข้อผิดพลาดในการอัพเดตข้อมูลสมาชิก");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Transition settings
  const pageTransition = {
    type: "tween",
    ease: "easeOut",
    duration: 0.2,
  };

  // Pagination logic
  const filteredMembers = members;
  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE) || 1;
  const pagedMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <AdminLayout>
      <motion.div
        className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="flex justify-between items-center py-5">
          <h1 className="text-2xl font-bold text-gray-900">อัพเดตข้อมูลสมาชิก</h1>
        </div>

        {/* Tab Bar */}
        <div className="flex space-x-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearchTerm("");
                setSelectedMember(null);
              }}
              className={`px-4 py-2 rounded-t font-bold border-b-2 ${activeTab === tab.key ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-500 bg-gray-100"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="ค้นหาด้วยชื่อบริษัทหรือรหัสสมาชิก"
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <p className="mt-3 text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-1">
              <UpdateList
                members={pagedMembers}
                selectedId={selectedMember?.id}
                onSelect={handleSelectMember}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
            {/* Detail */}
            <div className="lg:col-span-2">
              {selectedMember ? (
                <UpdateDetail
                  member={selectedMember}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={isSubmitting}
                  comment={comment}
                  setComment={setComment}
                  memberData={memberData}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                  <div className="text-center">
                    <p className="text-gray-500">เลือกสมาชิกจากรายการเพื่อแก้ไขข้อมูล</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMembers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mt-5">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-gray-50 p-4 rounded-full inline-flex mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold text-lg">ไม่พบข้อมูลสมาชิก</h3>
              <p className="mt-2 text-sm text-gray-500 mb-4">
                {searchTerm
                  ? `ไม่พบข้อมูลสมาชิกที่ตรงกับคำค้นหา "${searchTerm}"`
                  : "ไม่พบข้อมูลสมาชิก"}
              </p>
              {searchTerm && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-blue-600 border border-blue-200 hover:bg-blue-50 font-medium rounded-md px-4 py-2 text-sm"
                  >
                    ล้างการค้นหา
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}
