// pdf-domain-sections.js - higher-level PDF sections per business domain

import { formatThaiDate, resolvePrename, formatNumber } from "./pdf-utils.js";
import { PDF_CONFIG } from "./pdf-config.js";
import { field, section } from "./pdf-core-sections.js";

// Section 1: Member Info (IC type)
export const buildMemberInfoIC = (data, memberTypeLabel = "") => {
  return section(
    "ส่วนที่ 1 ข้อมูลสมาชิก",
    `
      <div class="row">
        <div class="col">${field("ชื่อ-นามสกุล (ไทย)", `${`${resolvePrename(data.prenameTh, data.prenameEn, data.prenameOther, "th") || ""}${data.firstNameTh || ""}`.trim()} ${data.lastNameTh || ""}`.trim())}</div>
        <div class="col">${field("ชื่อ-นามสกุล (อังกฤษ)", `${`${resolvePrename(data.prenameTh, data.prenameEn, data.prenameOther, "en") || ""}${data.firstNameEn || ""}`.trim()} ${data.lastNameEn || ""}`.trim())}</div>
      </div>
      <div class="row">
        <div class="col">${field("บัตรประชาชน", data.idCard)}</div>
        <div class="col">${field("โทรศัพท์", data.phone ? `${data.phone}${data.phoneExtension ? ` ต่อ ${data.phoneExtension}` : ""}` : "")}</div>
        <div class="col">${field("อีเมล", data.email)}</div>
      </div>
    `,
  );
};

// Section 1: Member Info (OC/AC/AM types)
export const buildMemberInfoCompany = (data, memberTypeLabel = "") => {
  return section(
    "ส่วนที่ 1 ข้อมูลสมาชิก",
    `
      <div class="row">
        <div class="col">${field("เลขทะเบียนนิติบุคคล", data.taxId)}</div>
        <div class="col">
          ${field("ชื่อบริษัท (ไทย)", data.companyNameTh)}
          ${field("ชื่อบริษัท (อังกฤษ)", data.companyNameEn)}
        </div>
      </div>
    `,
  );
};

// Section 2: Address
export const buildAddressSection = (data) => {
  const addr = data.address2 || data;
  const phone = data.address2 ? data.addressType2Phone : data.phone;
  const phoneExt = data.address2 ? data.addressType2PhoneExt : data.phoneExtension;
  const email = data.address2 ? data.addressType2Email : data.email;
  const website = data.address2 ? data.addressType2Website : data.website;

  return section(
    "ส่วนที่ 2 ที่อยู่ในการจัดส่งเอกสาร",
    `
      <div class="row">
        <div class="col">${field("เลขที่", addr.number || addr.addressNumber)}</div>
        <div class="col">${field("หมู่", addr.moo)}</div>
        <div class="col">${field("ซอย", addr.soi)}</div>
        <div class="col">${field("ถนน", addr.street)}</div>
      </div>
      <div class="row">
        <div class="col">${field("ตำบล/แขวง", addr.subDistrict)}</div>
        <div class="col">${field("อำเภอ/เขต", addr.district)}</div>
        <div class="col">${field("จังหวัด", addr.province)}</div>
        <div class="col">${field("รหัสไปรษณีย์", addr.postalCode)}</div>
      </div>
      <div class="row" style="margin-top: 5px; border-top: 1px solid #e0e0e0; padding-top: 5px;">
        <div class="col">${field("โทรศัพท์", phone ? `${phone}${phoneExt ? ` ต่อ ${phoneExt}` : ""}` : "")}</div>
        <div class="col">${field("อีเมล", email || "", 'style="white-space: nowrap;"')}</div>
        <div class="col"></div>
      </div>
      <div class="row">
        <div class="col">${field("เว็บไซต์", website || "", 'style="white-space: nowrap;"')}</div>
      </div>
    `,
  );
};

