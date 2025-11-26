import {
  generateMembershipPDF as newGenerateMembershipPDF,
  downloadMembershipPDF as newDownloadMembershipPDF,
} from "./pdfutils/pdf-generator";

// Thin wrapper around the new PDF generator implementation
export const generateMembershipPDF = (
  application,
  type,
  industrialGroups = {},
  provincialChapters = {},
  options = {},
) => newGenerateMembershipPDF(application, type, industrialGroups, provincialChapters, options);

export const downloadMembershipPDF = (application, type, options = {}) =>
  newDownloadMembershipPDF(application, type, options);

export default {
  generateMembershipPDF,
  downloadMembershipPDF,
};
