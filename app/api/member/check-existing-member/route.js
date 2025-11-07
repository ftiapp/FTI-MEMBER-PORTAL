import { NextResponse } from "next/server";
import { mssqlQuery } from "@/app/lib/mssql";

// Helper function to validate tax ID format
function validateTaxId(taxId) {
  if (!taxId || typeof taxId !== "string") {
    return false;
  }

  // Remove any spaces or dashes
  const cleanTaxId = taxId.replace(/[\s-]/g, "");

  // Check if it's exactly 13 digits
  return /^\d{13}$/.test(cleanTaxId);
}

// POST handler for checking tax ID against BI_MEMBER table
export async function POST(request) {
  try {
    const data = await request.json();
    const { taxId } = data;

    console.log(`Checking TAX_ID against BI_MEMBER: ${taxId}`);

    // Validate tax ID format
    if (!validateTaxId(taxId)) {
      return NextResponse.json(
        {
          valid: false,
          isMember: false,
          error: "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง",
        },
        { status: 400 },
      );
    }

    // Check tax ID in BI_MEMBER table (MSSQL)
    const result = await mssqlQuery(
      "SELECT TOP (1000) [TAX_ID] FROM [FTI].[dbo].[BI_MEMBER] WHERE [TAX_ID] = @param0",
      [taxId],
    );

    console.log("BI_MEMBER check result:", result);

    if (result && result.length > 0) {
      // Tax ID exists in BI_MEMBER - already a member
      return NextResponse.json(
        {
          valid: false,
          isMember: true,
          exists: true,
          message: "เลขทะเบียนนิติบุคคลนี้เป็นสมาชิก ส.อ.ท. แล้ว โปรดใช้เมนู 'ยืนยันสมาชิกเดิม'",
        },
        { status: 409 },
      );
    }

    // Tax ID is not in BI_MEMBER - can proceed with registration
    return NextResponse.json(
      {
        valid: true,
        isMember: false,
        exists: false,
        message: "เลขประจำตัวผู้เสียภาษีสามารถใช้สมัครสมาชิกได้",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking tax ID in BI_MEMBER:", error);
    return NextResponse.json(
      {
        valid: false,
        isMember: false,
        error: "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 },
    );
  }
}
