// HTML content generation utilities

import { formatThaiDate } from './dateUtils.js';
import { field, section } from './htmlBuilders.js';
import { buildSignatorySignature } from './signatureBuilders.js';
import { getPDFStyles } from './pdfConfig.js';

// Helper to resolve prename for display
export const resolvePrename = (prenameTh, prenameEn, prenameOther, lang = "th") => {
  const normTh = (prenameTh || "").trim();
  const normEn = (prenameEn || "").trim();
  const normOther = (prenameOther || "").trim();
  if (lang === "th") {
    if (!normTh && !normOther) return "";
    if (/^อื่นๆ$/i.test(normTh) || /^other$/i.test(normEn)) return normOther || "";
    return normTh || normOther || "";
  } else {
    if (!normEn && !normOther) return "";
    if (/^other$/i.test(normEn) || /^อื่นๆ$/i.test(normTh)) return normOther || "";
    return normEn || normOther || "";
  }
};

// Generate applicant section HTML
export const generateApplicantSection = (type, data) => {
  return type === "ic"
    ? section(
        "ข้อมูลผู้สมัคร",
        `
    <div class="row">
      <div class="col">${field("ชื่อ-นามสกุล (ไทย)", `${resolvePrename(data.prenameTh, data.prenameEn, data.prenameOther, "th")} ${data.firstNameTh || ""} ${data.lastNameTh || ""}`.trim())}</div>
      <div class="col">${field("ชื่อ-นามสกุล (อังกฤษ)", `${resolvePrename(data.prenameTh, data.prenameEn, data.prenameOther, "en")} ${data.firstNameEn || ""} ${data.lastNameEn || ""}`.trim())}</div>
    </div>
    <div class="row">
      <div class="col">${field("บัตรประชาชน", data.idCard)}</div>
      <div class="col">${field("โทรศัพท์", data.phone ? `${data.phone}${data.phoneExtension ? ` ต่อ ${data.phoneExtension}` : ""}` : "")}</div>
      <div class="col">${field("อีเมล", data.email)}</div>
    </div>
  `,
      )
    : section(
        type === "am" ? "ข้อมูลสมาคม" : "ข้อมูลบริษัท",
        `
    <div class="row">
      <div class="col">${field("ชื่อ (ไทย)", data.companyNameTh)}</div>
      <div class="col">${field("ชื่อ (อังกฤษ)", data.companyNameEn)}</div>
    </div>
    <div class="row">
      <div class="col">${field("เลขทะเบียน", data.taxId)}</div>
      <div class="col"></div>
      <div class="col"></div>
    </div>
  `,
      );
};

// Generate address section HTML
export const generateAddressSection = (data) => {
  return data.address2
    ? section(
        "ที่อยู่จัดส่งเอกสาร (ที่อยู่ 2)",
        `
    <div class="row">
      <div class="col">${field("เลขที่", data.address2.number)}</div>
      <div class="col">${field("หมู่", data.address2.moo)}</div>
      <div class="col">${field("ซอย", data.address2.soi)}</div>
      <div class="col">${field("ถนน", data.address2.street)}</div>
    </div>
    <div class="row">
      <div class="col">${field("ตำบล/แขวง", data.address2.subDistrict)}</div>
      <div class="col">${field("อำเภอ/เขต", data.address2.district)}</div>
      <div class="col">${field("จังหวัด", data.address2.province)}</div>
      <div class="col">${field("รหัสไปรษณีย์", data.address2.postalCode)}</div>
    </div>
    <div class="row" style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
      <div class="col">${field("โทรศัพท์", data.addressType2Phone ? `${data.addressType2Phone}${data.addressType2PhoneExt ? ` ต่อ ${data.addressType2PhoneExt}` : ""}` : "")}</div>
      <div class="col">${field("อีเมล", data.addressType2Email || "")}</div>
      <div class="col">${field("เว็บไซต์", data.addressType2Website || "")}</div>
    </div>
  `,
      )
    : section(
        "ที่อยู่",
        `
    <div class="row">
      <div class="col">${field("เลขที่", data.addressNumber)}</div>
      <div class="col">${field("หมู่", data.moo)}</div>
      <div class="col">${field("ซอย", data.soi)}</div>
      <div class="col">${field("ถนน", data.street)}</div>
    </div>
    <div class="row">
      <div class="col">${field("ตำบล/แขวง", data.subDistrict)}</div>
      <div class="col">${field("อำเภอ/เขต", data.district)}</div>
      <div class="col">${field("จังหวัด", data.province)}</div>
      <div class="col">${field("รหัสไปรษณีย์", data.postalCode)}</div>
    </div>
    <div class="row" style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
      <div class="col">${field("โทรศัพท์", data.phone ? `${data.phone}${data.phoneExtension ? ` ต่อ ${data.phoneExtension}` : ""}` : "")}</div>
      <div class="col">${field("อีเมล", data.email || "")}</div>
      <div class="col">${field("เว็บไซต์", data.website || "")}</div>
    </div>
  `,
      );
};

