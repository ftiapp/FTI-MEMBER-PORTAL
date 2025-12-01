/**
 * Centralized Rejection Data Mappers
 * Maps rejection data from history tables to form data format
 * Supports all membership types: OC, AC, AM, IC
 */

/**
 * Helper function to create file object from URL
 */
const getFileObject = (docUrl) =>
  docUrl ? { name: `Existing File - ${docUrl.split("/").pop()}`, url: docUrl } : null;

/**
 * Convert addresses array to object format for AddressSection
 * AddressSection expects: { "1": {...}, "2": {...}, "3": {...} }
 */
function convertAddressesToObject(addresses) {
  const addressesObj = {};
  addresses.forEach((addr, idx) => {
    const tabKey = String(idx + 1);
    addressesObj[tabKey] = {
      addressType: addr.address_type || tabKey,
      addressNumber: addr.address_number || "",
      moo: addr.moo || "",
      soi: addr.soi || "",
      street: addr.street || "",
      subDistrict: addr.sub_district || "",
      district: addr.district || "",
      province: addr.province || "",
      postalCode: addr.postal_code || "",
      building: addr.building || "",
      phone: addr.phone || "",
      phoneExtension: addr.phone_extension || "",
      email: addr.email || "",
      website: addr.website || "",
    };
  });
  return addressesObj;
}

/**
 * Convert businessTypes array to object format
 * BusinessTypesField expects: { manufacturer: true, distributor: true }
 */
function convertBusinessTypesToObject(businessTypes) {
  return businessTypes.reduce((acc, bt) => {
    const type = bt.business_type || bt.type;
    if (type) {
      acc[type] = true;
    }
    return acc;
  }, {});
}

/**
 * Map documents from history table
 * Supports both camelCase and snake_case document types
 */
function mapDocuments(documents, main, documentType) {
  const tryOne = (type) => {
    // Try to find document with exact match first
    let doc = documents.find((d) => d.document_type === type);

    // If not found, try camelCase version (e.g., factory_license -> factoryLicense)
    if (!doc && typeof type === "string") {
      const camelCaseType = type.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      doc = documents.find((d) => d.document_type === camelCaseType);
    }

    // If not found, try snake_case version (e.g., factoryLicense -> factory_license)
    if (!doc && typeof type === "string") {
      const snakeCaseType = type.replace(/([A-Z])/g, "_$1").toLowerCase();
      doc = documents.find((d) => d.document_type === snakeCaseType);
    }

    if (doc) {
      console.log(`✅ Found document for ${type}:`, doc.file_name);
      return {
        name: doc.file_name,
        url: doc.cloudinary_url || doc.file_path,
      };
    }

    // Fallback to main table field
    const mainField = `${type}_doc`;
    const fallback = getFileObject(main[mainField]);
    if (fallback) {
      console.log(`⚠️ Using main table fallback for ${type}`);
      return fallback;
    }
    return null;
  };

  if (Array.isArray(documentType)) {
    for (const t of documentType) {
      const res = tryOne(t);
      if (res) return res;
    }
    console.log(`❌ No document found for any of: ${documentType.join(", ")}`);
    return null;
  }

  const single = tryOne(documentType);
  if (!single) {
    console.log(`❌ No document found for ${documentType}`);
  }
  return single;
}

/**
 * Map OC Rejection Data
 */
