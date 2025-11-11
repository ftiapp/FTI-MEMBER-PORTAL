"use client";

import { useState } from "react";
import { benefits } from "../data/benefits";

export default function BenefitsComparison() {
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(benefits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBenefits = showAllBenefits
    ? benefits.slice(startIndex, endIndex)
    : benefits.slice(0, 10);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-50 p-6 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-blue-900">
            เปรียบเทียบสิทธิประโยชน์ทั้งหมด
          </h3>
          <button
            onClick={() => setShowAllBenefits(!showAllBenefits)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {showAllBenefits ? "ซ่อนรายละเอียด" : "ดูสิทธิประโยชน์ทั้งหมด"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-blue-100">
            <tr>
              <th className="py-4 px-6 text-left text-sm font-semibold text-blue-900 border-b w-1/2">
                สิทธิประโยชน์ ({benefits.length} รายการ)
              </th>
              <th className="py-4 px-4 text-center text-sm font-semibold text-blue-600 border-b">
                สามัญ-โรงงาน (สน)
                <br />
                <span className="text-xs font-normal">12,000 บาท</span>
              </th>
              <th className="py-4 px-4 text-center text-sm font-semibold text-blue-600 border-b">
                สามัญ-สมาคมการค้า (สส)
                <br />
                <span className="text-xs font-normal">8,000 บาท</span>
              </th>
              <th className="py-4 px-4 text-center text-sm font-semibold text-blue-600 border-b">
                สมทบ-นิติบุคคล (ทน)
                <br />
                <span className="text-xs font-normal">6,000 บาท</span>
              </th>
              <th className="py-4 px-4 text-center text-sm font-semibold text-blue-600 border-b">
                สมทบ-บุคคลธรรมดา (ทบ)
                <br />
                <span className="text-xs font-normal">3,000 บาท</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentBenefits.map((benefit, index) => (
              <tr key={benefit.id} className={index % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                <td className="py-3 px-6 text-sm text-gray-900 border-b">
                  <span className="font-medium text-blue-600 mr-2">{benefit.id}.</span>
                  {benefit.title}
                </td>
                <td className="py-3 px-4 text-center border-b">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      benefit.ordinary
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {benefit.ordinary ? "✓" : "×"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center border-b">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      benefit.associate
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {benefit.associate ? "✓" : "×"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center border-b">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      benefit.supporting
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {benefit.supporting ? "✓" : "×"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center border-b">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      benefit.supporting
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {benefit.supporting ? "✓" : "×"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {showAllBenefits && (
        <div className="bg-blue-50 p-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Page Info */}
            <div className="text-sm text-blue-600">
              แสดง {startIndex + 1}-{Math.min(endIndex, benefits.length)} จาก{" "}
              {benefits.length} รายการ
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
                }`}
              >
                ← ก่อนหน้า
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
                }`}
              >
                ถัดไป →
              </button>
            </div>
          </div>
        </div>
      )}

      {!showAllBenefits && benefits.length > 10 && (
        <div className="bg-blue-50 p-4 text-center border-t">
          <p className="text-blue-600 text-sm">
            และอีก {benefits.length - 10} รายการ -
            <button
              onClick={() => {
                setShowAllBenefits(true);
                setCurrentPage(1);
              }}
              className="ml-1 text-blue-700 hover:text-blue-800 font-medium"
            >
              คลิกเพื่อดูทั้งหมด
            </button>
          </p>
        </div>
      )}
    </div>
  );
}