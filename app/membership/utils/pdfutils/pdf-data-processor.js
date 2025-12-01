// pdf-data-processor.js - ประมวลผลข้อมูล

import { DOCUMENT_ALIASES } from "./pdf-config.js";
import { resolvePrename, pickName } from "./pdf-utils.js";

// Find document by type
const findDocument = (documents, type) => {
  const aliases = DOCUMENT_ALIASES[type] || [type];

  const matchedDocs = documents.filter((d) => {
    const t = (d.document_type || d.documentType || d.type || "").toString().trim();
    const tLower = t.toLowerCase();
    return aliases.some((a) => t === a || tLower === a.toLowerCase());
  });

  if (matchedDocs.length === 0) return null;

  // Multiple signatures
  if (matchedDocs.length > 1 && type === "authorizedSignature") {
    return matchedDocs.map((doc) => ({
      fileUrl: doc.cloudinary_url || doc.file_url || doc.fileUrl || doc.file_path || doc.url,
      mimeType: doc.mime_type || doc.mimeType || doc.type || "",
      fileName: doc.file_name || doc.fileName || doc.name || "",
      signatureNameId: doc.signature_name_id || doc.signatureNameId,
    }));
  }

  // Single document
  const doc = matchedDocs[0];
  return {
    fileUrl: doc.cloudinary_url || doc.file_url || doc.fileUrl || doc.file_path || doc.url,
    mimeType: doc.mime_type || doc.mimeType || doc.type || "",
    fileName: doc.file_name || doc.fileName || doc.name || "",
    signatureNameId: doc.signature_name_id || doc.signatureNameId,
  };
};

