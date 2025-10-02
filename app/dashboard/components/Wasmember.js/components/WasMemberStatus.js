"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaInfoCircle,
  FaEdit,
  FaFileAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function WasMemberStatus() {
  const { user } = useAuth();
  const router = useRouter();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/member/verification-status?userId=${user.id}`);

      if (response.ok) {
        const data = await response.json();

        // Check if data has verifications array
        if (data.verifications && Array.isArray(data.verifications)) {
          setVerifications(data.verifications);

          // Fetch documents for each verification
          if (data.verifications.length > 0) {
            await fetchDocumentsForVerifications(data.verifications);
          }
        } else if (data.submitted && data.memberData) {
          // If there's only a single verification in memberData format, convert it to array
          const singleVerification = {
            id: data.memberData.id || Date.now(),
            MEMBER_CODE: data.memberData.MEMBER_CODE || "",
            company_name: data.memberData.company_name || "",
            company_type: data.memberData.company_type || "",
            tax_id: data.memberData.tax_id || "",
            Admin_Submit: data.approved ? 1 : data.rejected ? 2 : 0,
            reject_reason: data.rejectReason || "",
            created_at: data.memberData.created_at || new Date().toISOString(),
          };

          setVerifications([singleVerification]);

          // Fetch documents for this verification
          if (singleVerification.MEMBER_CODE) {
            await fetchDocumentsForVerifications([singleVerification]);
          }
        } else {
          // No verifications found
          setVerifications([]);
        }
      } else {
        console.error("Failed to fetch verification status");
        setVerifications([]);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentsForVerifications = async (verificationsList) => {
    const docsMap = {};

    for (const verification of verificationsList) {
      if (verification.MEMBER_CODE) {
        try {
          const response = await fetch(
            `/api/member/get-documents?memberCode=${verification.MEMBER_CODE}`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.documents) {
              docsMap[verification.id] = data.documents;
            }
          }
        } catch (error) {
          console.error(`Error fetching documents for ${verification.MEMBER_CODE}:`, error);
        }
      }
    }

    setDocuments(docsMap);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy, HH:mm น.", { locale: th });
  };

  const getStatusIcon = (adminSubmit) => {
    switch (adminSubmit) {
      case 0:
        return <FaHourglassHalf className="text-yellow-500" size={20} />;
      case 1:
        return <FaCheckCircle className="text-green-500" size={20} />;
      case 2:
        return <FaTimesCircle className="text-red-500" size={20} />;
      default:
        return <FaInfoCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (adminSubmit) => {
    switch (adminSubmit) {
      case 0:
        return "รอการตรวจสอบ";
      case 1:
        return "อนุมัติแล้ว";
      case 2:
        return "ปฏิเสธแล้ว";
      default:
        return "ไม่ระบุสถานะ";
    }
  };

  const getStatusClass = (adminSubmit) => {
    switch (adminSubmit) {
      case 0:
        return "bg-yellow-100 text-yellow-800";
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEditSubmission = (verification) => {
    // Redirect to the verification page with edit parameter
    router.push(`/dashboard?tab=was-member&edit=${verification.id}`);
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!confirm("คุณต้องการลบคำขอยืนยันสมาชิกเดิมนี้หรือไม่?")) {
      return;
    }

    try {
      const response = await fetch("/api/member/delete-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          userId: user.id,
          memberNumber: verifications.find((v) => v.id === submissionId)?.MEMBER_CODE || "",
        }),
      });

      if (response.ok) {
        // Refresh the verification list
        fetchVerificationStatus();
      } else {
        const data = await response.json();
        alert(data.message || "เกิดข้อผิดพลาดในการลบคำขอ");
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("เกิดข้อผิดพลาดในการลบคำขอ");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {verifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>ไม่พบรายการยืนยันสมาชิกเดิม</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <div
              key={verification.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${verification.Admin_Submit === 2 ? "bg-red-50 border-red-200" : verification.Admin_Submit === 1 ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3 text-center min-w-[60px]">
                  {getStatusIcon(verification.Admin_Submit)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">
                      {verification.company_name} ({verification.MEMBER_CODE})
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusClass(verification.Admin_Submit)}`}
                    >
                      {getStatusText(verification.Admin_Submit)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ประเภทบริษัท: {verification.company_type}
                    {verification.Admin_Submit === 2 && verification.reject_reason && (
                      <span className="block mt-1 text-red-600">
                        เหตุผลที่ปฏิเสธ: {verification.reject_reason}
                      </span>
                    )}
                  </p>

                  {/* Display attached documents if available */}
                  {documents[verification.id] && documents[verification.id].length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">เอกสารแนบ:</p>
                      <div className="mt-1 space-y-1">
                        {documents[verification.id].map((doc, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <FaFileAlt className="text-blue-500 mr-2" />
                            <a
                              href={doc.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              {doc.file_name}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {formatDate(verification.created_at)}
                    </span>

                    <div className="flex space-x-2">
                      {/* Edit button for all statuses */}
                      <button
                        onClick={() => handleEditSubmission(verification)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium flex items-center"
                      >
                        <FaEdit className="h-4 w-4 mr-1" />
                        แก้ไขข้อมูล
                      </button>

                      {/* Delete button only for rejected submissions */}
                      {verification.Admin_Submit === 2 && (
                        <button
                          onClick={() => handleDeleteSubmission(verification.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
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
                          ลบข้อมูล
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