export function mapOCRejectionData(rejectionData) {
  if (!rejectionData) return {};

  // If already mapped, return as is
  if (rejectionData.companyNameThai || rejectionData.taxId) {
    return rejectionData;
  }

  const main = rejectionData.main || {};
  const reps = rejectionData.representatives || [];
  const products = rejectionData.products || [];
  const businessTypes = rejectionData.businessTypes || [];
  const businessTypeOther = rejectionData.businessTypeOther || null;
  const industryGroups = rejectionData.industryGroups || [];
  const provinceChapters = rejectionData.provinceChapters || [];
  const addresses = rejectionData.addresses || [];
  const contactPersons = rejectionData.contactPersons || [];
  const documents = rejectionData.documents || [];
  const signatureName = rejectionData.signatureName || null;

  console.log("🔍 OC Mapper - Raw data:", {
    addresses: addresses.length,
    contactPersons: contactPersons.length,
    documents: documents.length,
    hasSignatureName: !!signatureName,
  });

  console.log("📄 OC Documents detail:", documents);
  console.log(
    "📄 Document types found:",
    documents.map((d) => d.document_type),
  );

  // Parse JSON fields if they exist
  let productionImages = [];
  if (main.production_process_images) {
    try {
      const parsed =
        typeof main.production_process_images === "string"
          ? JSON.parse(main.production_process_images)
          : main.production_process_images;
      productionImages = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error parsing production_process_images:", e);
    }
  }

  const addressesObj = convertAddressesToObject(addresses);

  return {
    // Company Basic Info
    companyName: main.company_name_th || "",
    companyNameEng: main.company_name_en || "",
    taxId: main.tax_id || "",
    companyEmail: main.company_email || "",
    companyPhone: main.company_phone || "",
    companyPhoneExtension: main.company_phone_extension || "",
    factoryType: main.factory_type || "",

    // Address info - use addressesObj for AddressSection component
    addresses: addressesObj,

    // Also keep flat fields for backward compatibility
    addressNumber: addresses[0]?.address_number || main.address_number || "",
    street: addresses[0]?.street || main.street || "",
    subDistrict: addresses[0]?.sub_district || main.sub_district || "",
    district: addresses[0]?.district || main.district || "",
    province: addresses[0]?.province || main.province || "",
    postalCode: addresses[0]?.postal_code || main.postal_code || "",
    moo: addresses[0]?.moo || main.moo || "",

    // Financial Info - map from actual database columns
    registeredCapital: main.registered_capital ? String(main.registered_capital) : "",
    productionCapacityValue: main.production_capacity_value
      ? String(main.production_capacity_value)
      : "",
    productionCapacityUnit: main.production_capacity_unit || "",
    salesDomestic: main.sales_domestic ? String(main.sales_domestic) : "",
    salesExport: main.sales_export ? String(main.sales_export) : "",
    shareholderThaiPercent: main.shareholder_thai_percent
      ? String(main.shareholder_thai_percent)
      : "",
    shareholderForeignPercent: main.shareholder_foreign_percent
      ? String(main.shareholder_foreign_percent)
      : "",
    revenueLastYear: main.revenue_last_year ? String(main.revenue_last_year) : "",
    revenuePreviousYear: main.revenue_previous_year ? String(main.revenue_previous_year) : "",

    // Legacy financial fields (for backward compatibility)
    totalAssets: "", // Not in OC history table
    totalRevenue: main.revenue_last_year ? String(main.revenue_last_year) : "",
    netProfit: "", // Not in OC history table
    productionCapacity: main.production_capacity_value
      ? String(main.production_capacity_value)
      : "",
    exportSalesRatio:
      main.sales_export && (main.sales_domestic || main.sales_export)
        ? String((main.sales_export / (main.sales_domestic + main.sales_export)) * 100)
        : "",
    debtToEquityRatio: "", // Not in OC history table

    // Representatives
    representatives: reps.map((r, idx) => ({
      id: r.id || null,
      prenameTh: r.prename_th || "",
      prenameEn: r.prename_en || "",
      prenameOther: r.prename_other || "",
      prenameOtherEn: r.prename_other_en || "",
      firstNameThai: r.first_name_th || "",
      lastNameThai: r.last_name_th || "",
      firstNameEnglish: r.first_name_en || "",
      lastNameEnglish: r.last_name_en || "",
      position: r.position || "",
      email: r.email || "",
      phone: r.phone || "",
      phoneExtension: r.phone_extension || "",
      isPrimary: r.is_primary === 1 || r.is_primary === true || idx === 0,
    })),

    // Business Types - convert array to object format
    businessTypes: convertBusinessTypesToObject(businessTypes),
    otherBusinessTypeDetail: businessTypeOther?.detail || main.other_business_type_detail || "",

    // Products
    products: products.map((p, index) => ({
      id: p.id || null,
      key: p.id || `new-${index}-${Date.now()}`,
      nameTh: p.name_th || p.product_name || "",
      nameEn: p.name_en || "",
    })),
    numberOfEmployees: main.number_of_employees ? String(main.number_of_employees) : "",

    // Industry Groups and Province Chapters
    industrialGroupIds: industryGroups
      .map((ig) => ig.industry_group_id || ig.id)
      .filter((id) => id && id !== "000" && id !== 0),
    provincialChapterIds: provinceChapters
      .map((pc) => pc.province_chapter_id || pc.id)
      .filter((id) => id && id !== "000" && id !== 0),

    // Documents - map from documents history table
    companyRegistration: (() => {
      const doc = mapDocuments(documents, main, "company_registration");
      console.log("📄 companyRegistration mapped:", doc);
      return doc;
    })(),
    factoryLicense: (() => {
      const doc = mapDocuments(documents, main, "factory_license");
      console.log("📄 factoryLicense mapped:", doc);
      return doc;
    })(),
    industrialEstateLicense: (() => {
      const doc = mapDocuments(documents, main, "industrial_estate_license");
      console.log("📄 industrialEstateLicense mapped:", doc);
      return doc;
    })(),
    companyStamp: (() => {
      const doc = mapDocuments(documents, main, "companyStamp");
      console.log("📄 companyStamp mapped:", doc);
      return doc;
    })(),
    authorizedSignature: (() => {
      const doc = mapDocuments(documents, main, "authorizedSignature");
      console.log("📄 authorizedSignature mapped:", doc);
      return doc;
    })(),
    productionImages: documents
      .filter((d) => d.document_type === "production_image")
      .map((d) => ({
        name: d.file_name,
        url: d.cloudinary_url || d.file_path,
      }))
      .concat(productionImages),

    // Authorized Signatory Info - use signatureName if available, fallback to main
    authorizedSignatoryPrenameTh:
      signatureName?.prename_th || main.authorized_signatory_prename_th || "",
    authorizedSignatoryPrenameOther:
      signatureName?.prename_other || main.authorized_signatory_prename_other || "",
    authorizedSignatoryFirstNameTh:
      signatureName?.first_name_th || main.authorized_signatory_first_name_th || "",
    authorizedSignatoryLastNameTh:
      signatureName?.last_name_th || main.authorized_signatory_last_name_th || "",
    authorizedSignatoryPositionTh:
      signatureName?.position_th || main.authorized_signatory_position_th || "",

    // Contact Persons
    contactPersons: contactPersons.map((cp, idx) => ({
      id: cp.history_id || null,
      prenameTh: cp.prename_th || "",
      prenameEn: cp.prename_en || "",
      prenameOther: cp.prename_other || "",
      prenameOtherEn: cp.prename_other_en || "",
      firstNameTh: cp.first_name_th || "",
      lastNameTh: cp.last_name_th || "",
      firstNameEn: cp.first_name_en || "",
      lastNameEn: cp.last_name_en || "",
      position: cp.position || "",
      email: cp.email || "",
      phone: cp.phone || "",
      phoneExtension: cp.phone_extension || "",
      typeContactId: cp.type_contact_id || null,
      typeContactName: cp.type_contact_name || "",
      typeContactOtherDetail: cp.type_contact_other_detail || "",
    })),
  };
}