// Generate contact person section HTML
export const generateContactPersonSection = (data) => {
  if (!data.contactPersons?.length) return "";

  const isMain = (cp) =>
    cp?.isMain === true ||
    cp?.typeContactId === 1 ||
    cp?.type_contact_id === 1 ||
    /หลัก|main/i.test(cp?.typeContactName || cp?.type_contact_name || "");
  const mainContact = data.contactPersons.find(isMain) || data.contactPersons[0];

  return section(
    "ข้อมูลผู้ประสานงาน",
    `
<div class="row">
  <div class="col">${field("ชื่อ (ไทย)", `${resolvePrename(mainContact.prename_th || mainContact.prenameTh, mainContact.prename_en || mainContact.prenameEn, mainContact.prename_other || mainContact.prenameOther, "th")} ${mainContact.firstNameTh || mainContact.first_name_th || ""} ${mainContact.lastNameTh || mainContact.last_name_th || ""}`.trim())}</div>
  <div class="col">${field("ชื่อ (อังกฤษ)", `${resolvePrename(mainContact.prename_th || mainContact.prenameTh, mainContact.prename_en || mainContact.prenameEn, mainContact.prename_other || mainContact.prenameOther, "en")} ${mainContact.firstNameEn || mainContact.first_name_en || ""} ${mainContact.lastNameEn || mainContact.last_name_en || ""}`.trim())}</div>
  <div class="col">${field("ตำแหน่ง", mainContact.position || "")}</div>
</div>
<div class="row">
  <div class="col">${field("โทรศัพท์", mainContact.phone ? `${mainContact.phone}${mainContact.phoneExtension || mainContact.phone_extension ? ` ต่อ ${mainContact.phoneExtension || mainContact.phone_extension}` : ""}` : "")}</div>
  <div class="col">${field("อีเมล", mainContact.email || "")}</div>
  <div class="col"></div>
</div>
`,
  );
};

// Generate representatives section HTML
export const generateRepresentativesSection = (data) => {
  if (!data.representatives?.length) return "";

  return section(
    "ข้อมูลผู้แทน (สูงสุด 3 คน)",
    `
<div class="col-3">
  ${data.representatives
    .slice(0, 3)
    .map((rep, i) => {
      const firstTh =
        rep.firstNameTh ||
        rep.first_name_th ||
        rep.firstNameThai ||
        rep.firstname_th ||
        rep.firstnameThai ||
        rep.firstname;
      const lastTh =
        rep.lastNameTh ||
        rep.last_name_th ||
        rep.lastNameThai ||
        rep.lastname_th ||
        rep.lastnameThai ||
        rep.lastname;
      const firstEn =
        rep.firstNameEn ||
        rep.firstNameEng ||
        rep.first_name_en ||
        rep.firstNameEnglish ||
        rep.firstname_en ||
        rep.firstnameEnglish ||
        rep.firstName_en ||
        rep.firstName_eng;
      const lastEn =
        rep.lastNameEn ||
        rep.lastNameEng ||
        rep.last_name_en ||
        rep.lastNameEnglish ||
        rep.lastname_en ||
        rep.lastnameEnglish ||
        rep.lastName_en ||
        rep.lastName_eng;
      const position = rep.position || rep.positionName || rep.role || "";
      const phone = rep.phone || rep.tel || rep.telephone || "";
      const phoneExt =
        rep.phoneExtension || rep.phone_extension || rep.ext || rep.extension || "";
      const email = rep.email || rep.mail || rep.e_mail || "";
      return `
      <div class="rep-box">
        <div class="rep-title">ผู้แทน ${i + 1}</div>
        ${field("ชื่อ (ไทย)", `${resolvePrename(rep.prename_th || rep.prenameTh, rep.prename_en || rep.prenameEn, rep.prename_other || rep.prenameOther, "th")} ${firstTh || ""} ${lastTh || ""}`.trim())}
        ${field("ชื่อ (อังกฤษ)", `${resolvePrename(rep.prename_th || rep.prenameTh, rep.prename_en || rep.prenameEn, rep.prename_other || rep.prenameOther, "en")} ${firstEn || ""} ${lastEn || ""}`.trim())}
        ${field("ตำแหน่ง", position)}
        ${field("โทร", phone ? `${phone}${phoneExt ? ` ต่อ ${phoneExt}` : ""}` : "")}
        ${field("อีเมล", email)}
      </div>
    `;
    })
    .join("")}
</div>
`,
  );
};

