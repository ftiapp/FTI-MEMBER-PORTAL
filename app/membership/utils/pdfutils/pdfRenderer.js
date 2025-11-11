// Main PDF rendering logic

import { resolveGroupNames, limitDisplayLists } from './groupResolver.js';
import { preloadCompanyStamp, preloadLogo, preloadSignatures } from './imagePreloader.js';
import { generateHTML } from './htmlGenerator.js';
import { exportPDF } from './pdfExporter.js';
import { processData } from './dataNormalizer.js';
import { getTitleByType, getBusinessTypeNames } from './typeHelpers.js';

// Main PDF generation function
export const generateMembershipPDF = async (
  application,
  type,
  industrialGroups = {},
  provincialChapters = {},
) => {
  try {
    const data = processData(application);
    const title = getTitleByType(type);
    const businessTypes = getBusinessTypeNames(data);

    // Resolve Industrial Group & Provincial Chapter names
    const { industrialGroupNames, provincialChapterNames } = resolveGroupNames(data, application, industrialGroups, provincialChapters);

    // Limit long lists to help fit within 2 pages
    const { MAX_PRODUCTS_DISPLAY, displayIndustryGroups, extraIndustryGroups, displayProvincialChapters, extraProvincialChapters } = limitDisplayLists(industrialGroupNames, provincialChapterNames);

    const displayProducts = Array.isArray(data.products)
      ? data.products.slice(0, MAX_PRODUCTS_DISPLAY)
      : [];
    const extraProducts =
      Array.isArray(data.products) && data.products.length > MAX_PRODUCTS_DISPLAY
        ? data.products.length - MAX_PRODUCTS_DISPLAY
        : 0;

    // Prepare applicant account info (FTI_Portal_User table fields if present)
    const applicantAccount = (() => {
      const u =
        application?.user ||
        application?.account ||
        application?.applicant ||
        application?.createdBy ||
        application?.created_by ||
        application?.createdUser ||
        null;
      if (u && typeof u === "object") {
        return {
          ...u,
          // normalize common name keys for downstream usage
          firstname: u.firstname || u.first_name || u.firstName || null,
          lastname: u.lastname || u.last_name || u.lastName || null,
          name: u.name || u.fullname || u.full_name || null,
        };
      }
      // Fallback to flat fields possibly present on application
      return {
        id:
          application?.userId ||
          application?.user_id ||
          application?.created_by_id ||
          application?.createdById,
        firstname:
          application?.userFirstName ||
          application?.firstname ||
          application?.first_name ||
          application?.firstName,
        lastname:
          application?.userLastName ||
          application?.lastname ||
          application?.last_name ||
          application?.lastName,
        name:
          application?.userName ||
          application?.username ||
          application?.name ||
          application?.full_name ||
          application?.fullName,
        email: application?.userEmail || application?.email,
        phone: application?.userPhone || application?.phone,
      };
    })();
    let applicantFullName = [
      applicantAccount?.firstname ||
        applicantAccount?.first_name ||
        applicantAccount?.firstName ||
        "",
      applicantAccount?.lastname || applicantAccount?.last_name || applicantAccount?.lastName || "",
    ]
      .join(" ")
      .trim();
    if (!applicantFullName) {
      applicantFullName = applicantAccount?.name || "";
    }
    if (!applicantFullName) {
      // final fallback to application data's applicant names
      const thai = [data.firstNameTh || "", data.lastNameTh || ""].join(" ").trim();
      const eng = [data.firstNameEn || "", data.lastNameEn || ""].join(" ").trim();
      applicantFullName = thai || eng || "";
    }

    // Preload images
    const [companyStampImgSrc, logoSrc, { signatureImgSrc, preloadedSignatures }] = await Promise.all([
      preloadCompanyStamp(data),
      preloadLogo(),
      preloadSignatures(data),
    ]);

    // Generate HTML content
    const html = generateHTML(
      logoSrc,
      title,
      data,
      type,
      applicantFullName,
      applicantAccount,
      businessTypes,
      displayProducts,
      extraProducts,
      industrialGroupNames,
      provincialChapterNames,
      displayIndustryGroups,
      displayProvincialChapters,
      extraIndustryGroups,
      extraProvincialChapters,
      MAX_PRODUCTS_DISPLAY,
      displayIndustryGroups.length > 0 ? 10 : 0, // MAX_GROUPS_DISPLAY
      displayProvincialChapters.length > 0 ? 10 : 0, // MAX_CHAPTERS_DISPLAY
      signatureImgSrc,
      preloadedSignatures,
      companyStampImgSrc
    );

    // Export PDF
    return await exportPDF(html, type, data);
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
};
