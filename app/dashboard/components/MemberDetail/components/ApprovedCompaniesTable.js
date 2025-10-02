"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaBuilding,
  FaFileAlt,
  FaSearch,
  FaPencilAlt,
  FaEye,
  FaDownload,
  FaTimes,
  FaSearchPlus,
  FaSearchMinus,
  FaExpand,
} from "react-icons/fa";

import InfoBox from "./InfoBox";

/**
 * ApprovedCompaniesTable component displays a table of approved companies
 * @param {Object} props Component properties
 * @param {Array} props.companies List of company objects to display
 * @param {Function} props.formatDate Function to format date strings
 * @returns {JSX.Element} The companies table UI
 */
const ApprovedCompaniesTable = ({ companies, formatDate }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(1);

  const isImage = (url) => /\.(png|jpe?g|gif|webp)$/i.test(url || "");
  const isPdf = (url) => /\.pdf($|\?)/i.test(url || "");

  // Close on Escape key when modal is open
  useEffect(() => {
    if (!previewUrl) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setPreviewUrl(null);
        setZoom(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewUrl]);

  // Lock body scroll while preview is open
  useEffect(() => {
    if (previewUrl) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
  }, [previewUrl]);

  return (
  <motion.div
    className="overflow-x-auto rounded-lg shadow-lg border border-gray-200"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
  >
    <InfoBox />

    <motion.div
      className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center">
        <motion.div
          className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <FaBuilding className="text-blue-600" size={16} />
        </motion.div>
        <div>
          <motion.p
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            พบ {companies.length} รายการบริษัทที่ได้รับการอุมัติ
          </motion.p>
        </div>
      </div>
    </motion.div>
    <table className="min-w-full divide-y divide-gray-200 border-collapse">
      <motion.thead
        className="bg-blue-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
          >
            หมายเลขสมาชิก
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
          >
            ชื่อบริษัท
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
          >
            วันที่อนุมัติ
          </th>
          {/*
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            สถานะ
          </th>
          */}
          {/*
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            สถานะสมาชิก
          </th>
          */}
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
          >
            เอกสารยืนยัน
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
          >
            ดูข้อมูล
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
          >
            แก้ไขข้อมูล
          </th>
        </tr>
      </motion.thead>
      <motion.tbody
        className="bg-white divide-y divide-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {companies.length > 0 ? (
          companies.map((company, index) => (
            <motion.tr
              key={company.MEMBER_CODE || `${company?.id ?? "row"}-${index}`}
              className={
                index % 2 === 0
                  ? "bg-white hover:bg-blue-50 cursor-pointer"
                  : "bg-blue-50 hover:bg-blue-100 cursor-pointer"
              }
              onClick={(e) => {
                // Only navigate if not clicking on a link or button
                if (!e.target.closest("a") && !e.target.closest("button") && company.MEMBER_CODE) {
                  // Set access token in session storage to authorize access to member details
                  // This token will be checked by the MemberDetail page to verify authorized access
                  sessionStorage.setItem(
                    "memberDetailAccess",
                    `${company.MEMBER_CODE}_${Date.now()}`,
                  );

                  // Navigate to member detail page with the member code
                  window.location.href = `/MemberDetail?memberCode=${encodeURIComponent(company.MEMBER_CODE)}`;
                }
              }}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                {company.MEMBER_CODE ? (
                  <Link
                    href={`/MemberDetail?memberCode=${company.MEMBER_CODE}`}
                    className="text-blue-600 cursor-default"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      e.preventDefault(); // Prevent navigation
                    }}
                  >
                    {company.MEMBER_CODE}
                  </Link>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">
                {company.company_name || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                {formatDate(company.updated_at)}
              </td>
              {/*
              <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                <motion.span 
                  className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 shadow-sm"
                  whileHover={{ scale: 1.05, backgroundColor: "#dcfce7" }}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <FaCheckCircle className="mr-1 mt-0.5" size={12} />
                  อนุมัติ
                </motion.span>
              </td>
              */}
              {/*
              <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                {company.memberStatus ? (
                  <motion.span 
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${company.memberStatus.active === 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                    whileHover={{ scale: 1.05 }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {company.memberStatus.statusName || 'ไม่พบข้อมูล'}
                  </motion.span>
                ) : (
                  <span className="text-gray-400 italic">ไม่พบข้อมูล</span>
                )}
              </td>
              */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {company.file_path ? (
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="ดูเอกสาร"
                      title="ดูเอกสาร"
                      onClick={() => {
                        setZoom(1);
                        setPreviewUrl(company.file_path);
                      }}
                    >
                      <FaEye size={16} />
                    </button>
                    <a
                      href={company.file_path}
                      download
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="ดาวน์โหลด"
                      title="ดาวน์โหลด"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaDownload size={16} />
                    </a>
                  </div>
                ) : // สำหรับสมาชิกใหม่ที่ไม่มีเอกสารยืนยัน ให้ไปดูใบสมัครแทน
                company.tax_id ? (
                  <motion.button
                    className="text-green-600 hover:text-green-800 flex items-center"
                    onClick={async (e) => {
                      e.stopPropagation(); // Prevent row click

                      try {
                        // ค้นหาประเภทสมาชิกและ ID จาก tax_id
                        const response = await fetch(
                          `/api/membership/find-by-tax-id?taxId=${company.tax_id}`,
                        );
                        const result = await response.json();

                        if (result.success && result.data) {
                          const { membershipType, id } = result.data;
                          // เปิดไปหน้า summary ที่ถูกต้อง
                          const summaryUrl = `/membership/${membershipType.toLowerCase()}/summary?id=${id}`;
                          window.open(summaryUrl, "_blank");
                        } else {
                          alert("ไม่พบข้อมูลใบสมัคร");
                        }
                      } catch (error) {
                        console.error("Error finding membership:", error);
                        alert("เกิดข้อผิดพลาดในการค้นหาข้อมูล");
                      }
                    }}
                  >
                    <FaFileAlt className="mr-1" size={14} />
                    ดูใบสมัคร
                  </motion.button>
                ) : (
                  <span className="text-gray-400 italic">ไม่มีเอกสาร</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {company.MEMBER_CODE ? (
                  <motion.a
                    href={`/MemberDetail?memberCode=${company.MEMBER_CODE}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      e.preventDefault(); // Prevent default navigation
                      // authorize access
                      sessionStorage.setItem(
                        "memberDetailAccess",
                        `${company.MEMBER_CODE}_${Date.now()}`,
                      );
                      window.location.href = `/MemberDetail?memberCode=${encodeURIComponent(company.MEMBER_CODE)}`;
                    }}
                  >
                    <FaEye className="mr-1" size={14} />
                    ดูข้อมูล
                  </motion.a>
                ) : (
                  <span className="text-gray-400 italic">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <motion.a
                  href={`/MemberDetail?memberCode=${company.MEMBER_CODE}&memberType=000&member_group_code=000&typeCode=000`}
                  className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    e.preventDefault(); // Prevent default navigation

                    // Set access token in session storage to authorize access to member details
                    // This token will be checked by the MemberDetail page to verify authorized access
                    if (company.MEMBER_CODE) {
                      sessionStorage.setItem(
                        "memberDetailAccess",
                        `${company.MEMBER_CODE}_${Date.now()}`,
                      );

                      // Navigate to member detail page with the member code and fixed parameters
                      window.location.href = `/MemberDetail?memberCode=${encodeURIComponent(company.MEMBER_CODE)}&memberType=000&member_group_code=000&typeCode=000`;
                    }
                  }}
                >
                  <FaPencilAlt className="mr-1" size={14} />
                  แก้ไข
                </motion.a>
              </td>
            </motion.tr>
          ))
        ) : (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <td colSpan="7" className="px-6 py-10 text-center">
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaSearch className="text-gray-300 mb-3" size={24} />
                </motion.div>
                <motion.p
                  className="text-gray-500 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
                </motion.p>
              </div>
            </td>
          </motion.tr>
        )}
      </motion.tbody>
    </table>
    {/* Inline Preview Modal */}
    {previewUrl && typeof document !== "undefined" && createPortal(
      <div
        className="fixed inset-0 z-[1000000] bg-black/80 flex items-center justify-center"
        style={{ zIndex: 2147483647 }}
        role="dialog"
        aria-modal="true"
        aria-label="Document preview"
        onClick={() => {
          setPreviewUrl(null);
          setZoom(1);
        }}
      >
        <div className="relative w-[98vw] h-[96vh]" onClick={(e) => e.stopPropagation()}>
          {/* Controls */}
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 border rounded-md px-2 py-1 shadow">
            <button
              className="p-1 text-gray-700 hover:text-blue-700"
              title="ปิด (Esc)"
              onClick={() => {
                setPreviewUrl(null);
                setZoom(1);
              }}
            >
              <FaTimes />
            </button>
            <button
              className="p-1 text-gray-700 hover:text-blue-700"
              title="ย่อ"
              onClick={() => setZoom((z) => Math.max(0.25, +(z / 1.1).toFixed(2)))}
            >
              <FaSearchMinus />
            </button>
            <button
              className="p-1 text-gray-700 hover:text-blue-700"
              title="ขยาย"
              onClick={() => setZoom((z) => Math.min(5, +(z * 1.1).toFixed(2)))}
            >
              <FaSearchPlus />
            </button>
            <button
              className="p-1 text-gray-700 hover:text-blue-700"
              title="รีเซ็ต"
              onClick={() => setZoom(1)}
            >
              <FaExpand />
            </button>
          </div>
          <button
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow"
            aria-label="Close"
            onClick={() => {
              setPreviewUrl(null);
              setZoom(1);
            }}
          >
            <FaTimes size={22} />
          </button>

          {/* Preview area with zoom/pan */}
          <div className="w-full h-full overflow-auto">
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="max-w-none"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              >
                {isImage(previewUrl) && (
                  <img src={previewUrl} alt="document" className="block max-w-[96vw] max-h-[90vh] object-contain" />
                )}
                {isPdf(previewUrl) && (
                  <iframe
                    src={previewUrl}
                    title="document"
                    className="block bg-white"
                    style={{ width: "96vw", height: "90vh", border: 0 }}
                  />
                )}
                {!isImage(previewUrl) && !isPdf(previewUrl) && (
                  <div className="p-6 text-center">
                    ไม่รองรับการพรีวิวไฟล์นี้
                    <div className="mt-4">
                      <a href={previewUrl} target="_blank" rel="noreferrer" className="text-blue-300 underline">
                        เปิดไฟล์ในแท็บใหม่
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom center Close button for accessibility */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <button
              className="pointer-events-auto px-4 py-2 rounded-lg bg-white/90 hover:bg-white text-gray-800 shadow"
              onClick={() => {
                setPreviewUrl(null);
                setZoom(1);
              }}
            >
              ปิดพรีวิว (Esc)
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
  </motion.div>
  );
};

export default ApprovedCompaniesTable;
