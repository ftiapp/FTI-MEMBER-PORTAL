// ติดตั้ง: npm install html2pdf.js
import html2pdf from "html2pdf.js";

// Format Thai date
const formatThaiDate = (date) => {
  if (!date) return "-";
  const thaiMonths = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  const d = new Date(date);
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
};

// If URL is Cloudinary, inject a safe transformation to ensure image output and smaller size
const transformCloudinaryUrl = (url) => {
  try {
    if (!url) return url;
    const u = new URL(url);
    if (!u.hostname.includes("res.cloudinary.com")) return url;
    // Insert transformation segment before version segment 'v12345'
    const parts = u.pathname.split("/");
    const uploadIdx = parts.findIndex((p) => p === "upload");
    if (uploadIdx === -1) return url;
    const nextPart = parts[uploadIdx + 1] || "";
    const isVersion = /^v\d+$/.test(nextPart);
    const isTransform = nextPart && !isVersion && !nextPart.includes(".");
    const inject = "pg_1,f_auto,q_auto:eco,w_600";
    if (isVersion) {
      // No existing transform, insert before version
      parts.splice(uploadIdx + 1, 0, inject);
    } else if (isTransform) {
      // Already has transform; if missing f_auto, prepend ours
      if (!nextPart.includes("f_auto")) {
        parts[uploadIdx + 1] = `${inject},${nextPart}`;
      }
    } else {
      // Likely directly public_id (with extension). Insert transform here.
      parts.splice(uploadIdx + 1, 0, inject);
    }
    u.pathname = parts.join("/");
    return u.toString();
  } catch {
    return url;
  }
};

// Load remote image as Data URL to avoid CORS issues in html2canvas (enhanced for production compatibility)
const loadImageAsDataURL = async (url) => {
  if (!url) return null;
  console.debug(`[PDF] Attempting to load image as data URL: ${url}`);
  try {
    // First attempt: Try without CORS mode (works better in production for some cases)
    let res;
    try {
      console.debug(`[PDF] Trying fetch without CORS mode...`);
      res = await fetch(url);
      if (!res.ok) {
        console.warn(`[PDF] Fetch without CORS failed (${res.status}), trying with CORS mode...`);
        // Second attempt: Try with CORS mode
        res = await fetch(url, { mode: "cors" });
      }
    } catch (err) {
      console.warn(`[PDF] Fetch without CORS failed with error, trying with CORS mode...`, err);
      res = await fetch(url, { mode: "cors" });
    }
    if (!res.ok) return null;
    const blob = await res.blob();
    // Only proceed if content is actually an image
    if (!(blob && blob.type && blob.type.startsWith("image/"))) {
      return null;
    }
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Error loading image as data URL:", err);
    return null;
  }
};

// Get title by type
const getTitleByType = (type) =>
  ({
    ic: "เอกสารสมัครสมาชิก สมทบ-บุคคลธรรมดา (ทบ)",
    oc: "เอกสารสมัครสมาชิก สามัญ-โรงงาน (สน)",
    ac: "เอกสารสมัครสมาชิก สมทบ-นิติบุคคล (ทน)",
    am: "เอกสารสมัครสมาชิก สามัญ-สมาคมการค้า (สส)",
  })[type] || "ข้อมูลสมาชิก";

// Get business type names
const getBusinessTypeNames = (app) => {
  const names = {
    manufacturer: "ผู้ผลิต",
    distributor: "ผู้จัดจำหน่าย",
    importer: "ผู้นำเข้า",
    exporter: "ผู้ส่งออก",
    service: "ผู้ให้บริการ",
    service_provider: "ผู้ให้บริการ",
    other: "อื่นๆ",
  };

  // Normalize possible sources
  let src =
    app.businessTypes || app.business_types || app.businessType || app.business_type || null;
  if (!src) return "-";

  // String (comma separated)
  if (typeof src === "string") {
    return src
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => names[s] || s)
      .join(", ");
  }

  // Array of primitives (ids/labels)
  if (Array.isArray(src) && src.length && typeof src[0] !== "object") {
    return src.map((k) => names[k] || String(k)).join(", ");
  }

  // Array of objects
  if (Array.isArray(src)) {
    return src
      .map((bt) => {
        // Prefer explicit name from API
        const named = bt.businessTypeName || bt.name_th || bt.nameTh || bt.label || bt.name;
        if (named) return named;
        const key = bt.id || bt.key || bt.business_type || bt.type;
        if (key === "other") {
          // API may provide array of other types: [{ otherType }]
          const other =
            Array.isArray(app.businessTypeOther) && app.businessTypeOther.length > 0
              ? app.businessTypeOther[0].otherType || app.businessTypeOther[0].detail
              : app.businessTypeOther?.detail;
          return `อื่นๆ: ${other || "-"}`;
        }
        return names[key] || key;
      })
      .join(", ");
  }

  // Object format from form: { manufacturer: true, ... }
  return Object.entries(src)
    .filter(([k, v]) => v)
    .map(([k]) => {
      if (k === "other") {
        const other =
          Array.isArray(app.businessTypeOther) && app.businessTypeOther.length > 0
            ? app.businessTypeOther[0].otherType || app.businessTypeOther[0].detail
            : app.businessTypeOther?.detail || app.otherBusinessTypeDetail;
        return `อื่นๆ: ${other || "-"}`;
      }
      return names[k] || k;
    })
    .join(", ");
};

