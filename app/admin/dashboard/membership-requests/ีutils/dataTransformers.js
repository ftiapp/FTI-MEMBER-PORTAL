import { MEMBER_TYPES, BUSINESS_TYPES, DOCUMENT_TYPES, FACTORY_TYPES, STATUS } from "./constants";

const normalizeSignatories = (application) => {
  // Check for new signatories array structure
  let signatories = application.signatories || [];

  // If we have the old single signature structure, convert it to array
  if (!signatories || signatories.length === 0) {
    const oldSignature =
      application.signatureName || application.signature_name || application.signature;
    if (oldSignature) {
      signatories = [
        {
          prenameTh: oldSignature.prenameTh || oldSignature.prename_th,
          prenameOther: oldSignature.prenameOther || oldSignature.prename_other,
          firstNameTh: oldSignature.firstNameTh || oldSignature.first_name_th,
          lastNameTh: oldSignature.lastNameTh || oldSignature.last_name_th,
          positionTh: oldSignature.positionTh || oldSignature.position_th,
          // Also include snake_case for compatibility
          prename_th: oldSignature.prename_th || oldSignature.prenameTh,
          prename_other: oldSignature.prename_other || oldSignature.prenameOther,
          first_name_th: oldSignature.first_name_th || oldSignature.firstNameTh,
          last_name_th: oldSignature.last_name_th || oldSignature.lastNameTh,
          position_th: oldSignature.position_th || oldSignature.positionTh,
        },
      ];
    }
  }

  return signatories.map((signatory, index) => ({
    ...signatory,
    // Ensure both camelCase and snake_case are available
    prenameTh: signatory.prenameTh || signatory.prename_th,
    prenameOther: signatory.prenameOther || signatory.prename_other,
    firstNameTh: signatory.firstNameTh || signatory.first_name_th,
    lastNameTh: signatory.lastNameTh || signatory.last_name_th,
    positionTh: signatory.positionTh || signatory.position_th,
    prename_th: signatory.prename_th || signatory.prenameTh,
    prename_other: signatory.prename_other || signatory.prenameOther,
    first_name_th: signatory.first_name_th || signatory.firstNameTh,
    last_name_th: signatory.last_name_th || signatory.lastNameTh,
    position_th: signatory.position_th || signatory.positionTh,
  }));
};

const normalizeSignatureName = (signature) => {
  if (!signature) return null;

  const prenameTh = signature.prenameTh ?? signature.prename_th ?? null;
  const prenameOther = signature.prenameOther ?? signature.prename_other ?? null;
  const firstNameTh = signature.firstNameTh ?? signature.first_name_th ?? null;
  const lastNameTh = signature.lastNameTh ?? signature.last_name_th ?? null;
  const positionTh = signature.positionTh ?? signature.position_th ?? null;

  const prenameEn = signature.prenameEn ?? signature.prename_en ?? null;
  const prenameOtherEn = signature.prenameOtherEn ?? signature.prename_other_en ?? null;
  const firstNameEn = signature.firstNameEn ?? signature.first_name_en ?? null;
  const lastNameEn = signature.lastNameEn ?? signature.last_name_en ?? null;
  const positionEn = signature.positionEn ?? signature.position_en ?? null;

  return {
    prenameTh,
    prenameOther,
    firstNameTh,
    lastNameTh,
    positionTh,
    prenameEn,
    prenameOtherEn,
    firstNameEn,
    lastNameEn,
    positionEn,
    prename_th: prenameTh,
    prename_other: prenameOther,
    first_name_th: firstNameTh,
    last_name_th: lastNameTh,
    position_th: positionTh,
    prename_en: prenameEn,
    prename_other_en: prenameOtherEn,
    first_name_en: firstNameEn,
    last_name_en: lastNameEn,
    position_en: positionEn,
  };
};

