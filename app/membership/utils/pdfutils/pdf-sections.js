// pdf-sections.js - HTML sections builder

import { formatThaiDate, resolvePrename, formatNumber } from './pdf-utils.js';
import { PDF_CONFIG } from './pdf-config.js';

// Create field HTML
export const field = (label, value, style = '') =>
  `<div class="field" ${style}><span class="label">${label}:</span> <span class="value">${value || '-'}</span></div>`;

// Create section HTML
export const section = (title, content) =>
  `<div class="section"><div class="section-title">${title}</div>${content}</div>`;

// Build signatory signature HTML
export const buildSignatorySignature = (signatory, preloadedSignature, index, signatureFile) => {
  const getSignatoryName = (sig) => {
    const prenameTh = sig.prenameTh || sig.prename_th || '';
    const prenameOther = sig.prenameOther || sig.prename_other || '';
    const firstNameTh = sig.firstNameTh || sig.first_name_th || '';
    const lastNameTh = sig.lastNameTh || sig.last_name_th || '';

    let displayPrename = prenameTh;
    if (prenameTh === 'อื่นๆ' && prenameOther) {
      displayPrename = prenameOther;
    }

    // คำนำหน้ากับชื่อให้ติดกัน เช่น "นายสมชาย ใจดี"
    const prefixAndFirst = `${displayPrename || ''}${firstNameTh || ''}`.trim();
    const fullName = [prefixAndFirst, lastNameTh].filter(Boolean).join(' ').trim();
    return fullName || `ผู้มีอำนาจลงนาม คนที่ ${index + 1}`;
  };

  const signatoryName = getSignatoryName(signatory);
  const position = signatory.positionTh || signatory.position_th || '';

  let signatureHtml = '';
  if (preloadedSignature) {
    signatureHtml = `<img src="${preloadedSignature}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`;
  } else if (signatureFile && signatureFile.fileUrl) {
    signatureHtml = `<img src="${signatureFile.fileUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`;
  } else {
    signatureHtml = `<div style="color: #666; font-size: 11px; font-style: italic;">ไม่มีลายเซ็น</div>`;
  }

  return `
    <div class="signature-box">
      <div style="font-size: 11px; font-weight: bold; margin-bottom: 7px;">ลายเซ็นผู้มีอำนาจ</div>
      <div class="signature-img">${signatureHtml}</div>
      <div style="font-size: 10px; margin-top: 3px; border-top: 1px solid #000; padding-top: 3px;">
        <span class="signature-name">(${signatoryName})</span>
        ${position ? `<div style="margin-top: 1px;">${position}</div>` : ''}
        <div style="margin-top: 1px;">วันที่: ${formatThaiDate(new Date())}</div>
      </div>
    </div>
  `;
};

// Section 1: Member Info (IC type)
export const buildMemberInfoIC = (data) => {
  return section(
    'ส่วนที่ 1 ข้อมูลสมาชิก',
    `
      <div class="row">
        <div class="col">${field('ชื่อ-นามสกุล (ไทย)', `${`${resolvePrename(data.prenameTh, data.prenameEn, data.prenameOther, 'th') || ''}${data.firstNameTh || ''}`.trim()} ${data.lastNameTh || ''}`.trim())}</div>
        <div class="col">${field('ชื่อ-นามสกุล (อังกฤษ)', `${`${resolvePrename(data.prenameTh, data.prenameEn, data.prenameOther, 'en') || ''}${data.firstNameEn || ''}`.trim()} ${data.lastNameEn || ''}`.trim())}</div>
      </div>
      <div class="row">
        <div class="col">${field('บัตรประชาชน', data.idCard)}</div>
        <div class="col">${field('โทรศัพท์', data.phone ? `${data.phone}${data.phoneExtension ? ` ต่อ ${data.phoneExtension}` : ''}` : '')}</div>
        <div class="col">${field('อีเมล', data.email)}</div>
      </div>
    `
  );
};

// Section 1: Member Info (OC/AC/AM types)
export const buildMemberInfoCompany = (data) => {
  return section(
    'ส่วนที่ 1 ข้อมูลสมาชิก',
    `
      <div class="row">
        <div class="col">${field('ชื่อ (ไทย)', data.companyNameTh)}</div>
        <div class="col">${field('ชื่อ (อังกฤษ)', data.companyNameEn)}</div>
      </div>
      <div class="row">
        <div class="col">${field('เลขทะเบียนนิติบุคคล', data.taxId)}</div>
        <div class="col"></div>
      </div>
    `
  );
};

