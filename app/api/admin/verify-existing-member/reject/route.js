import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";
import { logAdminAction } from "@/app/lib/adminAuth";
import { getClientIp } from "@/app/lib/utils";
import { sendExistingMemberRejectionEmail } from "@/app/lib/postmark";

export async function POST(request) {
  try {
    // ตรวจสอบ session ของ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Fetch admin details from database to get the name
    const adminDetails = await query(
      "SELECT name FROM FTI_Portal_Admin_Users WHERE id = ? LIMIT 1",
      [admin.id],
    );

    if (adminDetails.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ดูแลระบบ" },
        { status: 404 },
      );
    }

    const adminName = adminDetails[0].name;

    // รับข้อมูลจาก request
    const data = await request.json();
    const { userId, memberCode, companyId, reason } = data;

    if (!userId || !memberCode || !companyId) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    if (!reason || reason.trim() === "") {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุเหตุผลในการปฏิเสธ" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่า company มีอยู่จริงและยังไม่ได้รับการยืนยัน
    const companyResult = await query(
      "SELECT * FROM FTI_Original_Membership WHERE id = ? AND user_id = ? AND MEMBER_CODE = ? AND Admin_Submit = 0",
      [companyId, userId, memberCode],
    );

    if (companyResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลบริษัทหรือได้รับการยืนยันไปแล้ว" },
        { status: 404 },
      );
    }

    const company = companyResult[0];

    // ดึงข้อมูลผู้ใช้
    const userResult = await query(
      "SELECT name, firstname, lastname, email FROM FTI_Portal_User WHERE id = ?",
      [userId],
    );

    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    const user = userResult[0];

    // เริ่ม transaction
    await query("START TRANSACTION");

    try {
      // อัปเดตสถานะใน FTI_Original_Membership เป็นปฏิเสธ (Admin_Submit = 2)
      await query(
        "UPDATE FTI_Original_Membership SET Admin_Submit = 2, reject_reason = ?, admin_id = ?, admin_name = ?, updated_at = NOW() WHERE id = ?",
        [reason, admin.id, adminName, companyId],
      );

      // Commit transaction
      await query("COMMIT");

      // บันทึก log
      const ip = getClientIp(request);
      const userAgent = request.headers.get("user-agent") || "";

      await logAdminAction(
        admin.id,
        "reject_existing_member",
        userId,
        {
          userId,
          memberCode,
          companyId,
          userName: user.name,
          companyName: company.company_name || "ไม่ระบุ",
          reason,
        },
        request,
        userId,
      );

      // ส่งอีเมลแจ้งเตือนผู้ใช้
      try {
        console.log("Attempting to send rejection email to:", user.email);
        console.log("Postmark API Key exists:", !!process.env.POSTMARK_API_KEY);

        const emailResponse = await sendExistingMemberRejectionEmail(
          user.email,
          user.firstname || "",
          user.lastname || "",
          memberCode,
          company.company_name || "ไม่ระบุ",
          reason,
        );

        console.log("✅ Existing member rejection email sent successfully!");
        console.log("Email to:", user.email);
        console.log("Postmark MessageID:", emailResponse?.MessageID);
      } catch (emailError) {
        console.error("❌ Error sending existing member rejection email:");
        console.error("Error details:", emailError.message);
        console.error("Error code:", emailError.code);
        console.error("Full error:", JSON.stringify(emailError, null, 2));
        // Continue with the process even if email sending fails
      }

      return NextResponse.json({
        success: true,
        message: "ปฏิเสธการยืนยันสมาชิกเดิมสำเร็จ",
      });
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error rejecting existing member:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการปฏิเสธการยืนยันสมาชิกเดิม" },
      { status: 500 },
    );
  }
}
