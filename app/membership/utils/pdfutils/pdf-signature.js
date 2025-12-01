// pdf-signature.js - signature preload and layout helpers

import { formatThaiDate, transformCloudinaryUrl, loadImageAsDataURL } from "./pdf-utils.js";
import { PDF_CONFIG } from "./pdf-config.js";
import { buildSignatorySignature } from "./pdf-core-sections.js";

// Preload signature image (single document)
export const preloadSignature = async (signatureDoc) => {
  console.log("[PDF] Preloading signature...");
  if (!signatureDoc || !signatureDoc.fileUrl) {
    console.log("[PDF] ❌ No signature file");
    return null;
  }

  const sigUrl = signatureDoc.fileUrl;
  const transformedUrl = transformCloudinaryUrl(sigUrl);
  console.debug("[PDF] Signature URL:", transformedUrl);

  const dataUrl = await loadImageAsDataURL(transformedUrl);
  if (dataUrl) {
    console.debug("[PDF] ✅ Signature loaded as data URL");
    return dataUrl;
  }

  const looksLikeImg =
    /\.(png|jpe?g|webp|gif)(\?|$)/i.test(transformedUrl) ||
    signatureDoc.mimeType?.startsWith?.("image/");
  if (looksLikeImg) {
    console.debug("[PDF] ⚠️ Fallback to URL");
    return transformedUrl;
  }

  console.warn("[PDF] ❌ Not an image");
  return null;
};

// Build signature area HTML for all membership types
export const buildSignatureArea = (
  data,
  type,
  signatureImgSrc,
  companyStampImgSrc,
  preloadedSignatures,
  logoSrc,
) => {
  const hasMultipleSignatories =
    data.signatories && Array.isArray(data.signatories) && data.signatories.length > 0;
  const authorizedSignatures = data.authorizedSignatures || [];

  const stampHtml =
    type === "oc" || type === "ac" || type === "am"
      ? `
    <div class="stamp-box">
      <div style="font-size: 11px; font-weight: bold; margin-bottom: 7px;">ตราบริษัท</div>
      <div class="stamp-img">
        ${
          companyStampImgSrc
            ? `<img src="${companyStampImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`
            : `<img src="${logoSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`
        }
      </div>
    </div>
  `
      : "";

  if (["oc", "ac", "am"].includes(type)) {
    if (hasMultipleSignatories) {
      const signaturesHtml = data.signatories
        .map((signatory, index) => {
          const preloadedSignature = preloadedSignatures[index] || null;
          const signatureFile = authorizedSignatures[index] || null;
          return buildSignatorySignature(signatory, preloadedSignature, index, signatureFile);
        })
        .join("");

      return `
        <div class="signature-area">
          ${signaturesHtml}
          ${stampHtml}
        </div>
      `;
    }

    return `
      <div class="signature-area">
        <div class="signature-box">
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 7px;">ลายเซ็นผู้มีอำนาจ</div>
          <div class="signature-img">
            ${
              signatureImgSrc
                ? `<img src="${signatureImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`
                : data.authorizedSignature?.fileUrl
                  ? `<img src="${data.authorizedSignature.fileUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`
                  : `<div style="color: #666; font-size: 11px; font-style: italic;">ไม่มีลายเซ็น</div>`
            }
          </div>
          <div style="font-size: 12px; margin-top: 4px; border-top: 1px solid #000; padding-top: 4px;">
            <span class="signature-name">(${data.authorizedSignatoryName || "ชื่อผู้มีอำนาจลงนาม"})</span>
            ${
              data.authorizedSignatoryPosition
                ? `<div style="margin-top: 2px;">${data.authorizedSignatoryPosition}</div>`
                : ""
            }
            <div style="margin-top: 2px;">วันที่: ${formatThaiDate(new Date())}</div>
          </div>
        </div>
        ${stampHtml}
      </div>
    `;
  }

  // IC type - simple signature
  return `
    <div style="display: flex; justify-content: flex-end; margin-top: 25px;">
      <div class="signature-box">
        <div style="font-size: 11px; font-weight: bold; margin-bottom: 7px;">ลายเซ็นผู้มีอำนาจ</div>
        <div class="signature-img">
          ${
            signatureImgSrc
              ? `<img src="${signatureImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`
              : data.authorizedSignature?.fileUrl
                ? `<img src="${data.authorizedSignature.fileUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`
                : `<div style="color: #666; font-size: 11px; font-style: italic;">ไม่มีลายเซ็น</div>`
          }
        </div>
        <div style="font-size: 12px; margin-top: 4px; border-top: 1px solid #000; padding-top: 4px;">
          <span class="signature-name">(${data.authorizedSignatoryName || "ชื่อผู้มีอำนาจลงนาม"})</span>
          ${
            data.authorizedSignatoryPosition
              ? `<div style="margin-top: 2px;">${data.authorizedSignatoryPosition}</div>`
              : ""
          }
          <div style="margin-top: 2px;">วันที่: ${formatThaiDate(new Date())}</div>
        </div>
      </div>
    </div>
  `;
};
