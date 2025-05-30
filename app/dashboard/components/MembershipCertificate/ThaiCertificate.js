import React from 'react';
import { getFullMemberType } from './utils';

const ThaiCertificate = ({ memberData, formatThaiDate }) => {
  const currentDate = formatThaiDate(new Date().toISOString());
  const currentYear = new Date().getFullYear() + 543;
  
  // Add diagonal watermark text for print and download
  const watermarkStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    transform: 'rotate(-45deg)',
    fontSize: '4rem',
    color: 'rgba(200, 200, 200, 0.2)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    overflow: 'hidden',
    zIndex: 5
  };
  
  return (
    <div className="certificate-container relative w-full bg-white p-8 min-h-screen">
      {/* Logo watermark */}
      <div className="certificate-watermark absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <img 
          src="/FTI-MasterLogo_RGB_forLightBG.png" 
          alt="FTI Watermark" 
          className="w-4/5 h-auto opacity-15 print:opacity-15 print:block"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      {/* Text watermarks for print and download */}
      <div style={watermarkStyle} className="print:block">
        <span>สภาอุตสาหกรรมแห่งประเทศไทย</span>
      </div>
      <div style={{...watermarkStyle, top: '50%'}} className="print:block">
        <span>The Federation of Thai Industries</span>
      </div>
      
      <div className="certificate-content relative z-10 text-black" style={{ fontFamily: 'Sarabun, sans-serif', fontSize: '16px', lineHeight: '1.6' }}>
        
        {/* เลขที่อ้างอิง */}
        <div className="certificate-header-ref text-left mb-8 mt-8">
          <p>ที่ {new Date().getDate()}/{new Date().getMonth() + 1}/{new Date().getFullYear() + 543}</p>
        </div>
        
        {/* Header - ส่วนหัวเอกสาร */}
        <div className="certificate-header text-center mb-12">
          <h1 className="text-2xl font-bold mb-2">หนังสือรับรองการเป็นสมาชิก</h1>
          <h2 className="text-xl font-bold">สภาอุตสาหกรรมแห่งประเทศไทย</h2>
          <div className="border-b-2 border-blue-800 w-48 mx-auto my-4"></div>
        </div>
        
        {/* Body - เนื้อหาเอกสาร */}
        <div className="certificate-body px-16 mb-20">
          
          <div className="certificate-body mb-8">
            <p className="mb-6 text-left">
              โดยหนังสือฉบับนี้ สภาอุตสาหกรรมแห่งประเทศไทย ขอรับรองว่า
            </p>
            
            <p className="text-center mb-6 font-bold text-xl">
              {memberData?.COMPANY_NAME || '...........................'}
            </p>
            
            <p className="text-center mb-6">
              เป็นสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย
            </p>
            
            <p className="text-center mb-6">
              ประเภท {getFullMemberType(memberData?.company_type) || '........'}  เลขที่สมาชิก  {memberData?.MEMBER_CODE || '...............'}  ตั้งแต่วันที่ {memberData?.JOIN_DATE ? formatThaiDate(memberData.JOIN_DATE) : '...........................'}
            </p>
            
            <p className="text-center mb-6">
              ขณะนี้ยังคงเป็นสมาชิกของสภาอุตสาหกรรมแห่งประเทศไทย ตลอดปี 25......
            </p>
            
            <p className="mb-10 text-right">
              ออกให้ ณ วันที่ {currentDate}
            </p>
          </div>
        </div>
        
        {/* Footer - ลายเซ็นและตำแหน่ง */}
        <div className="certificate-footer text-center mt-16">
          <div className="mb-8">
            <p className="mb-1">(.................................................)</p>
            <p>ผู้อำนวยการฝ่ายทะเบียนสมาชิก</p>
            <p>สภาอุตสาหกรรมแห่งประเทศไทย</p>
          </div>
        </div>
        
        {/* Document Footer - ข้อมูลเอกสาร */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-500">
          <p>แบบหนังสือรับรองสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย (ภาษาไทย)</p>
          <p>F-PRD-005 เริ่มใช้วันที่ 15 พฤษภาคม 2568 แก้ไขครั้งที่ 3</p>
        </div>
      </div>
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
        
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
            padding: 0;
            box-shadow: none;
            page-break-after: always;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .certificate-watermark img {
            display: block !important;
            opacity: 0.15 !important;
          }
        }
        
        .indent-8 {
          text-indent: 2rem;
        }
      `}</style>
    </div>
  );
};

export default ThaiCertificate;