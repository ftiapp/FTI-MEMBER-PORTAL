// ติดตั้ง: npm install html2pdf.js
import html2pdf from 'html2pdf.js';

export const generateMembershipPDF = async (application, type, industrialGroups = {}, provincialChapters = {}) => {
  try {
    const getTitleByType = (type) => {
      const titleMap = {
        'ic': 'เอกสารสมัครสมาชิก สมทบ-บุคคลธรรมดา (ทบ)',
        'oc': 'เอกสารสมัครสมาชิก สามัญ-โรงงาน (สน)',
        'ac': 'เอกสารสมัครสมาชิก สมทบ-นิติบุคคล (ทน)',
        'am': 'เอกสารสมัครสมาชิก สามัญ-สมาคมการค้า (สส)'
      };
      return titleMap[type] || 'ข้อมูลสมาชิก';
    };

    const formatThaiDate = (date) => {
      const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const day = date.getDate();
      const month = thaiMonths[date.getMonth()];
      const year = date.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    };

    const getBusinessTypes = () => {
      if (!application.businessTypes) return [];
      
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

    // สร้าง HTML ที่จัด layout ให้พอดีหน้า A4
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
            margin-bottom: 8px;
          }
          
          .content {
            display: block;
          }
          
          .section { 
            border: 1px solid #e2e8f0;
            border-radius: 3px;
            padding: 6px;
            margin-bottom: 5px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .section-title { 
            font-size: 10px; 
            font-weight: 600; 
            margin-bottom: 4px;
            color: #2d3748;
            background: #f7fafc;
            padding: 2px 4px;
            border-left: 2px solid #3182ce;
            border-radius: 2px;
          }
          
          .two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-bottom: 4px;
          }
          
          .three-columns {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 4px;
            margin-bottom: 4px;
          }
          
          .row { 
            display: flex; 
            margin-bottom: 2px;
            align-items: flex-start;
          }
          
          .label { 
            font-weight: 600; 
            width: 80px;
            color: #4a5568;
            font-size: 11px;
            flex-shrink: 0;
            margin-right: 4px;
          }
          
          .value { 
            flex: 1; 
            color: #2d3748;
            font-size: 11px;
            word-break: break-word;
            font-weight: 400;
          }
          
          .list-item {
            font-size: 10px;
            margin: 1px 0;
            padding-left: 6px;
            position: relative;
            line-height: 1.2;
          }
          
          .list-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #3182ce;
          }
          
          .rep-section, .contact-section {
            background: #f8fafc;
            padding: 4px;
            margin-bottom: 3px;
            border-radius: 2px;
            border-left: 2px solid #3182ce;
          }
          
          .rep-title, .contact-title {
            font-weight: 600;
            font-size: 10px;
            color: #2b6cb0;
            margin-bottom: 2px;
          }
          
          .business-type-item {
            display: inline-block;
            background: #ebf8ff;
            color: #2b6cb0;
            padding: 1px 3px;
            border-radius: 2px;
            font-size: 10px;
            margin: 1px 2px 1px 0;
            border: 1px solid #bee3f8;
          }
          
          .product-item {
            background: #f0fff4;
            border: 1px solid #c6f6d5;
            padding: 3px;
            margin-bottom: 2px;
            border-radius: 2px;
          }
          
          .document-item {
            background: #fffaf0;
            border: 1px solid #fed7aa;
            padding: 3px;
            margin-bottom: 2px;
            border-radius: 2px;
            font-size: 10px;
          }
          
          .footer {
            text-align: center;
            font-size: 8px;
            color: #a0aec0;
            margin-top: 8px;
            padding-top: 4px;
            border-top: 1px solid #e2e8f0;
          }
          
          .address-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 3px;
            margin-bottom: 3px;
          }
          
          .compact-row {
            display: grid;
            grid-template-columns: 75px 1fr;
            gap: 3px;
            margin-bottom: 2px;
            align-items: start;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 8px;">
              <img src="/images/FTI-MasterLogo_RGB_forLightBG.png" alt="FTI Logo" style="height: 50px; margin-bottom: 8px;" />
              <div style="text-align: center; font-weight: bold; font-size: 14px;">
                ${getTitleByType(type)}
              </div>
            </div>
          </div>
          
          <div class="date-info">
            วันที่สร้าง PDF: ${formatThaiDate(new Date())} | เวลา: ${new Date().toLocaleTimeString('th-TH')}
          </div>
          
          <div class="content">
            
         
            <!-- ข้อมูลหลัก -->
            <div class="section">
              <div class="section-title">${type === 'ic' ? 'ข้อมูลผู้สมัคร' : 'ข้อมูลบริษัท/องค์กร'}</div>
              
              ${type === 'ic' ? `
                <div class="two-columns">
                  <div class="compact-row">
                    <div class="label">ชื่อ (ไทย):</div>
                    <div class="value">${application.first_name_th || application.firstNameTh || '-'}</div>
                  </div>
                  <div class="compact-row">
                    <div class="label">นามสกุล (ไทย):</div>
                    <div class="value">${application.last_name_th || application.lastNameTh || '-'}</div>
                  </div>
                </div>
                <div class="two-columns">
                  <div class="compact-row">
                    <div class="label">ชื่อ (อังกฤษ):</div>
                    <div class="value">${application.first_name_en || application.firstNameEn || '-'}</div>
                  </div>
                  <div class="compact-row">
                    <div class="label">นามสกุล (อังกฤษ):</div>
                    <div class="value">${application.last_name_en || application.lastNameEn || '-'}</div>
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
                  <div class="label">ชื่อ (ไทย):</div>
                  <div class="value">${application.company_name_th || application.companyNameTh || application.associationNameTh || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">ชื่อ (อังกฤษ):</div>
                  <div class="value">${application.company_name_en || application.companyNameEn || application.associationNameEn || '-'}</div>
                </div>
                <div class="three-columns">
                  <div class="compact-row">
                    <div class="label">เลขทะเบียน:</div>
                    <div class="value">${application.tax_id || application.taxId || '-'}</div>
                  </div>
                  <div class="compact-row">
                    <div class="label">พนักงาน:</div>
                    <div class="value">${application.number_of_employees || application.numberOfEmployees || '-'} คน</div>
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
                    <div class="value">${application.company_email || application.companyEmail || application.email || '-'}</div>
                  </div>
                  <div class="compact-row">
                    <div class="label">โทรศัพท์:</div>
                    <div class="value">${application.company_phone || application.companyPhone || application.phone || '-'}</div>
                  </div>
                  <div class="compact-row">
                    <div class="label">เว็บไซต์:</div>
                    <div class="value">${application.company_website || application.companyWebsite || application.website || '-'}</div>
                  </div>
                </div>
              `}
            </div>

             <!-- ที่อยู่ -->
            <div class="section">
              <div class="section-title">ที่อยู่</div>
              <div class="address-grid">
                <div class="compact-row">
                  <div class="label">บ้านเลขที่:</div>
                  <div class="value">${application.address_number || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">หมู่:</div>
                  <div class="value">${application.moo || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">ซอย:</div>
                  <div class="value">${application.soi || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">ถนน:</div>
                  <div class="value">${application.street || application.road || '-'}</div>
                </div>
              </div>
              <div class="address-grid">
                <div class="compact-row">
                  <div class="label">ตำบล/แขวง:</div>
                  <div class="value">${application.sub_district || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">อำเภอ/เขต:</div>
                  <div class="value">${application.district || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">จังหวัด:</div>
                  <div class="value">${application.province || '-'}</div>
                </div>
                <div class="compact-row">
                  <div class="label">รหัสไปรษณีย์:</div>
                  <div class="value">${application.postal_code || '-'}</div>
                </div>
              </div>
              
              <!-- ผู้ติดต่อ - วางในบล็อกเดียวกันกับที่อยู่ -->
              ${type !== 'ic' && (
                (application.contactPersons && application.contactPersons.length > 0) || 
                (application.contactPerson && Array.isArray(application.contactPerson) && application.contactPerson.length > 0) ||
                (application.contactPerson && typeof application.contactPerson === 'object' && !Array.isArray(application.contactPerson))
              ) ? `
                <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
                  <div style="font-weight: 600; font-size: 10px; color: #2b6cb0; margin-bottom: 4px;">ผู้ติดต่อ</div>
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
                      <div style="background: #f8fafc; padding: 4px; margin-bottom: 3px; border-radius: 2px; ${contacts.length > 1 ? 'border-left: 2px solid #3182ce;' : ''}">
                        ${contacts.length > 1 ? `<div style="font-weight: 600; font-size: 9px; color: #2b6cb0; margin-bottom: 2px;">ผู้ติดต่อ ${index + 1}</div>` : ''}
                        <div class="address-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr; gap: 3px;">
                          <div class="compact-row">
                            <div class="label" style="font-size: 9px;">ชื่อ (ไทย):</div>
                            <div class="value" style="font-size: 9px;">${(contact.first_name_th || contact.firstNameTh || '') + ' ' + (contact.last_name_th || contact.lastNameTh || '')}</div>
                          </div>
                          <div class="compact-row">
                            <div class="label" style="font-size: 9px;">ชื่อ (อังกฤษ):</div>
                            <div class="value" style="font-size: 9px;">${(contact.first_name_en || contact.firstNameEn || '') + ' ' + (contact.last_name_en || contact.lastNameEn || '')}</div>
                          </div>
                          <div class="compact-row">
                            <div class="label" style="font-size: 9px;">ตำแหน่ง:</div>
                            <div class="value" style="font-size: 9px;">${contact.position || '-'}</div>
                          </div>
                          <div class="compact-row">
                            <div class="label" style="font-size: 9px;">โทรศัพท์:</div>
                            <div class="value" style="font-size: 9px;">${contact.phone || '-'}</div>
                          </div>
                        </div>
                        <div class="compact-row" style="margin-top: 2px;">
                          <div class="label" style="font-size: 9px;">อีเมล:</div>
                          <div class="value" style="font-size: 9px;">${contact.email || '-'}</div>
                        </div>
                      </div>
                    `).join('');
                  })()}
                </div>
              ` : ''}
            </div>

            <!-- กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด -->
            ${((application.industrialGroupIds && application.industrialGroupIds.length > 0) || 
              (application.provincialChapterIds && application.provincialChapterIds.length > 0)) ? `
              <div class="section">
                <div class="section-title">กลุ่มอุตสาหกรรม และ สภาอุตสาหกรรมจังหวัด</div>
                <div class="two-columns">
                  <!-- กลุ่มอุตสาหกรรม -->
                  <div>
                    ${application.industrialGroupIds && application.industrialGroupIds.length > 0 ? `
                      <div style="font-weight: 600; font-size: 9px; color: #2b6cb0; margin-bottom: 2px;">
                        กลุ่มอุตสาหกรรม:
                      </div>
                      ${application.industrialGroupIds.map(group => `
                        <div class="list-item">${industrialGroups[group.id || group] || `รหัส: ${group.id || group}`}</div>
                      `).join('')}
                    ` : `
                      <div style="font-weight: 600; font-size: 9px; color: #718096; margin-bottom: 2px;">
                        กลุ่มอุตสาหกรรม: -
                      </div>
                    `}
                  </div>
                  
                  <!-- สภาอุตสาหกรรมจังหวัด -->
                  <div>
                    ${application.provincialChapterIds && application.provincialChapterIds.length > 0 ? `
                      <div style="font-weight: 600; font-size: 10px; color: #2b6cb0; margin-bottom: 2px;">
                        สภาอุตสาหกรรมจังหวัด:
                      </div>
                      ${application.provincialChapterIds.map(chapter => `
                        <div class="list-item">${provincialChapters[chapter.id || chapter] || `รหัส: ${chapter.id || chapter}`}</div>
                      `).join('')}
                    ` : `
                      <div style="font-weight: 600; font-size: 10px; color: #718096; margin-bottom: 2px;">
                        สภาอุตสาหกรรมจังหวัด: -
                      </div>
                    `}
                  </div>
                </div>
              </div>
            ` : ''}

              <!-- ผู้แทน -->
            ${application.representatives && application.representatives.length > 0 ? `
              <div class="section">
                <div class="section-title">ข้อมูลผู้แทน</div>
                ${application.representatives.length <= 2 ? `
                  ${application.representatives.map((rep, index) => {
                    const isPrimary = rep.rep_order === 1 || rep.is_primary === 1 || rep.is_primary === true;
                    return `
                      <div class="rep-section">
                        <div class="rep-title">${isPrimary ? 'ผู้แทนหลัก' : `ผู้แทนรอง ${index}`}</div>
                        <div class="two-columns">
                          <div class="compact-row">
                            <div class="label">ชื่อ (ไทย):</div>
                            <div class="value">${rep.first_name_th || ''} ${rep.last_name_th || ''}</div>
                          </div>
                          <div class="compact-row">
                            <div class="label">ชื่อ (อังกฤษ):</div>
                            <div class="value">${rep.first_name_en || ''} ${rep.last_name_en || ''}</div>
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
                      const isPrimary = rep.rep_order === 1 || rep.is_primary === 1 || rep.is_primary === true;
                      return `
                        <div class="rep-section" style="margin-bottom: 0;">
                          <div class="rep-title" style="font-size: 10px;">${isPrimary ? 'ผู้แทนหลัก' : `ผู้แทนรอง ${index}`}</div>
                          <div class="compact-row" style="grid-template-columns: 60px 1fr; gap: 2px;">
                            <div class="label" style="font-size: 9px;">ชื่อ (ไทย):</div>
                            <div class="value" style="font-size: 10px; font-weight: 600;">${rep.first_name_th || ''} ${rep.last_name_th || ''}</div>
                          </div>
                          <div class="compact-row" style="grid-template-columns: 60px 1fr; gap: 2px;">
                            <div class="label" style="font-size: 9px;">ชื่อ (อังกฤษ):</div>
                            <div class="value" style="font-size: 9px;">${rep.first_name_en || ''} ${rep.last_name_en || ''}</div>
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
                  ${getBusinessTypes().split(', ').map(type => `
                    <span style="display: inline-block; background: #ebf8ff; color: #2b6cb0; padding: 2px 4px; border-radius: 3px; font-size: 10px; margin: 1px 2px 1px 0; border: 1px solid #bee3f8; font-weight: 500;">${type}</span>
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
                        ${index + 1}. ${product.name_th || '-'}/${product.name_en || '-'}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- ข้อมูลผู้สมัครเพิ่มเติม (หากมี) -->
            ${(application.firstname || application.lastname) && type !== 'ic' ? `
              <div class="section">
                <div class="section-title">ข้อมูลผู้สมัคร</div>
                <div class="two-columns">
                  <div class="compact-row">
                    <div class="label">ชื่อ-นามสกุล:</div>
                    <div class="value">${application.firstname || ''} ${application.lastname || ''}</div>
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

          </div>

          <div class="footer">
            เอกสารสร้างอัตโนมัติ • ${formatThaiDate(new Date())} ${new Date().toLocaleTimeString('th-TH')} • 
            ${type?.toUpperCase() || 'MEMBER'} Application PDF
          </div>
        </div>
      </body>
      </html>
    `;

    // สร้าง PDF จาก HTML
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    
    const opt = {
      margin: 0,
      filename: `${type?.toUpperCase() || 'MEMBER'}_${application.id || 'APP'}_${new Date().toISOString().split('T')[0]}.pdf`,
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
    throw error;
  }
};