// Process data - normalize field names
const processData = (app) => {
  // Fix company name mapping - handle cases where it shows '-'
  let companyNameTh =
    app.company_name_th || app.companyNameTh || app.associationName || app.associationNameTh;
  let companyNameEn =
    app.company_name_en || app.companyNameEn || app.associationNameEng || app.associationNameEn;

  // If company name is '-', try alternative mappings
  if (companyNameTh === "-" || !companyNameTh) {
    companyNameTh = app.companyName || app.name || app.company_name || "-";
  }
  if (companyNameEn === "-" || !companyNameEn) {
    companyNameEn = app.companyNameEng || app.nameEng || app.company_name_eng || "-";
  }

  // Find address type 2 data for contact information
  let addressType2Phone = "";
  let addressType2PhoneExt = "";
  let addressType2Email = "";
  let addressType2Website = "";

  // Check if addresses exists and find type 2 (array or object format)
  if (app.addresses) {
    if (Array.isArray(app.addresses)) {
      const addressType2 = app.addresses.find(
        (addr) => addr.address_type === "2" || addr.addressType === "2",
      );
      if (addressType2) {
        addressType2Phone = addressType2.phone || "";
        addressType2PhoneExt = addressType2.phone_extension || addressType2.phoneExtension || "";
        addressType2Email = addressType2.email || "";
        addressType2Website = addressType2.website || "";
      }
    } else if (typeof app.addresses === "object" && app.addresses["2"]) {
      const a2 = app.addresses["2"];
      addressType2Phone = a2.phone || "";
      addressType2PhoneExt = a2.phone_extension || a2.phoneExtension || "";
      addressType2Email = a2.email || "";
      addressType2Website = a2.website || "";
    }
  }

  // Extract documents from various possible sources
  let documents =
    app.documents ||
    app.memberDocs ||
    app.MemberDocuments ||
    app.icDocuments ||
    app.ICDocuments ||
    app.member_docs ||
    app.memberDocs ||
    [];
  // Also check if documents are in the root (from normalized data)
  if (!documents || documents.length === 0) {
    documents = app.documents || [];
  }
  if (!Array.isArray(documents) && documents?.data && Array.isArray(documents.data)) {
    documents = documents.data;
  }
  
  // Debug logging
  console.debug("[PDF] All documents sources checked:");
  console.debug("- app.documents:", app.documents);
  console.debug("- app.memberDocs:", app.memberDocs);
  console.debug("- Final documents array:", documents);
  console.debug("- Documents length:", documents?.length);
  
  const findDoc = (type) => {
    // normalize and support multiple aliases from different flows
    const aliasesMap = {
      authorizedSignature: [
        "authorizedSignature",
        "authorized_signature",
        "signature",
        "authorizedSign",
      ],
      companyStamp: ["companyStamp", "company_stamp", "stamp"],
    };
    const aliases = aliasesMap[type] || [type];
    const doc = documents.find((d) => {
      const t = (d.document_type || d.documentType || d.type || "").toString().trim();
      const tLower = t.toLowerCase();
      return aliases.some((a) => t === a || tLower === a.toLowerCase());
    });
    if (!doc) {
      console.debug(`[PDF] ${type} not found in documents. Available types:`, documents.map(d => d.document_type || d.type));
      return null;
    }
    console.debug(`[PDF] Found ${type}:`, doc);
    return {
      fileUrl: doc.cloudinary_url || doc.file_url || doc.fileUrl || doc.file_path || doc.url,
      mimeType: doc.mime_type || doc.mimeType || doc.type || "",
      fileName: doc.file_name || doc.fileName || doc.name || "",
    };
  };

  // Build address type 2 object (shipping address) - support array or object format
  let address2 = null;
  if (app.addresses) {
    if (Array.isArray(app.addresses)) {
      const raw = app.addresses.find(
        (addr) => addr.address_type === "2" || addr.addressType === "2" || addr.addressTypeId === 2,
      );
      if (raw) {
        address2 = {
          number:
            raw.address_number ||
            raw.addressNumber ||
            raw.address_no ||
            raw.addressNo ||
            raw.house_number ||
            raw.houseNumber ||
            raw.number ||
            "",
          moo: raw.moo || "",
          soi: raw.soi || "",
          street: raw.STreet || raw.street || raw.road || "",
          subDistrict: raw.sub_district || raw.subDistrict || "",
          district: raw.district || raw.amphur || "",
          province: raw.province || "",
          postalCode: raw.postal_code || raw.postalCode || "",
        };
      }
    } else if (typeof app.addresses === "object" && app.addresses["2"]) {
      const raw = app.addresses["2"];
      address2 = {
        number:
          raw.addressNumber ||
          raw.address_number ||
          raw.address_no ||
          raw.addressNo ||
          raw.house_number ||
          raw.houseNumber ||
          raw.number ||
          "",
        moo: raw.moo || "",
        soi: raw.soi || "",
        street: raw.STreet || raw.street || raw.road || "",
        subDistrict: raw.subDistrict || raw.sub_district || "",
        district: raw.district || raw.amphur || "",
        province: raw.province || "",
        postalCode: raw.postalCode || raw.postal_code || "",
      };
    }
  }

  // Fallback: If base address fields are missing, try to derive from addresses type 1 or the first entry
  let baseAddress = {
    number: app.address_number || app.addressNumber || app.address?.addressNumber,
    moo: app.moo || app.address?.moo,
    soi: app.soi || app.address?.soi,
    street:
      app.STreet ||
      app.street ||
      app.road ||
      app.address?.STreet ||
      app.address?.street ||
      app.address?.road,
    subDistrict: app.sub_district || app.subDistrict || app.address?.subDistrict,
    district: app.district || app.address?.district,
    province: app.province || app.address?.province,
    postalCode: app.postal_code || app.postalCode || app.address?.postalCode,
  };
  if (!baseAddress.number && app.addresses) {
    const pick = (raw) => ({
      number:
        raw.address_number ||
        raw.addressNumber ||
        raw.address_no ||
        raw.addressNo ||
        raw.house_number ||
        raw.houseNumber ||
        raw.number ||
        "",
      moo: raw.moo || "",
      soi: raw.soi || "",
      street: raw.STreet || raw.street || raw.road || "",
      subDistrict: raw.sub_district || raw.subDistrict || "",
      district: raw.district || raw.amphur || "",
      province: raw.province || "",
      postalCode: raw.postal_code || raw.postalCode || "",
    });
    if (Array.isArray(app.addresses)) {
      const a1 =
        app.addresses.find(
          (addr) =>
            addr.address_type === "1" || addr.addressType === "1" || addr.addressTypeId === 1,
        ) || app.addresses[0];
      if (a1) baseAddress = pick(a1);
    } else if (typeof app.addresses === "object" && app.addresses["1"]) {
      const a1 = app.addresses["1"];
      if (a1) baseAddress = pick(a1);
    }
  }

  return {
    ...app,
    companyNameTh,
    companyNameEn,
    taxId: app.tax_id || app.taxId,
    // Preserve 0 for employee count
    numberOfEmployees:
      app.number_of_employees ??
      app.numberOfEmployees ??
      app.employee_count ??
      app.employeeCount ??
      null,
    // Applicant name fields (IC)
    prenameTh: app.prename_th || app.prenameTh,
    prenameEn: app.prename_en || app.prenameEn,
    prenameOther: app.prename_other || app.prenameOther,
    firstNameTh: app.first_name_th || app.firstNameTh,
    lastNameTh: app.last_name_th || app.lastNameTh,
    firstNameEn: app.first_name_en || app.firstNameEn,
    lastNameEn: app.last_name_en || app.lastNameEn,
    idCard:
      app.id_card_number ||
      app.idCardNumber ||
      app.idCard ||
      app.id_card ||
      app.citizen_id ||
      app.nationalId ||
      "-",
    // Normalize phone extension for consistent display (IC main uses phone_extension)
    phoneExtension: app.phone_extension || app.phoneExtension,
    // Base address fields (with robust fallbacks including addresses[0]/type1)
    addressNumber: baseAddress.number,
    moo: baseAddress.moo,
    soi: baseAddress.soi,
    street: baseAddress.street,
    district: baseAddress.district,
    province: baseAddress.province,
    subDistrict: baseAddress.subDistrict,
    postalCode: baseAddress.postalCode,
    factoryType: app.factory_type || app.factoryType,
    numberOfMember: app.number_of_member || app.numberOfMember,
    industrialGroupIds: app.industrialGroups || app.industrialGroupIds || [],
    provincialChapterIds: app.provincialCouncils || app.provincialChapterIds || [],
    // Documents
    authorizedSignature: (() => {
      const sig = app.authorizedSignature || findDoc("authorizedSignature") || null;
      console.debug("[PDF] authorizedSignature found:", sig);
      return sig;
    })(),
    companyStamp: (() => {
      const stamp = app.companyStamp || findDoc("companyStamp") || null;
      console.debug("[PDF] companyStamp found:", stamp);
      return stamp;
    })(),
    // Multiple signatories data (for OC forms)
    signatories: app.signatories || [],
    signatureNames: app.signatureNames || [], // From MemberRegist_OC_Signature_Name table
    authorizedSignatures: app.authorizedSignatures || [], // Array of signature files
    // Representatives (normalize to a consistent array)
    representatives: (() => {
      let reps = app.representatives || app.reps || [];

      // IC uses singular 'representative' field
      if (!reps || reps.length === 0) {
        if (app.representative) {
          reps = [app.representative];
        }
      }

      if (!Array.isArray(reps)) {
        reps = reps ? [reps] : [];
      }
      return reps;
    })(),
    // Address type 2 contact information
    addressType2Phone,
    addressType2PhoneExt,
    addressType2Email,
    addressType2Website,
    // Address type 2 full data
    address2,
    // Compute authorized signatory name WITH PRENAME (prefer Thai, fallback to English, then representative)
    // Accept multiple possible shapes from API/frontend until APIs are unified
    authorizedSignatoryName: (() => {
      const pick = (...vals) => vals.find((v) => typeof v === "string" && v.trim());

      // Support nested signature name containers from DB/API joins
      const sigContainer = (() => {
        const cands = [
          app.signatureName,
          app.authorizedSignatureName,
          app.authorized_signature_name,
          app.signature_name,
          app.SignatureName,
        ];
        return cands.find((c) => c && typeof c === "object") || null;
      })();

      // Extract prename fields - include flat fields from main app object
      const prenameTh = pick(
        app.authorizedSignatoryPrenameTh,
        app.authorizedSignaturePrenameTh,
        app.authorized_signatory_prename_th,
        sigContainer?.prename_th,
        sigContainer?.prenameTh,
        app.prename_th,
        app.prenameTh,
      );
      console.log("🔍 DEBUG PDF - prenameTh values checked:", {
        authorizedSignatoryPrenameTh: app.authorizedSignatoryPrenameTh,
        authorizedSignaturePrenameTh: app.authorizedSignaturePrenameTh,
        authorized_signatory_prename_th: app.authorized_signatory_prename_th,
        "sigContainer?.prename_th": sigContainer?.prename_th,
        "sigContainer?.prenameTh": sigContainer?.prenameTh,
        "app.prename_th": app.prename_th,
        "app.prenameTh": app.prenameTh,
        "final prenameTh": prenameTh,
      });
      const prenameEn = pick(
        app.authorizedSignatoryPrenameEn,
        app.authorizedSignaturePrenameEn,
        app.authorized_signatory_prename_en,
        sigContainer?.prename_en,
        sigContainer?.prenameEn,
        app.prename_en,
        app.prenameEn,
      );
      const prenameOther = pick(
        app.authorizedSignatoryPrenameOther,
        app.authorizedSignaturePrenameOther,
        app.authorized_signatory_prename_other,
        sigContainer?.prename_other,
        sigContainer?.prenameOther,
        app.prename_other,
        app.prenameOther,
      );
      console.log("🔍 DEBUG PDF - prenameOther values checked:", {
        authorizedSignatoryPrenameOther: app.authorizedSignatoryPrenameOther,
        authorizedSignaturePrenameOther: app.authorizedSignaturePrenameOther,
        authorized_signatory_prename_other: app.authorized_signatory_prename_other,
        "sigContainer?.prename_other": sigContainer?.prename_other,
        "sigContainer?.prenameOther": sigContainer?.prenameOther,
        "app.prename_other": app.prename_other,
        "app.prenameOther": app.prenameOther,
        "final prenameOther": prenameOther,
      });

      // Possible flat fields
      const thFirst = pick(
        app.authorizedSignatoryFirstNameTh,
        app.authorizedSignatureFirstNameTh,
        app.authorizedSignatoryNameTh?.firstName,
        app.authorizedSignatureNameTh?.firstName,
        sigContainer?.first_name_th,
        sigContainer?.firstNameTh,
      );
      const thLast = pick(
        app.authorizedSignatoryLastNameTh,
        app.authorizedSignatureLastNameTh,
        app.authorizedSignatoryNameTh?.lastName,
        app.authorizedSignatureNameTh?.lastName,
        sigContainer?.last_name_th,
        sigContainer?.lastNameTh,
      );
      const enFirst = pick(
        app.authorizedSignatoryFirstNameEn,
        app.authorizedSignatureFirstNameEn,
        app.authorizedSignatoryNameEn?.firstName,
        app.authorizedSignatureNameEn?.firstName,
        sigContainer?.first_name_en,
        sigContainer?.firstNameEn,
      );
      const enLast = pick(
        app.authorizedSignatoryLastNameEn,
        app.authorizedSignatureLastNameEn,
        app.authorizedSignatoryNameEn?.lastName,
        app.authorizedSignatureNameEn?.lastName,
        sigContainer?.last_name_en,
        sigContainer?.lastNameEn,
      );

      // Resolve prename (handle "อื่นๆ"/"Other" case)
      let displayPrenameTh = "";
      let displayPrenameEn = "";

      if (prenameTh && (/^อื่นๆ$/i.test(prenameTh) || /^other$/i.test(prenameEn))) {
        displayPrenameTh = prenameOther || prenameTh;
      } else {
        displayPrenameTh = prenameTh || "";
      }

      if (prenameEn && /^other$/i.test(prenameEn)) {
        displayPrenameEn = prenameOther || prenameEn;
      } else {
        displayPrenameEn = prenameEn || "";
      }

      // Thai formatting: concatenate prename directly with first name (e.g., ดร.พลวัต)
      const firstWithPrenameTh = (displayPrenameTh || "") + (thFirst || "");
      const fullTh = [firstWithPrenameTh.trim(), thLast || ""].filter(Boolean).join(" ").trim();
      const fullEn = [displayPrenameEn, enFirst || "", enLast || ""]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (fullTh) return fullTh;
      if (fullEn) return fullEn;

      // Fallback to first representative name if present
      if (app.representatives?.[0]) {
        const r = app.representatives[0];
        const repPrenameTh = r.prename_th || r.prenameTh || "";
        const repPrenameOther = r.prename_other || r.prenameOther || "";
        const repDisplayPrename = /^อื่นๆ$/i.test(repPrenameTh) ? repPrenameOther : repPrenameTh;
        const repTh = [
          repDisplayPrename,
          r.firstNameTh || r.first_name_th || "",
          r.lastNameTh || r.last_name_th || "",
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
        const repEn =
          `${r.firstNameEn || r.firstNameEng || r.first_name_en || ""} ${r.lastNameEn || r.lastNameEng || r.last_name_en || ""}`.trim();
        return pick(repTh, repEn, r.name, app.representativeName, "ผู้มีอำนาจลงนาม");
      }
      return pick(app.representativeName, "ผู้มีอำนาจลงนาม");
    })(),
    // Compute authorized signatory position (prefer Thai, fallback to English, then representative position)
    authorizedSignatoryPosition: (() => {
      const pick = (...vals) => vals.find((v) => typeof v === "string" && v.trim());
      const posTh = pick(
        app.authorizedSignatoryPositionTh,
        app.authorizedSignaturePositionTh,
        app.authorizedSignatoryPosition?.th,
        app.authorizedSignaturePosition?.th,
      );
      const posEn = pick(
        app.authorizedSignatoryPositionEn,
        app.authorizedSignaturePositionEn,
        app.authorizedSignatoryPosition?.en,
        app.authorizedSignaturePosition?.en,
      );
      if (posTh) return posTh;
      if (posEn) return posEn;
      if (app.representatives?.[0]?.position) return app.representatives[0].position;
      return "";
    })(),
  };
};

// Create field HTML
const field = (label, value, style = "") =>
  `<div class="field" ${style}><span class="label">${label}:</span> <span class="value">${value || "-"}</span></div>`;

// Create section HTML
const section = (title, content) =>
  `<div class="section"><div class="section-title">${title}</div>${content}</div>`;

// Helper function to build signatory signature HTML with preloaded signatures
const buildSignatorySignature = (signatory, preloadedSignature, index, signatureFile) => {
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

  // Handle signature image with preloaded data or file URL fallback
  let signatureHtml = "";
  if (preloadedSignature) {
    signatureHtml = `<img src="${preloadedSignature}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`;
  } else if (signatureFile && signatureFile.fileUrl) {
    signatureHtml = `<img src="${signatureFile.fileUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" alt="Authorized Signature" />`;
  } else {
    signatureHtml = "(ลายเซ็น)";
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

// Main PDF generation function
export const generateMembershipPDF = async (
  application,
  type,
  industrialGroups = {},
  provincialChapters = {},
) => {
  try {
    const data = processData(application);
    const title = getTitleByType(type);
    const businessTypes = getBusinessTypeNames(data);
    // Helper to resolve prename for display
    const resolvePrename = (prenameTh, prenameEn, prenameOther, lang = "th") => {
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
    // Number format helper
    const nf = (v) => {
      if (v === 0 || v === "0") return "0";
      if (v === null || v === undefined || v === "") return "-";
      const n = Number(v);
      return Number.isFinite(n) ? n.toLocaleString() : String(v);
    };

    // Resolve Industrial Group & Provincial Chapter names
    let industrialGroupNames = data.industrialGroupNames || [];
    let provincialChapterNames = data.provincialChapterNames || [];

    const pickName = (obj, keys) => keys.map((k) => obj?.[k]).find(Boolean);

    if (!industrialGroupNames || industrialGroupNames.length === 0) {
      // Try from arrays with names (API provides `industryGroups`)
      if (Array.isArray(application.industryGroups)) {
        industrialGroupNames = application.industryGroups
          .map((g) => pickName(g, ["industryGroupName", "MEMBER_GROUP_NAME", "name_th", "nameTh"]))
          .filter(Boolean);
      }
      // Admin normalized data uses `industrialGroups` (not `industrialGroupIds`)
      else if (Array.isArray(data.industrialGroups)) {
        industrialGroupNames = data.industrialGroups
          .map((g) =>
            pickName(g, [
              "name",
              "industryGroupName",
              "industry_group_name",
              "MEMBER_GROUP_NAME",
              "name_th",
              "nameTh",
            ]),
          )
          .filter(Boolean);
      }
      // Legacy: Check for industrialGroupIds
      else if (Array.isArray(data.industrialGroupIds)) {
        // Case 1: Admin may provide array of objects that already include name fields
        if (data.industrialGroupIds.length > 0 && typeof data.industrialGroupIds[0] === "object") {
          industrialGroupNames = data.industrialGroupIds
            .map((g) =>
              pickName(g, [
                "industryGroupName",
                "industry_group_name",
                "MEMBER_GROUP_NAME",
                "name_th",
                "nameTh",
              ]),
            )
            .filter(Boolean);
        }
        // Case 2: Fallback to lookup arrays (ids only)
        if (!industrialGroupNames || industrialGroupNames.length === 0) {
          const groupsArr = Array.isArray(industrialGroups)
            ? industrialGroups
            : industrialGroups.data || [];
          industrialGroupNames = data.industrialGroupIds
            .map((id) => groupsArr.find((g) => g.id === id || g.MEMBER_GROUP_CODE === id))
            .map(
              (g) =>
                g && pickName(g, ["industryGroupName", "MEMBER_GROUP_NAME", "name_th", "nameTh"]),
            )
            .filter(Boolean);
        }
      }
    }

    // Preload company stamp image (if any)
    const stampUrlCandidate = data.companyStamp?.fileUrl || "";
    let companyStampImgSrc = "";
    if (stampUrlCandidate) {
      const maybeCld = transformCloudinaryUrl(stampUrlCandidate);
      console.debug("[PDF] companyStamp URL (original):", stampUrlCandidate);
      console.debug("[PDF] companyStamp URL (transformed):", maybeCld);
      const dataUrl = await loadImageAsDataURL(maybeCld);
      if (dataUrl) {
        companyStampImgSrc = dataUrl;
        console.debug("[PDF] companyStamp loaded as data URL (length):", dataUrl.length);
      } else {
        const looksLikeImg =
          /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(maybeCld) ||
          data.companyStamp?.mimeType?.startsWith?.("image/") ||
          data.companyStamp?.fileType?.startsWith?.("image/");
        if (looksLikeImg) {
          companyStampImgSrc = maybeCld;
          console.debug("[PDF] companyStamp fallback to URL");
        } else {
          console.warn("[PDF] companyStamp appears non-image, skipping <img>");
        }
      }
    }

    // Preload FTI logo as Data URL to avoid any CORS/path issues
    const logoPublicPath = "/FTI-MasterLogo_RGB_forLightBG.png";
    let logoSrc = logoPublicPath;
    try {
      const logoDataUrl = await loadImageAsDataURL(logoPublicPath);
      if (logoDataUrl) logoSrc = logoDataUrl;
    } catch (e) {
      console.warn("[PDF] failed to preload logo as data URL, fallback to public path", e);
    }

    if (!provincialChapterNames || provincialChapterNames.length === 0) {
      if (
        Array.isArray(application.provinceChapters) ||
        Array.isArray(application.provincialChapters)
      ) {
        const src = application.provinceChapters || application.provincialChapters;
        provincialChapterNames = src
          .map((c) =>
            pickName(c, ["provinceChapterName", "MEMBER_GROUP_NAME", "name_th", "nameTh"]),
          )
          .filter(Boolean);
      }
      // Admin normalized data uses `provincialChapters` (not `provincialChapterIds`)
      else if (Array.isArray(data.provincialChapters)) {
        provincialChapterNames = data.provincialChapters
          .map((c) =>
            pickName(c, [
              "name",
              "provinceChapterName",
              "province_chapter_name",
              "MEMBER_GROUP_NAME",
              "name_th",
              "nameTh",
            ]),
          )
          .filter(Boolean);
      }
      // Legacy: Check for provincialChapterIds
      else if (Array.isArray(data.provincialChapterIds)) {
        // Case 1: Admin may provide array of objects that already include name fields
        if (
          data.provincialChapterIds.length > 0 &&
          typeof data.provincialChapterIds[0] === "object"
        ) {
          provincialChapterNames = data.provincialChapterIds
            .map((c) =>
              pickName(c, [
                "provinceChapterName",
                "province_chapter_name",
                "MEMBER_GROUP_NAME",
                "name_th",
                "nameTh",
              ]),
            )
            .filter(Boolean);
        }
        // Case 2: Fallback to lookup arrays (ids only)
        if (!provincialChapterNames || provincialChapterNames.length === 0) {
          const chArr = Array.isArray(provincialChapters)
            ? provincialChapters
            : provincialChapters.data || [];
          provincialChapterNames = data.provincialChapterIds
            .map((id) => chArr.find((c) => c.id === id || c.MEMBER_GROUP_CODE === id))
            .map(
              (c) =>
                c && pickName(c, ["provinceChapterName", "MEMBER_GROUP_NAME", "name_th", "nameTh"]),
            )
            .filter(Boolean);
        }
      }
    }

    // Limit long lists to help fit within 2 pages
    const MAX_PRODUCTS_DISPLAY = 12;
    const MAX_GROUPS_DISPLAY = 10;
    const MAX_CHAPTERS_DISPLAY = 10;

    const displayProducts = Array.isArray(data.products)
      ? data.products.slice(0, MAX_PRODUCTS_DISPLAY)
      : [];
    const extraProducts =
      Array.isArray(data.products) && data.products.length > MAX_PRODUCTS_DISPLAY
        ? data.products.length - MAX_PRODUCTS_DISPLAY
        : 0;

    const displayIndustryGroups = Array.isArray(industrialGroupNames)
      ? industrialGroupNames.slice(0, MAX_GROUPS_DISPLAY)
      : [];
    const extraIndustryGroups =
      Array.isArray(industrialGroupNames) && industrialGroupNames.length > MAX_GROUPS_DISPLAY
        ? industrialGroupNames.length - MAX_GROUPS_DISPLAY
        : 0;

    const displayProvincialChapters = Array.isArray(provincialChapterNames)
      ? provincialChapterNames.slice(0, MAX_CHAPTERS_DISPLAY)
      : [];
    const extraProvincialChapters =
      Array.isArray(provincialChapterNames) && provincialChapterNames.length > MAX_CHAPTERS_DISPLAY
        ? provincialChapterNames.length - MAX_CHAPTERS_DISPLAY
        : 0;

    // Prepare applicant account info (FTI_Portal_User table fields if present)
    const applicantAccount = (() => {
      const u =
        application?.user ||
        application?.account ||
        application?.applicant ||
        application?.createdBy ||
        application?.created_by ||
        application?.createdUser ||
        null;
      if (u && typeof u === "object") {
        return {
          ...u,
          // normalize common name keys for downstream usage
          firstname: u.firstname || u.first_name || u.firstName || null,
          lastname: u.lastname || u.last_name || u.lastName || null,
          name: u.name || u.fullname || u.full_name || null,
        };
      }
      // Fallback to flat fields possibly present on application
      return {
        id:
          application?.userId ||
          application?.user_id ||
          application?.created_by_id ||
          application?.createdById,
        firstname:
          application?.userFirstName ||
          application?.firstname ||
          application?.first_name ||
          application?.firstName,
        lastname:
          application?.userLastName ||
          application?.lastname ||
          application?.last_name ||
          application?.lastName,
        name:
          application?.userName ||
          application?.username ||
          application?.name ||
          application?.full_name ||
          application?.fullName,
        email: application?.userEmail || application?.email,
        phone: application?.userPhone || application?.phone,
      };
    })();
    let applicantFullName = [
      applicantAccount?.firstname ||
        applicantAccount?.first_name ||
        applicantAccount?.firstName ||
        "",
      applicantAccount?.lastname || applicantAccount?.last_name || applicantAccount?.lastName || "",
    ]
      .join(" ")
      .trim();
    if (!applicantFullName) {
      applicantFullName = applicantAccount?.name || "";
    }
    if (!applicantFullName) {
      // final fallback to application data's applicant names
      const thai = [data.firstNameTh || "", data.lastNameTh || ""].join(" ").trim();
      const eng = [data.firstNameEn || "", data.lastNameEn || ""].join(" ").trim();
      applicantFullName = thai || eng || "";
    }

    // Preload signature images for single and multiple signatories
    const preloadSignature = async (signatureDoc) => {
      console.log("[PDF] Preloading signature image...");
      if (!signatureDoc || !signatureDoc.fileUrl) {
        console.log("[PDF] Signature document is missing or has no file URL.");
        return null;
      }

      const sigUrlCandidate = signatureDoc.fileUrl;
      const maybeCld = transformCloudinaryUrl(sigUrlCandidate);
      console.debug("[PDF] signature URL (original):", sigUrlCandidate);
      console.debug("[PDF] signature URL (transformed):", maybeCld);

      // Try to fetch as data URL first (best for CORS safety)
      const dataUrl = await loadImageAsDataURL(maybeCld);
      if (dataUrl) {
        console.debug(`[PDF] ✅ Signature successfully preloaded as data URL (${dataUrl.length} chars)`);
        return dataUrl;
      } else {
        // If fetch failed (CORS/format), fallback to raw URL if it looks like an image
        const looksLikeImg =
          /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(maybeCld) ||
          signatureDoc.mimeType?.startsWith?.("image/") ||
          signatureDoc.fileType?.startsWith?.("image/");
        if (looksLikeImg) {
          console.debug(`[PDF] ⚠️ Signature data URL failed, falling back to raw URL: ${maybeCld}`);
          return maybeCld;
        } else {
          console.warn(`[PDF] ❌ Signature appears non-image, skipping <img> for: ${maybeCld}`);
          return null;
        }
      }
    };

    // Preload single signature (fallback)
    console.debug("[PDF] authorizedSignature doc:", data.authorizedSignature);
    console.debug("[PDF] authorizedSignature fileUrl:", data.authorizedSignature?.fileUrl);
    let signatureImgSrc = "";
    if (data.authorizedSignature) {
      signatureImgSrc = await preloadSignature(data.authorizedSignature);
      console.debug("[PDF] signatureImgSrc after preload:", signatureImgSrc);
    }

    // Preload multiple signatures
    const preloadedSignatures = [];
    if (data.authorizedSignatures && Array.isArray(data.authorizedSignatures)) {
      console.debug("[PDF] Preloading", data.authorizedSignatures.length, "signature files");
      for (let i = 0; i < data.authorizedSignatures.length; i++) {
        const signatureFile = data.authorizedSignatures[i];
        const preloaded = await preloadSignature(signatureFile);
        preloadedSignatures.push(preloaded);
      }
    }

    // Simple CSS
    const styles = `
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

    // Generate HTML content
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>${styles}</style>
      </head>
      <body>
        <div class="member-number">
          หมายเลขสมาชิก:<br><br>................................................
        </div>
        <div class="created-date">
          สร้างเมื่อ: ${formatThaiDate(new Date())} ${new Date().toLocaleTimeString("th-TH")}
        </div>
        <div class="logo-wrap">
          <img src="${logoSrc}" alt="FTI Logo" crossorigin="anonymous" />
        </div>
        <div class="header">${title}</div>
        
        ${
          type === "ic"
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
              )
        }
        
        ${
          data.address2
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
              )
        }
        
        ${
          data.contactPersons?.length
            ? (() => {
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
              })()
            : ""
        }
        
        ${
          data.representatives?.length
            ? section(
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
                <div class=\"rep-box\">
                  <div class=\"rep-title\">ผู้แทน ${i + 1}</div>
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
              )
            : ""
        }
        
        
        ${
          businessTypes && businessTypes !== "-"
            ? section(
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
              )
            : ""
        }
        
        ${(() => {
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
                    ? `<div class=\"list-2col\">${dispIG.map((name) => `<div>• ${name}</div>`).join("")}${extraIG > 0 ? `<div class=\"span-all\" style=\"font-size: 9.5px; color: #666;\">... และอีก ${extraIG} รายการ</div>` : ""}</div>`
                    : "ไม่ระบุ"
                }
              </div>
              <div class="col">
                <strong>สภาอุตสาหกรรมจังหวัด:</strong><br>
                ${
                  dispPC.length
                    ? `<div class=\"list-2col\">${dispPC.map((name) => `<div>• ${name}</div>`).join("")}${extraPC > 0 ? `<div class=\"span-all\" style=\"font-size: 9.5px; color: #666;\">... และอีก ${extraPC} รายการ</div>` : ""}</div>`
                    : "• สภาอุตสาหกรรมแห่งประเทศไทย"
                }
              </div>
            </div>
          `,
          );
        })()}
        
        
        ${section(
          "ข้อมูลบัญชีผู้สมัคร",
          `
          <div class="row">
            <div class="col">${field("ชื่อ-นามสกุล", applicantFullName || "-")}</div>
            <div class="col">${field("อีเมล", applicantAccount?.email || "-")}</div>
            <div class="col">${field("โทรศัพท์", applicantAccount?.phone || "-")}</div>
          </div>
        `,
        )}

        ${
          ["oc", "ac", "am"].includes(type)
            ? (() => {
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
                      const signatureFile = authorizedSignatures[index] || null;
                      return buildSignatorySignature(signatory, preloadedSignature, index, signatureFile);
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
                            ${
                              signatureImgSrc
                                ? `<img src="${signatureImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`
                                : data.authorizedSignature?.fileUrl
                                  ? `<img src="${data.authorizedSignature.fileUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" alt="Authorized Signature" />`
                                  : "(ลายเซ็น)"
                            }
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
              })()
            : `
          <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <div style="display: flex; gap: 20px; font-size: 12px;">
              <div class="signature-box">
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">ลายเซ็นผู้มีอำนาจ</div>
                <div class="signature-img">
                  ${
                    signatureImgSrc
                      ? `<img src="${signatureImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`
                      : data.authorizedSignature?.fileUrl
                        ? `<img src="${data.authorizedSignature.fileUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" alt="Authorized Signature" />`
                        : "(ลายเซ็น)"
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
        `
        }
      </body>
      </html>
    `;

    // Create PDF
    const element = document.createElement("div");
    element.innerHTML = html;

    const opt = {
      margin: 5,
      filename: `${type?.toUpperCase()}_${data.companyNameTh || data.firstNameTh || "APPLICATION"}_${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, imageTimeout: 15000, foreignObjectRendering: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "avoid-all"] },
    };

    await html2pdf().set(opt).from(element).save();
    return { success: true, filename: opt.filename };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
};

// Download helper function
export const downloadMembershipPDF = async (application, type) => {
  // Allow calling with API response shape: { success, data, industrialGroups, provincialChapters }
  const appData = application?.data ? application.data : application;
  const lookupIndustrialGroups =
    application?.industrialGroups || application?.lookupIndustrialGroups || [];
  const lookupProvincialChapters =
    application?.provincialChapters || application?.lookupProvincialChapters || [];

  const result = await generateMembershipPDF(
    appData,
    type,
    lookupIndustrialGroups,
    lookupProvincialChapters,
  );
  if (!result.success) {
    throw new Error(result.error || "เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
  }
  return result;
};

// Export
export default {
  generateMembershipPDF,
  downloadMembershipPDF,
};
