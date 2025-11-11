// Main exports for PDF utilities

// Export all functions from individual modules
export { formatThaiDate } from './dateUtils.js';
export { transformCloudinaryUrl, loadImageAsDataURL, loadSignatureImageAsDataURL } from './imageUtils.js';
export { getTitleByType, getBusinessTypeNames } from './typeHelpers.js';
export { processData } from './dataNormalizer.js';
export { field, section } from './htmlBuilders.js';
export { buildSignatorySignature } from './signatureBuilders.js';
export { getPDFStyles, getPDFOptions } from './pdfConfig.js';
export { generateMembershipPDF } from './pdfRenderer.js';

// Export functions from sub-modules
export {
  normalizeAddressType2Contact,
  normalizeAddress2,
  normalizeBaseAddress
} from './addressNormalizer.js';
export {
  normalizeCompanyData,
  normalizeApplicantNames
} from './companyNormalizer.js';
export {
  findDocument,
  normalizeSignatureData,
  normalizeAuthorizedSignatoryName,
  normalizeAuthorizedSignatoryPosition
} from './signatureNormalizer.js';
export { normalizeRepresentatives } from './representativeNormalizer.js';
export {
  normalizeApplicantAccount,
  normalizeApplicantFullName
} from './applicantNormalizer.js';
export {
  resolveGroupNames,
  limitDisplayLists
} from './groupResolver.js';
export {
  preloadCompanyStamp,
  preloadLogo,
  preloadSignatures
} from './imagePreloader.js';
export {
  resolvePrename,
  generateApplicantSection,
  generateAddressSection,
  generateContactPersonSection,
  generateRepresentativesSection,
  generateBusinessSection,
  generateGroupsSection,
  generateApplicantAccountSection,
  generateSignatureSection,
  generateHTML
} from './htmlGenerator.js';
export { exportPDF } from './pdfExporter.js';

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