// Generate business section HTML
export const generateBusinessSection = (businessTypes, type, data, displayProducts, extraProducts) => {
  if (!businessTypes || businessTypes === "-") return "";

  return section(
    "ข้อมูลธุรกิจ",
    `
<div class="row">
  <div class="col">
    <div style="margin-bottom: 10px;">
      <strong>ประเภทธุรกิจ:</strong><br>
      <div style="margin-top: 5px;">
        ${businessTypes
          .split(", ")
          .filter(Boolean)
          .map((t) => `<span class="business-tag">${t}</span>`)
          .join("")}
      </div>
    </div>
    ${
      type !== "ic"
        ? `
      <div class="row">
        ${
          type === "am"
            ? `<div class="col">${field("สมาชิกสมาคม", `${data.numberOfMember ?? 0} คน`)}</div><div class="col">${field("จำนวนพนักงาน", `${data.numberOfEmployees ?? 0} คน`)}</div>`
            : `<div class="col">${field("จำนวนพนักงาน", `${data.numberOfEmployees ?? 0} คน`)}</div>${type === "oc" ? `<div class="col">${field("ประเภทโรงงาน", data.factoryType === "TYPE1" ? "> 50 แรงม้า" : "< 50 แรงม้า")}</div>` : '<div class="col"></div>'}`
        }
      </div>
    `
        : ""
    }
    </div>
  <div class="col">
    ${
      displayProducts.length
        ? `
      <div>
        <strong>สินค้าและบริการ (${Array.isArray(data.products) ? data.products.length : 0} รายการ):</strong>
        <div style="margin-top: 8px; padding: 8px; background: #f9f9f9; border-radius: 4px;">
            ${displayProducts
              .map(
                (p, i) => `
              <div style="font-size: 11px;">
                <strong>${i + 1}.</strong> 
                <span style="color: #0066cc;">${p.name_th || p.nameTh || "-"}</span>
                ${(p.name_en || p.nameEn) && (p.name_en || p.nameEn) !== "-" ? ` / <span style="color: #666;">${p.name_en || p.nameEn}</span>` : ""}
              </div>
            `,
              )
              .join("")}
            ${extraProducts > 0 ? `<div class="span-all" style="font-size: 10px; color: #666;">... และอีก ${extraProducts} รายการ</div>` : ""}
          </div>
        </div>
      </div>
    `
        : `
      <div>
        <strong>สินค้าและบริการ:</strong>
        <div style="margin-top: 6px; color: #666;">-</div>
      </div>
    `
    }
  </div>
</div>
`,
  );
};

