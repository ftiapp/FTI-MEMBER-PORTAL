/**
 * OC Data Mapper - Transform rejection data to form data
 */
export function mapOCRejectionData(rejectionData) {
  if (!rejectionData) return {};

  // Check if data is already in flat format
  if (rejectionData.companyName || rejectionData.taxId) {
    return rejectionData;
  }

  // Extract nested data
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
    addressesData: addresses,
    contactPersonsData: contactPersons,
    documentsData: documents,
    signatureNameData: signatureName,
  });

  const getFileObject = (docUrl) =>
    docUrl ? { name: `Existing File - ${docUrl.split("/").pop()}`, url: docUrl } : null;

  // Parse JSON fields if they exist
  let productionImages = [];
  if (main.production_process_images) {
    try {
      const parsed =
        typeof main.production_process_images === "string"
          ? JSON.parse(main.production_process_images)
          : main.production_process_images;
      productionImages = (Array.isArray(parsed) ? parsed : []).map((url) => ({
        name: `Existing Image - ${url.split("/").pop()}`,
        url: url,
      }));
    } catch (e) {
      console.error("⚠️ Error parsing production images:", e);
    }
  }

  // Convert addresses array to object format for AddressSection
  // AddressSection expects: { "1": {...}, "2": {...}, "3": {...} }
  const addressesObj = {};
  addresses.forEach((addr, idx) => {
    const tabKey = String(idx + 1); // Convert to "1", "2", "3"
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

  const result = {
    // Company info from Main table
    companyName: main.company_name_th || "",
    companyNameEng: main.company_name_en || "",
    taxId: main.tax_id || "",
    companyEmail: main.company_email || "",
    companyPhone: main.company_phone || "",
    companyPhoneExtension: main.phone_extension || "",

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

    // Business Types - convert array to object format for BusinessTypesField
    businessTypes: businessTypes.reduce((acc, bt) => {
      const type = bt.business_type || bt.type;
      if (type) {
        acc[type] = true;
      }
      return acc;
    }, {}),
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
    companyRegistration: documents.find((d) => d.document_type === "company_registration")
      ? {
          name: documents.find((d) => d.document_type === "company_registration").file_name,
          url:
            documents.find((d) => d.document_type === "company_registration").cloudinary_url ||
            documents.find((d) => d.document_type === "company_registration").file_path,
        }
      : getFileObject(main.company_registration_doc),
    factoryLicense: documents.find((d) => d.document_type === "factory_license")
      ? {
          name: documents.find((d) => d.document_type === "factory_license").file_name,
          url:
            documents.find((d) => d.document_type === "factory_license").cloudinary_url ||
            documents.find((d) => d.document_type === "factory_license").file_path,
        }
      : getFileObject(main.factory_license_doc),
    industrialEstateLicense: documents.find((d) => d.document_type === "industrial_estate_license")
      ? {
          name: documents.find((d) => d.document_type === "industrial_estate_license").file_name,
          url:
            documents.find((d) => d.document_type === "industrial_estate_license").cloudinary_url ||
            documents.find((d) => d.document_type === "industrial_estate_license").file_path,
        }
      : getFileObject(main.industrial_estate_license_doc),
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

    // Contact Persons - use field names that match OC form validation
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

  console.log("✅ OC Mapper - Mapped formData:", {
    addressNumber: result.addressNumber,
    street: result.street,
    province: result.province,
    contactPersonsCount: result.contactPersons.length,
    contactPersonsSample: result.contactPersons[0],
  });

  return result;
}