// Process address data
const processAddress = (addresses, type) => {
  if (!addresses) return null;

  let raw = null;
  if (Array.isArray(addresses)) {
    raw = addresses.find(
      (addr) =>
        addr.address_type === type ||
        addr.addressType === type ||
        addr.addressTypeId === parseInt(type),
    );
  } else if (typeof addresses === "object" && addresses[type]) {
    raw = addresses[type];
  }

  if (!raw) return null;

  return {
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
};

// Process application data
export const processApplicationData = (app) => {
  // Company names
  let companyNameTh =
    app.company_name_th || app.companyNameTh || app.associationName || app.associationNameTh;
  let companyNameEn =
    app.company_name_en || app.companyNameEn || app.associationNameEng || app.associationNameEn;

  if (companyNameTh === "-" || !companyNameTh) {
    companyNameTh = app.companyName || app.name || app.company_name || "-";
  }
  if (companyNameEn === "-" || !companyNameEn) {
    companyNameEn = app.companyNameEng || app.nameEng || app.company_name_eng || "-";
  }

  // Documents
  let documents =
    app.documents ||
    app.memberDocs ||
    app.MemberDocuments ||
    app.icDocuments ||
    app.ICDocuments ||
    app.member_docs ||
    [];

  if (!Array.isArray(documents) && documents?.data && Array.isArray(documents.data)) {
    documents = documents.data;
  }

  console.debug("[PDF] Processing documents:", documents?.length || 0);

  const findDoc = (type) => findDocument(documents, type);

  // Address type 2 contact info
  let addressType2Phone = "";
  let addressType2PhoneExt = "";
  let addressType2Email = "";
  let addressType2Website = "";

  if (app.addresses) {
    const addr2 = processAddress(app.addresses, "2");
    if (addr2) {
      if (Array.isArray(app.addresses)) {
        const raw = app.addresses.find(
          (a) => a.address_type === "2" || a.addressType === "2" || a.addressTypeId === 2,
        );
        addressType2Phone = raw?.phone || "";
        addressType2PhoneExt = raw?.phone_extension || raw?.phoneExtension || "";
        addressType2Email = raw?.email || "";
        addressType2Website = raw?.website || "";
      } else if (typeof app.addresses === "object" && app.addresses["2"]) {
        const raw = app.addresses["2"];
        addressType2Phone = raw.phone || "";
        addressType2PhoneExt = raw.phone_extension || raw.phoneExtension || "";
        addressType2Email = raw.email || "";
        addressType2Website = raw.website || "";
      }
    }
  }

  // Fallback: if address type 2 contact fields are still empty, use base contact info
  if (!addressType2Phone) {
    addressType2Phone = app.phone || app.tel || app.telephone || app.contactPhone || "";
  }
  if (!addressType2Email) {
    addressType2Email = app.email || app.contactEmail || "";
  }
  if (!addressType2Website) {
    addressType2Website = app.website || app.site || app.web || "";
  }

  // Base address
  let baseAddress = {
    number: app.address_number || app.addressNumber || app.address?.addressNumber,
    moo: app.moo || app.address?.moo,
    soi: app.soi || app.address?.soi,
    street: app.STreet || app.street || app.road || app.address?.STreet || app.address?.street,
    subDistrict: app.sub_district || app.subDistrict || app.address?.subDistrict,
    district: app.district || app.address?.district,
    province: app.province || app.address?.province,
    postalCode: app.postal_code || app.postalCode || app.address?.postalCode,
  };

  if (!baseAddress.number && app.addresses) {
    const addr1 = processAddress(app.addresses, "1");
    if (addr1) baseAddress = addr1;
  }

  // Signatures
  const authorizedSignature = (() => {
    const sig = app.authorizedSignature || findDoc("authorizedSignature") || null;
    if (Array.isArray(sig) && sig.length > 0) {
      return sig[0];
    }
    return sig;
  })();

  const authorizedSignatures = (() => {
    let sigs = app.authorizedSignatures || [];
    if (!sigs || sigs.length === 0) {
      const foundSigs = findDoc("authorizedSignature");
      if (Array.isArray(foundSigs)) {
        sigs = foundSigs;
      } else if (foundSigs) {
        sigs = [foundSigs];
      }
    }

    // Find numbered signatures
    const additionalSigs = documents
      .filter((d) => {
        const type = (d.document_type || d.documentType || d.type || "").toString();
        return /^authorizedSignature\d+$/.test(type);
      })
      .map((doc) => ({
        fileUrl: doc.cloudinary_url || doc.file_url || doc.fileUrl || doc.file_path || doc.url,
        mimeType: doc.mime_type || doc.mimeType || doc.type || "",
        fileName: doc.file_name || doc.fileName || doc.name || "",
        signatureNameId: doc.signature_name_id || doc.signatureNameId,
      }));

    if (additionalSigs.length > 0) {
      sigs = [...sigs, ...additionalSigs];
    }

    return sigs;
  })();

  const companyStamp = app.companyStamp || findDoc("companyStamp") || null;

  // Representatives
  let representatives = app.representatives || app.reps || [];
  if (!representatives || representatives.length === 0) {
    if (app.representative) {
      representatives = [app.representative];
    }
  }
  if (!Array.isArray(representatives)) {
    representatives = representatives ? [representatives] : [];
  }

  // Authorized signatory name
  const authorizedSignatoryName = (() => {
    const pick = (...vals) => vals.find((v) => typeof v === "string" && v.trim());

    const sigContainer =
      [
        app.signatureName,
        app.authorizedSignatureName,
        app.authorized_signature_name,
        app.signature_name,
      ].find((c) => c && typeof c === "object") || null;

    const prenameTh = pick(
      app.authorizedSignatoryPrenameTh,
      sigContainer?.prename_th,
      sigContainer?.prenameTh,
      app.prename_th,
      app.prenameTh,
    );
    const prenameEn = pick(
      app.authorizedSignatoryPrenameEn,
      sigContainer?.prename_en,
      sigContainer?.prenameEn,
      app.prename_en,
      app.prenameEn,
    );
    const prenameOther = pick(
      app.authorizedSignatoryPrenameOther,
      sigContainer?.prename_other,
      sigContainer?.prenameOther,
      app.prename_other,
      app.prenameOther,
    );

    const thFirst = pick(
      app.authorizedSignatoryFirstNameTh,
      sigContainer?.first_name_th,
      sigContainer?.firstNameTh,
    );
    const thLast = pick(
      app.authorizedSignatoryLastNameTh,
      sigContainer?.last_name_th,
      sigContainer?.lastNameTh,
    );
    const enFirst = pick(
      app.authorizedSignatoryFirstNameEn,
      sigContainer?.first_name_en,
      sigContainer?.firstNameEn,
    );
    const enLast = pick(
      app.authorizedSignatoryLastNameEn,
      sigContainer?.last_name_en,
      sigContainer?.lastNameEn,
    );

    const displayPrenameTh = resolvePrename(prenameTh, prenameEn, prenameOther, "th");
    const displayPrenameEn = resolvePrename(prenameTh, prenameEn, prenameOther, "en");

    const fullTh = [displayPrenameTh + (thFirst || ""), thLast || ""]
      .filter(Boolean)
      .join(" ")
      .trim();
    const fullEn = [displayPrenameEn, enFirst || "", enLast || ""].filter(Boolean).join(" ").trim();

    if (fullTh) return fullTh;
    if (fullEn) return fullEn;

    if (representatives[0]) {
      const r = representatives[0];
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
        `${r.firstNameEn || r.first_name_en || ""} ${r.lastNameEn || r.last_name_en || ""}`.trim();
      return pick(repTh, repEn, r.name, "ผู้มีอำนาจลงนาม");
    }
    return "ผู้มีอำนาจลงนาม";
  })();

  const authorizedSignatoryPosition = (() => {
    const pick = (...vals) => vals.find((v) => typeof v === "string" && v.trim());
    const posTh = pick(app.authorizedSignatoryPositionTh, app.authorizedSignaturePositionTh);
    const posEn = pick(app.authorizedSignatoryPositionEn, app.authorizedSignaturePositionEn);
    if (posTh) return posTh;
    if (posEn) return posEn;
    if (representatives[0]?.position) return representatives[0].position;
    return "";
  })();

  return {
    ...app,
    companyNameTh,
    companyNameEn,
    taxId: app.tax_id || app.taxId,
    numberOfEmployees:
      app.number_of_employees ?? app.numberOfEmployees ?? app.employee_count ?? null,
    prenameTh: app.prename_th || app.prenameTh,
    prenameEn: app.prename_en || app.prenameEn,
    prenameOther: app.prename_other || app.prenameOther,
    firstNameTh: app.first_name_th || app.firstNameTh,
    lastNameTh: app.last_name_th || app.lastNameTh,
    firstNameEn: app.first_name_en || app.firstNameEn,
    lastNameEn: app.last_name_en || app.lastNameEn,
    idCard:
      app.id_card_number || app.idCardNumber || app.idCard || app.id_card || app.citizen_id || "-",
    // Contact info (base)
    phone: app.phone || app.tel || app.telephone || app.contactPhone || null,
    email: app.email || app.contactEmail || null,
    website: app.website || app.site || app.web || null,
    phoneExtension: app.phone_extension || app.phoneExtension,
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
    authorizedSignature,
    authorizedSignatures,
    companyStamp,
    signatories: app.signatories || [],
    signatureNames: app.signatureNames || [],
    representatives,
    addressType2Phone,
    addressType2PhoneExt,
    addressType2Email,
    addressType2Website,
    address2: processAddress(app.addresses, "2"),
    authorizedSignatoryName,
    authorizedSignatoryPosition,
  };
};
