export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

async function getJwt() {
  const mod = await import("jsonwebtoken");
  return mod.default || mod;
}
import { executeQuery } from "@/app/lib/db";
import puppeteer from "puppeteer";

// Function to format date in Thai format
const formatThaiDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const thaiYear = date.getFullYear() + 543;
  const day = date.getDate();

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const month = thaiMonths[date.getMonth()];
  return `${day} ${month} ${thaiYear}`;
};

// Function to format date in English format
const formatEnglishDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const day = date.getDate();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export async function POST(request) {
  try {
    // Get user ID and language from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const language = searchParams.get("language") || "thai";

    // Get request body
    const body = await request.json();

    // Verify user authentication
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if the user ID in the token matches the requested user ID
    if (decodedToken.id != userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch member data from database if not provided in the request body
    let memberData = body;

    if (!memberData.memberCode || !memberData.companyName) {
      const query = `
        SELECT cm.MEMBER_CODE, cm.company_name, cm.company_type, cm.JOIN_DATE
        FROM FTI_Original_Membership cm
        WHERE cm.user_id = ?
      `;

      const results = await executeQuery(query, [userId]);

      if (results.length === 0) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      memberData = {
        memberCode: results[0].MEMBER_CODE,
        companyName: results[0].company_name,
        memberType: results[0].company_type,
        joinDate: results[0].JOIN_DATE,
      };
    }

    // Generate HTML for the certificate
    const html = generateCertificateHTML(memberData, language);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Set PDF options for A4 size
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1.5cm",
        right: "1.5cm",
        bottom: "1.5cm",
        left: "1.5cm",
      },
    });

    await browser.close();

    // Log the certificate download
    try {
      await executeQuery(
        "INSERT INTO FTI_Portal_User_Logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())",
        [userId, "certificate_download", `Downloaded ${language} certificate`],
      );
    } catch (error) {
      console.error("Error logging certificate download:", error);
      // Continue even if logging fails
    }

    // Return the PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate_${language === "thai" ? "th" : "en"}_${memberData.memberCode}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}

