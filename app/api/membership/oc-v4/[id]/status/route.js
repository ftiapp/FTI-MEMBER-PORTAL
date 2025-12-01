import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

export async function POST(request, { params }) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: "ไม่พบรหัสใบสมัคร" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body || {};

    if (typeof status !== "number") {
      return NextResponse.json(
        { success: false, message: "รูปแบบสถานะไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    connection = await getConnection();

    const [rows] = await connection.execute(
      `SELECT id FROM MemberRegist_OC_Main WHERE id = ? AND user_id = ?`,
      [id, user.id],
    );

    if (!rows.length) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลใบสมัครหรือคุณไม่มีสิทธิ์เข้าถึง" },
        { status: 404 },
      );
    }

    await connection.execute(
      `UPDATE MemberRegist_OC_Main
         SET status = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [status, id, user.id],
    );

    return NextResponse.json({ success: true, message: "อัปเดตสถานะเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("[OC-V4] Error updating status:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถอัปเดตสถานะได้" },
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
