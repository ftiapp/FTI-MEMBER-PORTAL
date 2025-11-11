// Signature data normalization utilities

// Extract authorized signature and company stamp from documents
export const findDocument = (documents, type) => {
  const aliasesMap = {
    authorizedSignature: [
      "authorizedSignature",
      "authorizedSignatures", // ⭐ เพิ่มบรรทัดนี้
      "authorized_signature",
      "authorized_signatures", // ⭐ เพิ่มบรรทัดนี้ด้วย
      "signature",
      "signatures", // ⭐ เพิ่มนี้ด้วย
      "authorizedSign",
      // Additional aliases for IC forms
      "ic_signature",
      "icSignature",
      "individual_signature",
      "individualSignature",
      "member_signature",
      "memberSignature",
    ],
    companyStamp: [
      "companyStamp",
      "company_stamp",
      "stamp"
    ],
  };
  const aliases = aliasesMap[type] || [type];
  const doc = documents.find((d) => {
    const t = (d.document_type || d.documentType || d.type || "").toString().trim();
    const tLower = t.toLowerCase();
    return aliases.some((a) => t === a || tLower === a.toLowerCase());
  });

  // Debug logging for document search
  if (type === "authorizedSignature") {
    console.debug(`[PDF] findDocument - looking for type: ${type}`);
    console.debug(`[PDF] findDocument - available document types:`, documents.map(d => d.document_type || d.documentType || d.type || "unknown"));
    console.debug(`[PDF] findDocument - found document:`, !!doc);
    if (doc) {
      console.debug(`[PDF] findDocument - document type found: ${doc.document_type || doc.documentType || doc.type}`);
      console.debug(`[PDF] findDocument - document fileUrl: ${doc.cloudinary_url || doc.file_url || doc.fileUrl || doc.file_path || doc.url}`);
    }
  }

  if (!doc) return null;
  return {
    fileUrl: doc.cloudinary_url || doc.file_url || doc.fileUrl || doc.file_path || doc.url,
    cloudinary_url: doc.cloudinary_url, // Keep original field for debugging
    mimeType: doc.mime_type || doc.mimeType || doc.type || "",
    mime_type: doc.mime_type, // Keep original field for debugging
    fileName: doc.file_name || doc.fileName || doc.name || "",
    file_name: doc.file_name, // Keep original field for debugging
  };
};

// Normalize signature-related data
export const normalizeSignatureData = (app) => {
  // Extract authorized signature and company stamp from documents if present
  let documents =
    app.documents ||
    app.memberDocuments ||
    app.MemberDocuments ||
    app.icDocuments ||
    app.ICDocuments ||
    app.member_docs ||
    app.memberDocs ||
    [];
  if (!Array.isArray(documents) && documents?.data && Array.isArray(documents.data)) {
    documents = documents.data;
  }

  // Debug logging for signature extraction
  const foundAuthorizedSignature = app.authorizedSignature || findDocument(documents, "authorizedSignature") || null;
  console.debug("[PDF] Signature normalization - documents found:", documents?.length || 0);
  console.debug("[PDF] Signature normalization - authorizedSignature from app:", !!app.authorizedSignature);
  console.debug("[PDF] Signature normalization - authorizedSignature from documents:", !!findDocument(documents, "authorizedSignature"));
  console.debug("[PDF] Signature normalization - final authorizedSignature:", !!foundAuthorizedSignature);
  
  // Also check for companyStamp in multiple places
  const foundCompanyStamp = app.companyStamp || app.company_stamp || findDocument(documents, "companyStamp") || null;
  console.debug("[PDF] Signature normalization - companyStamp from app:", !!app.companyStamp);
  console.debug("[PDF] Signature normalization - company_stamp from app:", !!app.company_stamp);
  console.debug("[PDF] Signature normalization - companyStamp from documents:", !!findDocument(documents, "companyStamp"));
  console.debug("[PDF] Signature normalization - final companyStamp:", !!foundCompanyStamp);

  return {
    // Documents
    authorizedSignature: foundAuthorizedSignature,
    companyStamp: foundCompanyStamp,
    // Multiple signatories data (for OC forms)
    signatories: app.signatories || [],
    signatureNames: app.signatureNames || [], // From MemberRegist_OC_Signature_Name table
    authorizedSignatures: app.authorizedSignatures || app.authorized_signatures || [], // Array of signature files
  };
};

// Compute authorized signatory name WITH PRENAME (prefer Thai, fallback to English, then representative)
export const normalizeAuthorizedSignatoryName = (app) => {
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
};

// Compute authorized signatory position (prefer Thai, fallback to English, then representative position)
export const normalizeAuthorizedSignatoryPosition = (app) => {
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
};
