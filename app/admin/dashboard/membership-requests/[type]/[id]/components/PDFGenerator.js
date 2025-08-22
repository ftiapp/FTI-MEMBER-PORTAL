// ติดตั้ง: npm install html2pdf.js
import { generateMembershipPDF as generateMembershipPDFUtil } from '../../../../../../membership/utils/pdfUtils';

// ใช้ Utility กลางให้หน้าตา PDF ฝั่งแอดมินเหมือนกับฝั่งผู้ใช้ 100%
export const generateMembershipPDF = async (application, type, industrialGroups = {}, provincialChapters = {}) => {
  return await generateMembershipPDFUtil(application, type, industrialGroups, provincialChapters);
};