// Generate groups section HTML
export const generateGroupsSection = (data, industrialGroupNames, provincialChapterNames, displayIndustryGroups, displayProvincialChapters, extraIndustryGroups, extraProvincialChapters, MAX_GROUPS_DISPLAY, MAX_CHAPTERS_DISPLAY) => {
  // Ensure fallback names from IDs if names are still empty
  let igNames =
    industrialGroupNames && industrialGroupNames.length ? industrialGroupNames : null;
  let pcNames =
    provincialChapterNames && provincialChapterNames.length ? provincialChapterNames : null;
  if (
    !igNames &&
    Array.isArray(data.industrialGroupIds) &&
    data.industrialGroupIds.length
  ) {
    igNames = data.industrialGroupIds.map((id) => `กลุ่มอุตสาหกรรม ${id}`);
  }
  if (
    !pcNames &&
    Array.isArray(data.provincialChapterIds) &&
    data.provincialChapterIds.length
  ) {
    pcNames = data.provincialChapterIds.map((id) => `สภาอุตสาหกรรมจังหวัด ${id}`);
  }
  if (!(igNames?.length || pcNames?.length)) return "";

  const dispIG = Array.isArray(igNames) ? igNames.slice(0, MAX_GROUPS_DISPLAY) : [];
  const dispPC = Array.isArray(pcNames) ? pcNames.slice(0, MAX_CHAPTERS_DISPLAY) : [];
  const extraIG =
    Array.isArray(igNames) && igNames.length > MAX_GROUPS_DISPLAY
      ? igNames.length - MAX_GROUPS_DISPLAY
      : 0;
  const extraPC =
    Array.isArray(pcNames) && pcNames.length > MAX_CHAPTERS_DISPLAY
      ? pcNames.length - MAX_CHAPTERS_DISPLAY
      : 0;

  return section(
    "กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด",
    `
    <div class="row">
      <div class="col">
        <strong>กลุ่มอุตสาหกรรม:</strong><br>
        ${
          dispIG.length
            ? `<div class="list-2col">${dispIG.map((name) => `<div>• ${name}</div>`).join("")}${extraIG > 0 ? `<div class="span-all" style="font-size: 9.5px; color: #666;">... และอีก ${extraIG} รายการ</div>` : ""}</div>`
            : "ไม่ระบุ"
        }
      </div>
      <div class="col">
        <strong>สภาอุตสาหกรรมจังหวัด:</strong><br>
        ${
          dispPC.length
            ? `<div class="list-2col">${dispPC.map((name) => `<div>• ${name}</div>`).join("")}${extraPC > 0 ? `<div class="span-all" style="font-size: 9.5px; color: #666;">... และอีก ${extraPC} รายการ</div>` : ""}</div>`
            : "• สภาอุตสาหกรรมแห่งประเทศไทย"
        }
      </div>
    </div>
  `,
  );
};

// Generate applicant account section HTML
export const generateApplicantAccountSection = (applicantFullName, applicantAccount) => {
  return section(
    "ข้อมูลบัญชีผู้สมัคร",
    `
    <div class="row">
      <div class="col">${field("ชื่อ-นามสกุล", applicantFullName || "-")}</div>
      <div class="col">${field("อีเมล", applicantAccount?.email || "-")}</div>
      <div class="col">${field("โทรศัพท์", applicantAccount?.phone || "-")}</div>
    </div>
  `,
  );
};