// Section 3: Representatives
export const buildRepresentativesSection = (representatives) => {
  if (!representatives || representatives.length === 0) return "";

  const repsHtml = representatives
    .slice(0, 3)
    .map((rep, i) => {
      const firstTh =
        rep.firstNameTh ||
        rep.first_name_th ||
        rep.firstnameThai ||
        rep.firstNameThai ||
        rep.firstname ||
        "";
      const lastTh =
        rep.lastNameTh ||
        rep.last_name_th ||
        rep.lastnameThai ||
        rep.lastNameThai ||
        rep.lastname ||
        "";

      const firstEn =
        rep.firstNameEn ||
        rep.first_name_en ||
        rep.firstName_en ||
        rep.firstNameEng ||
        rep.firstNameEnglish ||
        "";
      const lastEn =
        rep.lastNameEn ||
        rep.last_name_en ||
        rep.lastName_en ||
        rep.lastNameEng ||
        rep.lastNameEnglish ||
        "";

      const position = rep.position || rep.positionName || rep.role || "";

      const phone = rep.phone || rep.tel || "";
      const phoneExt = rep.phoneExtension || rep.phone_extension || "";
      const email = rep.email || "";

      const thaiName = `${`${
        resolvePrename(
          rep.prename_th || rep.prenameTh,
          rep.prename_en || rep.prenameEn,
          rep.prename_other || rep.prenameOther,
          "th",
        ) || ""
      }${firstTh || ""}`.trim()} ${lastTh || ""}`.trim();

      const engPrenameRaw =
        rep.prenameEn || rep.prename_en || rep.prenameTh || rep.prename_th || "";

      const engName = [engPrenameRaw, firstEn, lastEn]
        .map((part) => (part || "").trim())
        .filter(Boolean)
        .join(" ");

      return `
        <div class="rep-box">
          <div class="rep-title">ผู้แทน ${i + 1}</div>
          <div class="row">
            <div class="col">${field("ชื่อ (ไทย)", thaiName)}</div>
          </div>
          <div class="row">
            <div class="col">${field("ชื่อ (อังกฤษ)", engName)}</div>
          </div>
          <div class="row">
            <div class="col">${field("โทรศัพท์มือถือ", phone ? `${phone}${phoneExt ? ` ต่อ ${phoneExt}` : ""}` : "")}</div>
          </div>
          <div class="row">
            <div class="col">${field("อีเมล", email, 'style="white-space: nowrap;"')}</div>
          </div>
          <div class="row">
            <div class="col">${position ? field("ตำแหน่ง", position) : ""}</div>
          </div>
        </div>
      `;
    })
    .join("");

  return section("ส่วนที่ 3 นามผู้แทนใช้สิทธิ", `<div class="list-3col">${repsHtml}</div>`);
};

// Section 4: Business info
export const buildBusinessSection = (data, businessTypes, type) => {
  const displayProducts = Array.isArray(data.products)
    ? data.products.slice(0, PDF_CONFIG.MAX_PRODUCTS_DISPLAY)
    : [];
  const extraProducts =
    Array.isArray(data.products) && data.products.length > PDF_CONFIG.MAX_PRODUCTS_DISPLAY
      ? data.products.length - PDF_CONFIG.MAX_PRODUCTS_DISPLAY
      : 0;

  const productsHtml = displayProducts.length
    ? `
      <div>
        <strong>สินค้าและบริการ (${data.products.length} รายการ):</strong>
        <div class="product-list">
          ${displayProducts
            .map(
              (p, i) => `
            <div class="product-item">
              <strong>${i + 1}.</strong> ${p.name_th || p.nameTh || "-"}
              ${(p.name_en || p.nameEn) && p.name_en !== "-" ? ` / ${p.name_en || p.nameEn}` : ""}
            </div>
          `,
            )
            .join("")}
          ${
            extraProducts > 0
              ? `<div style="font-size: 11px; color: #666; margin-top: 4px;">... และอีก ${extraProducts} รายการ</div>`
              : ""
          }
        </div>
      </div>
    `
    : `<div><strong>สินค้าและบริการ:</strong><div style="margin-top: 6px;">-</div></div>`;

  let rawTypes =
    data.businessTypes || data.business_types || data.businessType || data.business_type || null;

  let selectedKeys = [];
  if (typeof rawTypes === "string") {
    selectedKeys = rawTypes
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  } else if (Array.isArray(rawTypes) && rawTypes.length && typeof rawTypes[0] !== "object") {
    selectedKeys = rawTypes.map((t) => String(t).trim()).filter(Boolean);
  } else if (Array.isArray(rawTypes)) {
    selectedKeys = rawTypes
      .map((bt) => bt.id || bt.key || bt.business_type || bt.type)
      .filter(Boolean)
      .map((t) => String(t).trim());
  } else if (rawTypes && typeof rawTypes === "object") {
    selectedKeys = Object.entries(rawTypes)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }

  let otherDetail = null;
  if (Array.isArray(data.businessTypeOther) && data.businessTypeOther.length > 0) {
    otherDetail = data.businessTypeOther[0].otherType || data.businessTypeOther[0].detail || null;
  } else if (data.businessTypeOther && typeof data.businessTypeOther === "object") {
    otherDetail = data.businessTypeOther.detail || data.businessTypeOther.otherType || null;
  }
  if (!otherDetail && data.otherBusinessTypeDetail) {
    otherDetail = data.otherBusinessTypeDetail;
  }

  const typeOptions = [
    { key: "manufacturer", label: "ผู้ผลิต" },
    { key: "distributor", label: "ผู้จัดจำหน่าย" },
    { key: "importer", label: "ผู้นำเข้า" },
    { key: "exporter", label: "ผู้ส่งออก" },
    { key: "service", label: "ผู้ให้บริการ" },
    { key: "other", label: otherDetail ? `อื่นๆ: ${otherDetail}` : "อื่นๆ" },
  ];

  const isSelected = (key) => selectedKeys.includes(key);
  const selectedTypeOptions = typeOptions.filter((opt) => isSelected(opt.key));

  const businessTypesGrid = selectedTypeOptions.length
    ? `
    <div style="margin-bottom: 6px;">
      <strong>ประเภทธุรกิจ:</strong>
      <div class="list-3col" style="margin-top: 4px;">
        ${selectedTypeOptions
          .map((opt) => `<div style="font-size: 11px;">• ${opt.label}</div>`)
          .join("")}
      </div>
    </div>
  `
    : "";

  const employeeInfoBlock =
    type !== "ic"
      ? `
    <div style="padding: 6px 6px 4px 6px;">
      <div style="font-weight: bold; margin-bottom: 4px;">ข้อมูลจำนวนพนักงาน</div>
      ${
        type === "am"
          ? `
            ${field("สมาชิกสมาคม", `${formatNumber(data.numberOfMember)} คน`)}
            ${field("จำนวนพนักงาน", `${formatNumber(data.numberOfEmployees)} คน`)}
          `
          : `
            ${field("จำนวนพนักงาน", `${formatNumber(data.numberOfEmployees)} คน`)}
            ${
              type === "oc"
                ? field(
                    "ประเภทโรงงาน",
                    data.factoryType === "TYPE1" ? "> 50 แรงม้า" : "< 50 แรงม้า",
                  )
                : ""
            }
          `
      }
    </div>
  `
      : "";

  return section(
    "ส่วนที่ 4 รายละเอียดอื่นๆ",
    `
      <div class="row">
        <div class="col">
          ${businessTypesGrid}
        </div>
        <div class="col">
          ${productsHtml}
        </div>
        <div class="col">
          ${employeeInfoBlock}
        </div>
      </div>
    `,
  );
};

