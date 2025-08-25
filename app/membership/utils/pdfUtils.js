// ติดตั้ง: npm install html2pdf.js
import html2pdf from 'html2pdf.js';

// Format Thai date
const formatThaiDate = (date) => {
  if (!date) return '-';
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const d = new Date(date);
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
};

// If URL is Cloudinary, inject a safe transformation to ensure image output and smaller size
const transformCloudinaryUrl = (url) => {
  try {
    if (!url) return url;
    const u = new URL(url);
    if (!u.hostname.includes('res.cloudinary.com')) return url;
    // Insert transformation segment before version segment 'v12345'
    const parts = u.pathname.split('/');
    const uploadIdx = parts.findIndex(p => p === 'upload');
    if (uploadIdx === -1) return url;
    const nextPart = parts[uploadIdx + 1] || '';
    const isVersion = /^v\d+$/.test(nextPart);
    const isTransform = nextPart && !isVersion && !nextPart.includes('.') ;
    const inject = 'pg_1,f_auto,q_auto:eco,w_600';
    if (isVersion) {
      // No existing transform, insert before version
      parts.splice(uploadIdx + 1, 0, inject);
    } else if (isTransform) {
      // Already has transform; if missing f_auto, prepend ours
      if (!nextPart.includes('f_auto')) {
        parts[uploadIdx + 1] = `${inject},${nextPart}`;
      }
    } else {
      // Likely directly public_id (with extension). Insert transform here.
      parts.splice(uploadIdx + 1, 0, inject);
    }
    u.pathname = parts.join('/');
    return u.toString();
  } catch {
    return url;
  }
};

// Load remote image as Data URL to avoid CORS issues in html2canvas
const loadImageAsDataURL = async (url) => {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    // Only proceed if content is actually an image
    if (!(blob && blob.type && blob.type.startsWith('image/'))) {
      return null;
    }
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Error loading image as data URL:', err);
    return null;
  }
};

// Get title by type
const getTitleByType = (type) => ({
  'ic': 'เอกสารสมัครสมาชิก สมทบ-บุคคลธรรมดา (ทบ)',
  'oc': 'เอกสารสมัครสมาชิก สามัญ-โรงงาน (สน)',
  'ac': 'เอกสารสมัครสมาชิก สมทบ-นิติบุคคล (ทน)',
  'am': 'เอกสารสมัครสมาชิก สามัญ-สมาคมการค้า (สส)'
}[type] || 'ข้อมูลสมาชิก');

// Get business type names
const getBusinessTypeNames = (app) => {
  const names = {
    'manufacturer': 'ผู้ผลิต',
    'distributor': 'ผู้จัดจำหน่าย',
    'importer': 'ผู้นำเข้า',
    'exporter': 'ผู้ส่งออก',
    'service': 'ผู้ให้บริการ',
    'service_provider': 'ผู้ให้บริการ',
    'other': 'อื่นๆ'
  };

  // Normalize possible sources
  let src = app.businessTypes || app.business_types || app.businessType || app.business_type || null;
  if (!src) return '-';

  // String (comma separated)
  if (typeof src === 'string') {
    return src.split(',').map(s => s.trim()).filter(Boolean).map(s => names[s] || s).join(', ');
  }

  // Array of primitives (ids/labels)
  if (Array.isArray(src) && src.length && typeof src[0] !== 'object') {
    return src.map(k => names[k] || String(k)).join(', ');
  }

  // Array of objects
  if (Array.isArray(src)) {
    return src.map(bt => {
      // Prefer explicit name from API
      const named = bt.businessTypeName || bt.name_th || bt.nameTh || bt.label || bt.name;
      if (named) return named;
      const key = bt.id || bt.key || bt.business_type || bt.type;
      if (key === 'other') {
        // API may provide array of other types: [{ otherType }]
        const other = Array.isArray(app.businessTypeOther) && app.businessTypeOther.length > 0
          ? app.businessTypeOther[0].otherType || app.businessTypeOther[0].detail
          : app.businessTypeOther?.detail;
        return `อื่นๆ: ${other || '-'}`;
      }
      return names[key] || key;
    }).join(', ');
  }

  // Object format from form: { manufacturer: true, ... }
  return Object.entries(src)
    .filter(([k, v]) => v)
    .map(([k]) => {
      if (k === 'other') {
        const other = Array.isArray(app.businessTypeOther) && app.businessTypeOther.length > 0
          ? app.businessTypeOther[0].otherType || app.businessTypeOther[0].detail
          : app.businessTypeOther?.detail || app.otherBusinessTypeDetail;
        return `อื่นๆ: ${other || '-'}`;
      }
      return names[k] || k;
    })
    .join(', ');
};