// Generate signature section HTML
export const generateSignatureSection = (type, data, signatureImgSrc, preloadedSignatures, companyStampImgSrc, logoSrc) => {
  if (["oc", "ac", "am"].includes(type)) {
    // Check if we have multiple signatories data
    const hasMultipleSignatories =
      data.signatories &&
      Array.isArray(data.signatories) &&
      data.signatories.length > 0;
    const authorizedSignatures = data.authorizedSignatures || [];

    if (hasMultipleSignatories) {
      // Multiple signatories - display all with their names
      const signaturesHtml = data.signatories
        .map((signatory, index) => {
          const preloadedSignature = preloadedSignatures[index] || null;
          return buildSignatorySignature(signatory, preloadedSignature, index);
        })
        .join("");

      return `
        <div class="signature-area">
          ${signaturesHtml}
          ${
            type === "oc" || type === "ac" || type === "am"
              ? `
            <div class="stamp-box">
              <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">ตราบริษัท</div>
              <div class="stamp-img">
                ${
                  companyStampImgSrc
                    ? `<img src="${companyStampImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" alt="Company Stamp" />`
                    : `<img src="${logoSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" alt="FTI Logo" />`
                }
              </div>
            </div>
          `
              : ""
          }
        </div>
      `;
    } else {
      // Single signatory - fallback to original behavior
      return `
        <div class="signature-area">
          <div class="signature-box">
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">ลายเซ็นผู้มีอำนาจ</div>
            <div class="signature-img">
              ${signatureImgSrc ? (() => {
                const isDataUrl = signatureImgSrc.startsWith('data:');
                return `<img src="${signatureImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" ${isDataUrl ? 'crossorigin="anonymous"' : ''} alt="ลายเซ็น" />`;
              })() : `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 8px; color: #999; text-align: center;">(ลายเซ็นไม่พร้อมใช้งาน)</div>`}
            </div>
            <div style="font-size: 10px; margin-top: 5px; border-top: 1px solid #999; padding-top: 5px;">
              (${data.authorizedSignatoryName || "ชื่อผู้มีอำนาจลงนาม"})
              ${data.authorizedSignatoryPosition ? `<div style="margin-top: 2px; color: #555;">ตำแหน่ง: ${data.authorizedSignatoryPosition}</div>` : ""}
              <div style="margin-top: 2px; color: #555;">วันที่: ${formatThaiDate(new Date())}</div>
            </div>
          </div>
          ${
            type === "oc" || type === "ac" || type === "am"
              ? `
            <div class="stamp-box">
              <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">ตราบริษัท</div>
              <div class="stamp-img">
                ${
                  companyStampImgSrc
                    ? `<img src="${companyStampImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" alt="Company Stamp" />`
                    : `<img src="${logoSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" alt="FTI Logo" />`
                }
              </div>
            </div>
          `
              : ""
          }
        </div>
      `;
    }
  } else {
    return `
    <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
      <div style="display: flex; gap: 20px; font-size: 12px;">
        <div class="signature-box">
          <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">ลายเซ็นผู้มีอำนาจ</div>
          <div class="signature-img">
            ${
              signatureImgSrc
                ? `<img src="${signatureImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" ${signatureImgSrc.startsWith('data:') ? 'crossorigin="anonymous"' : 'crossorigin="use-credentials"'} />`
                : data.authorizedSignature?.fileUrl
                  ? `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 8px; color: #999; text-align: center; border: 1px dashed #ccc;">ไฟล์ลายเซ็น<br>(ไม่สามารถแสดงได้)</div>`
                  : `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 8px; color: #999; text-align: center;">(ยังไม่ได้อัปโหลดลายเซ็น)</div>`
            }
          </div>
          <div style="font-size: 10px; margin-top: 5px; border-top: 1px solid #999; padding-top: 5px;">
            (${data.authorizedSignatoryName || "ชื่อผู้มีอำนาจลงนาม"})
            ${data.authorizedSignatoryPosition ? `<div style="margin-top: 2px; color: #555;">ตำแหน่ง: ${data.authorizedSignatoryPosition}</div>` : ""}
            <div style="margin-top: 2px; color: #555;">วันที่: ${formatThaiDate(new Date())}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  }
};

// Generate complete HTML content
export const generateHTML = (logoSrc, title, data, type, applicantFullName, applicantAccount, businessTypes, displayProducts, extraProducts, industrialGroupNames, provincialChapterNames, displayIndustryGroups, displayProvincialChapters, extraIndustryGroups, extraProvincialChapters, MAX_GROUPS_DISPLAY, MAX_CHAPTERS_DISPLAY, signatureImgSrc, preloadedSignatures, companyStampImgSrc) => {
  const styles = getPDFStyles();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${styles}</style>
    </head>
    <body>
      <div class="member-number">
        หมายเลขสมาชิก:<br><br>................................................</div>
      <div class="created-date">
        สร้างเมื่อ: ${formatThaiDate(new Date())} ${new Date().toLocaleTimeString("th-TH")}
      </div>
      <div class="logo-wrap">
        <img src="${logoSrc}" alt="FTI Logo" crossorigin="anonymous" />
      </div>
      <div class="header">${title}</div>

      ${generateApplicantSection(type, data)}

      ${generateAddressSection(data)}

      ${generateContactPersonSection(data)}

      ${generateRepresentativesSection(data)}

      ${generateBusinessSection(businessTypes, type, data, displayProducts, extraProducts)}

      ${generateGroupsSection(data, industrialGroupNames, provincialChapterNames, displayIndustryGroups, displayProvincialChapters, extraIndustryGroups, extraProvincialChapters, MAX_GROUPS_DISPLAY, MAX_CHAPTERS_DISPLAY)}

      ${generateApplicantAccountSection(applicantFullName, applicantAccount)}

      ${generateSignatureSection(type, data, signatureImgSrc, preloadedSignatures, companyStampImgSrc, logoSrc)}
    </body>
    </html>
  `;
};
