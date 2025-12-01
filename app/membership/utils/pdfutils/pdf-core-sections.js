// pdf-core-sections.js - low-level PDF section helpers

import { formatThaiDate, resolvePrename, formatNumber } from "./pdf-utils.js";
import { PDF_CONFIG } from "./pdf-config.js";

// Basic field and section components
export const field = (label, value, style = "") =>
  `<div class="field" ${style}><span class="label">${label}:</span> <span class="value">${value || "-"}</span></div>`;

export const section = (title, content) =>
  `<div class="section"><div class="section-title">${title}</div>${content}</div>`;

// Helper: industrial groups / provincial chapters block
export const buildGroupsAndChaptersBlock = (igNames, pcNames, extraIG, extraPC) => {
  const igList = igNames && igNames.length ? igNames : [];
  const pcList = pcNames && pcNames.length ? pcNames : [];

  return `
    <div class="row">
      <div class="col" style="margin-bottom: 6px;">
        <strong>กลุ่มอุตสาหกรรม:</strong><br>
        ${
          igList.length
            ? `<div style="margin-top: 2px;">
              ${igList
                .map(
                  (name) =>
                    `<span style=\"display: inline-block; margin-right: 8px;\">• ${name}</span>`,
                )
                .join("")}
              ${extraIG > 0 ? `<span style=\"font-size: 8.5px;\">... และอีก ${extraIG} รายการ</span>` : ""}
            </div>`
            : '<div style="margin-top: 2px;">-</div>'
        }
      </div>
      <div class="col">
        <strong>สภาอุตสาหกรรมจังหวัด:</strong><br>
        ${
          pcList.length
            ? `<div style="margin-top: 2px;">
              ${pcList
                .map(
                  (name) =>
                    `<span style=\"display: inline-block; margin-right: 8px;\">• ${name}</span>`,
                )
                .join("")}
              ${extraPC > 0 ? `<span style=\"font-size: 8.5px;\">... และอีก ${extraPC} รายการ</span>` : ""}
            </div>`
            : '<div style="margin-top: 2px;">-</div>'
        }
      </div>
    </div>
  `;
};

// Helper: compact contact person block
export const buildCompactContactPersonBlock = (contactPerson) => {
  const phone = contactPerson.phone || contactPerson.tel || "";
  const phoneExt = contactPerson.phoneExtension || contactPerson.phone_extension || "";
  const email = contactPerson.email || "";

  return `
    <div>
      <div style="margin-bottom: 6px;">
        <strong>ผู้ติดต่อ:</strong><br>
        ${contactPerson.name || "-"}
      </div>
      <div>
        <strong>โทรศัพท์:</strong><br>
        ${phone ? `${phone}${phoneExt ? ` ต่อ ${phoneExt}` : ""}` : "-"}
      </div>
      <div>
        <strong>อีเมล:</strong><br>
        ${email || "-"}
      </div>
    </div>
  `;
};

// Helper: single signatory signature box
export const buildSignatorySignature = (signatory, preloadedSignature, index, signatureFile) => {
  const getSignatoryName = (sig) => {
    const prenameTh = sig.prenameTh || sig.prename_th || "";
    const prenameOther = sig.prenameOther || sig.prename_other || "";
    const firstNameTh = sig.firstNameTh || sig.first_name_th || "";
    const lastNameTh = sig.lastNameTh || sig.last_name_th || "";

    let displayPrename = prenameTh;
    if (prenameTh === "อื่นๆ" && prenameOther) {
      displayPrename = prenameOther;
    }

    const prefixAndFirst = `${displayPrename || ""}${firstNameTh || ""}`.trim();
    const fullName = [prefixAndFirst, lastNameTh].filter(Boolean).join(" ").trim();
    return fullName || `ผู้มีอำนาจลงนาม คนที่ ${index + 1}`;
  };

  const signatoryName = getSignatoryName(signatory);
  const position = signatory.positionTh || signatory.position_th || "";

  let signatureHtml = "";
  if (preloadedSignature) {
    signatureHtml = `<img src="${preloadedSignature}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`;
  } else if (signatureFile && signatureFile.fileUrl) {
    signatureHtml = `<img src="${signatureFile.fileUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`;
  } else {
    signatureHtml = `<div style="color: #666; font-size: 11px; font-style: italic;">ไม่มีลายเซ็น</div>`;
  }

  return `
    <div class="signature-box">
      <div style="font-size: 11px; font-weight: bold; margin-bottom: 7px;">ลายเซ็นผู้มีอำนาจ</div>
      <div class="signature-img">${signatureHtml}</div>
      <div style="font-size: 10px; margin-top: 3px; border-top: 1px solid #000; padding-top: 3px;">
        <span class="signature-name">(${signatoryName})</span>
        ${position ? `<div style="margin-top: 1px;">${position}</div>` : ""}
        <div style="margin-top: 1px;">วันที่: ${formatThaiDate(new Date())}</div>
      </div>
    </div>
  `;
};

// Re-export helpers that rely on PDF_CONFIG for convenience
export { formatNumber, PDF_CONFIG };
