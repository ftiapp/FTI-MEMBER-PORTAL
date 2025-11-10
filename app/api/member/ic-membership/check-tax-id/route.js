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

// POST handler for checking tax ID for IC membership
export async function POST(request) {
  try {
    const data = await request.json();
    const { taxId } = data;

    console.log(`Checking TAX_ID for IC membership: ${taxId}`);

    // Validate tax ID format
    if (!validateTaxId(taxId)) {
      return NextResponse.json(
        {
          valid: false,
          error: "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง",
        },
        { status: 400 },
      );
    }

    // Check tax ID in BI_MEMBER table (MSSQL) first
    const biMemberResult = await mssqlQuery(
      "SELECT TOP (1000) [TAX_ID] FROM [FTI].[dbo].[BI_MEMBER] WHERE [TAX_ID] = @param0 AND [MEMBER_STATUS_CODE] = 'A'",
      [taxId],
    );

    console.log("BI_MEMBER check result for IC:", biMemberResult);

    if (biMemberResult && biMemberResult.length > 0) {
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

    // Tax ID is not in BI_MEMBER - can proceed with IC registration
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
    console.error("Error checking tax ID for IC membership:", error);
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
