// ติดตั้ง: npm install html2pdf.js
import html2pdf from 'html2pdf.js';

export const generateMembershipPDF = async (application, type, industrialGroups = {}, provincialChapters = {}) => {
  try {
    const getTitleByType = (type) => {
      const titleMap = {
        'ic': 'ข้อมูลสมาชิกบุคคล',
        'oc': 'ข้อมูลสมาชิกนิติบุคคลสามัญ',
        'ac': 'ข้อมูลสมาชิกนิติบุคคลสมทบ',
        'am': 'ข้อมูลสมาชิกสมาคม'
      };
      return titleMap[type] || 'ข้อมูลสมาชิk';
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
            margin: 12mm;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Sarabun', 'Tahoma', sans-serif;
            font-size: 10px;
            line-height: 1.4;
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
            font-size: 16px; 
            font-weight: 700; 
            margin-bottom: 12px;
            color: #1a365d;
            border-bottom: 2px solid #3182ce;
            padding-bottom: 8px;
          }
          
          .date-info {
            text-align: center;
            font-size: 9px;
            color: #718096;
            margin-bottom: 12px;
          }
          
          .content {
            display: block;
          }
          
          .section { 
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 8px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .section-title { 
            font-size: 11px; 
            font-weight: 600; 
            margin-bottom: 6px;
            color: #2d3748;
            background: #f7fafc;
            padding: 4px 6px;
            border-left: 3px solid #3182ce;
            border-radius: 2px;
          }
          
          .two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 6px;
          }
          
          .three-columns {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 6px;
            margin-bottom: 6px;
          }
          
          .row { 
            display: flex; 
            margin-bottom: 3px;
            align-items: flex-start;
          }
          
          .label { 
            font-weight: 600; 
            width: 85px;
            color: #4a5568;
            font-size: 9px;
            flex-shrink: 0;
            margin-right: 6px;
          }
          
          .value { 
            flex: 1; 
            color: #2d3748;
            font-size: 9px;
            word-break: break-word;
            font-weight: 400;
          }
          
          .list-item {
            font-size: 8px;
            margin: 1px 0;
            padding-left: 8px;
            position: relative;
            line-height: 1.3;
          }
          
          .list-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #3182ce;
          }
          
          .rep-section, .contact-section {
            background: #f8fafc;
            padding: 6px;
            margin-bottom: 4px;
            border-radius: 3px;
            border-left: 2px solid #3182ce;
          }
          
          .rep-title, .contact-title {
            font-weight: 600;
            font-size: 9px;
            color: #2b6cb0;
            margin-bottom: 3px;
          }
          
          .business-type-item {
            display: inline-block;
            background: #ebf8ff;
            color: #2b6cb0;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 8px;
            margin: 1px 2px 1px 0;
            border: 1px solid #bee3f8;
          }
          
          .product-item {
            background: #f0fff4;
            border: 1px solid #c6f6d5;
            padding: 4px;
            margin-bottom: 3px;
            border-radius: 2px;
          }
          
          .document-item {
            background: #fffaf0;
            border: 1px solid #fed7aa;
            padding: 4px;
            margin-bottom: 2px;
            border-radius: 2px;
            font-size: 8px;
          }
          
          .footer {
            text-align: center;
            font-size: 8px;
            color: #a0aec0;
            margin-top: 12px;
            padding-top: 6px;
            border-top: 1px solid #e2e8f0;
          }
          
          .address-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 4px;
            margin-bottom: 4px;
          }
          
          .compact-row {
            display: grid;
            grid-template-columns: 80px 1fr;
            gap: 4px;
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
            ${getTitleByType(type)}
          </div>
          
          <div class="date-info">
            วันที่สร้าง PDF: ${formatThaiDate(new Date())} | เวลา: ${new Date().toLocaleTimeString('th-TH')}
          </div>
          
          <div class="content">
            
            <!-- สถานะการสมัคร -->
            ${application.status !== undefined ? `
              <div class="section">
                <div class="section-title">สถานะการสมัคร</div>
                <div class="row">
                  <div class="label">สถานะ:</div>
                  <div class="value">
                    <span class="status-badge ${
                      application.status === 1 ? 'status-approved' : 
                      application.status === 0 ? 'status-pending' : 'status-rejected'
                    }">
                      ${application.status === 1 ? 'อนุมัติแล้ว' : 
                        application.status === 0 ? 'รอการอนุมัติ' : 'ปฏิเสธ'}
                    </span>
                    ${application.member_code ? `| รหัสสมาชิก: ${application.member_code}` : ''}
                  </div>
                </div>
                ${application.adminNote ? `
                  <div class="row">
                    <div class="label">หมายเหตุ:</div>
                    <div class="value">${application.adminNote}</div>
                  </div>
                ` : ''}
              </div>
            ` : ''}

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
                      <div style="font-weight: 600; font-size: 9px; color: #2b6cb0; margin-bottom: 3px;">
                        กลุ่มอุตสาหกรรม:
                      </div>
                      ${application.industrialGroupIds.map(group => `
                        <div class="list-item">${industrialGroups[group.id || group] || `รหัส: ${group.id || group}`}</div>
                      `).join('')}
                    ` : `
                      <div style="font-weight: 600; font-size: 9px; color: #718096; margin-bottom: 3px;">
                        กลุ่มอุตสาหกรรม: -
                      </div>
                    `}
                  </div>
                  
                  <!-- สภาอุตสาหกรรมจังหวัด -->
                  <div>
                    ${application.provincialChapterIds && application.provincialChapterIds.length > 0 ? `
                      <div style="font-weight: 600; font-size: 9px; color: #2b6cb0; margin-bottom: 3px;">
                        สภาอุตสาหกรรมจังหวัด:
                      </div>
                      ${application.provincialChapterIds.map(chapter => `
                        <div class="list-item">${provincialChapters[chapter.id || chapter] || `รหัส: ${chapter.id || chapter}`}</div>
                      `).join('')}
                    ` : `
                      <div style="font-weight: 600; font-size: 9px; color: #718096; margin-bottom: 3px;">
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
              </div>
            ` : ''}

            <!-- ผู้ติดต่อ -->
            ${type !== 'ic' && application.contactPersons && application.contactPersons.length > 0 ? `
              <div class="section">
                <div class="section-title">ข้อมูลผู้ติดต่อ</div>
                ${application.contactPersons.map((contact, index) => `
                  <div class="contact-section">
                    <div class="contact-title">ผู้ติดต่อ ${index + 1}</div>
                    <div class="two-columns">
                      <div class="compact-row">
                        <div class="label">ชื่อ (ไทย):</div>
                        <div class="value">${contact.first_name_th || contact.firstNameTh || ''} ${contact.last_name_th || contact.lastNameTh || ''}</div>
                      </div>
                      <div class="compact-row">
                        <div class="label">ชื่อ (อังกฤษ):</div>
                        <div class="value">${contact.first_name_en || contact.firstNameEn || ''} ${contact.last_name_en || contact.lastNameEn || ''}</div>
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
                `).join('')}
              </div>
            ` : ''}

            <!-- ประเภทธุรกิจ -->
            ${application.businessTypes ? `
              <div class="section">
                <div class="section-title">ประเภทธุรกิจ</div>
                <div class="value">
                  ${getBusinessTypes().split(', ').map(type => `
                    <span class="business-type-item">${type}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- สินค้าและบริการ -->
            ${application.products && application.products.length > 0 ? `
              <div class="section">
                <div class="section-title">สินค้าและบริการ (${application.products.length} รายการ)</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                  ${application.products.map((product, index) => `
                    <div class="product-item">
                      <div style="font-weight: 600; font-size: 8px; color: #2b6cb0; margin-bottom: 2px;">
                        สินค้า/บริการ ${index + 1}
                      </div>
                      <div style="font-size: 8px;">
                        <strong>ไทย:</strong> ${product.name_th || '-'}<br>
                        <strong>อังกฤษ:</strong> ${product.name_en || '-'}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- เอกสารแนบ -->
            ${application.documents && application.documents.length > 0 ? `
              <div class="section">
                <div class="section-title">เอกสารแนบ (${application.documents.length} ไฟล์)</div>
                ${application.documents.map((doc, index) => `
                  <div class="document-item">
                    <strong>${index + 1}.</strong> ${doc.document_name || `เอกสาร ${index + 1}`}
                    ${doc.file_path ? `<br><em style="color: #666; font-size: 7px;">ไฟล์: ${doc.file_path}</em>` : ''}
                  </div>
                `).join('')}
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