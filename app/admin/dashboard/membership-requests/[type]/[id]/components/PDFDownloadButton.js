import React, { useState } from "react";
import { generateMembershipPDF } from "./PDFGenerator";

const PDFDownloadButton = ({ application, type, industrialGroups, provincialChapters }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (!application) return;

    setIsGeneratingPDF(true);
    try {
      await generateMembershipPDF(application, type, industrialGroups, provincialChapters);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex justify-end mb-6">
      <button
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF}
        className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors ${
          isGeneratingPDF ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isGeneratingPDF ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            กำลังสร้าง PDF...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            ดาวน์โหลด PDF
          </>
        )}
      </button>
    </div>
  );
};

export default PDFDownloadButton;
