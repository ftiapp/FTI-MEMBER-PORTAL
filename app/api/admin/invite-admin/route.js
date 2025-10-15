import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { getAdminFromSession, logAdminAction } from "../../../lib/adminAuth";
import { generateToken } from "../../../lib/token";
import { sendAdminInviteEmail } from "@/app/lib/postmark";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || admin.adminLevel < 5) {
      return NextResponse.json(
        { success: false, message: "ไม่ได้รับอนุญาต เฉพาะ SuperAdmin เท่านั้น" },
        { status: 401 },
      );
    }

    const { email, adminLevel = 1, canCreate = false, canUpdate = false } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "อีเมลไม่ถูกต้อง" }, { status: 400 });
    }

    // If admin user with this email already exists, block
    const existing = await query("SELECT id FROM FTI_Portal_Admin_Users WHERE username = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "อีเมลนี้ถูกใช้เป็นผู้ดูแลระบบแล้ว" },
        { status: 400 },
      );
    }

    // Invalidate any previous active invites for this email
    await query(
      "UPDATE FTI_Portal_Admin_Invitation_Tokens SET used = 1, used_at = NOW() WHERE email = ? AND used = 0",
      [email],
    );

    // Create invitation token with 24h expiry
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO FTI_Portal_Admin_Invitation_Tokens (email, token, inviter_id, admin_level, can_create, can_update, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, token, admin.id, adminLevel, canCreate ? 1 : 0, canUpdate ? 1 : 0, expiresAt],
    );

    // Send email
    await sendAdminInviteEmail(email, token, { adminLevel });

    // Log
    await logAdminAction(
      admin.id,
      "invite_admin",
      null,
      { email, adminLevel, canCreate: !!canCreate, canUpdate: !!canUpdate },
      request,
    );

    return NextResponse.json({ success: true, message: "ส่งคำเชิญเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Error inviting admin:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการส่งคำเชิญ" },
      { status: 500 },
    );
  }
}
