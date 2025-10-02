"use server";

import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taxId = searchParams.get("taxId");

    if (!taxId) {
      return NextResponse.json(
        { isUnique: false, message: "กรุณาระบุเลขประจำตัวผู้เสียภาษี" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่าเลขประจำตัวผู้เสียภาษีนี้มีในระบบหรือไม่ (ตรวจสอบเฉพาะตาราง AC, AM, OC)

    // ตรวจสอบในตาราง Membership_members สำหรับสมาชิกประเภท AC
    const acResult = await query(
      `SELECT m.status 
       FROM Membership_members m 
       JOIN Membership_member_types mt ON m.member_type_id = mt.id 
       WHERE m.identification_number = ? 
       AND m.identification_type = 'TAX_ID' 
       AND mt.type_code = '12'`,
      [taxId],
    );

    if (acResult.length > 0) {
      const status = acResult[0].status;

      if (status === 0) {
        return NextResponse.json({
          isUnique: false,
          message: "คำขอสมัครสมาชิกสมาคมของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน",
        });
      } else if (status === 1) {
        return NextResponse.json({
          isUnique: false,
          message: "เลขประจำตัวผู้เสียภาษีนี้ได้เป็นสมาชิกสมาคมแล้ว",
        });
      }
    }

    // ตรวจสอบในตาราง Membership_members สำหรับสมาชิกประเภท AM
    const amResult = await query(
      `SELECT m.status 
       FROM Membership_members m 
       JOIN Membership_member_types mt ON m.member_type_id = mt.id 
       WHERE m.identification_number = ? 
       AND m.identification_type = 'TAX_ID' 
       AND mt.type_code = '21'`,
      [taxId],
    );

    if (amResult.length > 0) {
      const status = amResult[0].status;

      if (status === 0) {
        return NextResponse.json({
          isUnique: false,
          message: "คำขอสมัครสมาชิกสมาพันธ์ของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน",
        });
      } else if (status === 1) {
        return NextResponse.json({
          isUnique: false,
          message: "เลขประจำตัวผู้เสียภาษีนี้ได้เป็นสมาชิกสมาพันธ์แล้ว",
        });
      }
    }

    // ตรวจสอบในตาราง Membership_members สำหรับสมาชิกประเภท OC
    const ocResult = await query(
      `SELECT m.status 
       FROM Membership_members m 
       JOIN Membership_member_types mt ON m.member_type_id = mt.id 
       WHERE m.identification_number = ? 
       AND m.identification_type = 'TAX_ID' 
       AND mt.type_code = '11'`,
      [taxId],
    );

    if (ocResult.length > 0) {
      const status = ocResult[0].status;

      if (status === 0) {
        return NextResponse.json({
          isUnique: false,
          message: "คำขอสมัครสมาชิกสามัญของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน",
        });
      } else if (status === 1) {
        return NextResponse.json({
          isUnique: false,
          message: "เลขประจำตัวผู้เสียภาษีนี้ได้เป็นสมาชิกสามัญแล้ว",
        });
      }
    }

    // ถ้าไม่พบในทุกตาราง แสดงว่าเป็นเลขที่ไม่ซ้ำ
    return NextResponse.json({ isUnique: true });
  } catch (error) {
    console.error("Error checking tax ID uniqueness:", error);
    return NextResponse.json(
      {
        isUnique: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 },
    );
  }
}
