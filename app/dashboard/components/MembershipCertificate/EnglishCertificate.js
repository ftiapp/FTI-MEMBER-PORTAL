import React from "react";
import { getFullMemberType } from "./utils";

const EnglishCertificate = ({ memberData }) => {
  // Add diagonal watermark text for print and download
  const watermarkStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
    transform: "rotate(-45deg)",
    fontSize: "4rem",
    color: "rgba(200, 200, 200, 0.2)",
    fontWeight: "bold",
    textTransform: "uppercase",
    overflow: "hidden",
    zIndex: 5,
  };
  const formatEnglishDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const day = date.getDate();

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const currentDate = formatEnglishDate(new Date().toISOString());

  return (
    <div className="certificate-container relative w-full bg-white p-8 print:border-0">
      {/* Logo watermark */}
      <div className="certificate-watermark absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <img
          src="/FTI-MasterLogo_RGB_forLightBG.png"
          alt="FTI Watermark"
          className="w-4/5 h-auto opacity-15 print:opacity-15 print:block"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>

      {/* Text watermarks for print and download */}
      <div style={watermarkStyle} className="print:block">
        <span>สภาอุตสาหกรรมแห่งประเทศไทย</span>
      </div>
      <div style={{ ...watermarkStyle, top: "50%" }} className="print:block">
        <span>The Federation of Thai Industries</span>
      </div>

      <div className="certificate-content relative z-10 text-center">
        <div className="certificate-header-ref text-left mb-8 mt-8">
          <p>Ref: ...... /....... .......</p>
        </div>

        <div className="certificate-header text-center mb-12">
          <h1 className="text-2xl font-bold mb-2">MEMBERSHIP CERTIFICATE</h1>
          <h2 className="text-xl font-bold">THE FEDERATION OF THAI INDUSTRIES</h2>
          <div className="border-b-2 border-blue-800 w-48 mx-auto my-4"></div>
        </div>

        <div className="certificate-body mb-12">
          <p className="mb-6 text-left">This is to certify that</p>

          <p className="text-center mb-6 font-bold text-xl">
            {memberData?.COMPANY_NAME || "..........................."} CO., LTD.
          </p>

          <p className="text-center mb-6">is a member of The Federation of Thai Industries</p>

          <p className="text-center mb-6">
            Type: {getFullMemberType(memberData?.company_type) || "........"} Membership No.{" "}
            {memberData?.MEMBER_CODE || "..............."} since{" "}
            {memberData?.JOIN_DATE
              ? formatEnglishDate(memberData.JOIN_DATE)
              : "..........................."}
          </p>

          <p className="text-center mb-6">
            The company is currently a member of The Federation of Thai Industries for the year{" "}
            {new Date().getFullYear()}.
          </p>

          <p className="mb-10 text-right">Issued on {currentDate}</p>
        </div>

        <div className="certificate-footer text-center mt-16">
          <div className="mb-8">
            <p className="mb-1">(.................................................)</p>
            <p>Director of Membership Registration</p>
            <p>The Federation of Thai Industries</p>
          </div>
        </div>
      </div>

      {/* Document Footer - ข้อมูลเอกสาร */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        <p>แบบหนังสือรับรองสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย (ภาษาอังกฤษ)</p>
        <p>F-PRD-005 เริ่มใช้วันที่ 15 พฤษภาคม 2568 แก้ไขครั้งที่ 3</p>
      </div>

      <style jsx>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          .certificate-container {
            width: 210mm;
            height: 297mm;
            position: relative;
            margin: 0;
            padding: 20mm;
            box-shadow: none;
            page-break-after: always;
          }

          .certificate-content {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .certificate-header {
            margin-bottom: 40mm;
          }

          .certificate-body {
            flex: 1;
          }

          .certificate-footer {
            margin-top: auto;
          }
          .certificate-watermark img {
            display: block !important;
            opacity: 0.15 !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EnglishCertificate;