/**
 * Map AC Rejection Data
 */
export function mapACRejectionData(rejectionData) {
  if (!rejectionData) return {};

  if (rejectionData.companyNameThai || rejectionData.taxId) {
    return rejectionData;
  }

  const main = rejectionData.main || {};
  const reps = rejectionData.representatives || [];
  const products = rejectionData.products || [];
  const businessTypes = rejectionData.businessTypes || [];
  const businessTypeOther = rejectionData.businessTypeOther || null;
  const industryGroups = rejectionData.industryGroups || [];
  const provinceChapters = rejectionData.provinceChapters || [];
  const addresses = rejectionData.addresses || [];
  const contactPersons = rejectionData.contactPersons || [];
  const documents = rejectionData.documents || [];
  const signatureName = rejectionData.signatureName || null;

  const addressesObj = convertAddressesToObject(addresses);

  return {
    // Company Basic Info
    companyName: main.company_name_th || "",
    companyNameEng: main.company_name_en || "",
    taxId: main.tax_id || "",
    companyEmail: main.company_email || "",
    companyPhone: main.company_phone || "",
    companyPhoneExtension: main.company_phone_extension || "",

    // Address info
    addresses: addressesObj,

    addressNumber: addresses[0]?.address_number || main.address_number || "",
    street: addresses[0]?.street || main.street || "",
    subDistrict: addresses[0]?.sub_district || main.sub_district || "",
    district: addresses[0]?.district || main.district || "",
    province: addresses[0]?.province || main.province || "",
    postalCode: addresses[0]?.postal_code || main.postal_code || "",
    moo: addresses[0]?.moo || main.moo || "",

    // Financial Info
    registeredCapital: main.registered_capital ? String(main.registered_capital) : "",
    productionCapacityValue: main.production_capacity_value
      ? String(main.production_capacity_value)
      : "",
    productionCapacityUnit: main.production_capacity_unit || "",
    salesDomestic: main.sales_domestic ? String(main.sales_domestic) : "",
    salesExport: main.sales_export ? String(main.sales_export) : "",
    shareholderThaiPercent: main.shareholder_thai_percent
      ? String(main.shareholder_thai_percent)
      : "",
    shareholderForeignPercent: main.shareholder_foreign_percent
      ? String(main.shareholder_foreign_percent)
      : "",
    revenueLastYear: main.revenue_last_year ? String(main.revenue_last_year) : "",
    revenuePreviousYear: main.revenue_previous_year ? String(main.revenue_previous_year) : "",

    representatives: reps.map((r, idx) => ({
      id: r.id || null,
      prenameTh: r.prename_th || "",
      prenameEn: r.prename_en || "",
      prenameOther: r.prename_other || "",
      prenameOtherEn: r.prename_other_en || "",
      firstNameThai: r.first_name_th || "",
      lastNameThai: r.last_name_th || "",
      firstNameEnglish: r.first_name_en || "",
      lastNameEnglish: r.last_name_en || "",
      position: r.position || "",
      email: r.email || "",
      phone: r.phone || "",
      phoneExtension: r.phone_extension || "",
      isPrimary: r.is_primary === 1 || r.is_primary === true || idx === 0,
    })),

    businessTypes: convertBusinessTypesToObject(businessTypes),
    otherBusinessTypeDetail: businessTypeOther?.detail || main.other_business_type_detail || "",

    products: products.map((p, index) => ({
      id: p.id || null,
      key: p.id || `new-${index}-${Date.now()}`,
      nameTh: p.name_th || p.product_name || "",
      nameEn: p.name_en || "",
    })),

    industrialGroupIds: industryGroups
      .map((ig) => ig.industry_group_id || ig.id)
      .filter((id) => id && id !== "000" && id !== 0),
    provincialChapterIds: provinceChapters
      .map((pc) => pc.province_chapter_id || pc.id)
      .filter((id) => id && id !== "000" && id !== 0),

    companyRegistration: mapDocuments(documents, main, "company_registration"),
    factoryLicense: mapDocuments(documents, main, "factory_license"),
    industrialEstateLicense: mapDocuments(documents, main, "industrial_estate_license"),
    companyStamp: mapDocuments(documents, main, "companyStamp"),
    authorizedSignature: mapDocuments(documents, main, "authorizedSignature"),

    authorizedSignatoryPrenameTh:
      signatureName?.prename_th || main.authorized_signatory_prename_th || "",
    authorizedSignatoryPrenameOther:
      signatureName?.prename_other || main.authorized_signatory_prename_other || "",
    authorizedSignatoryFirstNameTh:
      signatureName?.first_name_th || main.authorized_signatory_first_name_th || "",
    authorizedSignatoryLastNameTh:
      signatureName?.last_name_th || main.authorized_signatory_last_name_th || "",
    authorizedSignatoryPositionTh:
      signatureName?.position_th || main.authorized_signatory_position_th || "",

    contactPersons: contactPersons.map((cp, idx) => ({
      id: cp.history_id || null,
      prenameTh: cp.prename_th || "",
      prenameEn: cp.prename_en || "",
      prenameOther: cp.prename_other || "",
      prenameOtherEn: cp.prename_other_en || "",
      firstNameTh: cp.first_name_th || "",
      lastNameTh: cp.last_name_th || "",
      firstNameEn: cp.first_name_en || "",
      lastNameEn: cp.last_name_en || "",
      position: cp.position || "",
      email: cp.email || "",
      phone: cp.phone || "",
      phoneExtension: cp.phone_extension || "",
      typeContactId: cp.type_contact_id || null,
      typeContactName: cp.type_contact_name || "",
      typeContactOtherDetail: cp.type_contact_other_detail || "",
    })),
  };
}

