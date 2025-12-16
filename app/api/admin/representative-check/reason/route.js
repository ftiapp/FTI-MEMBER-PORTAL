import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { getAdminFromSession } from "../../../../lib/adminAuth";

export async function POST(request) {
  try {
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    // (Optional) Restrict to admin users only; page itself is in admin area.
    const { reasonText } = await request.json();

    const reason = (reasonText ?? "").toString().trim();
    if (!reason) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุเหตุผลในการเข้าใช้งาน" },
        { status: 400 },
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown-ip";

    const userAgent = request.headers.get("user-agent") || "";

    const result = await query(
      `INSERT INTO FTI_Portal_Admin_Representative_Check_Reason
       (admin_id, admin_username, admin_name, reason_text, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)` ,
      [
        admin.id,
        admin.username || "",
        admin.name || admin.username || "",
        reason,
        ipAddress,
        userAgent,
      ],
    );

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Error saving representative check reason:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการบันทึกเหตุผล" },
      { status: 500 },
    );
  }
}