// Section 6: Contact person
export const buildContactPersonSection = (contactPersons) => {
  if (!contactPersons || contactPersons.length === 0) return "";

  const isMain = (cp) =>
    cp?.isMain === true || cp?.typeContactId === 1 || /หลัก|main/i.test(cp?.typeContactName || "");

  const mainContact = contactPersons.find(isMain) || contactPersons[0];

  const thaiName = `${`${
    resolvePrename(
      mainContact.prename_th || mainContact.prenameTh,
      mainContact.prename_en || mainContact.prenameEn,
      mainContact.prename_other || mainContact.prenameOther,
      "th",
    ) || ""
  }${mainContact.firstNameTh || mainContact.first_name_th || ""}`.trim()} ${
    mainContact.lastNameTh || mainContact.last_name_th || ""
  }`.trim();

  const engName = `${`${
    resolvePrename(
      mainContact.prename_th || mainContact.prenameTh,
      mainContact.prename_en || mainContact.prenameEn,
      mainContact.prename_other || mainContact.prenameOther,
      "en",
    ) || ""
  }${mainContact.firstNameEn || mainContact.first_name_en || ""}`.trim()} ${
    mainContact.lastNameEn || mainContact.last_name_en || ""
  }`.trim();

  const phone = mainContact.phone || "";
  const phoneExt = mainContact.phoneExtension || mainContact.phone_extension || "";
  const phoneDisplay = phone ? `${phone}${phoneExt ? ` ต่อ ${phoneExt}` : ""}` : "";

  const position = mainContact.position || "";

  const content = `
    <div class="row">
      <div class="col">${field("ชื่อ (ไทย)", thaiName)}</div>
      <div class="col">${field("โทรศัพท์", phoneDisplay)}</div>
      <div class="col">${field("ตำแหน่ง", position)}</div>
    </div>
    <div class="row">
      <div class="col">${field("ชื่อ (อังกฤษ)", engName)}</div>
      <div class="col" style="flex: 2;">
        ${field(
          "อีเมล",
          mainContact.email || "",
          'style="white-space: normal; word-break: break-all;"',
        )}
      </div>
    </div>
  `;

  return section("ส่วนที่ 6 ข้อมูลผู้ประสานงาน", content);
};
