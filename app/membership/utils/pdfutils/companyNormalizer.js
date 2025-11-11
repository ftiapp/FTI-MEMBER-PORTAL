// Company data normalization utilities

// Normalize company names and basic company data
export const normalizeCompanyData = (app) => {
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

  return {
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
    factoryType: app.factory_type || app.factoryType,
    numberOfMember: app.number_of_member || app.numberOfMember,
    industrialGroupIds: app.industrialGroups || app.industrialGroupIds || [],
    provincialChapterIds: app.provincialCouncils || app.provincialChapterIds || [],
  };
};

// Normalize applicant name fields (IC specific)
export const normalizeApplicantNames = (app) => {
  return {
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
  };
};
