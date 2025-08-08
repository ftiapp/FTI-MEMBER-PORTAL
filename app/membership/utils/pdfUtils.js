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
  // Fix company name mapping
  let companyNameTh = app.company_name_th || app.companyNameTh || app.associationName || app.associationNameTh;
  let companyNameEn = app.company_name_en || app.companyNameEn || app.associationNameEng || app.associationNameEn;
  
  if (companyNameTh === '-' || !companyNameTh) {
    companyNameTh = app.companyName || app.name || app.company_name || '-';
  }
  if (companyNameEn === '-' || !companyNameEn) {
    companyNameEn = app.companyNameEng || app.nameEng || app.company_name_eng || '-';
  }
  
  // Find address type 2 data
  let addressType2Phone = '';
  let addressType2PhoneExt = '';
  let addressType2Email = '';
  let addressType2Website = '';
  
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
    addressType2Phone,
    addressType2PhoneExt,
    addressType2Email,
    addressType2Website,
    representativeName: app.representatives?.[0] ? 
      `${app.representatives[0].firstNameTh || app.representatives[0].first_name_th || ''} ${app.representatives[0].lastNameTh || app.representatives[0].last_name_th || ''}`.trim() ||
      `${app.representatives[0].firstNameEn || app.representatives[0].first_name_en || ''} ${app.representatives[0].lastNameEn || app.representatives[0].last_name_en || ''}`.trim() ||
      app.representatives[0].name || 'ผู้มีอำนาจลงนาม'
      : app.representativeName || 'ผู้มีอำนาจลงนาม'
  };
};

// Create compact field HTML
const field = (label, value, style = '') => 
  `<span class="field" ${style}><b>${label}:</b> ${value || '-'}</span>`;

// Create compact section HTML
const section = (title, content) => 
  `<div class="section"><div class="section-title">${title}</div>${content}</div>`;

