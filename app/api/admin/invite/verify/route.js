import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ success: false, message: "โทเคนไม่ถูกต้อง" }, { status: 400 });
    }

    const rows = await query(
      `SELECT id, email, inviter_id, admin_level, can_create, can_update, expires_at, used
       FROM FTI_Portal_Admin_Invitation_Tokens
       WHERE token = ? AND used = 0 AND expires_at > NOW()
       LIMIT 1`,
      [token],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "โทเคนไม่ถูกต้องหรือหมดอายุ" },
        { status: 400 },
      );
    }

    const invite = rows[0];
    return NextResponse.json({
      success: true,
      data: {
        email: invite.email,
        adminLevel: invite.admin_level,
        canCreate: !!invite.can_create,
        canUpdate: !!invite.can_update,
        expiresAt: invite.expires_at,
      },
    });
  } catch (error) {
    console.error("Error verifying invite token:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