// Section 2: Address
export const buildAddressSection = (data) => {
  const addr = data.address2 || data;
  const phone = data.address2 ? data.addressType2Phone : data.phone;
  const phoneExt = data.address2 ? data.addressType2PhoneExt : data.phoneExtension;
  const email = data.address2 ? data.addressType2Email : data.email;
  const website = data.address2 ? data.addressType2Website : data.website;
  
  return section(
    'ส่วนที่ 2 ที่อยู่ในการจัดส่งเอกสาร',
    `
      <div class="row">
        <div class="col">${field('เลขที่', addr.number || addr.addressNumber)}</div>
        <div class="col">${field('หมู่', addr.moo)}</div>
        <div class="col">${field('ซอย', addr.soi)}</div>
        <div class="col">${field('ถนน', addr.street)}</div>
      </div>
      <div class="row">
        <div class="col">${field('ตำบล/แขวง', addr.subDistrict)}</div>
        <div class="col">${field('อำเภอ/เขต', addr.district)}</div>
        <div class="col">${field('จังหวัด', addr.province)}</div>
        <div class="col">${field('รหัสไปรษณีย์', addr.postalCode)}</div>
      </div>
      <div class="row" style="margin-top: 5px; border-top: 1px solid #e0e0e0; padding-top: 5px;">
        <div class="col">${field('โทรศัพท์', phone ? `${phone}${phoneExt ? ` ต่อ ${phoneExt}` : ''}` : '')}</div>
        <div class="col">${field('อีเมล', email || '', 'style="white-space: nowrap;"')}</div>
        <div class="col"></div>
      </div>
      <div class="row">
        <div class="col">${field('เว็บไซต์', website || '', 'style="white-space: nowrap;"')}</div>
      </div>
    `
  );
};

// Section 3: Representatives
export const buildRepresentativesSection = (representatives) => {
  if (!representatives || representatives.length === 0) return '';
  
  const repsHtml = representatives.slice(0, 3).map((rep, i) => {
    const firstTh = rep.firstNameTh || rep.first_name_th || rep.firstname;
    const lastTh = rep.lastNameTh || rep.last_name_th || rep.lastname;
    const firstEn = rep.firstNameEn || rep.first_name_en || rep.firstName_en;
    const lastEn = rep.lastNameEn || rep.last_name_en || rep.lastName_en;
    const position = rep.position || rep.positionName || rep.role || '';
    const phone = rep.phone || rep.tel || '';
    const phoneExt = rep.phoneExtension || rep.phone_extension || '';
    const email = rep.email || '';
    
    return `
      <div class="rep-box">
        <div class="rep-title">ผู้แทน ${i + 1}</div>
        ${field('ชื่อ (ไทย)', `${`${resolvePrename(rep.prename_th || rep.prenameTh, rep.prename_en || rep.prenameEn, rep.prename_other || rep.prenameOther, 'th') || ''}${firstTh || ''}`.trim()} ${lastTh || ''}`.trim())}
        ${field('ชื่อ (อังกฤษ)', `${`${resolvePrename(rep.prename_th || rep.prenameTh, rep.prename_en || rep.prenameEn, rep.prename_other || rep.prenameOther, 'en') || ''}${firstEn || ''}`.trim()} ${lastEn || ''}`.trim())}
        ${position ? `<div class="field"><span class="value">${position}</span></div>` : ''}
        ${field('โทร', phone ? `${phone}${phoneExt ? ` ต่อ ${phoneExt}` : ''}` : '')}
        ${field('อีเมล', email)}
      </div>
    `;
  }).join('');
  
  return section(
    'ส่วนที่ 3 นามผู้แทนใช้สิทธิ',
    `<div class="col-3">${repsHtml}</div>`
  );
};