export const normalizeApplicationData = (application, type) => {
  if (!application) return null;

  // Map numeric status to string status for UI
  let statusString = STATUS.PENDING;
  const rawStatus = application.status;
  if (typeof rawStatus === "number") {
    if (rawStatus === 1) statusString = STATUS.APPROVED;
    else if (rawStatus === 2) statusString = STATUS.REJECTED;
    else if (rawStatus === 4)
      statusString = STATUS.RESUBMITTED; // 4 = Resubmitted
    else statusString = STATUS.PENDING;
  } else if (typeof rawStatus === "string") {
    const s = rawStatus.toLowerCase();
    if (s === "approved" || s === "1") statusString = STATUS.APPROVED;
    else if (s === "rejected" || s === "2") statusString = STATUS.REJECTED;
    else if (s === "resubmitted" || s === "4") statusString = STATUS.RESUBMITTED;
    else statusString = STATUS.PENDING;
  }

  // Normalize field names to consistent format
  return {
    // Basic Info
    id: application.id,
    type: type || application.type,
    status: statusString,
    memberCode: application.member_code || application.memberCode,

    // Personal/Company Info (from FTI_Portal_User table)
    firstNameTh: application.first_name_th || application.firstNameTh || application.firstname,
    lastNameTh: application.last_name_th || application.lastNameTh || application.lastname,
    firstNameEn: application.first_name_en || application.firstNameEn,
    lastNameEn: application.last_name_en || application.lastNameEn,
    companyNameTh:
      application.company_name_th || application.companyNameTh || application.associationNameTh,
    companyNameEn:
      application.company_name_en || application.companyNameEn || application.associationNameEn,

    // IDs
    idCard: application.id_card_number || application.idCard,
    taxId: application.tax_id || application.taxId,

    // Contact
    email: application.email || application.company_email || application.companyEmail,
    phone: application.phone || application.company_phone || application.companyPhone,
    website: application.website || application.company_website || application.companyWebsite,

    // Company Details
    numberOfEmployees: application.number_of_employees || application.numberOfEmployees,
    numberOfMembers: application.number_of_member || application.numberOfMember,
    factoryType: application.factory_type || application.factoryType,

    // Financial
    registeredCapital: application.registered_capital || application.registeredCapital,
    productionCapacityValue:
      application.production_capacity_value || application.productionCapacityValue,
    productionCapacityUnit:
      application.production_capacity_unit || application.productionCapacityUnit,
    salesDomestic: application.sales_domestic || application.salesDomestic,
    salesExport: application.sales_export || application.salesExport,
    shareholderThaiPercent:
      application.shareholder_thai_percent || application.shareholderThaiPercent,
    shareholderForeignPercent:
      application.shareholder_foreign_percent || application.shareholderForeignPercent,
    revenueLastYear: application.revenue_last_year || application.revenueLastYear,
    revenuePreviousYear: application.revenue_previous_year || application.revenuePreviousYear,

    // Address - support multiple address types
    address: normalizeAddress(application),
    addresses: normalizeAllAddresses(application),

    // Groups
    industrialGroups: normalizeIndustrialGroups(application),
    provincialChapters: normalizeProvincialChapters(application),

    // Business
    businessTypes: normalizeBusinessTypes(application),
    products: normalizeProducts(application),

    // People
    representatives: normalizeRepresentatives(application),
    contactPerson: normalizeContactPerson(application),
    contactPersons: normalizeContactPersons(application),

    // Documents
    documents: normalizeDocuments(application),

    // Authorized Signatories - support multiple signatories
    signatories: normalizeSignatories(application),
    signatureName: normalizeSignatureName(
      application.signatureName || application.signature_name || application.signature,
    ),

    // Admin
    adminNote: application.adminNote || application.admin_note,
    adminNoteAt: application.adminNoteAt || application.admin_note_at,
    approvedByAdminName: application.approved_by_admin_name,
    approvedAt: application.approved_at,
    mainApprovedAt: application.main_approved_at,
    mainApprovedBy: application.main_approved_by,

    // Timestamps
    createdAt: application.created_at || application.createdAt,
    updatedAt: application.updated_at || application.updatedAt,
  };
};

