"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "react-hot-toast";

export default function ManageDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/member/documents?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("ไม่สามารถโหลดข้อมูลเอกสารได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!confirm("คุณต้องการลบเอกสารนี้ใช่หรือไม่?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/member/delete-document?id=${documentId}&userId=${user.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("ลบเอกสารสำเร็จ");
        fetchDocuments(); // Refresh documents list
      } else {
        toast.error(result.message || "ไม่สามารถลบเอกสารได้");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("เกิดข้อผิดพลาดในการลบเอกสาร");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDocumentTypeName = (type) => {
    switch (type) {
      case "company_registration":
        return "หนังสือรับรองบริษัท";
      case "tax_registration":
        return "ทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20)";
      default:
        return "เอกสารอื่นๆ";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">จัดการเอกสาร</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <h3 className="font-medium">เอกสารของท่าน</h3>
            <button
              className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm"
              onClick={() => (window.location.href = "/dashboard/upload-document")}
            >
              อัพโหลดเอกสาร
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-8 text-center text-gray-500">ไม่พบเอกสาร</div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-700 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">{getDocumentTypeName(doc.document_type)}</p>
                      <p className="text-sm text-gray-500">
                        อัพโหลดเมื่อ {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      ดาวน์โหลด
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-500 hover:text-red-700"
                      title="ลบเอกสาร"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
