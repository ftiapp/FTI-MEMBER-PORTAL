"use server";

import { NextResponse } from "next/server";

// Mock database function to simulate database operations
const mockDbQuery = async (query, ...params) => {
  console.log("Mock DB Query:", query, params);
  // Return empty result by default
  return { rows: [], rowCount: 0 };
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idCardNumber = searchParams.get("idCardNumber");

    if (!idCardNumber) {
      return NextResponse.json(
        { isUnique: false, message: "กรุณาระบุเลขบัตรประชาชน" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่าเลขบัตรประชาชนนี้มีในระบบหรือไม่ (ตรวจสอบทุกตารางสมาชิก)

    // ตรวจสอบในตาราง AMmember_Representative
    const amResult = await mockDbQuery(
      "SELECT m.status FROM AMmember_Representative r JOIN AMmember m ON r.am_member_id = m.id WHERE r.id_card_number = $1",
      idCardNumber,
    );

    if (amResult.rowCount > 0) {
      const status = amResult.rows[0].status;

      if (status === 0) {
        return NextResponse.json({
          isUnique: false,
          message: "คำขอสมัครสมาชิกสมาพันธ์ของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน",
        });
      } else if (status === 1) {
        return NextResponse.json({
          isUnique: false,
          message: "เลขบัตรประชาชนนี้ได้เป็นผู้แทนสมาพันธ์แล้ว",
        });
      }
    }

    // ตรวจสอบในตาราง ACmember_Representative
    const acResult = await mockDbQuery(
      "SELECT m.status FROM ACmember_Representative r JOIN ACmember m ON r.ac_member_id = m.id WHERE r.id_card_number = $1",
      idCardNumber,
    );

    if (acResult.rowCount > 0) {
      const status = acResult.rows[0].status;

      if (status === 0) {
        return NextResponse.json({
          isUnique: false,
          message: "คำขอสมัครสมาชิกสมาคมของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน",
        });
      } else if (status === 1) {
        return NextResponse.json({
          isUnique: false,
          message: "เลขบัตรประชาชนนี้ได้เป็นผู้แทนสมาคมแล้ว",
        });
      }
    }

    // ตรวจสอบในตาราง ICmember
    const icResult = await mockDbQuery(
      "SELECT status FROM ICmember WHERE id_card_number = $1",
      idCardNumber,
    );

    if (icResult.rowCount > 0) {
      const status = icResult.rows[0].status;

      if (status === 0) {
        return NextResponse.json({
          isUnique: false,
          message: "คำขอสมัครสมาชิกบุคคลของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน",
        });
      } else if (status === 1) {
        return NextResponse.json({
          isUnique: false,
          message: "เลขบัตรประชาชนนี้ได้เป็นสมาชิกบุคคลแล้ว",
        });
      }
    }

    // ตรวจสอบในตาราง OCmember_Representative
    const ocResult = await mockDbQuery(
      "SELECT m.status FROM OCmember_Representative r JOIN OCmember m ON r.oc_member_id = m.id WHERE r.id_card_number = $1",
      idCardNumber,
    );

    if (ocResult.rowCount > 0) {
      const status = ocResult.rows[0].status;

      if (status === 0) {
        return NextResponse.json({
          isUnique: false,
          message: "คำขอสมัครสมาชิกสามัญของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน",
        });
      } else if (status === 1) {
        return NextResponse.json({
          isUnique: false,
          message: "เลขบัตรประชาชนนี้ได้เป็นผู้แทนสมาชิกสามัญแล้ว",
        });
      }
    }

    // ถ้าไม่พบในทุกตาราง แสดงว่าเป็นเลขที่ไม่ซ้ำ
    return NextResponse.json({ isUnique: true });
  } catch (error) {
    console.error("Error checking ID card uniqueness:", error);
    return NextResponse.json(
      {
        isUnique: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 },
    );
  }
}