// Process data - normalize field names
const processData = (app) => {
  // Fix company name mapping - handle cases where it shows '-'
  let companyNameTh = app.company_name_th || app.companyNameTh || app.associationName || app.associationNameTh;
  let companyNameEn = app.company_name_en || app.companyNameEn || app.associationNameEng || app.associationNameEn;
  
  // If company name is '-', try alternative mappings
  if (companyNameTh === '-' || !companyNameTh) {
    companyNameTh = app.companyName || app.name || app.company_name || '-';
  }
  if (companyNameEn === '-' || !companyNameEn) {
    companyNameEn = app.companyNameEng || app.nameEng || app.company_name_eng || '-';
  }
  
  // Find address type 2 data for contact information
  let addressType2Phone = '';
  let addressType2PhoneExt = '';
  let addressType2Email = '';
  let addressType2Website = '';
  
  // Check if addresses exists and find type 2 (array or object format)
  if (app.addresses) {
    if (Array.isArray(app.addresses)) {
      const addressType2 = app.addresses.find(addr => addr.address_type === '2' || addr.addressType === '2');
      if (addressType2) {
        addressType2Phone = addressType2.phone || '';
        addressType2PhoneExt = addressType2.phone_extension || addressType2.phoneExtension || '';
        addressType2Email = addressType2.email || '';
        addressType2Website = addressType2.website || '';
      }
    } else if (typeof app.addresses === 'object' && app.addresses['2']) {
      const a2 = app.addresses['2'];
      addressType2Phone = a2.phone || '';
      addressType2PhoneExt = a2.phone_extension || a2.phoneExtension || '';
      addressType2Email = a2.email || '';
      addressType2Website = a2.website || '';
    }
  }
  
  // Extract authorized signature and company stamp from documents if present
  let documents = app.documents 
    || app.memberDocuments 
    || app.MemberDocuments 
    || app.icDocuments 
    || app.ICDocuments 
    || app.member_docs 
    || app.memberDocs 
    || [];
  if (!Array.isArray(documents) && documents?.data && Array.isArray(documents.data)) {
    documents = documents.data;
  }
  const findDoc = (type) => {
    // normalize and support multiple aliases from different flows
    const aliasesMap = {
      authorizedSignature: ['authorizedSignature', 'authorized_signature', 'signature', 'authorizedSign'],
      companyStamp: ['companyStamp', 'company_stamp', 'stamp']
    };
    const aliases = aliasesMap[type] || [type];
    const doc = documents.find(d => {
      const t = (d.document_type || d.documentType || d.type || '').toString().trim();
      const tLower = t.toLowerCase();
      return aliases.some(a => t === a || tLower === a.toLowerCase());
    });
    if (!doc) return null;
    return {
      fileUrl: doc.cloudinary_url || doc.file_url || doc.fileUrl || doc.file_path || doc.url,
      mimeType: doc.mime_type || doc.mimeType || doc.type || '',
      fileName: doc.file_name || doc.fileName || doc.name || ''
    };
  };

  // Build address type 2 object (shipping address) - support array or object format
  let address2 = null;
  if (app.addresses) {
    if (Array.isArray(app.addresses)) {
      const raw = app.addresses.find(addr => addr.address_type === '2' || addr.addressType === '2' || addr.addressTypeId === 2);
      if (raw) {
        address2 = {
          number: raw.address_number || raw.addressNumber || raw.address_no || raw.addressNo || raw.house_number || raw.houseNumber || raw.number || '',
          moo: raw.moo || '',
          soi: raw.soi || '',
          street: raw.street || raw.road || '',
          subDistrict: raw.sub_district || raw.subDistrict || '',
          district: raw.district || raw.amphur || '',
          province: raw.province || '',
          postalCode: raw.postal_code || raw.postalCode || ''
        };
      }
    } else if (typeof app.addresses === 'object' && app.addresses['2']) {
      const raw = app.addresses['2'];
      address2 = {
        number: raw.addressNumber || raw.address_number || raw.address_no || raw.addressNo || raw.house_number || raw.houseNumber || raw.number || '',
        moo: raw.moo || '',
        soi: raw.soi || '',
        street: raw.street || raw.road || '',
        subDistrict: raw.subDistrict || raw.sub_district || '',
        district: raw.district || raw.amphur || '',
        province: raw.province || '',
        postalCode: raw.postalCode || raw.postal_code || ''
      };
    }
  }

  // Fallback: If base address fields are missing, try to derive from addresses type 1 or the first entry
  let baseAddress = {
    number: app.address_number || app.addressNumber || app.address?.addressNumber,
    moo: app.moo || app.address?.moo,
    soi: app.soi || app.address?.soi,
    street: app.street || app.road || app.address?.street || app.address?.road,
    subDistrict: app.sub_district || app.subDistrict || app.address?.subDistrict,
    district: app.district || app.address?.district,
    province: app.province || app.address?.province,
    postalCode: app.postal_code || app.postalCode || app.address?.postalCode,
  };
  if ((!baseAddress.number && app.addresses)) {
    const pick = (raw) => ({
      number: raw.address_number || raw.addressNumber || raw.address_no || raw.addressNo || raw.house_number || raw.houseNumber || raw.number || '',
      moo: raw.moo || '',
      soi: raw.soi || '',
      street: raw.street || raw.road || '',
      subDistrict: raw.sub_district || raw.subDistrict || '',
      district: raw.district || raw.amphur || '',
      province: raw.province || '',
      postalCode: raw.postal_code || raw.postalCode || ''
    });
    if (Array.isArray(app.addresses)) {
      const a1 = app.addresses.find(addr => addr.address_type === '1' || addr.addressType === '1' || addr.addressTypeId === 1) || app.addresses[0];
      if (a1) baseAddress = pick(a1);
    } else if (typeof app.addresses === 'object') {
      const a1 = app.addresses['1'] || app.addresses['main'] || null;
      if (a1) baseAddress = pick(a1);
    }
  }

  return {
    ...app,
    companyNameTh,
    companyNameEn,
    taxId: app.tax_id || app.taxId,
    numberOfEmployees: app.number_of_employees || app.numberOfEmployees,
    firstNameTh: app.first_name_th || app.firstNameTh,
    lastNameTh: app.last_name_th || app.lastNameTh,
    firstNameEn: app.first_name_en || app.firstNameEn,
    lastNameEn: app.last_name_en || app.lastNameEn,
    idCard: app.id_card_number || app.idCardNumber || app.idCard || app.id_card || app.citizen_id || app.nationalId || '-',
    // Normalize phone extension for consistent display (IC main uses phone_extension)
    phoneExtension: app.phone_extension || app.phoneExtension,
    // Base address fields (with robust fallbacks including addresses[0]/type1)
    addressNumber: baseAddress.number,
    moo: baseAddress.moo,
    soi: baseAddress.soi,
    street: baseAddress.street,
    district: baseAddress.district,
    province: baseAddress.province,
    subDistrict: baseAddress.subDistrict,
    postalCode: baseAddress.postalCode,
    factoryType: app.factory_type || app.factoryType,
    numberOfMember: app.number_of_member || app.numberOfMember,
    industrialGroupIds: app.industrialGroups || app.industrialGroupIds || [],
    provincialChapterIds: app.provincialCouncils || app.provincialChapterIds || [],
    // Documents
    authorizedSignature: app.authorizedSignature || findDoc('authorizedSignature') || null,
    companyStamp: app.companyStamp || findDoc('companyStamp') || null,
    // Representatives (normalize to a consistent array)
    representatives: (() => {
      let reps = app.representatives || app.reps || [];
  
      // IC uses singular 'representative' field
      if (!reps || reps.length === 0) {
        if (app.representative) {
          reps = [app.representative];
        }
      }
  
      if (!Array.isArray(reps)) {
        reps = reps ? [reps] : [];
      }
      return reps;
    })(),
    // Address type 2 contact information
    addressType2Phone,
    addressType2PhoneExt,
    addressType2Email,
    addressType2Website,
    // Address type 2 full data
    address2,
    // Compute authorized signatory name (prefer Thai, fallback to English, then representative)
    // Accept multiple possible shapes from API/frontend until APIs are unified
    authorizedSignatoryName: (() => {
      const pick = (...vals) => vals.find(v => typeof v === 'string' && v.trim());

      // Possible flat fields
      const thFirst = pick(app.authorizedSignatoryFirstNameTh, app.authorizedSignatureFirstNameTh, app.authorizedSignatoryNameTh?.firstName, app.authorizedSignatureNameTh?.firstName);
      const thLast  = pick(app.authorizedSignatoryLastNameTh,  app.authorizedSignatureLastNameTh,  app.authorizedSignatoryNameTh?.lastName,  app.authorizedSignatureNameTh?.lastName);
      const enFirst = pick(app.authorizedSignatoryFirstNameEn, app.authorizedSignatureFirstNameEn, app.authorizedSignatoryNameEn?.firstName, app.authorizedSignatureNameEn?.firstName);
      const enLast  = pick(app.authorizedSignatoryLastNameEn,  app.authorizedSignatureLastNameEn,  app.authorizedSignatoryNameEn?.lastName,  app.authorizedSignatureNameEn?.lastName);

      const fullTh = [thFirst || '', thLast || ''].join(' ').trim();
      const fullEn = [enFirst || '', enLast || ''].join(' ').trim();

      if (fullTh) return fullTh;
      if (fullEn) return fullEn;

      // Fallback to first representative name if present
      if (app.representatives?.[0]) {
        const r = app.representatives[0];
        const repTh = `${r.firstNameTh || r.first_name_th || ''} ${r.lastNameTh || r.last_name_th || ''}`.trim();
        const repEn = `${r.firstNameEn || r.first_name_en || ''} ${r.lastNameEn || r.last_name_en || ''}`.trim();
        return pick(repTh, repEn, r.name, app.representativeName, 'ผู้มีอำนาจลงนาม');
      }
      return pick(app.representativeName, 'ผู้มีอำนาจลงนาม');
    })()
  };
};

