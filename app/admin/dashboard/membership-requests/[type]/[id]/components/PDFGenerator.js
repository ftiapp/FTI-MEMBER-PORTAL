// ติดตั้ง: npm install html2pdf.js
import html2pdf from 'html2pdf.js';

// Helper function to preload images
const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(null);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error(`Failed to load image: ${url}`);
      resolve(null);
    };
    img.src = url;
  });
};

export const generateMembershipPDF = async (application, type, industrialGroups = {}, provincialChapters = {}) => {
  try {
    const getTitleByType = (type) => {
      const titleMap = {
        'ic': 'สมัครสมาชิก สมทบ-บุคคลธรรมดา (ทบ)',
        'oc': 'สมัครสมาชิก สามัญ-โรงงาน (สน)',
        'ac': 'สมัครสมาชิก สมทบ-นิติบุคคล (ทน)',
        'am': 'สมัครสมาชิก สามัญ-สมาคมการค้า (สส)'
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

    // Find document delivery address
    const getDocumentAddress = () => {
      if (application.addresses && Array.isArray(application.addresses)) {
        return application.addresses.find(addr => addr.address_type === '2') || application;
      }
      return application;
    };

    // Get main contact
    const getMainContact = () => {
      if (application.contactPersons && Array.isArray(application.contactPersons)) {
        return application.contactPersons[0];
      } else if (application.contactPerson && Array.isArray(application.contactPerson)) {
        return application.contactPerson[0];
      } else if (application.contactPerson && typeof application.contactPerson === 'object') {
        return application.contactPerson;
      }
      return null;
    };

    const addressData = getDocumentAddress();
    const mainContact = getMainContact();

    // สร้าง HTML ที่กระชับและเหมาะกับหน้า A4
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4; margin: 10mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          
          body { 
            font-family: 'Sarabun', sans-serif;
            font-size: 13px;
            line-height: 1.3;
            color: #333;
            background: white;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          
          .container { 
            width: 100%; 
            padding: 0; 
            margin: 0 auto; 
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 6px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
          }
          
          .title { font-size: 16px; font-weight: 700; }
          .date { font-size: 10px; color: #666; margin-top: 2px; }
          
          .section { 
            border: 1px solid #ccc;
            margin-bottom: 6px;
            padding: 6px;
            page-break-inside: avoid;
          }
          
          .section-title { 
            font-size: 11px; 
            font-weight: 600; 
            margin-bottom: 3px;
            background: #f5f5f5;
            padding: 2px 5px;
            border-left: 2px solid #000;
          }
          
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
          .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; }
          .grid4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; }
          
          .field { 
            display: flex; 
            margin-bottom: 3px;
            font-size: 12px;
          }
          
          .label { 
            font-weight: 600; 
            width: 80px;
            flex-shrink: 0;
            margin-right: 6px;
          }
          
          .value { 
            flex: 1; 
            word-break: break-word;
          }
          
          .inline-group {
            display: flex;
            gap: 12px;
            margin-bottom: 3px;
          }
          
          .rep-item {
            background: #f9f9f9;
            padding: 4px;
            border-radius: 3px;
            margin-bottom: 3px;
          }
          
          .business-tag {
            display: inline-block;
            background: #e6f3ff;
            color: #0066cc;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 11px;
            margin: 2px 3px 2px 0;
            border: 1px solid #b3d9ff;
          }
          
          .product-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
          }
          
          .product-item {
            background: #f0fff0;
            border: 1px solid #90ee90;
            padding: 4px;
            border-radius: 3px;
            font-size: 11px;
          }
          
          .signature-section {
            margin-top: 15px;
            display: flex;
            justify-content: flex-end;
          }
          
          .signature-box {
            width: 320px;
            border: 1px solid #ccc;
            padding: 8px;
            background: #fafafa;
          }
          
          .signature-header {
            font-size: 11px;
            text-align: center;
            border-bottom: 1px dotted #999;
            padding-bottom: 4px;
            margin-bottom: 6px;
            font-weight: 600;
          }
          
          .signature-content {
            display: flex;
            gap: 8px;
          }
          
          .signature-item {
            flex: 1;
            text-align: center;
          }
          
          .signature-label {
            font-weight: 600;
            font-size: 10px;
            margin-bottom: 3px;
            color: #333;
          }
          
          .signature-image {
            border: 1px dashed #999;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
          }
          
          .signature-image img {
            max-width: 100%;
            max-height: 45px;
            object-fit: contain;
          }
          
          .signature-date {
            margin-top: 4px;
            text-align: right;
            font-size: 10px;
            color: #666;
          }
          
          .footer {
            text-align: center;
            font-size: 10px;
            color: #999;
            margin-top: 8px;
            padding-top: 4px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="title">${getTitleByType(type)}</div>
          </div>
          
          <!-- ข้อมูลหลัก -->
          <div class="section">
            <div class="section-title">${type === 'ic' ? 'ข้อมูลผู้สมัคร' : 'ข้อมูลบริษัท/องค์กร'}</div>
            
            ${type === 'ic' ? `
              <div class="grid2">
                <div class="field">
                  <div class="label">ชื่อ (ไทย):</div>
                  <div class="value">${application.first_name_th || application.firstNameTh || '-'} ${application.last_name_th || application.lastNameTh || '-'}</div>
                </div>
                <div class="field">
                  <div class="label">ชื่อ (อังกฤษ):</div>
                  <div class="value">${application.first_name_en || application.firstNameEn || '-'} ${application.last_name_en || application.lastNameEn || '-'}</div>
                </div>
              </div>
              <div class="inline-group">
                <div class="field" style="flex: 1;">
                  <div class="label">บัตรประชาชน:</div>
                  <div class="value">${application.id_card_number || application.idCard || '-'}</div>
                </div>
                <div class="field" style="flex: 1;">
                  <div class="label">โทรศัพท์:</div>
                  <div class="value">${application.phone || '-'}</div>
                </div>
                <div class="field" style="flex: 1;">
                  <div class="label">อีเมล:</div>
                  <div class="value">${application.email || '-'}</div>
                </div>
              </div>
            ` : `
              <div class="grid2">
                <div class="field">
                  <div class="label">ชื่อ (ไทย):</div>
                  <div class="value">${application.company_name_th || application.companyNameTh || application.associationNameTh || '-'}</div>
                </div>
                <div class="field">
                  <div class="label">ชื่อ (อังกฤษ):</div>
                  <div class="value">${application.company_name_en || application.companyNameEn || application.associationNameEn || '-'}</div>
                </div>
              </div>
              <div class="grid3">
                <div class="field">
                  <div class="label">เลขทะเบียน:</div>
                  <div class="value">${application.tax_id || application.taxId || '-'}</div>
                </div>
                <div class="field">
                  <div class="label">พนักงาน:</div>
                  <div class="value">${application.number_of_employees || application.numberOfEmployees || '-'} คน</div>
                </div>
                ${type === 'am' ? `
                  <div class="field">
                    <div class="label">สมาชิกสมาคม:</div>
                    <div class="value">${application.number_of_member || application.numberOfMember || '-'} คน</div>
                  </div>
                ` : type === 'oc' ? `
                  <div class="field">
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
              <div class="inline-group">
                <div class="field" style="flex: 1;">
                  <div class="label">อีเมล:</div>
                  <div class="value">${application.company_email || application.companyEmail || application.email || '-'}</div>
                </div>
                <div class="field" style="flex: 1;">
                  <div class="label">โทรศัพท์:</div>
                  <div class="value">${application.company_phone || application.companyPhone || application.phone || '-'}</div>
                </div>
                <div class="field" style="flex: 1;">
                  <div class="label">เว็บไซต์:</div>
                  <div class="value">${application.company_website || application.companyWebsite || application.website || '-'}</div>
                </div>
              </div>
            `}
          </div>

          <!-- ข้อมูลผู้สมัครเพิ่มเติม -->
          ${(application.firstname || application.lastname) && type !== 'ic' ? `
            <div class="section">
              <div class="section-title">ข้อมูลผู้สมัคร</div>
              <div class="inline-group">
                <div class="field" style="flex: 1;">
                  <div class="label">ชื่อ-นามสกุล:</div>
                  <div class="value">${application.firstname || ''} ${application.lastname || ''}</div>
                </div>
                <div class="field" style="flex: 1;">
                  <div class="label">โทรศัพท์:</div>
                  <div class="value">${application.phone || '-'}</div>
                </div>
                <div class="field" style="flex: 1;">
                  <div class="label">อีเมล:</div>
                  <div class="value">${application.email || '-'}</div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- ที่อยู่และผู้ติดต่อ -->
          <div class="section">
            <div class="section-title">ที่อยู่จัดส่งเอกสาร</div>
            <div class="grid4">
              <div class="field">
                <div class="label">บ้านเลขที่:</div>
                <div class="value">${addressData.address_number || '-'}</div>
              </div>
              <div class="field">
                <div class="label">หมู่:</div>
                <div class="value">${addressData.moo || '-'}</div>
              </div>
              <div class="field">
                <div class="label">ซอย:</div>
                <div class="value">${addressData.soi || '-'}</div>
              </div>
              <div class="field">
                <div class="label">ถนน:</div>
                <div class="value">${addressData.street || addressData.road || '-'}</div>
              </div>
            </div>
            <div class="grid4">
              <div class="field">
                <div class="label">ตำบล:</div>
                <div class="value">${addressData.sub_district || '-'}</div>
              </div>
              <div class="field">
                <div class="label">อำเภอ:</div>
                <div class="value">${addressData.district || '-'}</div>
              </div>
              <div class="field">
                <div class="label">จังหวัด:</div>
                <div class="value">${addressData.province || '-'}</div>
              </div>
              <div class="field">
                <div class="label">รหัสไปรษณีย์:</div>
                <div class="value">${addressData.postal_code || '-'}</div>
              </div>
            </div>
            
            ${type !== 'ic' && mainContact ? `
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #ddd;">
                <div style="font-weight: 600; font-size: 12px; margin-bottom: 3px;">ผู้ติดต่อ</div>
                <div class="grid3">
                  <div class="field">
                    <div class="label">ชื่อ:</div>
                    <div class="value">${(mainContact.first_name_th || mainContact.firstNameTh || '') + ' ' + (mainContact.last_name_th || mainContact.lastNameTh || '')}</div>
                  </div>
                  <div class="field">
                    <div class="label">ตำแหน่ง:</div>
                    <div class="value">${mainContact.position || '-'}</div>
                  </div>
                  <div class="field">
                    <div class="label">โทรศัพท์:</div>
                    <div class="value">${mainContact.phone || '-'}</div>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- กลุ่มอุตสาหกรรมและสภาจังหวัด -->
          ${((application.industrialGroupIds && application.industrialGroupIds.length > 0) || 
            (application.provincialChapterIds && application.provincialChapterIds.length > 0)) ? `
            <div class="section">
              <div class="section-title">กลุ่มอุตสาหกรรม และ สภาอุตสาหกรรมจังหวัด</div>
              <div class="grid2">
                <div>
                  <div style="font-weight: 600; font-size: 12px; margin-bottom: 3px;">กลุ่มอุตสาหกรรม:</div>
                  ${application.industrialGroupIds && application.industrialGroupIds.length > 0 ? 
                    `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px;">
                      ${application.industrialGroupIds.map(group => `
                        <div style="font-size: 11px; margin: 2px 0;">• ${industrialGroups[group.id || group] || `รหัส: ${group.id || group}`}</div>
                      `).join('')}
                    </div>` : 
                    '<div style="font-size: 11px; color: #999;">-</div>'
                  }
                </div>
                <div>
                  <div style="font-weight: 600; font-size: 12px; margin-bottom: 3px;">สภาอุตสาหกรรมจังหวัด:</div>
                  ${application.provincialChapterIds && application.provincialChapterIds.length > 0 ? 
                    `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px;">
                      ${application.provincialChapterIds.map(chapter => `
                        <div style="font-size: 11px; margin: 2px 0;">• ${provincialChapters[chapter.id || chapter] || `รหัส: ${chapter.id || chapter}`}</div>
                      `).join('')}
                    </div>` : 
                    '<div style="font-size: 11px; color: #999;">-</div>'
                  }
                </div>
              </div>
            </div>
          ` : ''}

          <!-- ผู้แทน -->
          ${application.representatives && application.representatives.length > 0 ? `
            <div class="section">
              <div class="section-title">ข้อมูลผู้แทน</div>
              <div class="grid3">
                ${application.representatives.map((rep, index) => {
                  const isPrimary = rep.rep_order === 1 || rep.is_primary === 1 || rep.is_primary === true;
                  return `
                    <div class="rep-item">
                      <div style="font-weight: 600; font-size: 11px; color: #0066cc; margin-bottom: 3px;">
                        ${isPrimary ? 'ผู้แทนหลัก' : `ผู้แทนรอง ${index}`}
                      </div>
                      <div style="font-size: 11px; margin-bottom: 2px;">
                        <strong>${rep.first_name_th || ''} ${rep.last_name_th || ''}</strong>
                      </div>
                      <div style="font-size: 10px;">${rep.position || '-'}</div>
                      <div style="font-size: 10px;">${rep.phone || '-'}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- ประเภทธุรกิจ -->
          ${application.businessTypes ? `
            <div class="section">
              <div class="section-title">ประเภทธุรกิจ</div>
              <div>
                ${getBusinessTypes().split(', ').map(type => `
                  <span class="business-tag">${type}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- สินค้าและบริการ -->
          ${application.products && application.products.length > 0 ? `
            <div class="section">
              <div class="section-title">สินค้าและบริการ (${application.products.length} รายการ)</div>
              <div class="product-grid">
                ${application.products.map((product, index) => `
                  <div class="product-item">
                    <strong>${index + 1}.</strong> ${product.name_th || '-'}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- ลายเซ็นและตราประทับ -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-header">
                ลายเซ็นและตราประทับ
              </div>
              
              <div class="signature-content">
                ${type !== 'ic' ? `
                <div class="signature-item">
                  <div class="signature-label">ตราประทับบริษัท</div>
                  <div class="signature-image">
                    ${application.companyStamp && application.companyStamp.fileUrl ? `
                      <img src="${application.companyStamp.fileUrl}" alt="ตราประทับบริษัท" crossorigin="anonymous" />
                    ` : `
                      <span style="color: #999; font-size: 7px;">ไม่มีตราประทับ</span>
                    `}
                  </div>
                </div>
                ` : ''}
                
                <div class="signature-item">
                  <div class="signature-label">ลายเซ็นผู้มีอำนาจ</div>
                  <div class="signature-image">
                    ${application.authorizedSignature && application.authorizedSignature.fileUrl ? `
                      <img src="${application.authorizedSignature.fileUrl}" alt="ลายเซ็นผู้มีอำนาจ" crossorigin="anonymous" />
                    ` : `
                      <span style="color: #999; font-size: 7px;">ไม่มีลายเซ็น</span>
                    `}
                  </div>
                </div>
              </div>
              
              <div class="signature-date">
                วันที่สมัคร: ${application.createdAt ? formatThaiDate(new Date(application.createdAt)) : formatThaiDate(new Date())}
              </div>
            </div>
          </div>

          <div class="footer">
            เอกสารสร้างอัตโนมัติ • ${formatThaiDate(new Date())} • ${type?.toUpperCase() || 'MEMBER'} Application PDF
          </div>
        </div>
      </body>
      </html>
    `;

    // Preload images
    console.log('Preloading images...');
    const imagesToPreload = [];
    
    if (application.companyStamp && application.companyStamp.fileUrl) {
      imagesToPreload.push(preloadImage(application.companyStamp.fileUrl));
    }
    
    if (application.authorizedSignature && application.authorizedSignature.fileUrl) {
      imagesToPreload.push(preloadImage(application.authorizedSignature.fileUrl));
    }
    
    await Promise.all(imagesToPreload);
    console.log('Images preloaded successfully');
    
    // สร้าง PDF
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${type?.toUpperCase() || 'MEMBER'}_${application.id || 'APP'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.9 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        windowWidth: 1122, // A4 width in pixels at 300 DPI
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll('img');
          images.forEach((img) => {
            img.crossOrigin = 'Anonymous';
          });
          
          // Force full width layout
          const container = clonedDoc.querySelector('.container');
          if (container) {
            container.style.width = '100%';
            container.style.maxWidth = '100%';
            container.style.margin = '0 auto';
            container.style.padding = '0 15px';
          }
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      console.log('Starting PDF generation...');
      await html2pdf().from(element).set(opt).save();
      console.log('PDF generation completed successfully');
    } catch (pdfError) {
      console.error('Error during PDF generation:', pdfError);
      throw pdfError;
    }
    
    return { success: true, filename: opt.filename };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};