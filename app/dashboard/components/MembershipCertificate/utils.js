'use client';

// Member type mapping
export const memberTypeMap = {
  'สน': 'สามัญ-โรงงาน',
  'สส': 'สามัญ-สมาคมการค้า',
  'ทน': 'สมทบ-นิติบุคคล',
  'ทบ': 'สมทบ-บุคคลธรรมดา'
};

// Get full member type name
export const getFullMemberType = (typeCode) => {
  return memberTypeMap[typeCode] || typeCode;
};

/**
 * Format a date string to Thai date format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string in Thai format
 */
export const formatThaiDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const thaiYear = date.getFullYear() + 543;
  const day = date.getDate();

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const month = thaiMonths[date.getMonth()];
  return `${day} ${month} ${thaiYear}`;
};

/**
 * Format a date string to English date format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string in English format
 */
export const formatEnglishDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const day = date.getDate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Generate HTML content for Thai certificate
 * @param {Object} selectedMember - The member data
 * @returns {string} HTML content for the certificate
 */
export const generateThaiCertificateHTML = (selectedMember) => {
  if (!selectedMember) return '';

  const currentDate = formatThaiDate(new Date().toISOString());
  const joinDate = selectedMember?.JOIN_DATE ? formatThaiDate(selectedMember.JOIN_DATE) : '...........................';
  const currentYear = new Date().getFullYear() + 543;
  const memberType = getFullMemberType(selectedMember?.company_type) || '........';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>เอกสารรับรองการเป็นสมาชิก</title>
      <style>
        @font-face {
          font-family: 'Sarabun';
          src: url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
        }
        body {
          font-family: 'Sarabun', sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .certificate {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          position: relative;
          background-color: white;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .certificate-watermark {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          display: flex !important;
          justify-content: center;
          align-items: center;
          pointer-events: none;
          overflow: hidden;
        }
        .certificate-watermark img {
          width: 80%;
          height: auto;
          opacity: 0.15 !important;
          display: block !important;
        }
        .text-watermark {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          pointer-events: none;
          transform: rotate(-45deg);
          font-size: 4rem;
          color: rgba(200, 200, 200, 0.2);
          font-weight: bold;
          text-transform: uppercase;
          overflow: hidden;
          z-index: -1;
        }
        .certificate-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .certificate-header h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .certificate-header h2 {
          font-size: 20px;
          font-weight: bold;
        }
        .divider {
          border-bottom: 2px solid #1e40af;
          width: 200px;
          margin: 20px auto;
        }
        .certificate-body {
          text-align: left;
          margin-bottom: 40px;
        }
        .certificate-body p {
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .company-name {
          text-align: center;
          font-weight: bold;
          font-size: 20px;
          margin: 20px 0;
        }
        .certificate-footer {
          text-align: center;
          margin-top: 60px;
        }
        .signature-line {
          margin-bottom: 5px;
        }
        .document-footer {
          position: absolute;
          bottom: 20px;
          left: 20px;
          font-size: 10px;
          color: #666;
          text-align: left;
        }
        @media print {
          body {
            padding: 0;
          }
          .print-button {
            display: none;
          }
          .certificate-watermark img {
            display: block !important;
            opacity: 0.1 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate" style="position: relative;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; display: flex; justify-content: center; align-items: center; pointer-events: none; overflow: hidden;">
          <img src="/FTI-MasterLogo_RGB_forLightBG.png" style="width: 70%; height: auto; opacity: 0.1; display: block !important;" alt="FTI Watermark" />
        </div>
        <div style="text-align: left; margin-bottom: 40px; margin-top: 40px;">
          <p>ที่...... /....... .......</p>
        </div>

        <div class="certificate-header" style="margin-bottom: 60px;">
          <h1>หนังสือรับรองการเป็นสมาชิก</h1>
          <h2>สภาอุตสาหกรรมแห่งประเทศไทย</h2>
          <div class="divider"></div>
        </div>
        
        <div class="certificate-body">
          <!-- Reference number already moved to the top -->
            
          <p style="text-align: left;">โดยหนังสือฉบับนี้ สภาอุตสาหกรรมแห่งประเทศไทย ขอรับรองว่า</p>
            
          <p class="company-name" style="text-align: center;">บริษัท ${selectedMember?.company_name || '...........................'} จำกัด</p>
            
          <p style="text-align: center;">เป็นสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย</p>
            
          <p style="text-align: center;">ประเภท${memberType} เลขที่สมาชิก${selectedMember?.MEMBER_CODE || '...............'} ตั้งแต่วันที่ ${joinDate}</p>
            
          <p style="text-align: center;">ขณะนี้ยังคงเป็นสมาชิกของสภาอุตสาหกรรมแห่งประเทศไทย ตลอดปี ${currentYear}</p>
            
          <p style="text-align: right;">ออกให้ ณ วันที่ ${currentDate}</p>
        </div>
        
        <div class="certificate-footer" style="text-align: center; margin-top: 80px;">
          <p class="signature-line" style="margin-bottom: 10px;">(.................................................)</p>
          <p>ผู้อำนวยการฝ่ายทะเบียนสมาชิก</p>
          <p>สภาอุตสาหกรรมแห่งประเทศไทย</p>
        </div>
        
        <div class="document-footer" style="position: absolute; bottom: 20px; left: 20px; font-size: 10px; color: #666;">
          <p>แบบหนังสือรับรองสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย (ภาษาไทย)</p>
          <p>F-PRD-005 เริ่มใช้วันที่ 15 พฤษภาคม 2568 แก้ไขครั้งที่ 3</p>
        </div>
      </div>
      <div class="print-button" style="text-align: center; margin-top: 30px;">
        <button onclick="setTimeout(() => { window.print(); }, 100);" style="padding: 10px 20px; background-color: #1e40af; color: white; border: none; border-radius: 4px; cursor: pointer;">
          พิมพ์เอกสาร
        </button>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML content for English certificate
 * @param {Object} selectedMember - The member data
 * @returns {string} HTML content for the certificate
 */
export const generateEnglishCertificateHTML = (selectedMember) => {
  if (!selectedMember) return '';

  const currentDate = formatEnglishDate(new Date().toISOString());
  const joinDate = selectedMember?.JOIN_DATE ? formatEnglishDate(selectedMember.JOIN_DATE) : '...........................';
  const currentYear = new Date().getFullYear();
  const memberType = getFullMemberType(selectedMember?.company_type) || '........';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Membership Certificate</title>
      <style>
        @font-face {
          font-family: 'Sarabun';
          src: url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
        }
        body {
          font-family: 'Sarabun', sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .certificate {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          position: relative;
          background-color: white;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .certificate-watermark {
          background-image: url('/FTI-MasterLogo_RGB_forLightBG.png');
          background-repeat: no-repeat;
          background-position: center;
          background-size: 50%;
          opacity: 0.1;
          margin-bottom: 10px;
        }
        .certificate-header h2 {
          font-size: 20px;
          font-weight: bold;
        }
        .divider {
          border-bottom: 2px solid #1e40af;
          width: 200px;
          margin: 20px auto;
        }
        .certificate-body {
          text-align: left;
          margin-bottom: 40px;
        }
        .certificate-body p {
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .company-name {
          text-align: center;
          font-weight: bold;
          font-size: 20px;
          margin: 20px 0;
        }
        .certificate-footer {
          text-align: left;
          margin-top: 60px;
        }
        .signature-line {
          margin-bottom: 5px;
        }
        .document-footer {
          position: absolute;
          bottom: 20px;
          left: 20px;
          font-size: 10px;
          color: #666;
          text-align: left;
        }
        @media print {
          body {
            padding: 0;
          }
          .print-button {
            display: none;
          }
          .certificate-watermark img {
            display: block !important;
            opacity: 0.1 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate" style="position: relative;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; display: flex; justify-content: center; align-items: center; pointer-events: none; overflow: hidden;">
          <img src="/FTI-MasterLogo_RGB_forLightBG.png" style="width: 70%; height: auto; opacity: 0.1; display: block !important;" alt="FTI Watermark" />
        </div>
        <div style="position: relative; z-index: 1;">
        <div style="text-align: left; margin-bottom: 40px; margin-top: 40px;">
          <p>Ref: ...... /....... .......</p>
        </div>

        <div class="certificate-header">
          <h1>MEMBERSHIP CERTIFICATE</h1>
          <h2>THE FEDERATION OF THAI INDUSTRIES</h2>
          <div class="divider"></div>
        </div>
        
        <div class="certificate-body">
          <div style="text-align: left; margin-bottom: 20px;">
            <p>Ref: ...... /....... .......</p>
          </div>
            
          <p style="text-align: left;">This is to certify that</p>
            
          <p class="company-name" style="text-align: center;">${selectedMember?.company_name || '...........................'} CO., LTD.</p>
            
          <p style="text-align: center;">is a member of The Federation of Thai Industries</p>
            
          <p style="text-align: center;">Type: ${memberType} Membership No. ${selectedMember?.MEMBER_CODE || '...............'} since ${joinDate}</p>
            
          <p style="text-align: center;">The company is currently a member of The Federation of Thai Industries for the year ${currentYear}.</p>
            
          <p style="text-align: right;">Issued on ${currentDate}</p>
        </div>
        
        <div class="certificate-footer" style="text-align: center; margin-top: 80px;">
          <p class="signature-line" style="margin-bottom: 10px;">(.................................................)</p>
          <p>Director of Membership Registration</p>
          <p>The Federation of Thai Industries</p>
        </div>
        
        <div class="document-footer" style="position: absolute; bottom: 20px; left: 20px; font-size: 10px; color: #666;">
          <p>แบบหนังสือรับรองสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย (ภาษาอังกฤษ)</p>
          <p>F-PRD-005 เริ่มใช้วันที่ 15 พฤษภาคม 2568 แก้ไขครั้งที่ 3</p>
        </div>
      </div>
      <div class="print-button" style="text-align: center; margin-top: 30px;">
        <button onclick="setTimeout(() => { window.print(); }, 100);" style="padding: 10px 20px; background-color: #1e40af; color: white; border: none; border-radius: 4px; cursor: pointer;">
          พิมพ์เอกสาร
        </button>
      </div>
    </body>
    </html>
  `;
};

/**
 * Handle printing a certificate
 * @param {string} language - 'thai' or 'english'
 * @param {Object} member - The member data
 * @param {Array} memberData - Array of all member data
 */
export const handlePrintCertificate = (language, member, memberData) => {
  // Use the selected member or the first member in the array
  const selectedMember = member || (memberData.length > 0 ? memberData[0] : null);
  if (!selectedMember) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('โปรดอนุญาตให้เปิดหน้าต่างป๊อปอัพเพื่อพิมพ์เอกสาร');
    return;
  }

  const html = language === 'thai' 
    ? generateThaiCertificateHTML(selectedMember) 
    : generateEnglishCertificateHTML(selectedMember);

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };
};

/**
 * Handle direct download of certificate as PDF
 * @param {string} language - 'thai' or 'english'
 * @param {Object} member - The member data
 * @param {Array} memberData - Array of all member data
 */
export const handleDownloadCertificate = (language, member, memberData) => {
  // Use the selected member or the first member in the array
  const selectedMember = member || (memberData.length > 0 ? memberData[0] : null);
  if (!selectedMember) return;
  
  // Create a filename based on member information
  const companyName = selectedMember.COMPANY_NAME || selectedMember.company_name || 'certificate';
  const memberCode = selectedMember.MEMBER_CODE || '';
  const fileName = `${companyName}_${memberCode}_${language}_certificate.pdf`.replace(/\s+/g, '_');
  
  // Create a new window for the certificate
  const downloadWindow = window.open('', '_blank');
  if (!downloadWindow) {
    alert('โปรดอนุญาตให้เปิดหน้าต่างป๊อปอัพเพื่อดาวน์โหลดเอกสาร');
    return;
  }
  
  const html = language === 'thai' 
    ? generateThaiCertificateHTML(selectedMember) 
    : generateEnglishCertificateHTML(selectedMember);
  
  // Add html2pdf script to the new window
  const modifiedHtml = html.replace('</head>', `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script>
      window.onload = function() {
        // Make sure watermark is visible
        const watermarkImg = document.querySelector('.certificate-watermark img');
        if (watermarkImg) {
          watermarkImg.style.display = 'block';
          watermarkImg.style.opacity = '0.15';
        }
        
        // Make sure text watermarks are visible
        const textWatermarks = document.querySelectorAll('.text-watermark');
        textWatermarks.forEach(watermark => {
          watermark.style.display = 'flex';
        });
        
        const element = document.querySelector('.certificate');
        const opt = {
          margin: 0,
          filename: '${fileName}',
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 2, useCORS: true, logging: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Directly download without preview
        html2pdf().set(opt).from(element).save().then(() => {
          // Close the window after download starts
          setTimeout(() => window.close(), 1000);
        });
      };
    </script>
  </head>`);
  
  downloadWindow.document.write(modifiedHtml);
  downloadWindow.document.close();
}