export const normalizeAddress = (data) => {
  if (!data) return null;

  // Check if addresses array exists - prioritize address_type '2' (company address)
  if (data.addresses && Array.isArray(data.addresses)) {
    const companyAddress = data.addresses.find((addr) => String(addr.address_type) === "2");
    const factoryAddress = data.addresses.find((addr) => String(addr.address_type) === "1");
    const otherAddress = data.addresses.find((addr) => String(addr.address_type) === "3");

    // Return company address first, then factory, then other
    const selectedAddress = companyAddress || factoryAddress || otherAddress || data.addresses[0];
    if (selectedAddress) {
      return {
        addressType: String(selectedAddress.address_type),
        building: selectedAddress.building,
        addressNumber:
          selectedAddress.address_number ||
          selectedAddress.addressNumber ||
          selectedAddress.house_number,
        moo: selectedAddress.moo,
        soi: selectedAddress.soi,
        street: selectedAddress.street || selectedAddress.road,
        subDistrict:
          selectedAddress.sub_district ||
          selectedAddress.subDistrict ||
          selectedAddress.subdistrict,
        district: selectedAddress.district,
        province: selectedAddress.province,
        postalCode:
          selectedAddress.postal_code ||
          selectedAddress.postalCode ||
          selectedAddress.zipcode ||
          selectedAddress.zip_code,
        phone: selectedAddress.phone,
        phoneExtension: selectedAddress.phone_extension,
        email: selectedAddress.email,
        website: selectedAddress.website,
      };
    }
  }

  // Fallback to direct fields
  return {
    addressNumber: data.address_number || data.addressNumber || data.house_number,
    moo: data.moo,
    soi: data.soi,
    street: data.street || data.road,
    subDistrict: data.sub_district || data.subDistrict || data.subdistrict,
    district: data.district,
    province: data.province,
    postalCode: data.postal_code || data.postalCode || data.zipcode || data.zip_code,
    phone: data.phone,
    email: data.email,
    website: data.website,
  };
};

export const normalizeAllAddresses = (data) => {
  if (!data) return [];

  const addressTypes = {
    1: "ที่อยู่สำนักงาน",
    2: "ที่อยู่จัดส่งเอกสาร",
    3: "ที่อยู่ใบกำกับภาษี",
  };

  // Check if addresses array exists
  if (data.addresses && Array.isArray(data.addresses)) {
    return data.addresses
      .map((addr) => {
        const typeStr = String(addr.address_type ?? addr.addressType ?? "");
        return {
          addressType: typeStr,
          addressTypeName: addressTypes[typeStr] || `ที่อยู่ประเภท ${typeStr}`,
          building: addr.building,
          addressNumber: addr.address_number || addr.addressNumber || addr.house_number,
          moo: addr.moo,
          soi: addr.soi,
          street: addr.street || addr.road,
          subDistrict: addr.sub_district || addr.subDistrict || addr.subdistrict,
          district: addr.district,
          province: addr.province,
          postalCode: addr.postal_code || addr.postalCode || addr.zipcode || addr.zip_code,
          phone: addr.phone,
          phoneExtension: addr.phone_extension,
          email: addr.email,
          website: addr.website,
        };
      })
      .sort((a, b) => String(a.addressType).localeCompare(String(b.addressType))); // Sort by type
  }

  return [];
};

export const normalizeIndustrialGroups = (application) => {
  const groups =
    application.industrialGroups ||
    application.industrialGroupIds ||
    application.industrial_groups ||
    [];

  return groups.map((group) => ({
    id: group.id || group.industry_group_id || group,
    name: group.industry_group_name || group.name || null,
  }));
};

export const normalizeProvincialChapters = (application) => {
  const chapters =
    application.provincialChapters ||
    application.provincialChapterIds ||
    application.provincial_chapters ||
    [];

  return chapters.map((chapter) => ({
    id: chapter.id || chapter.province_chapter_id || chapter,
    name: chapter.province_chapter_name || chapter.name || null,
  }));
};

