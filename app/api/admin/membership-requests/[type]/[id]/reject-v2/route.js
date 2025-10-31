import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * NEW REJECT API v2 - No Reject_DATA table
 *
 * Simply update Main table with rejection info
 */

export async function POST(request, { params }) {
  let connection;

  try {
    const { type, id } = await params;
    const body = await request.json();
    const { rejectionReason } = body;

    // Validate
    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุเหตุผลในการปฏิเสธ" },
        { status: 400 },
      );
    }

    // Get admin from session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    connection = await getConnection();
    await connection.beginTransaction();

    try {
      // Map type to table
      const tableMap = {
        oc: "MemberRegist_OC_Main",
        ac: "MemberRegist_AC_Main",
        am: "MemberRegist_AM_Main",
        ic: "MemberRegist_IC_Main",
      };

      const mainTable = tableMap[type];
      if (!mainTable) {
        throw new Error("Invalid membership type");
      }

      // Update Main table with rejection info
      await connection.execute(
        `UPDATE ${mainTable} 
         SET status = 2,
             rejection_reason = ?,
             rejected_by = ?,
             rejected_at = NOW()
         WHERE id = ?`,
        [rejectionReason, admin.id, id],
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "ปฏิเสธใบสมัครเรียบร้อยแล้ว",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error rejecting application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถปฏิเสธใบสมัครได้ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