// Create field HTML
const field = (label, value, style = '') => 
  `<div class="field" ${style}><span class="label">${label}:</span> <span class="value">${value || '-'}</span></div>`;

// Create section HTML
const section = (title, content) => 
  `<div class="section"><div class="section-title">${title}</div>${content}</div>`;

// Main PDF generation function
export const generateMembershipPDF = async (application, type, industrialGroups = {}, provincialChapters = {}) => {
  try {
    const data = processData(application);
    const title = getTitleByType(type);
    const businessTypes = getBusinessTypeNames(data);
    
    // Resolve Industrial Group & Provincial Chapter names
    let industrialGroupNames = data.industrialGroupNames || [];
    let provincialChapterNames = data.provincialChapterNames || [];

    const pickName = (obj, keys) => keys.map(k => obj?.[k]).find(Boolean);

    if ((!industrialGroupNames || industrialGroupNames.length === 0)) {
      // Try from arrays with names (API provides `industryGroups`)
      if (Array.isArray(application.industryGroups)) {
        industrialGroupNames = application.industryGroups
          .map(g => pickName(g, ['industryGroupName', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']))
          .filter(Boolean);
      } 
      // Admin normalized data uses `industrialGroups` (not `industrialGroupIds`)
      else if (Array.isArray(data.industrialGroups)) {
        industrialGroupNames = data.industrialGroups
          .map(g => pickName(g, ['name', 'industryGroupName', 'industry_group_name', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']))
          .filter(Boolean);
      }
      // Legacy: Check for industrialGroupIds
      else if (Array.isArray(data.industrialGroupIds)) {
        // Case 1: Admin may provide array of objects that already include name fields
        if (data.industrialGroupIds.length > 0 && typeof data.industrialGroupIds[0] === 'object') {
          industrialGroupNames = data.industrialGroupIds
            .map(g => pickName(g, ['industryGroupName', 'industry_group_name', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']))
            .filter(Boolean);
        }
        // Case 2: Fallback to lookup arrays (ids only)
        if ((!industrialGroupNames || industrialGroupNames.length === 0)) {
          const groupsArr = Array.isArray(industrialGroups) ? industrialGroups : (industrialGroups.data || []);
          industrialGroupNames = data.industrialGroupIds
            .map(id => groupsArr.find(g => g.id === id || g.MEMBER_GROUP_CODE === id))
            .map(g => g && pickName(g, ['industryGroupName', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']))
            .filter(Boolean);
        }
      }
    }

    // Preload company stamp image (if any)
    const stampUrlCandidate = data.companyStamp?.fileUrl || '';
    let companyStampImgSrc = '';
    if (stampUrlCandidate) {
      const maybeCld = transformCloudinaryUrl(stampUrlCandidate);
      console.debug('[PDF] companyStamp URL (original):', stampUrlCandidate);
      console.debug('[PDF] companyStamp URL (transformed):', maybeCld);
      const dataUrl = await loadImageAsDataURL(maybeCld);
      if (dataUrl) {
        companyStampImgSrc = dataUrl;
        console.debug('[PDF] companyStamp loaded as data URL (length):', dataUrl.length);
      } else {
        const looksLikeImg = /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(maybeCld)
          || (data.companyStamp?.mimeType?.startsWith?.('image/') || data.companyStamp?.fileType?.startsWith?.('image/'));
        if (looksLikeImg) {
          companyStampImgSrc = maybeCld;
          console.debug('[PDF] companyStamp fallback to URL');
        } else {
          console.warn('[PDF] companyStamp appears non-image, skipping <img>');
        }
      }
    }

    // Preload FTI logo as Data URL to avoid any CORS/path issues
    const logoPublicPath = '/FTI-MasterLogo_RGB_forLightBG.png';
    let logoSrc = logoPublicPath;
    try {
      const logoDataUrl = await loadImageAsDataURL(logoPublicPath);
      if (logoDataUrl) logoSrc = logoDataUrl;
    } catch (e) {
      console.warn('[PDF] failed to preload logo as data URL, fallback to public path', e);
    }

    if ((!provincialChapterNames || provincialChapterNames.length === 0)) {
      if (Array.isArray(application.provinceChapters) || Array.isArray(application.provincialChapters)) {
        const src = application.provinceChapters || application.provincialChapters;
        provincialChapterNames = src
          .map(c => pickName(c, ['provinceChapterName', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']))
          .filter(Boolean);
      } 
      // Admin normalized data uses `provincialChapters` (not `provincialChapterIds`)
      else if (Array.isArray(data.provincialChapters)) {
        provincialChapterNames = data.provincialChapters
          .map(c => pickName(c, ['name', 'provinceChapterName', 'province_chapter_name', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']))
          .filter(Boolean);
      }
      // Legacy: Check for provincialChapterIds
      else if (Array.isArray(data.provincialChapterIds)) {
        // Case 1: Admin may provide array of objects that already include name fields
        if (data.provincialChapterIds.length > 0 && typeof data.provincialChapterIds[0] === 'object') {
          provincialChapterNames = data.provincialChapterIds
            .map(c => pickName(c, ['provinceChapterName', 'province_chapter_name', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']))
            .filter(Boolean);
        }
        // Case 2: Fallback to lookup arrays (ids only)
        if ((!provincialChapterNames || provincialChapterNames.length === 0)) {
          const chArr = Array.isArray(provincialChapters) ? provincialChapters : (provincialChapters.data || []);
          provincialChapterNames = data.provincialChapterIds
            .map(id => chArr.find(c => c.id === id || c.MEMBER_GROUP_CODE === id))
            .map(c => c && pickName(c, ['provinceChapterName', 'MEMBER_GROUP_NAME', 'name_th', 'nameTh']))
            .filter(Boolean);
        }
      }
    }
    
    // Limit long lists to help fit within 2 pages
    const MAX_PRODUCTS_DISPLAY = 12;
    const MAX_GROUPS_DISPLAY = 10;
    const MAX_CHAPTERS_DISPLAY = 10;

    const displayProducts = Array.isArray(data.products) ? data.products.slice(0, MAX_PRODUCTS_DISPLAY) : [];
    const extraProducts = Array.isArray(data.products) && data.products.length > MAX_PRODUCTS_DISPLAY
      ? data.products.length - MAX_PRODUCTS_DISPLAY
      : 0;

    const displayIndustryGroups = Array.isArray(industrialGroupNames) ? industrialGroupNames.slice(0, MAX_GROUPS_DISPLAY) : [];
    const extraIndustryGroups = Array.isArray(industrialGroupNames) && industrialGroupNames.length > MAX_GROUPS_DISPLAY
      ? industrialGroupNames.length - MAX_GROUPS_DISPLAY
      : 0;

    const displayProvincialChapters = Array.isArray(provincialChapterNames) ? provincialChapterNames.slice(0, MAX_CHAPTERS_DISPLAY) : [];
    const extraProvincialChapters = Array.isArray(provincialChapterNames) && provincialChapterNames.length > MAX_CHAPTERS_DISPLAY
      ? provincialChapterNames.length - MAX_CHAPTERS_DISPLAY
      : 0;
    
    // Preload signature image as data URL if possible (for Cloudinary or other origins)
    // Log document info for debugging signature rendering
    console.debug('[PDF] authorizedSignature doc:', data.authorizedSignature);
    const sigUrlCandidate = data.authorizedSignature?.fileUrl || '';
    let signatureImgSrc = '';
    if (sigUrlCandidate) {
      const maybeCld = transformCloudinaryUrl(sigUrlCandidate);
      console.debug('[PDF] signature URL (original):', sigUrlCandidate);
      console.debug('[PDF] signature URL (transformed):', maybeCld);
      // Try to fetch as data URL first (best for CORS safety)
      const dataUrl = await loadImageAsDataURL(maybeCld);
      if (dataUrl) {
        signatureImgSrc = dataUrl;
        console.debug('[PDF] signature loaded as data URL (length):', dataUrl.length);
      } else {
        // If fetch failed (CORS/format), fallback to raw URL if it looks like an image
        const looksLikeImg = /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(maybeCld)
          || (data.authorizedSignature?.mimeType?.startsWith?.('image/') || data.authorizedSignature?.fileType?.startsWith?.('image/'));
        if (looksLikeImg) {
          signatureImgSrc = maybeCld;
          console.debug('[PDF] signature fallback to URL');
        } else {
          console.warn('[PDF] signature appears non-image, skipping <img>');
        }
      }
    }

    // Simple CSS
    const styles = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Sarabun', sans-serif; font-size: 11px; line-height: 1.3; padding: 6px; }
      .logo-wrap { text-align: center; margin-bottom: 2px; display: flex; justify-content: center; }
      .logo-wrap img { height: 28px; object-fit: contain; display: block; margin: 0 auto; }
      .header { text-align: center; font-size: 11.5px; font-weight: bold; margin-bottom: 2px; padding-bottom: 1px; border-bottom: 1px solid #333; }
      .section { border: 1px solid #ddd; margin-bottom: 4px; padding: 5px; }
      .section-title { font-weight: bold; font-size: 10px; background: #f5f5f5; padding: 2px 4px; margin: -5px -5px 4px -5px; border-bottom: 1px solid #ddd; }
      .field { margin-bottom: 2px; font-size: 10px; }
      .label { font-weight: 600; display: inline-block; min-width: 70px; }
      .value { color: #333; }
      .row { display: flex; gap: 12px; }
      .col { flex: 1; }
      .col-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .rep-box { border: 1px solid #e0e0e0; padding: 5px; background: #fafafa; }
      .rep-title { font-weight: bold; font-size: 9.5px; color: #0066cc; margin-bottom: 2px; }
      .business-tag { display: inline-block; background: #e6f3ff; color: #0066cc; padding: 1px 4px; border-radius: 3px; font-size: 9.5px; margin: 1px; }
      .signature-area { display: flex; gap: 16px; margin-top: 8px; }
      .signature-box { flex: 1; border: 1px solid #ddd; padding: 12px; text-align: center; min-width: 140px; }
      .signature-img { border: 1px dashed #999; height: 55px; width: 110px; margin: 8px auto; display: flex; align-items: center; justify-content: center; }
      .stamp-box { border: 1px solid #ddd; padding: 12px; text-align: center; min-width: 140px; }
      .stamp-img { border: 1px dashed #999; width: 110px; height: 55px; margin: 8px auto; display: flex; align-items: center; justify-content: center; }
      .footer { text-align: center; font-size: 8.5px; color: #999; margin-top: 8px; }
      .list-2col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 12px; row-gap: 2px; align-items: start; }
      .list-2col .span-all { grid-column: 1 / -1; }
      .list-3col { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 10px; row-gap: 4px; align-items: start; }
      .list-3col .span-all { grid-column: 1 / -1; }
    `;

    // Generate HTML content
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>${styles}</style>
      </head>
      <body>
        <div class="logo-wrap">
          <img src="${logoSrc}" alt="FTI Logo" crossorigin="anonymous" />
        </div>
        <div class="header">${title}</div>
        
        ${type === 'ic' ? 
          section('ข้อมูลผู้สมัคร', `
            <div class="row">
              <div class="col">${field('ชื่อ-นามสกุล (ไทย)', `${data.firstNameTh || ''} ${data.lastNameTh || ''}`)}</div>
              <div class="col">${field('ชื่อ-นามสกุล (อังกฤษ)', `${data.firstNameEn || ''} ${data.lastNameEn || ''}`)}</div>
            </div>
            <div class="row">
              <div class="col">${field('บัตรประชาชน', data.idCard)}</div>
              <div class="col">${field('โทรศัพท์', data.phone ? `${data.phone}${data.phoneExtension ? ` ต่อ ${data.phoneExtension}` : ''}` : '')}</div>
              <div class="col">${field('อีเมล', data.email)}</div>
            </div>
          `) :
          section(type === 'am' ? 'ข้อมูลสมาคม' : 'ข้อมูลบริษัท', `
            <div class="row">
              <div class="col">${field('ชื่อ (ไทย)', data.companyNameTh)}</div>
              <div class="col">${field('ชื่อ (อังกฤษ)', data.companyNameEn)}</div>
            </div>
            <div class="row">
              <div class="col">${field('เลขทะเบียน', data.taxId)}</div>
              <div class="col"></div>
              <div class="col"></div>
            </div>
          `)
        }
        
        ${data.address2 ?
          section('ที่อยู่จัดส่งเอกสาร (ที่อยู่ 2)', `
            <div class="row">
              <div class="col">${field('เลขที่', data.address2.number)}</div>
              <div class="col">${field('หมู่', data.address2.moo)}</div>
              <div class="col">${field('ซอย', data.address2.soi)}</div>
              <div class="col">${field('ถนน', data.address2.street)}</div>
            </div>
            <div class="row">
              <div class="col">${field('ตำบล/แขวง', data.address2.subDistrict)}</div>
              <div class="col">${field('อำเภอ/เขต', data.address2.district)}</div>
              <div class="col">${field('จังหวัด', data.address2.province)}</div>
              <div class="col">${field('รหัสไปรษณีย์', data.address2.postalCode)}</div>
            </div>
            ${(data.addressType2Phone || data.addressType2Email || data.addressType2Website) ? `
              <div class="row" style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
                ${data.addressType2Phone ? `<div class=\"col\">${field('โทรศัพท์', data.addressType2Phone)}${data.addressType2PhoneExt ? ` ต่อ ${data.addressType2PhoneExt}` : ''}</div>` : '<div class=\"col\"></div>'}
                ${data.addressType2Email ? `<div class=\"col\">${field('อีเมล', data.addressType2Email)}</div>` : '<div class=\"col\"></div>'}
                ${data.addressType2Website ? `<div class=\"col\">${field('เว็บไซต์', data.addressType2Website)}</div>` : '<div class=\"col\"></div>'}
              </div>
            ` : ''}
          `)
          :
          section('ที่อยู่', `
            <div class="row">
              <div class="col">${field('เลขที่', data.addressNumber)}</div>
              <div class="col">${field('หมู่', data.moo)}</div>
              <div class="col">${field('ซอย', data.soi)}</div>
              <div class="col">${field('ถนน', data.street)}</div>
            </div>
            <div class="row">
              <div class="col">${field('ตำบล/แขวง', data.subDistrict)}</div>
              <div class="col">${field('อำเภอ/เขต', data.district)}</div>
              <div class="col">${field('จังหวัด', data.province)}</div>
              <div class="col">${field('รหัสไปรษณีย์', data.postalCode)}</div>
            </div>
            ${(data.phone || data.email || data.website) ? `
              <div class="row" style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
                ${data.phone ? `<div class=\"col\">${field('โทรศัพท์', data.phone)}${data.phoneExtension ? ` ต่อ ${data.phoneExtension}` : ''}</div>` : '<div class=\"col\"></div>'}
                ${data.email ? `<div class=\"col\">${field('อีเมล', data.email)}</div>` : '<div class=\"col\"></div>'}
                ${data.website ? `<div class=\"col\">${field('เว็บไซต์', data.website)}</div>` : '<div class=\"col\"></div>'}
              </div>
            ` : ''}
          `)
        }
        
        ${data.contactPersons?.length ? (() => {
          const isMain = (cp) => cp?.isMain === true
            || cp?.typeContactId === 1 || cp?.type_contact_id === 1
            || /หลัก|main/i.test(cp?.typeContactName || cp?.type_contact_name || '');
          const mainContact = data.contactPersons.find(isMain) || data.contactPersons[0];
          return section('ข้อมูลผู้ประสานงาน', `
            <div class="row">
              <div class="col">${field('ชื่อ (ไทย)', `${mainContact.firstNameTh || mainContact.first_name_th || ''} ${mainContact.lastNameTh || mainContact.last_name_th || ''}`)}</div>
              <div class="col">${field('ชื่อ (อังกฤษ)', `${mainContact.firstNameEn || mainContact.first_name_en || ''} ${mainContact.lastNameEn || mainContact.last_name_en || ''}`)}</div>
              <div class="col">${field('ตำแหน่ง', mainContact.position || '')}</div>
            </div>
            <div class="row">
              <div class="col">${field('โทรศัพท์', mainContact.phone ? `${mainContact.phone}${(mainContact.phoneExtension || mainContact.phone_extension) ? ` ต่อ ${(mainContact.phoneExtension || mainContact.phone_extension)}` : ''}` : '')}</div>
              <div class="col">${field('อีเมล', mainContact.email || '')}</div>
              <div class="col"></div>
            </div>
          `);
        })() : ''}
        
        ${data.representatives?.length ? section('ข้อมูลผู้แทน (สูงสุด 3 คน)', `
          <div class="col-3">
            ${data.representatives.slice(0, 3).map((rep, i) => {
              const firstTh = rep.firstNameTh || rep.first_name_th || rep.firstNameThai || rep.firstname_th || rep.firstnameThai || rep.firstname;
              const lastTh  = rep.lastNameTh  || rep.last_name_th  || rep.lastNameThai  || rep.lastname_th  || rep.lastnameThai  || rep.lastname;
              const firstEn = rep.firstNameEn || rep.first_name_en || rep.firstNameEnglish || rep.firstname_en || rep.firstnameEnglish;
              const lastEn  = rep.lastNameEn  || rep.last_name_en  || rep.lastNameEnglish  || rep.lastname_en  || rep.lastnameEnglish;
              const position = rep.position || rep.positionName || rep.role || '';
              const phone = rep.phone || rep.tel || rep.telephone || '';
              const phoneExt = rep.phoneExtension || rep.phone_extension || rep.ext || rep.extension || '';
              const email = rep.email || rep.mail || rep.e_mail || '';
              return `
                <div class=\"rep-box\">
                  <div class=\"rep-title\">ผู้แทน ${i + 1}</div>
                  ${field('ชื่อ (ไทย)', `${firstTh || ''} ${lastTh || ''}`)}
                  ${field('ชื่อ (อังกฤษ)', `${firstEn || ''} ${lastEn || ''}`)}
                  ${field('ตำแหน่ง', position)}
                  ${field('โทร', phone ? `${phone}${phoneExt ? ` ต่อ ${phoneExt}` : ''}` : '')}
                  ${field('อีเมล', email)}
                </div>
              `;
            }).join('')}
          </div>
        `) : ''}
        
        ${(businessTypes && businessTypes !== '-') ? section('ข้อมูลธุรกิจ', `
          <div class="row">
            <div class="col">
              <div style="margin-bottom: 10px;">
                <strong>ประเภทธุรกิจ:</strong><br>
                <div style="margin-top: 5px;">
                  ${businessTypes.split(', ').filter(Boolean).map(t => `<span class="business-tag">${t}</span>`).join('')}
                </div>
              </div>
              ${type !== 'ic' ? `
                <div class=\"row\">
                  ${type === 'am'
                    ? `<div class=\"col\">${field('สมาชิกสมาคม', `${data.numberOfMember || '-'} คน`)}</div><div class=\"col\">${field('จำนวนพนักงาน', `${data.numberOfEmployees || '-'} คน`)}</div>`
                    : `<div class=\"col\">${field('จำนวนพนักงาน', `${data.numberOfEmployees || '-'} คน`)}</div>${type === 'oc' ? `<div class=\"col\">${field('ประเภทโรงงาน', data.factoryType === 'TYPE1' ? '> 50 แรงม้า' : '< 50 แรงม้า')}</div>` : '<div class=\"col\"></div>'}`}
                </div>
              ` : ''}
            </div>
            <div class="col">
              ${displayProducts.length ? `
                <div>
                  <strong>สินค้าและบริการ (${data.products.length} รายการ):</strong>
                  <div style="margin-top: 8px; padding: 8px; background: #f9f9f9; border-radius: 4px;">
                    <div class="list-3col">
                      ${displayProducts.map((p, i) => `
                        <div style="font-size: 11px;">
                          <strong>${i + 1}.</strong> 
                          <span style="color: #0066cc;">${p.name_th || p.nameTh || '-'}</span>
                          ${(p.name_en || p.nameEn) && (p.name_en || p.nameEn) !== '-' ? ` / <span style=\"color: #666;\">${p.name_en || p.nameEn}</span>` : ''}
                        </div>
                      `).join('')}
                      ${extraProducts > 0 ? `<div class="span-all" style="font-size: 10px; color: #666;">... และอีก ${extraProducts} รายการ</div>` : ''}
                    </div>
                  </div>
                </div>
              ` : `
                <div>
                  <strong>สินค้าและบริการ:</strong>
                  <div style="margin-top: 6px; color: #666;">-</div>
                </div>
              `}
            </div>
          </div>
        `) : ''}
        

        ${(() => {
          // Ensure fallback names from IDs if names are still empty
          let igNames = industrialGroupNames && industrialGroupNames.length ? industrialGroupNames : null;
          let pcNames = provincialChapterNames && provincialChapterNames.length ? provincialChapterNames : null;
          if (!igNames && Array.isArray(data.industrialGroupIds) && data.industrialGroupIds.length) {
            igNames = data.industrialGroupIds.map(id => `กลุ่มอุตสาหกรรม ${id}`);
          }
          if (!pcNames && Array.isArray(data.provincialChapterIds) && data.provincialChapterIds.length) {
            pcNames = data.provincialChapterIds.map(id => `สภาอุตสาหกรรมจังหวัด ${id}`);
          }
          if (!(igNames?.length || pcNames?.length)) return '';
          const dispIG = Array.isArray(igNames) ? igNames.slice(0, MAX_GROUPS_DISPLAY) : [];
          const dispPC = Array.isArray(pcNames) ? pcNames.slice(0, MAX_CHAPTERS_DISPLAY) : [];
          const extraIG = igNames.length > MAX_GROUPS_DISPLAY ? igNames.length - MAX_GROUPS_DISPLAY : 0;
          const extraPC = pcNames.length > MAX_CHAPTERS_DISPLAY ? pcNames.length - MAX_CHAPTERS_DISPLAY : 0;
          return section('กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด', `
            <div class="row">
              <div class="col">
                <strong>กลุ่มอุตสาหกรรม:</strong><br>
                ${dispIG.length ? 
                  `<div class=\"list-2col\">${dispIG.map(name => `<div>• ${name}</div>`).join('')}${extraIG > 0 ? `<div class=\"span-all\" style=\"font-size: 9.5px; color: #666;\">... และอีก ${extraIG} รายการ</div>` : ''}</div>` : 
                  'ไม่ระบุ'}
              </div>
              <div class="col">
                <strong>สภาอุตสาหกรรมจังหวัด:</strong><br>
                ${dispPC.length ? 
                  `<div class=\"list-2col\">${dispPC.map(name => `<div>• ${name}</div>`).join('')}${extraPC > 0 ? `<div class=\"span-all\" style=\"font-size: 9.5px; color: #666;\">... และอีก ${extraPC} รายการ</div>` : ''}</div>` : 
                  '• สภาอุตสาหกรรมแห่งประเทศไทย'}
              </div>
            </div>
          `);
        })()}
        
        
        ${(['oc','ac','am'].includes(type)) ? `
          <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <div style="display: flex; gap: 20px; font-size: 12px;">
              <div class="signature-box">
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">ลายเซ็นผู้มีอำนาจ</div>
                <div class="signature-img">
                  ${signatureImgSrc
                    ? `<img src="${signatureImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`
                    : (data.authorizedSignature?.fileUrl ? 'แนบไฟล์: ลายเซ็น (ไม่ใช่รูปภาพ)' : '(ลายเซ็น)')}
                </div>
                <div style="font-size: 10px; margin-top: 5px; border-top: 1px solid #999; padding-top: 5px;">
                  (${data.authorizedSignatoryName || 'ชื่อผู้มีอำนาจลงนาม'})
                  <div style="margin-top: 2px; color: #555;">วันที่: ${formatThaiDate(new Date())}</div>
                </div>
              </div>
              <div class="stamp-box">
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">ตราบริษัท</div>
                <div class="stamp-img">
                  ${companyStampImgSrc 
                    ? `<img src="${companyStampImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" alt="Company Stamp" />`
                    : `<img src="${logoSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" alt="FTI Logo" />`}
                </div>
              </div>
            </div>
          </div>
        ` : `
          <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <div style="display: flex; gap: 20px; font-size: 12px;">
              <div class="signature-box">
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">ลายเซ็นผู้มีอำนาจ</div>
                <div class="signature-img">
                  ${signatureImgSrc
                    ? `<img src="${signatureImgSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />`
                    : (data.authorizedSignature?.fileUrl ? 'แนบไฟล์: ลายเซ็น (ไม่ใช่รูปภาพ)' : '(ลายเซ็น)')}
                </div>
                <div style="font-size: 10px; margin-top: 5px; border-top: 1px solid #999; padding-top: 5px;">
                  (${data.authorizedSignatoryName || 'ชื่อผู้มีอำนาจลงนาม'})
                  <div style="margin-top: 2px; color: #555;">วันที่: ${formatThaiDate(new Date())}</div>
                </div>
              </div>
            </div>
          </div>
        `}
        
        <div class="footer">
          สร้างเมื่อ: ${formatThaiDate(new Date())} ${new Date().toLocaleTimeString('th-TH')}
        </div>
      </body>
      </html>
    `;

    // Create PDF
    const element = document.createElement('div');
    element.innerHTML = html;
    
    const opt = {
      margin: 5,
      filename: `${type?.toUpperCase()}_${data.companyNameTh || data.firstNameTh || 'APPLICATION'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, imageTimeout: 10000 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'avoid-all'] }
    };
    
    await html2pdf().set(opt).from(element).save();
    return { success: true, filename: opt.filename };
    
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Download helper function
export const downloadMembershipPDF = async (application, type) => {
  // Allow calling with API response shape: { success, data, industrialGroups, provincialChapters }
  const appData = application?.data ? application.data : application;
  const lookupIndustrialGroups = application?.industrialGroups || application?.lookupIndustrialGroups || [];
  const lookupProvincialChapters = application?.provincialChapters || application?.lookupProvincialChapters || [];

  const result = await generateMembershipPDF(appData, type, lookupIndustrialGroups, lookupProvincialChapters);
  if (!result.success) {
    throw new Error(result.error || 'เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
  }
  return result;
};

// Export
export default { 
  generateMembershipPDF,
  downloadMembershipPDF 
};