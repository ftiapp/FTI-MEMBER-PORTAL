// ติดตั้ง: npm install html2pdf.js
import html2pdf from 'html2pdf.js';

// Format Thai date
const formatThaiDate = (date) => {
  if (!date) return '-';
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const d = new Date(date);
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
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
  if (!app.businessTypes) return '-';
  const names = {
    'manufacturer': 'ผู้ผลิต',
    'distributor': 'ผู้จัดจำหน่าย',
    'importer': 'ผู้นำเข้า',
    'exporter': 'ผู้ส่งออก',
    'service': 'ผู้ให้บริการ',
    'other': 'อื่นๆ'
  };
  
  if (Array.isArray(app.businessTypes)) {
    return app.businessTypes.map(bt => 
      bt.business_type === 'other' ? `อื่นๆ: ${app.businessTypeOther?.find(o => o.main_id === bt.main_id)?.detail || '-'}` 
      : names[bt.business_type] || bt.business_type
    ).join(', ');
  }
  
  return Object.entries(app.businessTypes)
    .filter(([k, v]) => v)
    .map(([k]) => k === 'other' ? `อื่นๆ: ${app.businessTypeOther?.detail || '-'}` : names[k] || k)
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
  
  // Check if addresses array exists and find type 2
  if (app.addresses && Array.isArray(app.addresses)) {
    const addressType2 = app.addresses.find(addr => addr.address_type === '2' || addr.addressType === '2');
    if (addressType2) {
      addressType2Phone = addressType2.phone || '';
      addressType2PhoneExt = addressType2.phone_extension || addressType2.phoneExtension || '';
      addressType2Email = addressType2.email || '';
      addressType2Website = addressType2.website || '';
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
    idCard: app.id_card_number || app.idCard,
    addressNumber: app.address_number || app.addressNumber,
    subDistrict: app.sub_district || app.subDistrict,
    postalCode: app.postal_code || app.postalCode,
    factoryType: app.factory_type || app.factoryType,
    numberOfMember: app.number_of_member || app.numberOfMember,
    industrialGroupIds: app.industrialGroups || app.industrialGroupIds || [],
    provincialChapterIds: app.provincialCouncils || app.provincialChapterIds || [],
    // Address type 2 contact information
    addressType2Phone,
    addressType2PhoneExt,
    addressType2Email,
    addressType2Website,
    // Representative name for signature
    representativeName: app.representatives?.[0] ? 
      `${app.representatives[0].firstNameTh || app.representatives[0].first_name_th || ''} ${app.representatives[0].lastNameTh || app.representatives[0].last_name_th || ''}`.trim() ||
      `${app.representatives[0].firstNameEn || app.representatives[0].first_name_en || ''} ${app.representatives[0].lastNameEn || app.representatives[0].last_name_en || ''}`.trim() ||
      app.representatives[0].name || 'ผู้มีอำนาจลงนาม'
      : app.representativeName || 'ผู้มีอำนาจลงนาม'
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
    
    // Simple CSS
    const styles = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Sarabun', sans-serif; font-size: 12px; line-height: 1.4; padding: 10px; }
      .header { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #333; }
      .section { border: 1px solid #ddd; margin-bottom: 8px; padding: 8px; }
      .section-title { font-weight: bold; font-size: 11px; background: #f5f5f5; padding: 3px 5px; margin: -8px -8px 5px -8px; border-bottom: 1px solid #ddd; }
      .field { margin-bottom: 4px; font-size: 11px; }
      .label { font-weight: 600; display: inline-block; min-width: 80px; }
      .value { color: #333; }
      .row { display: flex; gap: 15px; }
      .col { flex: 1; }
      .col-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .rep-box { border: 1px solid #e0e0e0; padding: 6px; background: #fafafa; }
      .rep-title { font-weight: bold; font-size: 10px; color: #0066cc; margin-bottom: 3px; }
      .business-tag { display: inline-block; background: #e6f3ff; color: #0066cc; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin: 2px; }
      .signature-area { display: flex; gap: 20px; margin-top: 10px; }
      .signature-box { flex: 1; border: 1px solid #ddd; padding: 15px; text-align: center; min-width: 150px; }
      .signature-img { border: 1px dashed #999; height: 60px; width: 120px; margin: 10px auto; display: flex; align-items: center; justify-content: center; }
      .stamp-box { border: 1px solid #ddd; padding: 15px; text-align: center; min-width: 150px; }
      .stamp-img { border: 1px dashed #999; width: 120px; height: 60px; margin: 10px auto; display: flex; align-items: center; justify-content: center; }
      .footer { text-align: center; font-size: 9px; color: #999; margin-top: 10px; }
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
        <div class="header">${title}</div>
        
        ${type === 'ic' ? 
          section('ข้อมูลผู้สมัคร', `
            <div class="row">
              <div class="col">${field('ชื่อ-นามสกุล (ไทย)', `${data.firstNameTh || ''} ${data.lastNameTh || ''}`)}</div>
              <div class="col">${field('ชื่อ-นามสกุล (อังกฤษ)', `${data.firstNameEn || ''} ${data.lastNameEn || ''}`)}</div>
            </div>
            <div class="row">
              <div class="col">${field('บัตรประชาชน', data.idCard)}</div>
              <div class="col">${field('โทรศัพท์', data.phone)}</div>
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
              ${type === 'am' ? `<div class="col">${field('สมาชิก', `${data.numberOfMember || '-'} คน`)}</div>` : '<div class="col"></div>'}
              <div class="col"></div>
            </div>
          `)
        }
        
        ${section('ที่อยู่', `
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
          ${(data.addressType2Phone || data.addressType2Email || data.addressType2Website) ? `
            <div class="row" style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
              ${data.addressType2Phone ? `<div class="col">${field('โทรศัพท์', data.addressType2Phone)}${data.addressType2PhoneExt ? ` ต่อ ${data.addressType2PhoneExt}` : ''}</div>` : '<div class="col"></div>'}
              ${data.addressType2Email ? `<div class="col">${field('อีเมล', data.addressType2Email)}</div>` : '<div class="col"></div>'}
              ${data.addressType2Website ? `<div class="col">${field('เว็บไซต์', data.addressType2Website)}</div>` : '<div class="col"></div>'}
            </div>
          ` : ''}
        `)}
        
        ${data.representatives?.length ? section('ข้อมูลผู้แทน (สูงสุด 3 คน)', `
          <div class="col-3">
            ${data.representatives.slice(0, 3).map((rep, i) => `
              <div class="rep-box">
                <div class="rep-title">ผู้แทน ${i + 1}</div>
                ${field('ชื่อ (ไทย)', `${rep.firstNameTh || rep.first_name_th || ''} ${rep.lastNameTh || rep.last_name_th || ''}`)}
                ${field('ชื่อ (อังกฤษ)', `${rep.firstNameEn || rep.first_name_en || ''} ${rep.lastNameEn || rep.last_name_en || ''}`)}
                ${field('ตำแหน่ง', rep.position)}
                ${field('โทร', rep.phone)}
                ${field('อีเมล', rep.email)}
              </div>
            `).join('')}
          </div>
        `) : ''}
        
        ${data.businessTypes ? section('ข้อมูลธุรกิจ', `
          <div style="margin-bottom: 12px;">
            <div class="row">
              <div class="col">
                <strong>ประเภทธุรกิจ:</strong><br>
                <div style="margin-top: 5px;">
                  ${businessTypes.split(', ').map(t => `<span class="business-tag">${t}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
          
          ${type !== 'ic' ? `
            <div style="margin-bottom: 12px;">
              <div class="row">
                <div class="col">
                  ${field('จำนวนพนักงาน', `${data.numberOfEmployees || '-'} คน`)}
                </div>
                ${type === 'oc' ? `
                  <div class="col">
                    ${field('ประเภทโรงงาน', data.factoryType === 'TYPE1' ? '> 50 แรงม้า' : '< 50 แรงม้า')}
                  </div>
                ` : '<div class="col"></div>'}
                <div class="col"></div>
              </div>
            </div>
          ` : ''}
          
          ${data.products?.length ? `
            <div style="margin-top: 12px;">
              <strong>สินค้าและบริการ (${data.products.length} รายการ):</strong>
              <div style="margin-top: 8px; padding: 8px; background: #f9f9f9; border-radius: 4px;">
                ${data.products.map((p, i) => `
                  <div style="margin-bottom: 4px; font-size: 11px;">
                    <strong>${i + 1}.</strong> 
                    <span style="color: #0066cc;">${p.name_th || p.nameTh || '-'}</span>
                    ${(p.name_en || p.nameEn) && (p.name_en || p.nameEn) !== '-' ? ` / <span style="color: #666;">${p.name_en || p.nameEn}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        `) : ''}
        

        
        ${(data.industrialGroupIds?.length || data.provincialChapterIds?.length) ? section('กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด', `
          <div class="row">
            <div class="col">
              <strong>กลุ่มอุตสาหกรรม:</strong><br>
              ${data.industrialGroupIds?.length ? 
                data.industrialGroupIds.map(g => {
                  const groupId = g.id || g;
                  const groupName = industrialGroups[groupId]?.GROUP_NAME || `กลุ่ม ${groupId}`;
                  return `• ${groupName}`;
                }).join('<br>') : 
                'ไม่ระบุ'}
            </div>
            <div class="col">
              <strong>สภาอุตสาหกรรมจังหวัด:</strong><br>
              ${data.provincialChapterIds?.length ? 
                data.provincialChapterIds.map(c => {
                  const chapterId = c.id || c;
                  // Special case for code '000' - show full organization name
                  if (chapterId === '000' || chapterId === 0) {
                    return '• สภาอุตสาหกรรมแห่งประเทศไทย';
                  }
                  const chapterName = provincialChapters[chapterId]?.CHAPTER_NAME || `สภา ${chapterId}`;
                  return `• ${chapterName}`;
                }).join('<br>') : 
                'ไม่ระบุ'}
            </div>
          </div>
        `) : ''}
        
        ${type !== 'ic' ? `
          <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <div style="display: flex; gap: 20px; font-size: 12px;">
              <div class="stamp-box">
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">ตราประทับ</div>
                <div class="stamp-img">
                  ${data.companyStamp?.fileUrl ? '✓' : '(ตราประทับ)'}
                </div>
              </div>
              <div class="signature-box">
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">ลายเซ็นผู้มีอำนาจ</div>
                <div class="signature-img">
                  ${data.authorizedSignature?.fileUrl ? '✓' : '(ลายเซ็น)'}
                </div>
                <div style="font-size: 10px; margin-top: 5px; border-top: 1px solid #999; padding-top: 5px;">
                  (${data.representativeName || 'ชื่อผู้มีอำนาจลงนาม'})
                </div>
              </div>
            </div>
          </div>
        ` : ''}
        
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
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
  const result = await generateMembershipPDF(application, type);
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