/**
 * Map AM Rejection Data
 */
export function mapAMRejectionData(rejectionData) {
  if (!rejectionData) return {};

  if (rejectionData.companyNameThai || rejectionData.taxId) {
    return rejectionData;
  }

  const main = rejectionData.main || {};
  const reps = rejectionData.representatives || [];
  const products = rejectionData.products || [];
  const businessTypes = rejectionData.businessTypes || [];
  const businessTypeOther = rejectionData.businessTypeOther || null;
  const addresses = rejectionData.addresses || [];
  const contactPersons = rejectionData.contactPersons || [];
  const documents = rejectionData.documents || [];
  const signatureName = rejectionData.signatureName || null;

  const addressesObj = convertAddressesToObject(addresses);

  return {
    // Company Basic Info
    companyName: main.company_name_th || "",
    companyNameEng: main.company_name_en || "",
    taxId: main.tax_id || "",
    companyEmail: main.company_email || "",
    companyPhone: main.company_phone || "",
    companyPhoneExtension: main.company_phone_extension || "",

    // Address info
    addresses: addressesObj,

    addressNumber: addresses[0]?.address_number || main.address_number || "",
    street: addresses[0]?.street || main.street || "",
    subDistrict: addresses[0]?.sub_district || main.sub_district || "",
    district: addresses[0]?.district || main.district || "",
    province: addresses[0]?.province || main.province || "",
    postalCode: addresses[0]?.postal_code || main.postal_code || "",
    moo: addresses[0]?.moo || main.moo || "",

    // Financial Info
    registeredCapital: main.registered_capital ? String(main.registered_capital) : "",
    productionCapacityValue: main.production_capacity_value
      ? String(main.production_capacity_value)
      : "",
    productionCapacityUnit: main.production_capacity_unit || "",
    salesDomestic: main.sales_domestic ? String(main.sales_domestic) : "",
    salesExport: main.sales_export ? String(main.sales_export) : "",
    shareholderThaiPercent: main.shareholder_thai_percent
      ? String(main.shareholder_thai_percent)
      : "",
    shareholderForeignPercent: main.shareholder_foreign_percent
      ? String(main.shareholder_foreign_percent)
      : "",
    revenueLastYear: main.revenue_last_year ? String(main.revenue_last_year) : "",
    revenuePreviousYear: main.revenue_previous_year ? String(main.revenue_previous_year) : "",

    representatives: reps.map((r, idx) => ({
      id: r.id || null,
      prenameTh: r.prename_th || "",
      prenameEn: r.prename_en || "",
      prenameOther: r.prename_other || "",
      prenameOtherEn: r.prename_other_en || "",
      firstNameThai: r.first_name_th || "",
      lastNameThai: r.last_name_th || "",
      firstNameEnglish: r.first_name_en || "",
      lastNameEnglish: r.last_name_en || "",
      position: r.position || "",
      email: r.email || "",
      phone: r.phone || "",
      phoneExtension: r.phone_extension || "",
      isPrimary: r.is_primary === 1 || r.is_primary === true || idx === 0,
    })),

    businessTypes: convertBusinessTypesToObject(businessTypes),
    otherBusinessTypeDetail: businessTypeOther?.detail || main.other_business_type_detail || "",

    products: products.map((p, index) => ({
      id: p.id || null,
      key: p.id || `new-${index}-${Date.now()}`,
      nameTh: p.name_th || p.product_name || "",
      nameEn: p.name_en || "",
    })),

    companyRegistration: mapDocuments(documents, main, "company_registration"),
    factoryLicense: mapDocuments(documents, main, "factory_license"),
    companyStamp: mapDocuments(documents, main, "companyStamp"),
    authorizedSignature: mapDocuments(documents, main, "authorizedSignature"),

    authorizedSignatoryPrenameTh:
      signatureName?.prename_th || main.authorized_signatory_prename_th || "",
    authorizedSignatoryPrenameOther:
      signatureName?.prename_other || main.authorized_signatory_prename_other || "",
    authorizedSignatoryFirstNameTh:
      signatureName?.first_name_th || main.authorized_signatory_first_name_th || "",
    authorizedSignatoryLastNameTh:
      signatureName?.last_name_th || main.authorized_signatory_last_name_th || "",
    authorizedSignatoryPositionTh:
      signatureName?.position_th || main.authorized_signatory_position_th || "",

    contactPersons: contactPersons.map((cp, idx) => ({
      id: cp.history_id || null,
      prenameTh: cp.prename_th || "",
      prenameEn: cp.prename_en || "",
      prenameOther: cp.prename_other || "",
      prenameOtherEn: cp.prename_other_en || "",
      firstNameTh: cp.first_name_th || "",
      lastNameTh: cp.last_name_th || "",
      firstNameEn: cp.first_name_en || "",
      lastNameEn: cp.last_name_en || "",
      position: cp.position || "",
      email: cp.email || "",
      phone: cp.phone || "",
      phoneExtension: cp.phone_extension || "",
      typeContactId: cp.type_contact_id || null,
      typeContactName: cp.type_contact_name || "",
      typeContactOtherDetail: cp.type_contact_other_detail || "",
    })),
  };
}

