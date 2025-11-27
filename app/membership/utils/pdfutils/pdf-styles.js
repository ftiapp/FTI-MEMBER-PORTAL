// pdf-styles.js - CSS styles สำหรับ PDF

export const getPDFStyles = () => `
  @page { 
    margin: 0mm; 

    size: A4;
  }
  
  * { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
  }
  
  body { 

    font-family: 'Sarabun', 'TH Sarabun New', 'Tahoma', sans-serif;
    font-size: 14.5px;

    line-height: 1.45;
    padding: 0px 4mm 4mm 4mm;
    position: relative;
    color: #000000;
  }
  
  .footer-page {
    page-break-before: always;
    /* ขยายความสูงขั้นต่ำของหน้าสำหรับ footer เพื่อดันเนื้อหาให้ลงมาใกล้ขอบล่างมากขึ้น */
    min-height: 270mm;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    /* เผื่อพื้นที่เล็กน้อยด้านล่างสำหรับ "สร้างเมื่อ" ที่ชิดขอบล่าง */
    padding: 0 6mm 8mm 6mm;
  }
  
  /* Header Section */
  .logo-header-row {
    position: relative;
    margin-bottom: 6px;
    padding-top: 8px;
    min-height: 60px;
  }

  .logo-wrap { 
    text-align: left;
    display: flex; 
    justify-content: flex-start;
    align-items: center;
    position: absolute;
    left: 0;
    top: 0;
  }
  
  .logo-wrap img { 
    height: 50px;
    object-fit: contain;
    display: block;
    margin: 0;
  }
  
  .header { 
    text-align: center;
    font-size: 14.5px;
    font-weight: bold;
    margin-top: -2px;
    margin-bottom: 10px;
    padding-bottom: 0px;
    line-height: 1.5;
    color: #000000;
  }

  .sub-header {
    text-align: center;
    font-size: 12.5px;
    font-weight: 600;
    margin-top: -6px;
    margin-bottom: 8px;
    line-height: 1.4;
    color: #000000;
  }
  
  /* Metadata */
  .created-date { 
    position: absolute;
    /* ชิดขอบล่างสุด และจัดให้อยู่กึ่งกลางแนวนอน */
    bottom: 2mm;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    font-size: 9.5px;
    color: #666666;
  }
  
  .member-number { 
    position: absolute;
    top: 4px;
    right: 8px;
    font-size: 10.5px;
    color: #000000;
    font-weight: bold;
  }
  
  /* Sections */
  .section { 
    border: 1px solid #000000;
    margin-bottom: 5px;
    padding: 0 4px 4px 4px;
    page-break-inside: avoid;
  }
  
  .section:first-of-type { 
    margin-top: 6px; 
  }
  
  .section-title { 
    font-weight: bold;
    font-size: 12.5px;

    text-align: left;
    padding: 0 0 11px 2px;
    margin: -1px 0 10px 0;
    border-bottom: 1px solid #000000;
    background-color: transparent;
    line-height: 1.1;
  }
  
  /* Fields */
  .field { 
    margin-bottom: 3px;
    font-size: 12.5px;

    line-height: 1.4;
  }
  
  .label { 
    font-weight: 600;
    display: inline-block;
    min-width: 70px;
    color: #000000;
  }
  
  .value { 
    color: #000000;
    display: inline;
  }
  
  /* Layout */
  .row { 
    display: flex;
    gap: 8px;
    margin-bottom: 2px;
  }
  
  .col { 
    flex: 1;
  }
  
  .col-3 { 
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  /* Representative Box */
  .rep-box { 
    border: 0;
    padding: 4px 6px;
    background: transparent;
    page-break-inside: avoid;
  }

  /* Vertical separator between representatives */
  .rep-box:not(:last-child) {
    border-right: 1px solid #cccccc;
  }
  
  .rep-title { 
    font-weight: bold;
    font-size: 12px;
    color: #000000;
    margin-bottom: 3px;
    padding-bottom: 1px;
  }
  
  /* Business Tags */
  .business-tag { 
    display: inline-block;
    background: #e8f4f8;
    color: #000000;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 12px;
    margin: 2px;
    border: 1px solid #b0d4e3;
  }
  
  /* Signature Area */
  .signature-area { 
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
    page-break-inside: avoid;
  }
  
  .signature-box { 
    flex: 0 0 auto;
    border: 1px solid #000000;
    padding: 4px;
    text-align: center;
    min-width: 120px;
    max-width: 160px;
    page-break-inside: avoid;
  }

  .signature-name {
    display: block;
    white-space: normal;
    word-break: break-word;
  }
  
  .signature-img { 
    border: 1px solid #000000;
    height: 55px;
    width: 110px;
    margin: 3px auto 6px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
  }
  
  .stamp-box { 
    border: 1px solid #000000;
    padding: 4px;
    text-align: center;
    min-width: 120px;
    max-width: 160px;
    page-break-inside: avoid;
  }
  
  .stamp-img { 
    border: 1px solid #000000;
    width: 110px;
    height: 55px;
    margin: 3px auto 6px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
  }
  
  /* Lists */
  .list-2col { 
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 8px;
    row-gap: 4px;
    align-items: start;
  }
  
  .list-2col .span-all { 
    grid-column: 1 / -1; 
  }
  
  .list-3col { 
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 10px;
    row-gap: 4px;
    align-items: start;
  }
  
  .list-3col .span-all { 
    grid-column: 1 / -1; 
  }
  
  /* Checkbox styles */
  .checkbox-field {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .checkbox {
    width: 16px;
    height: 16px;
    border: 2px solid #000000;
    display: inline-block;
  }
  
  /* Product/Service list */
  .product-list {
    margin-top: 4px;
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: 0;
  }
  
  .product-item {
    font-size: 11px;
    margin-bottom: 2px;
    line-height: 1.3;
  }

  /* Footer for FTI staff section */
  .footer-separator {
    border-top: 1px dashed #000000;
    margin: 25px 0 10px 0;
  }

  .footer-section {
    font-size: 12px;
    margin-top: 30px;
    page-break-inside: avoid;
  }

  .footer-section .footer-title {
    text-align: center;
    font-weight: 600;
    margin-bottom: 15px;
  }

  .footer-section .footer-text {
    text-align: center;
    margin: 0 auto 20px auto;
    max-width: 160mm;
    white-space: normal;
  }

  .footer-signatures {
    display: flex;
    justify-content: space-between;
    gap: 50px;
    margin-top: 30px;
    padding: 0 20px;
    page-break-inside: avoid;
  }

  .footer-signature-col {
    flex: 1;
    font-size: 12px;
    text-align: center;
  }

  .footer-signature-col .footer-sign-line {
    display: inline-block;
    min-width: 220px;
    border-bottom: 1px dashed #000000;
    margin: 0 5px 12px 5px;
  }
  
  /* Print specific */
  @media print {
    body { 
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    .section {
      page-break-inside: avoid;
    }
    
    .signature-area {
      page-break-inside: avoid;
    }
  }
`;