export const normalizeBusinessTypes = (application) => {
  const types = application.businessTypes || application.business_types || [];

  if (Array.isArray(types)) {
    return types.map((type) => {
      const typeKey = typeof type === "string" ? type : type.business_type || type.type;
      const mainId = typeof type === "object" ? type.main_id : null;

      // Handle 'other' type with detail
      if (typeKey === "other" && application.businessTypeOther) {
        let otherDetail = "";
        if (Array.isArray(application.businessTypeOther)) {
          const found = mainId
            ? application.businessTypeOther.find((o) => o.main_id === mainId)
            : application.businessTypeOther[0];
          otherDetail = found?.detail || found?.description || "";
        } else {
          otherDetail = application.businessTypeOther.detail || application.businessTypeOther;
        }
        return { type: "other", detail: otherDetail };
      }

      return { type: typeKey };
    });
  }

  // Handle object format
  if (typeof types === "object") {
    return Object.entries(types)
      .filter(([_, value]) => value)
      .map(([key]) => {
        if (key === "other" && application.businessTypeOther) {
          const detail =
            typeof application.businessTypeOther === "string"
              ? application.businessTypeOther
              : application.businessTypeOther.detail || "";
          return { type: "other", detail };
        }
        return { type: key };
      });
  }

  return [];
};

export const normalizeProducts = (application) => {
  const products = application.products || [];
  return products.map((product) => ({
    nameTh: product.name_th || product.nameTh,
    nameEn: product.name_en || product.nameEn,
  }));
};

export const normalizeRepresentatives = (application) => {
  const reps = application.representatives || application.reps || application.representative || [];

  const normalizedReps = Array.isArray(reps) ? reps : [reps];

  return normalizedReps.map((rep) => ({
    id: rep.id || rep.rep_id || null,
    // Prename fields (Thai/EN + other) - expose both camelCase and snake_case for UI compatibility
    prenameTh: rep.prenameTh || rep.prename_th || null,
    prenameEn: rep.prenameEn || rep.prename_en || null,
    prenameOther: rep.prenameOther || rep.prename_other || null,
    prenameOtherEn: rep.prenameOtherEn || rep.prename_other_en || null,
    prename_th: rep.prename_th || rep.prenameTh || null,
    prename_en: rep.prename_en || rep.prenameEn || null,
    prename_other: rep.prename_other || rep.prenameOther || null,
    prename_other_en: rep.prename_other_en || rep.prenameOtherEn || null,
    firstNameTh: rep.first_name_th || rep.firstNameTh,
    lastNameTh: rep.last_name_th || rep.lastNameTh,
    firstNameEn: rep.first_name_en || rep.firstNameEn,
    lastNameEn: rep.last_name_en || rep.lastNameEn,
    position: rep.position,
    phone: rep.phone,
    phoneExtension: rep.phone_extension || rep.phoneExtension,
    email: rep.email,
    isPrimary:
      rep.isPrimary === true ||
      rep.is_primary === 1 ||
      rep.is_primary === true ||
      rep.rep_order === 1 ||
      rep.repOrder === 1,
    is_primary:
      rep.is_primary !== undefined
        ? rep.is_primary
        : rep.isPrimary === true || rep.rep_order === 1 || rep.repOrder === 1
          ? 1
          : 0,
    order: rep.order || rep.rep_order || rep.repOrder || (rep.is_primary === 1 ? 1 : 2),
    rep_order: rep.rep_order || rep.repOrder || rep.order || (rep.is_primary === 1 ? 1 : 2),
  }));
};

