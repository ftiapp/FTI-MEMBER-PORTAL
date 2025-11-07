import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { mssqlQuery } from "@/app/lib/mssql";

// Helper function to check tax ID in database (ตรวจสอบทั้ง OC, AC, AM และ BI_MEMBER)
async function checkTaxIdInDatabase(taxId) {
  try {
    // 0. ตรวจสอบในตาราง BI_MEMBER (MSSQL) ก่อน - สมาชิกเดิม
    const biMemberResult = await mssqlQuery(
      "SELECT TOP (1000) [TAX_ID] FROM [FTI].[dbo].[BI_MEMBER] WHERE [TAX_ID] = @param0",
      [taxId],
    );
    if (biMemberResult && biMemberResult.length > 0) {
      return { exists: true, isExistingMember: true, status: 'existing_member', memberType: "BI_MEMBER" };
    }

    // 1. ตรวจสอบในตาราง OC (MemberRegist_OC_Main)
    const ocResult = await query(
      "SELECT status FROM MemberRegist_OC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1",
      [taxId],
    );
    if (ocResult.length > 0) {
      return { exists: true, status: ocResult[0].status, memberType: "OC" };
    }

    // 2. ตรวจสอบในตาราง AC (MemberRegist_AC_Main)
    const acResult = await query(
      "SELECT status FROM MemberRegist_AC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1",
      [taxId],
    );
    if (acResult.length > 0) {
      return { exists: true, status: acResult[0].status, memberType: "AC" };
    }

    // 3. ตรวจสอบในตาราง AM (MemberRegist_AM_Main)
    const amResult = await query(
      "SELECT status FROM MemberRegist_AM_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1",
      [taxId],
    );
    if (amResult.length > 0) {
      return { exists: true, status: amResult[0].status, memberType: "AM" };
    }

    return {
      exists: false,
      isExistingMember: false,
      status: null,
      memberType: null,
    };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

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

// Helper function to generate response messages
function generateResponseMessage(taxId, status, memberType, isExistingMember = false) {
  // Special case for existing members from BI_MEMBER
  if (isExistingMember || status === 'existing_member') {
    return "เลขทะเบียนนิติบุคคลนี้เป็นสมาชิก ส.อ.ท. แล้ว โปรดใช้เมนู 'ยืนยันสมาชิกเดิม'";
  }

  const memberTypeThai = {
    OC: "สมาชิกสามัญ (โรงงาน)",
    AC: "สมาชิกสมทบ (นิติบุคคล)",
    AM: "สมาชิกสามัญ (สมาคมการค้า)",
  };

  const messages = {
    0: `เลขประจำตัวผู้เสียภาษีนี้อยู่ระหว่างพิจารณาสมัครสมาชิก กรุณาใช้เลขประจำตัวผู้เสียภาษีอื่น`,
    1: `เลขประจำตัวผู้เสียภาษีนี้เป็นสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยแล้ว กรุณาใช้เลขประจำตัวผู้เสียภาษีอื่น`,
    available: `เลขประจำตัวผู้เสียภาษีนี้สามารถใช้ได้`,
  };

  return messages[status] || messages.available;
}

// GET handler for checking tax ID availability
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const taxId = searchParams.get("taxId");

  if (!taxId) {
    return NextResponse.json(
      {
        valid: false,
        error: "กรุณาระบุเลขประจำตัวผู้เสียภาษี",
      },
      { status: 400 },
    );
  }

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

  try {
    const result = await checkTaxIdInDatabase(taxId);

    if (result.exists) {
      return NextResponse.json(
        {
          valid: false,
          exists: true,
          isExistingMember: result.isExistingMember || false,
          status: result.status,
          message: generateResponseMessage(taxId, result.status, result.memberType, result.isExistingMember),
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        valid: true,
        exists: false,
        isExistingMember: false,
        message: generateResponseMessage(taxId, "available", null, false),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking Tax ID:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล",
      },
      { status: 500 },
    );
  }
}

// POST handler for checking tax ID availability
export async function POST(request) {
  try {
    const data = await request.json();
    const { taxId } = data;

    console.log(`Checking TAX_ID: ${taxId}`);

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

    const result = await checkTaxIdInDatabase(taxId);

    console.log("Database check result:", result);

    if (result.exists) {
      return NextResponse.json(
        {
          valid: false,
          exists: true,
          isExistingMember: result.isExistingMember || false,
          status: result.status,
          message: generateResponseMessage(taxId, result.status, result.memberType, result.isExistingMember),
        },
        { status: 409 },
      );
    }

    // Tax ID is available for registration
    return NextResponse.json(
      {
        valid: true,
        exists: false,
        isExistingMember: false,
        message: generateResponseMessage(taxId, "available", null, false),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking tax ID:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 },
    );
  }
}