function generateCertificateHTML(memberData, language) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const thaiYear = currentYear + 543;

  if (language === "thai") {
    const joinDate = memberData.joinDate
      ? formatThaiDate(memberData.joinDate)
      : "...........................";
    const formattedCurrentDate = formatThaiDate(currentDate.toISOString());

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>เอกสารรับรองการเป็นสมาชิก</title>
        <style>
          @font-face {
            font-family: 'Sarabun';
            src: url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
          }
          body {
            font-family: 'Sarabun', sans-serif;
            padding: 0;
            margin: 0;
          }
          .certificate {
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
            border: 1px solid #ddd;
            min-height: 1000px;
            box-sizing: border-box;
          }
          .certificate-header {
            text-align: center;
            margin-bottom: 40px;
          }
          .certificate-header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .certificate-header h2 {
            font-size: 20px;
            font-weight: bold;
          }
          .divider {
            border-bottom: 2px solid #1e40af;
            width: 200px;
            margin: 20px auto;
          }
          .certificate-body {
            text-align: left;
            margin-bottom: 40px;
          }
          .certificate-body p {
            margin-bottom: 20px;
            line-height: 1.6;
          }
          .company-name {
            text-align: center;
            font-weight: bold;
            font-size: 20px;
            margin: 20px 0;
          }
          .certificate-footer {
            text-align: center;
            margin-top: 60px;
          }
          .signature-line {
            margin-bottom: 5px;
          }
          .document-footer {
            position: absolute;
            bottom: 20px;
            right: 20px;
            font-size: 10px;
            color: #666;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="certificate-header">
            <h1>หนังสือรับรองการเป็นสมาชิก</h1>
            <h2>สภาอุตสาหกรรมแห่งประเทศไทย</h2>
            <div class="divider"></div>
          </div>
          
          <div class="certificate-body">
            <p style="text-align: right;">ที่...... /....... .......</p>
            
            <p>โดยหนังสือฉบับนี้ สภาอุตสาหกรรมแห่งประเทศไทย ขอรับรองว่า</p>
            
            <p class="company-name">บริษัท ${memberData.companyName || "..........................."} จำกัด</p>
            
            <p>เป็นสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย</p>
            
            <p>ประเภท${memberData.memberType || "........"} เลขที่สมาชิก${memberData.memberCode || "..............."} ตั้งแต่วันที่ ${joinDate}</p>
            
            <p>ขณะนี้ยังคงเป็นสมาชิกของสภาอุตสาหกรรมแห่งประเทศไทย ตลอดปี ${thaiYear}</p>
            
            <p style="text-align: right;">ออกให้ ณ วันที่ ${formattedCurrentDate}</p>
          </div>
          
          <div class="certificate-footer">
            <p class="signature-line">(.................................................)</p>
            <p>ผู้อำนวยการฝ่ายทะเบียนสมาชิก</p>
            <p>สภาอุตสาหกรรมแห่งประเทศไทย</p>
          </div>
          
          <div class="document-footer">
            <p>แบบหนังสือรับรองสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย (ภาษาไทย)</p>
            <p>F-PRD-005 เริ่มใช้วันที่ 15 พฤษภาคม 2568 แก้ไขครั้งที่ 3</p>
          </div>
        </div>
      </body>
      </html>
    `;
  } else {
    const joinDate = memberData.joinDate
      ? formatEnglishDate(memberData.joinDate)
      : "...........................";
    const formattedCurrentDate = formatEnglishDate(currentDate.toISOString());

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Membership Certificate</title>
        <style>
          @font-face {
            font-family: 'Sarabun';
            src: url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
          }
          body {
            font-family: 'Sarabun', sans-serif;
            padding: 0;
            margin: 0;
          }
          .certificate {
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
            border: 1px solid #ddd;
            min-height: 1000px;
            box-sizing: border-box;
          }
          .certificate-header {
            text-align: center;
            margin-bottom: 40px;
          }
          .certificate-header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .certificate-header h2 {
            font-size: 20px;
            font-weight: bold;
          }
          .divider {
            border-bottom: 2px solid #1e40af;
            width: 200px;
            margin: 20px auto;
          }
          .certificate-body {
            text-align: left;
            margin-bottom: 40px;
          }
          .certificate-body p {
            margin-bottom: 20px;
            line-height: 1.6;
          }
          .company-name {
            text-align: center;
            font-weight: bold;
            font-size: 20px;
            margin: 20px 0;
          }
          .certificate-footer {
            text-align: center;
            margin-top: 60px;
          }
          .signature-line {
            margin-bottom: 5px;
          }
          .document-footer {
            position: absolute;
            bottom: 20px;
            right: 20px;
            font-size: 10px;
            color: #666;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="certificate-header">
            <h1>MEMBERSHIP CERTIFICATE</h1>
            <h2>THE FEDERATION OF THAI INDUSTRIES</h2>
            <div class="divider"></div>
          </div>
          
          <div class="certificate-body">
            <p style="text-align: right;">Ref: ...... /....... .......</p>
            
            <p>This is to certify that</p>
            
            <p class="company-name">${memberData.companyName || "..........................."} CO., LTD.</p>
            
            <p>is a member of The Federation of Thai Industries</p>
            
            <p>Type: ${memberData.memberType || "........"} Membership No. ${memberData.memberCode || "..............."} since ${joinDate}</p>
            
            <p>The company is currently a member of The Federation of Thai Industries for the year ${currentYear}.</p>
            
            <p style="text-align: right;">Issued on ${formattedCurrentDate}</p>
          </div>
          
          <div class="certificate-footer">
            <p class="signature-line">(.................................................)</p>
            <p>Director of Membership Registration</p>
            <p>The Federation of Thai Industries</p>
          </div>
          
          <div class="document-footer">
            <p>แบบหนังสือรับรองสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย (ภาษาอังกฤษ)</p>
            <p>F-PRD-005 เริ่มใช้วันที่ 15 พฤษภาคม 2568 แก้ไขครั้งที่ 3</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
