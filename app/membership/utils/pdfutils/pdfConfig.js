// PDF configuration and settings

// CSS styles for PDF
export const getPDFStyles = () => `
  @page { margin: 8mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Sarabun', sans-serif; font-size: 11px; line-height: 1.3; padding: 6px 6px 30px 6px; position: relative; }
  .logo-wrap { text-align: center; margin-bottom: 0px; display: flex; justify-content: center; }
  .logo-wrap img { height: 42px; object-fit: contain; display: block; margin: 0 auto; }
  .header { text-align: center; font-size: 11.5px; font-weight: bold; margin-top: -10px; margin-bottom: 0px; padding-bottom: 4px; border-bottom: 1px solid #333; line-height: 2.5; }
  .created-date { position: absolute; top: 40px; right: 6px; font-size: 8px; color: #999; }
  .member-number { position: absolute; top: 6px; right: 6px; font-size: 8px; color: #000; font-weight: bold; }
  .section { border: 1px solid #ddd; margin-bottom: 4px; padding: 5px; }
  .section-title { font-weight: bold; font-size: 10px; background: #f5f5f5; padding: 2px 4px; margin: -5px -5px 4px -5px; border-bottom: 1px solid #ddd; }
  .field { margin-bottom: 2px; font-size: 10px; }
  .label { font-weight: 600; display: inline-block; min-width: 70px; }
  .value { color: #333; }
  .row { display: flex; gap: 12px; }
  .col { flex: 1; }
  .col-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .rep-box { border: 1px solid #e0e0e0; padding: 5px; background: #fafafa; }
  .rep-title { font-weight: bold; font-size: 9.5px; color: #0066cc; margin-bottom: 2px; }
  .business-tag { display: inline-block; background: #e6f3ff; color: #0066cc; padding: 1px 4px; border-radius: 3px; font-size: 9.5px; margin: 1px; }
  .signature-area { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; justify-content: flex-end; }
  .signature-box { flex: 0 0 auto; border: 1px solid #ddd; padding: 6px; text-align: center; min-width: 100px; max-width: 150px; }
  .signature-img { border: 1px dashed #999; height: 40px; width: 80px; margin: 4px auto; display: flex; align-items: center; justify-content: center; }
  .stamp-box { border: 1px solid #ddd; padding: 6px; text-align: center; min-width: 100px; }
  .stamp-img { border: 1px dashed #999; width: 80px; height: 40px; margin: 4px auto; display: flex; align-items: center; justify-content: center; }
  .list-2col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 12px; row-gap: 2px; align-items: start; }
  .list-2col .span-all { grid-column: 1 / -1; }
  .list-3col { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 10px; row-gap: 4px; align-items: start; }
  .list-3col .span-all { grid-column: 1 / -1; }
`;

// Get html2pdf options
export const getPDFOptions = (type, data) => {
  // Detect if we're running in Edge browser
  const isEdge = typeof window !== 'undefined' && /Edg/.test(navigator.userAgent);

  return {
    margin: 5,
    filename: `${type?.toUpperCase()}_${data.companyNameTh || data.firstNameTh || "APPLICATION"}_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      imageTimeout: 30000,
      logging: false,
      // Enable foreignObjectRendering for Edge browser compatibility
      foreignObjectRendering: isEdge,
      removeContainer: true,
      backgroundColor: '#ffffff',
      // Additional Edge-specific settings
      ...(isEdge && {
        letterRendering: true,
        allowTaint: false, // Disable allowTaint for Edge
      })
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "avoid-all"] },
  };
};