// Section 4: Business Info
export const buildBusinessSection = (data, businessTypes, type) => {
  const displayProducts = Array.isArray(data.products) 
    ? data.products.slice(0, PDF_CONFIG.MAX_PRODUCTS_DISPLAY) 
    : [];
  const extraProducts = Array.isArray(data.products) && data.products.length > PDF_CONFIG.MAX_PRODUCTS_DISPLAY
    ? data.products.length - PDF_CONFIG.MAX_PRODUCTS_DISPLAY
    : 0;
  
  const productsHtml = displayProducts.length
    ? `
      <div>
        <strong>สินค้าและบริการ (${data.products.length} รายการ):</strong>
        <div class="product-list">
          ${displayProducts.map((p, i) => `
            <div class="product-item">
              <strong>${i + 1}.</strong> ${p.name_th || p.nameTh || '-'}
              ${(p.name_en || p.nameEn) && p.name_en !== '-' ? ` / ${p.name_en || p.nameEn}` : ''}
            </div>
          `).join('')}
          ${extraProducts > 0 ? `<div style="font-size: 11px; color: #666; margin-top: 4px;">... และอีก ${extraProducts} รายการ</div>` : ''}
        </div>
      </div>
    `
    : `<div><strong>สินค้าและบริการ:</strong><div style="margin-top: 6px;">-</div></div>`;
  
  const employeeInfo = type !== 'ic' ? `
    <div class="row" style="margin-top: 4px;">
      ${type === 'am' 
        ? `<div class="col">${field('สมาชิกสมาคม', `${formatNumber(data.numberOfMember)} คน`)}</div>
           <div class="col">${field('จำนวนพนักงาน', `${formatNumber(data.numberOfEmployees)} คน`)}</div>`
        : `<div class="col">${field('จำนวนพนักงาน', `${formatNumber(data.numberOfEmployees)} คน`)}</div>
           ${type === 'oc' ? `<div class="col">${field('ประเภทโรงงาน', data.factoryType === 'TYPE1' ? '> 50 แรงม้า' : '< 50 แรงม้า')}</div>` : '<div class="col"></div>'}`
      }
    </div>
  ` : '';
  
  return section(
    'ส่วนที่ 4 ข้อมูลธุรกิจ',
    `
      <div class="row">
        <div class="col">
          <div style="margin-bottom: 6px;">
            <strong>ประเภทธุรกิจ:</strong><br>
            <div style="margin-top: 2px;">
              ${businessTypes
                .split(', ')
                .filter(Boolean)
                .map(t => `<span style="display: inline-block; margin-right: 8px;">• ${t}</span>`)
                .join('')}
            </div>
          </div>
          ${employeeInfo}
        </div>
        <div class="col">${productsHtml}</div>
      </div>
    `
  );
};

// Contact Person Section
export const buildContactPersonSection = (contactPersons) => {
  if (!contactPersons || contactPersons.length === 0) return '';
  
  const isMain = (cp) => cp?.isMain === true || cp?.typeContactId === 1 || 
                        /หลัก|main/i.test(cp?.typeContactName || '');
  const mainContact = contactPersons.find(isMain) || contactPersons[0];
  
  return section(
    'ข้อมูลผู้ประสานงาน',
    `
      <div class="row">
        <div class="col">${field('ชื่อ (ไทย)', `${`${resolvePrename(mainContact.prename_th || mainContact.prenameTh, mainContact.prename_en || mainContact.prenameEn, mainContact.prename_other || mainContact.prenameOther, 'th') || ''}${mainContact.firstNameTh || mainContact.first_name_th || ''}`.trim()} ${mainContact.lastNameTh || mainContact.last_name_th || ''}`.trim())}</div>
        <div class="col">${field('ชื่อ (อังกฤษ)', `${`${resolvePrename(mainContact.prename_th || mainContact.prenameTh, mainContact.prename_en || mainContact.prenameEn, mainContact.prename_other || mainContact.prenameOther, 'en') || ''}${mainContact.firstNameEn || mainContact.first_name_en || ''}`.trim()} ${mainContact.lastNameEn || mainContact.last_name_en || ''}`.trim())}</div>
        <div class="col">${mainContact.position ? `<div class="field"><span class="value">${mainContact.position}</span></div>` : ''}</div>
      </div>
      <div class="row">
        <div class="col">${field('โทรศัพท์', mainContact.phone ? `${mainContact.phone}${mainContact.phoneExtension || mainContact.phone_extension ? ` ต่อ ${mainContact.phoneExtension || mainContact.phone_extension}` : ''}` : '')}</div>
        <div class="col">${field('อีเมล', mainContact.email || '')}</div>
        <div class="col"></div>
      </div>
    `
  );
};