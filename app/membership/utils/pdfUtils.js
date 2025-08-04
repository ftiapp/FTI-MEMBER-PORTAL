// ติดตั้ง: npm install html2pdf.js
import html2pdf from 'html2pdf.js';

// Utility function to format Thai date
const formatThaiDate = (date) => {
  if (!date) return '-';
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const d = new Date(date);
  const day = d.getDate();
  const month = thaiMonths[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day} ${month} ${year}`;
};

// Utility function to get title by membership type
const getTitleByType = (type) => {
  const titleMap = {
    'ic': 'เอกสารสมัครสมาชิก สมทบ-บุคคลธรรมดา (ทบ)',
    'oc': 'เอกสารสมัครสมาชิก สามัญ-โรงงาน (สน)',
    'ac': 'เอกสารสมัครสมาชิก สมทบ-นิติบุคคล (ทน)',
    'am': 'เอกสารสมัครสมาชิก สามัญ-สมาคมการค้า (สส)'
  };
  return titleMap[type] || 'ข้อมูลสมาชิก';
};

// Utility function to get business type names
const getBusinessTypeNames = (application) => {
  if (!application.businessTypes) return '-';
  
  const businessTypeNames = {
    'manufacturer': 'ผู้ผลิต',
    'distributor': 'ผู้จัดจำหน่าย',
    'importer': 'ผู้นำเข้า',
    'exporter': 'ผู้ส่งออก',
    'service': 'ผู้ให้บริการ',
    'other': 'อื่นๆ'
  };

  if (Array.isArray(application.businessTypes)) {
    return application.businessTypes.map(businessType => {
      if (businessType.business_type === 'other' && application.businessTypeOther) {
        const otherDetail = application.businessTypeOther.find(other => other.main_id === businessType.main_id);
        return `อื่นๆ: ${otherDetail?.detail || 'ไม่ระบุ'}`;
      }
      return businessTypeNames[businessType.business_type] || businessType.business_type;
    }).join(', ');
  } else {
    return Object.entries(application.businessTypes)
      .filter(([key, value]) => value)
      .map(([key, value]) => {
        if (key === 'other' && application.businessTypeOther) {
          const otherDetail = typeof application.businessTypeOther === 'string' 
            ? application.businessTypeOther 
            : application.businessTypeOther.detail || application.businessTypeOther.other_detail || '';
          return `อื่นๆ: ${otherDetail || 'ไม่ระบุ'}`;
        }
        return businessTypeNames[key] || key;
      }).join(', ');
  }
};

// Main PDF generation function
export const generateMembershipPDF = async (application, type, industrialGroups = {}, provincialChapters = {}) => {
    try {
      // Process application data to normalize field names
      const processedData = processApplicationData(application);
      const title = getTitleByType(type);
      const businessTypesText = getBusinessTypeNames(processedData);
      
    // Create HTML content with comprehensive layout matching PDFGenerator
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Sarabun', 'Tahoma', sans-serif;
            font-size: 12px;
            line-height: 1.3;
            margin: 0;
            padding: 0;
            color: #2d3748;
            background: white;
          }
          
          .container {
            width: 100%;
            min-height: 100vh;
            padding: 0;
          }
          
          .header { 
            text-align: center; 
            font-size: 14px; 
            font-weight: 700; 
            margin-bottom: 8px;
            color: #1a365d;
            border-bottom: 1px solid #3182ce;
            padding-bottom: 6px;
          }
          
          .date-info {
            text-align: center;
            font-size: 9px;
            color: #718096;
            margin-bottom: 12px;
          }
          
          .section { 
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 6px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .section-title { 
            font-size: 11px; 
            font-weight: 600; 
            margin-bottom: 6px;
            color: #2d3748;
            background: #f7fafc;
            padding: 3px 6px;
            border-left: 3px solid #3182ce;
            border-radius: 2px;
          }
          
          .two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 4px;
          }
          
          .three-columns {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 6px;
            margin-bottom: 4px;
          }
          
          .four-columns {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 4px;
            margin-bottom: 4px;
          }
          
          .compact-row {
            display: grid;
            grid-template-columns: 80px 1fr;
            gap: 4px;
            margin-bottom: 3px;
            align-items: start;
          }
          
          .label { 
            font-weight: 600; 
            color: #4a5568;
            font-size: 10px;
            flex-shrink: 0;
          }
          
          .value { 
            color: #2d3748;
            font-size: 10px;
            word-break: break-word;
            font-weight: 400;
          }
          
          .rep-section, .contact-section {
            background: #f8fafc;
            padding: 6px;
            margin-bottom: 4px;
            border-radius: 3px;
            border-left: 3px solid #3182ce;
          }
          
          .rep-title, .contact-title {
            font-weight: 600;
            font-size: 10px;
            color: #2b6cb0;
            margin-bottom: 3px;
          }
          
          .business-type-item {
            display: inline-block;
            background: #ebf8ff;
            color: #2b6cb0;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 9px;
            margin: 1px 2px 1px 0;
            border: 1px solid #bee3f8;
            font-weight: 500;
          }
          
          .product-item {
            background: #f0fff4;
            border: 1px solid #c6f6d5;
            padding: 4px;
            margin-bottom: 3px;
            border-radius: 3px;
            font-size: 9px;
          }
          
          .list-item {
            font-size: 9px;
            margin: 2px 0;
            padding-left: 8px;
            position: relative;
            line-height: 1.2;
            color: #4a5568;
          }
          
          .list-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #3182ce;
            font-weight: bold;
          }
          
          .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: 600;
            text-align: center;
          }
          
          .status-approved {
            background: #c6f6d5;
            color: #22543d;
          }
          
          .status-pending {
            background: #fef5e7;
            color: #b7791f;
          }
          
          .status-rejected {
            background: #fed7d7;
            color: #c53030;
          }
          
          .footer {
            text-align: center;
            font-size: 8px;
            color: #a0aec0;
            margin-top: 12px;
            padding-top: 6px;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header with Logo -->
          <div class="header">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 8px;">
              <img src="/images/FTI-MasterLogo_RGB_forLightBG.png" alt="FTI Logo" style="height: 50px; margin-bottom: 8px;" />
              <div style="text-align: center; font-weight: bold; font-size: 14px;">
                ${title}
              </div>
            </div>
          </div>
          
          <div class="date-info">
            วันที่สร้าง PDF: ${formatThaiDate(new Date())} | เวลา: ${new Date().toLocaleTimeString('th-TH')}
          </div>

          <!-- ข้อมูลผู้สมัคร (แยกออกมาหากมี) -->
          ${(application.firstname || application.lastname || application.email || application.phone) && type !== 'ic' ? `
            <div class="section">
              <div class="section-title">ข้อมูลผู้สมัคร</div>
              <div class="two-columns">
                <div class="compact-row">
                  <div class="label">ชื่อ-นามสกุล:</div>
                  <div class="value">${(application.firstname || '') + ' ' + (application.lastname || '')}</div>
                </div>
                <div class="compact-row">
                  <div class="label">อีเมล:</div>
                  <div class="value">${application.email || '-'}</div>
                </div>
              </div>
              <div class="compact-row">
                <div class="label">โทรศัพท์:</div>
                <div class="value">${application.phone || '-'}</div>
              </div>
            </div>
          ` : ''}

          <!-- ข้อมูลหลัก -->
          <div class="section">
            <div class="section-title">${type === 'ic' ? 'ข้อมูลผู้สมัคร' : type === 'am' ? 'ข้อมูลสมาคม' : 'ข้อมูลบริษัท'}</div>
            
            ${type === 'ic' ? `
              <div class="two-columns">
                <div class="compact-row">
                  <div class="label">ชื่อ (ไทย):</div>
                  <div class="value">${processedData.firstNameTh || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">นามสกุล (ไทย):</div>
                  <div class="value">${processedData.lastNameTh || '-'}</div>
                </div>
              </div>
              <div class="two-columns">
                <div class="compact-row">
                  <div class="label">ชื่อ (อังกฤษ):</div>
                  <div class="value">${processedData.firstNameEn || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">นามสกุล (อังกฤษ):</div>
                  <div class="value">${processedData.lastNameEn || '-'}</div>
                </div>
              </div>
              <div class="two-columns">
                <div class="compact-row">
                  <div class="label">บัตรประชาชน:</div>
                  <div class="value">${application.id_card_number || application.idCard || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">อีเมล:</div>
                  <div class="value">${application.email || '-'}</div>
                </div>
              </div>
              <div class="two-columns">
                <div class="compact-row">
                  <div class="label">โทรศัพท์:</div>
                  <div class="value">${application.phone || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">เว็บไซต์:</div>
                  <div class="value">${application.website || '-'}</div>
                </div>
              </div>
            ` : `
              <div class="compact-row">
  <div class="label">${type === 'am' ? 'ชื่อสมาคม' : 'ชื่อบริษัท'} (ไทย):</div>
  <div class="value">${
    processedData.companyNameTh || 
    processedData.companyName || 
    application.companyName || 
    application.company_name_th || 
    '-'
  }</div>
</div>
<div class="compact-row">
  <div class="label">${type === 'am' ? 'ชื่อสมาคม' : 'ชื่อบริษัท'} (อังกฤษ):</div>
  <div class="value">${
    processedData.companyNameEn || 
    processedData.companyNameEng || 
    application.companyNameEng || 
    application.company_name_eng || 
    application.company_name_en || 
    '-'
  }</div>
</div>
              <div class="three-columns">
                <div class="compact-row">
                  <div class="label">เลขทะเบียน:</div>
                  <div class="value">${processedData.taxId || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">พนักงาน:</div>
                  <div class="value">${processedData.numberOfEmployees || '-'} คน</div>
                </div>
                ${type === 'am' ? `
                  <div class="compact-row">
                    <div class="label">สมาชิกสมาคม:</div>
                    <div class="value">${application.number_of_member || application.numberOfMember || '-'} คน</div>
                  </div>
                ` : type === 'oc' ? `
                  <div class="compact-row">
                    <div class="label">ประเภทโรงงาน:</div>
                    <div class="value">${(() => {
                      const factoryType = application.factory_type || application.factoryType;
                      if (factoryType === 'TYPE1' || factoryType === 'type1' || factoryType === '1') {
                        return 'มีเครื่องจักร > 50 แรงม้า';
                      } else if (factoryType === 'TYPE2' || factoryType === 'type2' || factoryType === '2') {
                        return 'ไม่มีเครื่องจักรหรือ < 50 แรงม้า';
                      } else {
                        return '-';
                      }
                    })()}</div>
                  </div>
                ` : '<div></div>'}
              </div>
              <div class="three-columns">
                <div class="compact-row">
                  <div class="label">อีเมล:</div>
                  <div class="value">${processedData.companyEmail || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">โทรศัพท์:</div>
                  <div class="value">${processedData.companyPhone || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">เว็บไซต์:</div>
                  <div class="value">${processedData.companyWebsite || '-'}</div>
                </div>
              </div>
            `}
          </div>

          <!-- ที่อยู่ -->
          <div class="section">
            <div class="section-title">ที่อยู่${type === 'ic' ? '' : type === 'am' ? 'สมาคม' : 'บริษัท'}</div>
            <div class="four-columns">
              <div class="compact-row">
                <div class="label">บ้านเลขที่:</div>
                <div class="value">${processedData.addressNumber || '-'}</div>
              </div>
              <div class="compact-row">
                <div class="label">หมู่:</div>
                <div class="value">${processedData.moo || '-'}</div>
              </div>
              <div class="compact-row">
                <div class="label">ซอย:</div>
                <div class="value">${processedData.soi || '-'}</div>
              </div>
              <div class="compact-row">
                <div class="label">ถนน:</div>
                <div class="value">${processedData.street || '-'}</div>
              </div>
            </div>
            <div class="four-columns">
              <div class="compact-row">
                <div class="label">ตำบล/แขวง:</div>
                <div class="value">${processedData.subDistrict || '-'}</div>
              </div>
              <div class="compact-row">
                <div class="label">อำเภอ/เขต:</div>
                <div class="value">${processedData.district || '-'}</div>
              </div>
              <div class="compact-row">
                <div class="label">จังหวัด:</div>
                <div class="value">${processedData.province || '-'}</div>
              </div>
              <div class="compact-row">
                <div class="label">รหัสไปรษณีย์:</div>
                <div class="value">${processedData.postalCode || '-'}</div>
              </div>
            </div>
          </div>

          <!-- ข้อมูลผู้ติดต่อ -->
          ${type !== 'ic' && (
            (application.contactPersons && application.contactPersons.length > 0) || 
            (application.contactPerson && Array.isArray(application.contactPerson) && application.contactPerson.length > 0) ||
            (application.contactPerson && typeof application.contactPerson === 'object' && !Array.isArray(application.contactPerson))
          ) ? `
            <div class="section">
              <div class="section-title">ข้อมูลผู้ติดต่อ</div>
              ${(() => {
                let contacts = [];
                
                if (application.contactPersons && Array.isArray(application.contactPersons)) {
                  contacts = application.contactPersons;
                } else if (application.contactPerson && Array.isArray(application.contactPerson)) {
                  contacts = application.contactPerson;
                } else if (application.contactPerson && typeof application.contactPerson === 'object') {
                  contacts = [application.contactPerson];
                }
                
                return contacts.map((contact, index) => `
                  <div class="contact-section">
                    ${contacts.length > 1 ? `<div class="contact-title">ผู้ติดต่อ ${index + 1}</div>` : ''}
                    <div class="two-columns">
                      <div class="compact-row">
                        <div class="label">ชื่อ (ไทย):</div>
                        <div class="value">${(contact.first_name_th || contact.firstNameTh || '') + ' ' + (contact.last_name_th || contact.lastNameTh || '')}</div>
                      </div>
                      <div class="compact-row">
                        <div class="label">ชื่อ (อังกฤษ):</div>
                        <div class="value">${(contact.first_name_en || contact.firstNameEn || '') + ' ' + (contact.last_name_en || contact.lastNameEn || '')}</div>
                      </div>
                    </div>
                    <div class="three-columns">
                      <div class="compact-row">
                        <div class="label">ตำแหน่ง:</div>
                        <div class="value">${contact.position || '-'}</div>
                      </div>
                      <div class="compact-row">
                        <div class="label">โทรศัพท์:</div>
                        <div class="value">${contact.phone || '-'}</div>
                      </div>
                      <div class="compact-row">
                        <div class="label">อีเมล:</div>
                        <div class="value">${contact.email || '-'}</div>
                      </div>
                    </div>
                  </div>
                `).join('');
              })()}
            </div>
          ` : ''}

          <!-- ข้อมูลผู้แทน -->
          ${application.representatives && application.representatives.length > 0 ? `
            <div class="section">
              <div class="section-title">ข้อมูลผู้แทน</div>
              ${application.representatives.length <= 2 ? `
                ${application.representatives.map((rep, index) => {
                  // แก้ไขตรงนี้ - ใช้ index + 1 สำหรับการแสดงผล
                  const isPrimary = rep.rep_order === 1 || rep.is_primary === 1 || rep.is_primary === true;
                  const displayTitle = isPrimary ? 'ผู้แทนหลัก' : `ผู้แทน ${index + 1}`;
                  
                  return `
                    <div class="rep-section">
                      <div class="rep-title">${displayTitle}</div>
                      <div class="two-columns">
                        <div class="compact-row">
                          <div class="label">ชื่อ (ไทย):</div>
                          <div class="value">${
                            (rep.firstNameTh || rep.first_name_th || rep.firstNameThai || '') + ' ' + 
                            (rep.lastNameTh || rep.last_name_th || rep.lastNameThai || '')
                          }</div>
                        </div>
                        <div class="compact-row">
                          <div class="label">ชื่อ (อังกฤษ):</div>
                          <div class="value">${
                            (rep.firstNameEn || rep.first_name_en || rep.firstNameEnglish || '') + ' ' + 
                            (rep.lastNameEn || rep.last_name_en || rep.lastNameEnglish || '')
                          }</div>
                        </div>
                      </div>
                      <div class="three-columns">
                        <div class="compact-row">
                          <div class="label">ตำแหน่ง:</div>
                          <div class="value">${rep.position || '-'}</div>
                        </div>
                        <div class="compact-row">
                          <div class="label">โทรศัพท์:</div>
                          <div class="value">${rep.phone || '-'}</div>
                        </div>
                        <div class="compact-row">
                          <div class="label">อีเมล:</div>
                          <div class="value">${rep.email || '-'}</div>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              ` : `
                <!-- แสดง 3 คนในบรรทัดเดียว -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px;">
                  ${application.representatives.map((rep, index) => {
                    // แก้ไขตรงนี้ด้วย - สำหรับ layout แบบ 3 คอลัมน์
                    const isPrimary = rep.rep_order === 1 || rep.is_primary === 1 || rep.is_primary === true;
                    const displayTitle = isPrimary ? 'ผู้แทนหลัก' : `ผู้แทน ${index + 1}`;
                    
                    return `
                      <div class="rep-section" style="margin-bottom: 0;">
                        <div class="rep-title" style="font-size: 10px;">${displayTitle}</div>
                        <div class="compact-row" style="grid-template-columns: 60px 1fr; gap: 2px;">
                          <div class="label" style="font-size: 9px;">ชื่อ (ไทย):</div>
                          <div class="value" style="font-size: 10px; font-weight: 600;">${
                            (rep.firstNameTh || rep.first_name_th || rep.firstNameThai || '') + ' ' + 
                            (rep.lastNameTh || rep.last_name_th || rep.lastNameThai || '')
                          }</div>
                        </div>
                        <div class="compact-row" style="grid-template-columns: 60px 1fr; gap: 2px;">
                          <div class="label" style="font-size: 9px;">ชื่อ (อังกฤษ):</div>
                          <div class="value" style="font-size: 10px; font-weight: 600;">${
                            (rep.firstNameEn || rep.first_name_en || rep.firstNameEnglish || '') + ' ' + 
                            (rep.lastNameEn || rep.last_name_en || rep.lastNameEnglish || '')
                          }</div>
                        </div>
                        <div class="compact-row" style="grid-template-columns: 60px 1fr; gap: 2px;">
                          <div class="label" style="font-size: 9px;">ตำแหน่ง:</div>
                          <div class="value" style="font-size: 10px;">${rep.position || '-'}</div>
                        </div>
                        <div class="compact-row" style="grid-template-columns: 60px 1fr; gap: 2px;">
                          <div class="label" style="font-size: 9px;">โทรศัพท์:</div>
                          <div class="value" style="font-size: 9px;">${rep.phone || '-'}</div>
                        </div>
                        <div class="compact-row" style="grid-template-columns: 60px 1fr; gap: 2px;">
                          <div class="label" style="font-size: 9px;">อีเมล:</div>
                          <div class="value" style="font-size: 9px;">${rep.email || '-'}</div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>
          ` : ''}

          <!-- ประเภทธุรกิจ -->
          ${application.businessTypes ? `
            <div class="section">
              <div class="section-title">ประเภทธุรกิจ</div>
              <div class="value">
                ${businessTypesText.split(', ').map(type => `
                  <span class="business-type-item">${type}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- สินค้าและบริการ -->
          ${application.products && application.products.length > 0 ? `
            <div class="section">
              <div class="section-title">สินค้าและบริการ (${application.products.length} รายการ)</div>
              <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px;">
                ${application.products.map((product, index) => `
  <div style="background: #f0fff4; border: 1px solid #c6f6d5; padding: 3px; border-radius: 2px; min-height: 32px;">
    <div style="font-weight: 600; font-size: 10px; color: #2b6cb0; line-height: 1.2;">
      ${index + 1}. ${
        product.name_th || 
        product.nameTh || 
        '-'
      }/${
        product.name_en || 
        product.nameEn || 
        '-'
      }
    </div>
  </div>
`).join('')}
              </div>
            </div>
          ` : ''}

          <!-- กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด -->
          ${((application.industrialGroupIds && application.industrialGroupIds.length > 0) || 
            (application.provincialChapterIds && application.provincialChapterIds.length > 0)) ? `
            <div class="section">
              <div class="section-title">กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด</div>
              <div class="two-columns">
                <div>
                  ${application.industrialGroupIds && application.industrialGroupIds.length > 0 ? `
                    <div style="font-weight: 600; font-size: 10px; color: #2b6cb0; margin-bottom: 3px;">
                      กลุ่มอุตสาหกรรม:
                    </div>
                    ${application.industrialGroupIds.map(group => `
                      <div class="list-item">${industrialGroups[group.id || group] || `รหัส: ${group.id || group}`}</div>
                    `).join('')}
                  ` : `
                    <div style="font-weight: 600; font-size: 10px; color: #718096; margin-bottom: 3px;">
                      กลุ่มอุตสาหกรรม: -
                    </div>
                  `}
                </div>
                
                <div>
                  ${application.provincialChapterIds && application.provincialChapterIds.length > 0 ? `
                    <div style="font-weight: 600; font-size: 10px; color: #2b6cb0; margin-bottom: 3px;">
                      สภาอุตสาหกรรมจังหวัด:
                    </div>
                    ${application.provincialChapterIds.map(chapter => `
                      <div class="list-item">${provincialChapters[chapter.id || chapter] || `รหัส: ${chapter.id || chapter}`}</div>
                    `).join('')}
                  ` : `
                    <div style="font-weight: 600; font-size: 10px; color: #718096; margin-bottom: 3px;">
                      สภาอุตสาหกรรมจังหวัด: -
                    </div>
                  `}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- หมายเหตุจากผู้ดูแลระบบ -->
          ${application.adminNote ? `
            <div class="section">
              <div class="section-title">หมายเหตุจากผู้ดูแลระบบ</div>
              <div class="value" style="background: #fffaf0; padding: 6px; border-radius: 3px; border-left: 3px solid #f6ad55;">
                ${application.adminNote}
                ${application.adminNoteAt ? `<br><small style="color: #718096;">บันทึกเมื่อ: ${formatThaiDate(new Date(application.adminNoteAt))} ${new Date(application.adminNoteAt).toLocaleTimeString('th-TH')}</small>` : ''}
              </div>
            </div>
          ` : ''}

          <!-- เอกสารแนบ -->
          ${application.documents && application.documents.length > 0 ? `
            <div class="section">
              <div class="section-title">เอกสารแนบ (${application.documents.length} ไฟล์)</div>
              ${application.documents.map((doc, index) => `
                <div class="list-item">
                  <strong>${doc.document_name || `เอกสาร ${index + 1}`}:</strong> ${doc.file_path ? doc.file_path.split('/').pop() : 'ไม่ระบุชื่อไฟล์'}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="footer">
            เอกสารสร้างอัตโนมัติ • ${formatThaiDate(new Date())} ${new Date().toLocaleTimeString('th-TH')} • 
            ${type?.toUpperCase() || 'MEMBER'} Application PDF
          </div>
        </div>
      </body>
      </html>
    `;

    // Create element and generate PDF
    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    const opt = {
      margin: 0,
      filename: `${type?.toUpperCase() || 'MEMBER'}_${processedData.companyNameTh || processedData.companyNameEn || processedData.associationNameTh || processedData.firstNameTh || processedData.firstNameEn || 'APPLICATION'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.95 
      },
      html2canvas: { 
        scale: 1.5,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        logging: false,
        width: 794,
        height: 1123
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    await html2pdf().set(opt).from(element).save();
    
    return { success: true, filename: opt.filename };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to download PDF from summary page
export const downloadMembershipPDF = async (application, type) => {
  const result = await generateMembershipPDF(application, type);
  if (!result.success) {
    throw new Error(result.error || 'เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
  }
};

// Additional utility functions for data processing
export const processApplicationData = (application) => {
  // Normalize different field name variations
  const processed = {
    ...application,
    // Company info normalization
    companyNameTh: application.company_name_th || application.companyNameTh || application.associationNameTh,
    companyNameEn: application.company_name_en || application.companyNameEn || application.associationNameEn,
    taxId: application.tax_id || application.taxId,
    companyEmail: application.company_email || application.companyEmail || application.email,
    companyPhone: application.company_phone || application.companyPhone || application.phone,
    companyWebsite: application.company_website || application.companyWebsite || application.website,
    numberOfEmployees: application.number_of_employees || application.numberOfEmployees,
    
    // Individual info normalization
    firstNameTh: application.first_name_th || application.firstNameTh,
    lastNameTh: application.last_name_th || application.lastNameTh,
    firstNameEn: application.first_name_en || application.firstNameEn,
    lastNameEn: application.last_name_en || application.lastNameEn,
    idCard: application.id_card_number || application.idCard,
    
    // Address normalization
    addressNumber: application.address_number || application.addressNumber,
    subDistrict: application.sub_district || application.subDistrict,
    postalCode: application.postal_code || application.postalCode,
    
    // Factory specific
    factoryType: application.factory_type || application.factoryType,
    
    // Association specific
    numberOfMember: application.number_of_member || application.numberOfMember
  };
  
  return processed;
};

// Helper function to get contact person info
export const getContactPersonInfo = (application) => {
  let contacts = [];
  
  if (application.contactPersons && Array.isArray(application.contactPersons)) {
    contacts = application.contactPersons;
  } else if (application.contactPerson && Array.isArray(application.contactPerson)) {
    contacts = application.contactPerson;
  } else if (application.contactPerson && typeof application.contactPerson === 'object') {
    contacts = [application.contactPerson];
  }
  
  return contacts;
};

// Helper function to get representatives info
export const getRepresentativesInfo = (application) => {
  if (!application.representatives || !Array.isArray(application.representatives)) {
    return [];
  }
  
  return application.representatives.map((rep, index) => ({
    ...rep,
    isPrimary: rep.rep_order === 1 || rep.is_primary === 1 || rep.is_primary === true,
    displayTitle: rep.rep_order === 1 || rep.is_primary === 1 || rep.is_primary === true ? 'ผู้แทนหลัก' : `ผู้แทนรอง ${index}`
  }));
};

// Helper function to format business types for display
export const formatBusinessTypesForDisplay = (application) => {
  const businessTypes = getBusinessTypeNames(application);
  return businessTypes.split(', ').filter(type => type !== '-');
};

// Export all functions
export default {
  generateMembershipPDF,
  downloadMembershipPDF,
  processApplicationData,
  getContactPersonInfo,
  getRepresentativesInfo,
  formatBusinessTypesForDisplay,
  formatThaiDate,
  getTitleByType,
  getBusinessTypeNames
};