/**
 * Map IC Rejection Data
 */
export function mapICRejectionData(rejectionData) {
  if (!rejectionData) return {};

  if (rejectionData.firstNameThai || rejectionData.idCardNumber) {
    return {
      // Ensure Thai prename aliases exist for ICApplicantInfo
      prename_th: rejectionData.prename_th || rejectionData.prenameTh || "",
      prenameTh: rejectionData.prenameTh || rejectionData.prename_th || "",

      // Keep all existing fields
      ...rejectionData,
    };
  }

  const main = rejectionData.main || {};
  const representatives = rejectionData.representatives || [];
  const products = rejectionData.products || [];
  const businessTypes = rejectionData.businessTypes || [];
  const businessTypeOther = rejectionData.businessTypeOther || null;
  const addresses = rejectionData.addresses || [];
  const documents = rejectionData.documents || [];
  const signatureName = rejectionData.signatureName || null;

  console.log("🔍 IC Mapper - Raw data:", {
    addresses: addresses.length,
    documents: documents.length,
    hasSignatureName: !!signatureName,
    representatives: representatives.length,
  });

  const addressesObj = convertAddressesToObject(addresses);

  return {
    // Thai prename
    prename_th: main.prename_th || "",
    prenameTh: main.prename_th || "",

    // English prename
    prenameEn: main.prename_en || "",
    prenameOther: main.prename_other || "",
    prenameOtherEn: main.prename_other_en || "",

    // Aliases for form fields used by ICApplicantInfo (English prename)
    prename_en: main.prename_en || "",
    prename_other_en: main.prename_other_en || "",

    firstNameThai: main.first_name_th || "",
    lastNameThai: main.last_name_th || "",

    // Original English name fields (kept for backward compatibility)
    firstNameEnglish: main.first_name_en || "",
    lastNameEnglish: main.last_name_en || "",

    // Aliases for current IC EnglishNameFields (firstNameEng / lastNameEng)
    firstNameEng: main.first_name_en || "",
    lastNameEng: main.last_name_en || "",

    idCardNumber: main.id_card_number || "",
    email: main.email || "",
    phone: main.phone || "",

    addresses: addressesObj,

    addressNumber: addresses[0]?.address_number || main.address_number || "",
    street: addresses[0]?.street || main.street || "",
    subDistrict: addresses[0]?.sub_district || main.sub_district || "",
    district: addresses[0]?.district || main.district || "",
    province: addresses[0]?.province || main.province || "",
    postalCode: addresses[0]?.postal_code || main.postal_code || "",
    moo: addresses[0]?.moo || main.moo || "",

    // Representatives - IC has single representative
    representative:
      representatives.length > 0
        ? {
            id: representatives[0].id || null,
            prenameTh: representatives[0].prename_th || "",
            prenameEn: representatives[0].prename_en || "",
            prenameOther: representatives[0].prename_other || "",
            prenameOtherEn: representatives[0].prename_other_en || "",
            firstNameThai: representatives[0].first_name_th || "",
            lastNameThai: representatives[0].last_name_th || "",
            firstNameEnglish: representatives[0].first_name_en || "",
            lastNameEnglish: representatives[0].last_name_en || "",
            position: representatives[0].position || "",
            email: representatives[0].email || "",
            phone: representatives[0].phone || "",
            phoneExtension: representatives[0].phone_extension || "",
            isPrimary:
              representatives[0].is_primary === 1 || representatives[0].is_primary === true || true,
          }
        : null,

    businessTypes: convertBusinessTypesToObject(businessTypes),
    otherBusinessTypeDetail: businessTypeOther?.detail || main.other_business_type_detail || "",

    products: products.map((p, index) => ({
      id: p.id || null,
      key: p.id || `new-${index}-${Date.now()}`,
      nameTh: p.name_th || p.product_name || "",
      nameEn: p.name_en || "",
    })),

    // IC Documents
    idCardDocument: (() => {
      // Support multiple aliases used across systems
      const doc = mapDocuments(documents, main, ["idCardDocument", "id_card", "idCard"]);
      console.log("📄 idCardDocument mapped:", doc);
      return doc;
    })(),
    companyStamp: (() => {
      const doc = mapDocuments(documents, main, "companyStamp");
      console.log("📄 companyStamp mapped:", doc);
      return doc;
    })(),
    authorizedSignature: (() => {
      const doc = mapDocuments(documents, main, "authorizedSignature");
      console.log("📄 authorizedSignature mapped:", doc);
      return doc;
    })(),

    // Authorized Signatory Info
    authorizedSignatoryPrenameTh:
      signatureName?.prename_th || main.authorized_signatory_prename_th || "",
    authorizedSignatoryPrenameOther:
      signatureName?.prename_other || main.authorized_signatory_prename_other || "",
    authorizedSignatoryFirstNameTh:
      signatureName?.first_name_th || main.authorized_signatory_first_name_th || "",
    authorizedSignatoryLastNameTh:
      signatureName?.last_name_th || main.authorized_signatory_last_name_th || "",
    authorizedSignatoryPositionTh:
      signatureName?.position_th || main.authorized_signatory_position_th || "",
  };
}

/**
 * Main mapper function - routes to appropriate mapper based on membership type
 */
export function mapRejectionDataToForm(membershipType, rejectionData) {
  console.log(`🗺️ Mapping ${membershipType.toUpperCase()} rejection data to form`);

  switch (membershipType) {
    case "oc":
      return mapOCRejectionData(rejectionData);
    case "ac":
      return mapACRejectionData(rejectionData);
    case "am":
      return mapAMRejectionData(rejectionData);
    case "ic":
      return mapICRejectionData(rejectionData);
    default:
      console.error(`Unknown membership type: ${membershipType}`);
      return {};
  }
}
