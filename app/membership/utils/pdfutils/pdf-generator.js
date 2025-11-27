// pdf-generator.js - ไฟล์หลักสำหรับสร้าง PDF
// ติดตั้ง: npm install html2pdf.js

import html2pdf from 'html2pdf.js';
import { PDF_CONFIG, FORM_TITLES } from './pdf-config.js';
import { getPDFStyles } from './pdf-styles.js';
import {
  formatThaiDate,
  transformCloudinaryUrl,
  loadImageAsDataURL,
  getBusinessTypeNames,
  pickName,
} from './pdf-utils.js';
import { processApplicationData } from './pdf-data-processor.js';
import {
  buildMemberInfoIC,
  buildMemberInfoCompany,
  buildAddressSection,
  buildRepresentativesSection,
  buildBusinessSection,
  buildContactPersonSection,
  buildGroupsAndChaptersBlock,
} from './pdf-sections.js';
import { preloadSignature, buildSignatureArea } from './pdf-signature.js';

// Main PDF generation function
export const generateMembershipPDF = async (
  application,
  type,
  industrialGroups = {},
  provincialChapters = {},
  options = {},
) => {

  try {
    // Process data
    const data = processApplicationData(application);
    const title = FORM_TITLES[type] || 'ข้อมูลสมาชิก';
    const businessTypes = getBusinessTypeNames(data);

    // Resolve Industrial Group & Provincial Chapter names
    let industrialGroupNames = data.industrialGroupNames || [];
    let provincialChapterNames = data.provincialChapterNames || [];

    if (!industrialGroupNames || industrialGroupNames.length === 0) {
      if (Array.isArray(application.industryGroups)) {
        industrialGroupNames = application.industryGroups
          .map((g) => pickName(g, ['industryGroupName', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']))
          .filter(Boolean);
      } else if (Array.isArray(data.industrialGroups)) {
        industrialGroupNames = data.industrialGroups
          .map((g) =>
            pickName(g, [
              'name',
              'industryGroupName',
              'industry_group_name',
              'MEMBER_GROUP_NAME',
              'name_th',
              'nameTh',
            ]),
          )
          .filter(Boolean);
      } else if (Array.isArray(data.industrialGroupIds)) {
        if (data.industrialGroupIds.length > 0 && typeof data.industrialGroupIds[0] === 'object') {
          industrialGroupNames = data.industrialGroupIds
            .map((g) =>
              pickName(g, [
                'industryGroupName',
                'industry_group_name',
                'MEMBER_GROUP_NAME',
                'name_th',
                'nameTh',
              ]),
            )
            .filter(Boolean);
        }
        if (!industrialGroupNames || industrialGroupNames.length === 0) {
          const groupsArr = Array.isArray(industrialGroups)
            ? industrialGroups
            : industrialGroups.data || [];
          industrialGroupNames = data.industrialGroupIds
            .map((id) => groupsArr.find((g) => g.id === id || g.MEMBER_GROUP_CODE === id))
            .map((g) =>
              g && pickName(g, ['industryGroupName', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']),
            )
            .filter(Boolean);
        }
      }
    }

    if (!provincialChapterNames || provincialChapterNames.length === 0) {
      if (Array.isArray(application.provinceChapters) || Array.isArray(application.provincialChapters)) {
        const src = application.provinceChapters || application.provincialChapters;
        provincialChapterNames = src
          .map((c) => pickName(c, ['provinceChapterName', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']))
          .filter(Boolean);
      } else if (Array.isArray(data.provincialChapters)) {
        provincialChapterNames = data.provincialChapters
          .map((c) =>
            pickName(c, [
              'name',
              'provinceChapterName',
              'province_chapter_name',
              'MEMBER_GROUP_NAME',
              'name_th',
              'nameTh',
            ]),
          )
          .filter(Boolean);
      } else if (Array.isArray(data.provincialChapterIds)) {
        if (
          data.provincialChapterIds.length > 0 &&
          typeof data.provincialChapterIds[0] === 'object'
        ) {
          provincialChapterNames = data.provincialChapterIds
            .map((c) =>
              pickName(c, [
                'provinceChapterName',
                'province_chapter_name',
                'MEMBER_GROUP_NAME',
                'name_th',
                'nameTh',
              ]),
            )
            .filter(Boolean);
        }
        if (!provincialChapterNames || provincialChapterNames.length === 0) {
          const chArr = Array.isArray(provincialChapters)
            ? provincialChapters
            : provincialChapters.data || [];
          provincialChapterNames = data.provincialChapterIds
            .map((id) => chArr.find((c) => c.id === id || c.MEMBER_GROUP_CODE === id))
            .map((c) =>
              c && pickName(c, ['provinceChapterName', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']),
            )
            .filter(Boolean);
        }
      }
    }

    console.log('[PDF] Starting PDF generation for type:', type);
    console.log('[PDF] Data processed:', {
      companyNameTh: data.companyNameTh,
      signatures: data.authorizedSignatures?.length || 0,
      signatories: data.signatories?.length || 0,
    });

    // Preload FTI logo
    let logoSrc = PDF_CONFIG.FTI_LOGO_PATH;
    try {
      const logoDataUrl = await loadImageAsDataURL(PDF_CONFIG.FTI_LOGO_PATH);
      if (logoDataUrl) logoSrc = logoDataUrl;
    } catch (e) {
      console.warn('[PDF] Failed to preload logo, using path', e);
    }

    // Preload company stamp
    let companyStampImgSrc = '';
    if (data.companyStamp?.fileUrl) {
      const stampUrl = transformCloudinaryUrl(data.companyStamp.fileUrl);
      const dataUrl = await loadImageAsDataURL(stampUrl);
      if (dataUrl) {
        companyStampImgSrc = dataUrl;
      } else if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(stampUrl)) {
        companyStampImgSrc = stampUrl;
      }
    }

    // Preload signatures
    let signatureImgSrc = '';
    if (data.authorizedSignature) {
      signatureImgSrc = await preloadSignature(data.authorizedSignature);
    }

    const preloadedSignatures = [];
    if (data.authorizedSignatures && Array.isArray(data.authorizedSignatures)) {
      for (let i = 0; i < data.authorizedSignatures.length; i++) {
        const preloaded = await preloadSignature(data.authorizedSignatures[i]);
        preloadedSignatures.push(preloaded);
      }
    }

    const includeStaffFooter = options.includeStaffFooter === true;

    const MEMBER_TYPE_LABELS = {
      ic: 'สมทบ-บุคคลธรรมดา (ทบ)',
      oc: 'สามัญ-โรงงาน (สน)',
      ac: 'สมทบ-นิติบุคคล (ทน)',
      am: 'สามัญ-สมาคมการค้า (สส)',
    };

    const memberTypeLabel = MEMBER_TYPE_LABELS[type] || '';

    // Build HTML content
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>${getPDFStyles()}</style>
      </head>
      <body>
        <div class="created-date">
          สร้างเมื่อ: ${formatThaiDate(new Date())} ${new Date().toLocaleTimeString('th-TH')}
        </div>
        <div class="member-number">
          หมายเลขสมาชิก:<br><br>................................................
        </div>
        <div class="logo-header-row">
          <div class="logo-wrap">
            <img src="${logoSrc}" alt="FTI Logo" crossorigin="anonymous" />
          </div>
          <div class="header">${title}</div>
          ${memberTypeLabel ? `<div class="sub-header">ประเภทสมาชิก: ${memberTypeLabel}</div>` : ''}
        </div>
        
        ${type === 'ic' 
          ? buildMemberInfoIC(data, memberTypeLabel) 
          : buildMemberInfoCompany(data, memberTypeLabel)
        }
        
        ${buildAddressSection(data)}
        
        ${buildRepresentativesSection(data.representatives)}
        
        ${businessTypes && businessTypes !== '-' 
          ? buildBusinessSection(data, businessTypes, type) 
          : ''
        }
        
        ${(() => {
          // Ensure fallback names from IDs if names are still empty
          let igNames =
            industrialGroupNames && industrialGroupNames.length ? industrialGroupNames : null;
          let pcNames =
            provincialChapterNames && provincialChapterNames.length ? provincialChapterNames : null;

          if (!igNames && Array.isArray(data.industrialGroupIds) && data.industrialGroupIds.length) {
            igNames = data.industrialGroupIds.map((id) => `กลุ่มอุตสาหกรรม ${id}`);
          }
          if (
            !pcNames &&
            Array.isArray(data.provincialChapterIds) &&
            data.provincialChapterIds.length
          ) {
            const filteredChapterIds = data.provincialChapterIds.filter(
              (id) => id && String(id).trim() !== '000',
            );
            pcNames = filteredChapterIds.map((id) => `สภาอุตสาหกรรมจังหวัด ${id}`);
          }

          const MAX_GROUPS_DISPLAY = PDF_CONFIG.MAX_GROUPS_DISPLAY;
          const MAX_CHAPTERS_DISPLAY = PDF_CONFIG.MAX_CHAPTERS_DISPLAY;

          const dispIG = Array.isArray(igNames) ? igNames.slice(0, MAX_GROUPS_DISPLAY) : [];
          const dispPC = Array.isArray(pcNames) ? pcNames.slice(0, MAX_CHAPTERS_DISPLAY) : [];
          const extraIG =
            Array.isArray(igNames) && igNames.length > MAX_GROUPS_DISPLAY
              ? igNames.length - MAX_GROUPS_DISPLAY
              : 0;
          const extraPC =
            Array.isArray(pcNames) && pcNames.length > MAX_CHAPTERS_DISPLAY
              ? pcNames.length - MAX_CHAPTERS_DISPLAY
              : 0;

          const groupsAndChaptersBlock = buildGroupsAndChaptersBlock(dispIG, dispPC, extraIG, extraPC);

          // If no groups/chapters at all, skip this section
          if (!groupsAndChaptersBlock) return '';

          return `
            <div class="section">
              <div class="section-title">ส่วนที่ 5  สมัครเพิ่มเติม เข้ากลุ่มอุตสาหกรรม และ/หรือสภาอุตสาหกรรมจังหวัด</div>
              ${groupsAndChaptersBlock}
            </div>
          `;
        })()}

        ${data.contactPersons?.length ? buildContactPersonSection(data.contactPersons) : ''}
        
        ${buildSignatureArea(data, type, signatureImgSrc, companyStampImgSrc, preloadedSignatures, logoSrc)}

        ${includeStaffFooter
          ? `<div class="footer-page">
              <div class="footer-separator"></div>
              <div class="footer-section">
                <div class="footer-title">(สำหรับเจ้าหน้าที่สภาอุตสาหกรรมแห่งประเทศไทย)</div>
                <div class="footer-text">
                  ข้าพเจ้าขอรับรองว่า ผู้สมัครรายนี้มีคุณสมบัติครบถ้วนในการสมัครเข้าเป็นสมาชิกตามระเบียบ และข้อบังคับของสภาอุตสาหกรรมแห่งประเทศไทย ทุกประการ
                </div>
                <div class="footer-signatures">
                  <div class="footer-signature-col">
                    ลงชื่อ <span class="footer-sign-line">&nbsp;</span><br />
                    (<span class="footer-sign-line">&nbsp;</span>)<br />
                    เจ้าหน้าที่
                  </div>
                  <div class="footer-signature-col">
                    ลงชื่อ <span class="footer-sign-line">&nbsp;</span><br />
                    (<span class="footer-sign-line">&nbsp;</span>)<br />
                    นายทะเบียน
                  </div>
                </div>
              </div>
            </div>`
          : ''}
      </body>
      </html>
    `;

    // Create PDF
    const element = document.createElement('div');
    element.innerHTML = html;

    const filename = `${type?.toUpperCase()}_${data.companyNameTh || data.firstNameTh || 'APPLICATION'}_${new Date().toISOString().split('T')[0]}.pdf`;

    const opt = {
      margin: PDF_CONFIG.margin,
      filename: filename,
      image: { type: 'jpeg', quality: PDF_CONFIG.imageQuality },
      html2canvas: { 
        scale: PDF_CONFIG.scale, 
        useCORS: true, 
        allowTaint: true, 
        imageTimeout: PDF_CONFIG.imageTimeout,
        foreignObjectRendering: false 
      },
      jsPDF: { 
        unit: 'mm', 
        format: PDF_CONFIG.format, 
        orientation: PDF_CONFIG.orientation 
      },
      pagebreak: { mode: ['css', 'avoid-all'] },
    };

    await html2pdf().set(opt).from(element).save();
    
    console.log('[PDF] ✅ PDF generated successfully:', filename);
    return { success: true, filename };
    
  } catch (error) {
    console.error('[PDF] ❌ Error:', error);
    return { success: false, error: error.message };
  }
};

// Download helper function
export const downloadMembershipPDF = async (application, type, options = {}) => {
  const appData = application?.data ? application.data : application;
  const lookupIndustrialGroups = application?.industrialGroups || application?.lookupIndustrialGroups || [];
  const lookupProvincialChapters = application?.provincialChapters || application?.lookupProvincialChapters || [];

  const result = await generateMembershipPDF(
    appData,
    type,
    lookupIndustrialGroups,
    lookupProvincialChapters,
    options,
  );
  
  if (!result.success) {
    throw new Error(result.error || 'เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
  }
  
  return result;
};

export default {
  generateMembershipPDF,
  downloadMembershipPDF,
};