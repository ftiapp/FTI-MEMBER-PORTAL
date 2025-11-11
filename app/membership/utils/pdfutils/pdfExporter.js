// PDF export utilities

import html2pdf from "html2pdf.js";
import { getPDFOptions } from './pdfConfig.js';

// Export PDF from HTML element
export const exportPDF = async (html, type, data) => {
  try {
    // Create PDF
    const element = document.createElement("div");
    element.innerHTML = html;

    const opt = getPDFOptions(type, data);

    await html2pdf().set(opt).from(element).save();
    return { success: true, filename: opt.filename };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
};
