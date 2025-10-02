import React, { useState } from "react";
import { FaEdit, FaTrashAlt, FaHourglassHalf } from "react-icons/fa";
import {
  getVerificationStatusIcon,
  getVerificationStatusText,
  getVerificationStatusClass,
  formatDate,
} from "./utils";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";

const VerificationsList = ({ verifications, onEdit, onDelete, deleteLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Calculate pagination
  const indexOfLastVerification = currentPage * itemsPerPage;
  const indexOfFirstVerification = indexOfLastVerification - itemsPerPage;
  const currentVerifications = verifications.slice(
    indexOfFirstVerification,
    indexOfLastVerification,
  );
  const totalPages = Math.ceil(verifications.length / itemsPerPage);

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
      id="verifications-container"
    >
      <h3 className="text-xl font-semibold mb-4 text-blue-800">สถานะการยืนยันสมาชิกเดิม</h3>

      {verifications.length === 0 ? (
        <EmptyState message="ไม่พบรายการยืนยันสมาชิกเดิม" />
      ) : (
        <div className="space-y-4">
          {currentVerifications.map((verification) => (
            <div
              key={verification.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-all ${
                verification.deleting ? "opacity-50 scale-95" : "opacity-100"
              } ${
                verification.Admin_Submit === 2
                  ? "bg-red-50 border-red-200"
                  : verification.Admin_Submit === 1
                    ? "bg-green-50 border-green-200"
                    : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-white rounded-lg p-3 text-center min-w-[60px] shadow-sm border border-gray-200">
                  {getVerificationStatusIcon(verification.Admin_Submit)}
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {verification.company_name}
                      <span className="text-blue-700"> ({verification.MEMBER_CODE})</span>
                    </h4>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${getVerificationStatusClass(verification.Admin_Submit)} font-medium shadow-sm`}
                    >
                      {getVerificationStatusText(verification.Admin_Submit)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 font-medium">
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded-md">
                      ประเภทบริษัท: <strong>{verification.company_type}</strong>
                    </span>
                    {verification.Admin_Submit === 2 && verification.reject_reason && (
                      <span className="block mt-2 text-red-600 p-2 bg-red-50 rounded border border-red-200">
                        <strong>เหตุผลที่ปฏิเสธ:</strong> {verification.reject_reason}
                      </span>
                    )}
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-gray-600">
                      วันที่ส่งคำขอ: <strong>{formatDate(verification.created_at)}</strong>
                    </span>

                    <div className="flex space-x-2">
                      {/* Edit button with improved styling */}
                      <button
                        onClick={() => onEdit(verification)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-medium flex items-center shadow-sm hover:shadow active:translate-y-0.5"
                      >
                        <FaEdit className="h-4 w-4 mr-1.5" />
                        แก้ไขข้อมูล
                      </button>

                      {/* Delete button only for rejected submissions */}
                      {verification.Admin_Submit === 2 && (
                        <button
                          onClick={() => onDelete(verification.id)}
                          disabled={deleteLoading === verification.id}
                          className={`px-3 py-2 ${deleteLoading === verification.id ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-white rounded-md transition-all text-sm font-medium flex items-center shadow-sm hover:shadow active:translate-y-0.5 min-w-[100px] justify-center`}
                        >
                          {deleteLoading === verification.id ? (
                            <span className="flex items-center">
                              <FaHourglassHalf className="h-4 w-4 mr-1.5 animate-spin" />
                              กำลังลบ...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <FaTrashAlt className="h-4 w-4 mr-1.5" />
                              ลบข้อมูล
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default VerificationsList;
