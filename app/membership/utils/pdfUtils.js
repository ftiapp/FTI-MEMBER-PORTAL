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
) => newGenerateMembershipPDF(application, type, industrialGroups, provincialChapters);

export const downloadMembershipPDF = (application, type) =>
  newDownloadMembershipPDF(application, type);

export default {
  generateMembershipPDF,
  downloadMembershipPDF,
};
