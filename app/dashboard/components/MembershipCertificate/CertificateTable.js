"use client";

import React from "react";
import { FaInfoCircle, FaDesktop, FaDownload } from "react-icons/fa";
import { handleDownloadCertificate } from "./utils";

const CertificateTable = ({
  currentItems,
  memberData,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  memberTypes,
  currentPage,
  totalPages,
  paginate,
}) => {
  return (
    <div className="space-y-6">
      {/* Search and Filter Controls - ย้ายมาด้านบน */}
      <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="block text-base font-semibold text-gray-800 mb-2">ค้นหาข้อมูล</label>
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อบริษัท หรือ รหัสสมาชิก..."
              className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full lg:w-80">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              กรองตามประเภท
            </label>
            <select
              className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-800 font-medium"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">ทุกประเภทสมาชิก</option>
              {memberTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* หมายเหตุ - แถบสีน้ำเงินพร้อมไอคอน */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <FaDesktop className="text-xl flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm">หมายเหตุการใช้งาน</h3>
            <p className="text-blue-100 text-sm mt-1">
              คลิกปุ่ม <FaDownload className="inline mx-1" /> เพื่อดาวน์โหลดเอกสารเท่านั้น
              (ปิดการพิมพ์)
            </p>
          </div>
        </div>
      </div>

      {/* ตาราง */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
              <tr>
                <th className="py-4 px-6 text-left font-medium text-blue-100 text-sm uppercase tracking-wider">
                  รหัส
                </th>
                <th className="py-4 px-6 text-left font-medium text-blue-100 text-sm uppercase tracking-wider">
                  ประเภท
                </th>
                <th className="py-4 px-6 text-left font-medium text-blue-100 text-sm uppercase tracking-wider">
                  ชื่อบริษัท
                </th>
                <th className="py-4 px-6 text-center font-medium text-blue-100 text-sm uppercase tracking-wider">
                  เอกสารยืนยันสมาชิก(TH)
                </th>
                <th className="py-4 px-6 text-center font-medium text-blue-100 text-sm uppercase tracking-wider">
                  เอกสารยืนยันสมาชิก(EN)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {member.MEMBER_CODE || "-"}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {member.company_type || "-"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                      {member.company_name || "-"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownloadCertificate("thai", member, memberData)}
                          className="flex items-center justify-center p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          title="ดาวน์โหลด"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownloadCertificate("english", member, memberData)}
                          className="flex items-center justify-center p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          title="ดาวน์โหลด"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <FaInfoCircle className="text-4xl text-gray-400" />
                      <p className="text-gray-500 text-lg font-medium">
                        ไม่พบข้อมูลที่ตรงกับการค้นหา
                      </p>
                      <p className="text-gray-400 text-sm">
                        ลองใช้คำค้นหาอื่น หรือเปลี่ยนการกรองข้อมูล
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            ก่อนหน้า
          </button>

          <div className="flex space-x-1">
            {[...Array(totalPages).keys()].map((number) => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === number + 1
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                {number + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificateTable;
