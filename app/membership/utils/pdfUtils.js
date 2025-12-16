// Thin wrapper around the new PDF generator implementation
export const generateMembershipPDF = async (
  application,
  type,
  industrialGroups = {},
  provincialChapters = {},
  options = {},
) => {
  const { generateMembershipPDF: newGenerateMembershipPDF } = await import(
    "./pdfutils/pdf-generator"
  );
  return newGenerateMembershipPDF(application, type, industrialGroups, provincialChapters, options);
};

export const downloadMembershipPDF = async (application, type, options = {}) => {
  const { downloadMembershipPDF: newDownloadMembershipPDF } = await import(
    "./pdfutils/pdf-generator"
  );
  return newDownloadMembershipPDF(application, type, options);
};

export default {
  generateMembershipPDF,
  downloadMembershipPDF,
};
