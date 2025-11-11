// Signature HTML builder functions

import { formatThaiDate } from './dateUtils.js';

// Helper function to build signatory signature HTML with preloaded signatures
export const buildSignatorySignature = (signatory, preloadedSignature, index) => {
  // Get signatory name with prename
  const getSignatoryName = (sig) => {
    const prenameTh = sig.prenameTh || sig.prename_th || "";
    const prenameOther = sig.prenameOther || sig.prename_other || "";
    const firstNameTh = sig.firstNameTh || sig.first_name_th || "";
    const lastNameTh = sig.lastNameTh || sig.last_name_th || "";

    let displayPrename = prenameTh;
    if (prenameTh === "อื่นๆ" && prenameOther) {
      displayPrename = prenameOther;
    }

    const fullName = [displayPrename, firstNameTh, lastNameTh].filter(Boolean).join(" ").trim();

    return fullName || `ผู้มีอำนาจลงนาม คนที่ ${index + 1}`;
  };

  const signatoryName = getSignatoryName(signatory);
  const position = signatory.positionTh || signatory.position_th || "";

  // Enhanced signature image handling with better fallback
  let signatureHtml = "";
  if (preloadedSignature) {
    // Check if it's a data URL or direct URL
    const isDataUrl = preloadedSignature.startsWith('data:');
    const isEdge = typeof window !== 'undefined' && /Edg/.test(navigator.userAgent);

    // Add Edge-specific attributes for better compatibility
    const edgeAttributes = isEdge ? 'loading="eager" decoding="sync"' : '';

    signatureHtml = `<img src="${preloadedSignature}" style="max-width: 100%; max-height: 100%; object-fit: contain;" ${isDataUrl ? 'crossorigin="anonymous"' : ''} ${edgeAttributes} alt="ลายเซ็น" />`;
    console.debug(`[PDF] Using ${isDataUrl ? 'data URL' : 'direct URL'} for signature ${index + 1}${isEdge ? ' (Edge optimized)' : ''}`);
  } else {
    // Enhanced fallback with more descriptive text
    signatureHtml = `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 8px; color: #999; text-align: center;">(ลายเซ็นไม่พร้อมใช้งาน)</div>`;
    console.warn(`[PDF] No signature image available for signatory ${index + 1} (${signatoryName})`);
  }

  return `
    <div class="signature-box" style="min-width: 100px;">
      <div style="font-size: 10px; font-weight: bold; margin-bottom: 3px;">ลายเซ็นผู้มีอำนาจ</div>
      <div class="signature-img">
        ${signatureHtml}
      </div>
      <div style="font-size: 8px; margin-top: 3px; border-top: 1px solid #999; padding-top: 3px;">
        (${signatoryName})
        ${position ? `<div style="margin-top: 1px; color: #555;">ตำแหน่ง: ${position}</div>` : ""}
        <div style="margin-top: 1px; color: #555;">วันที่: ${formatThaiDate(new Date())}</div>
      </div>
    </div>
  `;
};