export const normalizeContactPerson = (application) => {
  // Try various possible locations for contact person data
  let contact = application.contactPerson || application.contact_person || application.contact;

  // Handle case where contactPerson is an array from API
  if (Array.isArray(contact)) {
    contact = contact[0]; // Take first contact person
  }

  if (!contact && application.contactPersons) {
    contact = Array.isArray(application.contactPersons)
      ? application.contactPersons[0]
      : application.contactPersons;
  }

  if (!contact && application.representatives) {
    const reps = normalizeRepresentatives(application);
    contact = reps.find((r) => r.isPrimary) || reps[0];
  }

  if (!contact) return null;

  return {
    // prename support (both snake and camel for UI compatibility)
    prename_th:
      contact.prename_th ||
      contact.prenameTh ||
      contact.title_th ||
      contact.titleTh ||
      contact.title ||
      null,
    prename_en:
      contact.prename_en || contact.prenameEn || contact.title_en || contact.titleEn || null,
    prename_other: contact.prename_other || contact.prenameOther || null,
    prename_other_en: contact.prename_other_en || contact.prenameOtherEn || null,
    // also expose camelCase for components that prefer it
    prenameTh:
      contact.prenameTh ||
      contact.prename_th ||
      contact.titleTh ||
      contact.title_th ||
      contact.title ||
      null,
    prenameEn:
      contact.prenameEn || contact.prename_en || contact.titleEn || contact.title_en || null,
    prenameOther: contact.prenameOther || contact.prename_other || null,
    prenameOtherEn: contact.prenameOtherEn || contact.prename_other_en || null,
    firstNameTh: contact.first_name_th || contact.firstNameTh,
    lastNameTh: contact.last_name_th || contact.lastNameTh,
    firstNameEn: contact.first_name_en || contact.firstNameEn,
    lastNameEn: contact.last_name_en || contact.lastNameEn,
    position: contact.position,
    phone: contact.phone,
    phoneExtension: contact.phone_extension || contact.phoneExtension,
    email: contact.email,
    typeContactId: contact.type_contact_id || contact.typeContactId,
    typeContactName: contact.type_contact_name || contact.typeContactName,
    typeContactOtherDetail: contact.type_contact_other_detail || contact.typeContactOtherDetail,
  };
};

// New function to normalize multiple contact persons
export const normalizeContactPersons = (application) => {
  // Try various possible locations for contact person data
  let contacts = [];

  // Check for contactPersons array first
  if (application.contactPersons && Array.isArray(application.contactPersons)) {
    contacts = application.contactPersons;
  }
  // Check for contact_persons array (snake_case)
  else if (application.contact_persons && Array.isArray(application.contact_persons)) {
    contacts = application.contact_persons;
  }
  // Check for AM specific table data
  else if (application.am_contact_persons && Array.isArray(application.am_contact_persons)) {
    contacts = application.am_contact_persons;
  }
  // Check for OC specific table data
  else if (application.oc_contact_persons && Array.isArray(application.oc_contact_persons)) {
    contacts = application.oc_contact_persons;
  }
  // Check for AC specific table data
  else if (application.ac_contact_persons && Array.isArray(application.ac_contact_persons)) {
    contacts = application.ac_contact_persons;
  }
  // Check for IC specific table data
  else if (application.ic_contact_persons && Array.isArray(application.ic_contact_persons)) {
    contacts = application.ic_contact_persons;
  }
  // If we have a single contactPerson, convert it to array
  else if (application.contactPerson || application.contact_person) {
    const contact = application.contactPerson || application.contact_person;
    contacts = [contact];
  }

  // If still no contacts, try to use representatives as fallback
  if (contacts.length === 0 && application.representatives) {
    const reps = normalizeRepresentatives(application);
    if (reps.length > 0) {
      contacts = reps;
    }
  }

  // Map each contact to normalized format
  return contacts.map((contact) => ({
    // prename support
    prename_th:
      contact.prename_th ||
      contact.prenameTh ||
      contact.title_th ||
      contact.titleTh ||
      contact.title ||
      null,
    prename_en:
      contact.prename_en || contact.prenameEn || contact.title_en || contact.titleEn || null,
    prename_other: contact.prename_other || contact.prenameOther || null,
    prename_other_en: contact.prename_other_en || contact.prenameOtherEn || null,
    prenameTh:
      contact.prenameTh ||
      contact.prename_th ||
      contact.titleTh ||
      contact.title_th ||
      contact.title ||
      null,
    prenameEn:
      contact.prenameEn || contact.prename_en || contact.titleEn || contact.title_en || null,
    prenameOther: contact.prenameOther || contact.prename_other || null,
    prenameOtherEn: contact.prenameOtherEn || contact.prename_other_en || null,
    firstNameTh: contact.first_name_th || contact.firstNameTh,
    lastNameTh: contact.last_name_th || contact.lastNameTh,
    firstNameEn: contact.first_name_en || contact.firstNameEn,
    lastNameEn: contact.last_name_en || contact.lastNameEn,
    position: contact.position,
    phone: contact.phone,
    phoneExtension: contact.phone_extension || contact.phoneExtension,
    email: contact.email,
    typeContactId: contact.type_contact_id || contact.typeContactId,
    typeContactName: contact.type_contact_name || contact.typeContactName,
    typeContactOtherDetail: contact.type_contact_other_detail || contact.typeContactOtherDetail,
  }));
};

