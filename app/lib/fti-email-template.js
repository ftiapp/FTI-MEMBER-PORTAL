// Centralized FTI Email HTML Template
// Usage: getFTIEmailHtmlTemplate({ title, bodyContent })

/**
 * Returns a professional HTML email template for FTI Portal
 * @param {Object} params
 * @param {string} params.title - The title of the email (shown in header)
 * @param {string} params.bodyContent - Main HTML content for the email body
 * @returns {string} - Full HTML email
 */
export function getFTIEmailHtmlTemplate({ title, bodyContent }) {
  // Use absolute URL for logo: prefer deployed public logo, fallback to FTI official logo
  const logoUrl =
    (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BASE_URL)
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/FTI-MasterLogo_RGB_forLightBG.png`
      : 'https://www.fti.or.th/wp-content/uploads/2022/01/cropped-logo-fti-1.png';
  const promptFontUrl =
    'https://fonts.googleapis.com/css2?family=Prompt:wght@400;600&display=swap';

  return `
  <!DOCTYPE html>
  <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link href="${promptFontUrl}" rel="stylesheet" type="text/css">
      <style>
        body {
          font-family: 'Prompt', Arial, sans-serif !important;
          background: #f8f9fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 32px auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .header {
          background: #f4f8fc;
          text-align: center;
          padding: 32px 24px 16px 24px;
        }
        .header img {
          max-width: 160px;
          margin-bottom: 16px;
        }
        .header .org {
          font-size: 22px;
          font-weight: 600;
          color: #1a56db;
          margin-bottom: 4px;
        }
        .header .org-en {
          font-size: 15px;
          color: #4b5563;
          margin-bottom: 0;
        }
        .email-title {
          font-size: 20px;
          color: #1a56db;
          font-weight: 600;
          margin: 24px 0 12px 0;
          text-align: center;
        }
        .body-content {
          padding: 0 32px 24px 32px;
          font-size: 16px;
          color: #222;
        }
        .footer {
          background: #f4f8fc;
          padding: 28px 24px 18px 24px;
          font-size: 13px;
          color: #6b7280;
          text-align: center;
        }
        .footer .contact {
          margin-bottom: 10px;
          line-height: 1.6;
        }
        .footer .disclaimer {
          margin: 12px 0 6px 0;
          color: #d97706;
          font-size: 12px;
        }
        .footer .copyright {
          color: #9ca3af;
          font-size: 12px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="FTI Logo" />
          <div class="org">สภาอุตสาหกรรมแห่งประเทศไทย</div>
          <div class="org-en">The Federation of Thai Industries</div>
        </div>
        <div class="email-title">${title}</div>
        <div class="body-content">
          ${bodyContent}
        </div>
        <div class="footer">
          <div class="contact">
            สภาอุตสาหกรรมแห่งประเทศไทย<br/>
            ชั้น 8 อาคารปฏิบัติการเทคโนโลยีเชิงสร้างสรรค์<br/>
            เลขที่ 2 ถนนนางลิ้นจี่ แขวงทุ่งมหาเมฆ<br/>
            เขตสาทร กรุงเทพมหานคร 10120<br/>
            CALL CENTER: 1453 กด 2<br/>
            E-MAIL: member@fti.or.th
          </div>
          <div class="disclaimer">
            อีเมลนี้ถูกส่งด้วยระบบอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้
          </div>
          <div class="copyright">
            &copy; 2025 The Federation of Thai Industries. All rights reserved.<br/>
            Digital and Information Technology Department, The Federation of Thai Industries
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}