// Main PDF generation function
export const generateMembershipPDF = async (application, type, industrialGroups = {}, provincialChapters = {}) => {
  try {
    const data = processData(application);
    const title = getTitleByType(type);
    const businessTypes = getBusinessTypeNames(data);
    
    // Optimized compact CSS for one page
    const styles = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Sarabun', sans-serif; 
        font-size: 9px; 
        line-height: 1.2; 
        padding: 3px;
      }
      .header { 
        text-align: center; 
        font-size: 11px; 
        font-weight: bold; 
        margin-bottom: 3px; 
        padding-bottom: 2px; 
        border-bottom: 1px solid #333; 
      }
      .section { 
        border: 0.5px solid #ddd; 
        margin-bottom: 3px; 
        padding: 3px; 
      }
      .section-title { 
        font-weight: bold; 
        font-size: 8px; 
        background: #f5f5f5; 
        padding: 1px 3px; 
        margin: -3px -3px 2px -3px; 
        border-bottom: 0.5px solid #ddd; 
      }
      .field { 
        margin-right: 8px; 
        font-size: 8px; 
        display: inline-block;
      }
      .field b {
        font-weight: 600;
      }
      .row { 
        display: flex; 
        gap: 8px; 
        margin-bottom: 2px;
      }
      .col { flex: 1; }
      .col-3 { 
        display: grid; 
        grid-template-columns: repeat(3, 1fr); 
        gap: 4px; 
      }
      .rep-box { 
        border: 0.5px solid #e0e0e0; 
        padding: 2px; 
        background: #fafafa; 
        font-size: 7px;
      }
      .rep-title { 
        font-weight: bold; 
        font-size: 7px; 
        color: #0066cc; 
        margin-bottom: 1px; 
      }
      .business-tag { 
        display: inline-block; 
        background: #e6f3ff; 
        color: #0066cc; 
        padding: 1px 3px; 
        border-radius: 2px; 
        font-size: 7px; 
        margin: 1px; 
      }
      .signature-area { 
        display: flex; 
        gap: 10px; 
        margin-top: 5px;
        justify-content: flex-end;
      }
      .signature-box, .stamp-box { 
        border: 0.5px solid #ddd; 
        padding: 5px; 
        text-align: center; 
        width: 80px;
        font-size: 7px;
      }
      .signature-img, .stamp-img { 
        border: 0.5px dashed #999; 
        height: 25px; 
        width: 60px; 
        margin: 3px auto; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        font-size: 7px;
      }
      .footer { 
        text-align: center; 
        font-size: 7px; 
        color: #999; 
        margin-top: 3px; 
      }
      .products-list {
        font-size: 7px;
        padding: 2px;
        background: #f9f9f9;
        border-radius: 2px;
        margin-top: 2px;
      }
      .product-item {
        margin-bottom: 1px;
      }
      .contact-info {
        font-size: 7px;
        display: flex;
        gap: 8px;
        margin-top: 2px;
        padding-top: 2px;
        border-top: 0.5px solid #eee;
      }
    `;

    // Generate compact HTML content
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
            <div>
              ${field('ชื่อ-นามสกุล (ไทย)', `${data.firstNameTh || ''} ${data.lastNameTh || ''}`)}
              ${field('(อังกฤษ)', `${data.firstNameEn || ''} ${data.lastNameEn || ''}`)}
            </div>
            <div>
              ${field('บัตรประชาชน', data.idCard)}
              ${field('โทร', data.phone)}
              ${field('อีเมล', data.email)}
            </div>
          `) :
          section(type === 'am' ? 'ข้อมูลสมาคม' : 'ข้อมูลบริษัท', `
            <div>
              ${field('ชื่อ (ไทย)', data.companyNameTh)}
              ${field('(อังกฤษ)', data.companyNameEn)}
            </div>
            <div>
              ${field('เลขทะเบียน', data.taxId)}
              ${type === 'am' ? field('สมาชิก', `${data.numberOfMember || '-'} คน`) : ''}
            </div>
          `)
        }
        
        ${section('ที่อยู่', `
          <div>
            ${field('เลขที่', data.addressNumber)}
            ${field('หมู่', data.moo)}
            ${field('ซอย', data.soi)}
            ${field('ถนน', data.street)}
          </div>
          <div>
            ${field('ตำบล', data.subDistrict)}
            ${field('อำเภอ', data.district)}
            ${field('จังหวัด', data.province)}
            ${field('ไปรษณีย์', data.postalCode)}
          </div>
          ${(data.phone || data.email || data.website || data.addressType2Phone || data.addressType2Email) ? `
            <div class="contact-info">
              ${data.phone ? field('โทร', `${data.phone}${data.phoneExtension ? ` ต่อ ${data.phoneExtension}` : ''}`) : ''}
              ${data.email ? field('อีเมล', data.email) : ''}
              ${data.website ? field('เว็บ', data.website) : ''}
              ${data.addressType2Phone ? field('โทร2', `${data.addressType2Phone}${data.addressType2PhoneExt ? ` ต่อ ${data.addressType2PhoneExt}` : ''}`) : ''}
              ${data.addressType2Email ? field('อีเมล2', data.addressType2Email) : ''}
            </div>
          ` : ''}
        `)}
        
        ${data.contactPersons?.find(cp => cp.typeContactId === 1) ? (() => {
          const mc = data.contactPersons.find(cp => cp.typeContactId === 1);
          return section('ผู้ประสานงาน', `
            <div>
              ${field('ชื่อ', `${mc.firstNameTh || ''} ${mc.lastNameTh || ''}`)}
              ${field('ตำแหน่ง', mc.position || '')}
              ${field('โทร', mc.phone ? `${mc.phone}${mc.phoneExtension ? ` ต่อ ${mc.phoneExtension}` : ''}` : '')}
              ${field('อีเมล', mc.email || '')}
            </div>
          `);
        })() : ''}
        
        ${data.representatives?.length ? section('ผู้แทน', `
          <div class="col-3">
            ${data.representatives.slice(0, 3).map((rep, i) => `
              <div class="rep-box">
                <div class="rep-title">ผู้แทน ${i + 1}</div>
                <div>${field('ชื่อ', `${rep.firstNameThai || rep.first_name_th || ''} ${rep.lastNameThai || rep.last_name_th || ''}`)}</div>
                <div>${field('ตำแหน่ง', rep.position)}</div>
                <div>${field('โทร', rep.phone || '')}</div>
              </div>
            `).join('')}
          </div>
        `) : ''}
        
        ${data.businessTypes ? section('ข้อมูลธุรกิจ', `
          <div>
            <b style="font-size: 8px;">ประเภท:</b>
            ${businessTypes.split(', ').map(t => `<span class="business-tag">${t}</span>`).join('')}
            ${type !== 'ic' ? `
              ${field('พนักงาน', `${data.numberOfEmployees || '-'} คน`, 'margin-left: 8px;')}
              ${type === 'oc' ? field('โรงงาน', data.factoryType === 'TYPE1' ? '> 50 แรงม้า' : '< 50 แรงม้า') : ''}
            ` : ''}
          </div>
          
          ${data.products?.length ? `
            <div class="products-list">
              <b>สินค้า (${data.products.length}):</b>
              ${data.products.slice(0, 5).map((p, i) => 
                `<span class="product-item">${i + 1}. ${p.name_th || p.nameTh || '-'}</span>`
              ).join(' ')}
              ${data.products.length > 5 ? `<span>...และอื่นๆ</span>` : ''}
            </div>
          ` : ''}
        `) : ''}
        
        ${(data.industrialGroupNames?.length || data.provincialChapterNames?.length) ? section('กลุ่ม/สภา', `
          <div style="font-size: 7px;">
            ${data.industrialGroupNames?.length ? 
              `<b>กลุ่ม:</b> ${data.industrialGroupNames.join(', ')}` : ''}
            ${data.provincialChapterNames?.length ? 
              `<b style="margin-left: 8px;">สภาจังหวัด:</b> ${data.provincialChapterNames.join(', ')}` : ''}
          </div>
        `) : ''}
        
        ${type !== 'ic' ? `
          <div class="signature-area">
            <div class="stamp-box">
              <div style="font-weight: bold;">ตราประทับ</div>
              <div class="stamp-img">
                ${data.companyStamp?.fileUrl ? '✓' : '(ตรา)'}
              </div>
            </div>
            <div class="signature-box">
              <div style="font-weight: bold;">ลายเซ็น</div>
              <div class="signature-img">
                ${data.authorizedSignature?.fileUrl ? '✓' : '(เซ็น)'}
              </div>
              <div style="font-size: 6px; margin-top: 2px; border-top: 0.5px solid #999; padding-top: 2px;">
                ${data.representativeName || 'ผู้มีอำนาจ'}
              </div>
            </div>
          </div>
        ` : ''}
        
        <div class="footer">
          สร้าง: ${formatThaiDate(new Date())} ${new Date().toLocaleTimeString('th-TH')}
        </div>
      </body>
      </html>
    `;

    // Create PDF with optimized settings
    const element = document.createElement('div');
    element.innerHTML = html;
    
    const opt = {
      margin: 3, // ลด margin
      filename: `${type?.toUpperCase()}_${data.companyNameTh || data.firstNameTh || 'APPLICATION'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.9 },
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