export const normalizeDocuments = (application) => {
  // Accept multiple possible sources for documents across types
  const docs =
    application.documents ||
    application.memberDocuments ||
    application.MemberDocuments ||
    application.member_docs ||
    application.memberDocs ||
    application.ic_documents ||
    application.icDocuments ||
    application.ac_documents ||
    application.oc_documents ||
    application.am_documents ||
    [];

  // Also check for multiple signature files
  const signatureDocs = application.authorizedSignatures || [];

  const allDocs = [
    ...(Array.isArray(docs) ? docs : [docs]),
    ...(Array.isArray(signatureDocs) ? signatureDocs : [signatureDocs]),
  ];

  return allDocs.map((doc) => ({
    // Preserve identifiers for admin actions like delete/replace
    id: doc.id || doc.document_id || doc.doc_id,
    mainId: doc.main_id || doc.application_id || doc.mainId,
    cloudinaryId: doc.cloudinary_id || doc.public_id || doc.cloudinaryId,

    type: doc.document_type || doc.type,
    name: doc.document_name || doc.name || doc.file_name || getDocumentDisplayName(doc),
    filePath: doc.file_path || doc.filePath,
    // Prefer explicit file_url, then cloudinary_url, then generic url
    fileUrl: doc.file_url || doc.fileUrl || doc.cloudinary_url || doc.url,
    mimeType: doc.mime_type || doc.mimeType || doc.type,
  }));
};

export const getDocumentDisplayName = (doc) => {
  if (doc.document_name || doc.name) {
    return doc.document_name || doc.name;
  }
  return DOCUMENT_TYPES[doc.document_type || doc.type] || "เอกสารแนบ";
};

// Fixed function to safely render business type names
export const getBusinessTypeName = (type) => {
  if (typeof type === "object" && type !== null) {
    if (type.type === "other") {
      return `อื่นๆ: ${type.detail || "ไม่ระบุ"}`;
    }
    return BUSINESS_TYPES[type.type] || String(type.type);
  }
  return BUSINESS_TYPES[type] || String(type);
};

// Fixed function to safely render factory type names
export const getFactoryTypeName = (type) => {
  return FACTORY_TYPES[type] || "-";
};

// Fixed function to safely render member type info
export const getMemberTypeInfo = (type) => {
  return MEMBER_TYPES[type] || { code: "N/A", name: "ไม่ทราบประเภท" };
};

// Helper function to safely render any value
export const safeRender = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

// Helper function to format arrays for display
export const formatArrayForDisplay = (array, keyToShow = "name") => {
  if (!Array.isArray(array) || array.length === 0) {
    return "-";
  }

  return array
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        return item[keyToShow] || item.name || item.id || JSON.stringify(item);
      }
      return String(item);
    })
    .join(", ");
};
