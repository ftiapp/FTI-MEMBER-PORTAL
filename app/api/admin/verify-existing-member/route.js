import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { mssqlQuery } from "@/app/lib/mssql";
import { getAdminFromSession } from "@/app/lib/adminAuth";
import { logAdminAction } from "@/app/lib/adminAuth";
import { getClientIp } from "@/app/lib/utils";
import { sendExistingMemberApprovalEmail } from "@/app/lib/postmark";

export async function POST(request) {
  try {
    // ตรวจสอบ session ของ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // รับข้อมูลจาก request
    const data = await request.json();
    const { userId, memberCode, companyId } = data;

    if (!userId || !memberCode || !companyId) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
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

    // ตรวจสอบข้อมูลจาก MSSQL
    const mssqlResult = await mssqlQuery(
      `
      SELECT 
        [REGIST_CODE],
        [MEMBER_CODE],
        [MEMBER_TYPE_CODE],
        [MEMBER_STATUS_CODE],
        [COMP_PERSON_CODE],
        [TAX_ID],
        [COMPANY_NAME],
        [COMP_PERSON_NAME_EN],
        [ProductDesc_TH],
        [ProductDesc_EN]
      FROM [FTI].[dbo].[BI_MEMBER]
      WHERE [MEMBER_CODE] = @param0
    `,
      [memberCode],
    );

    if (!mssqlResult || mssqlResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลสมาชิกในระบบ MSSQL" },
        { status: 404 },
      );
    }

    const memberInfo = mssqlResult[0];

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
      // อัปเดตสถานะใน FTI_Original_Membership
      await query(
        "UPDATE FTI_Original_Membership SET Admin_Submit = 1, updated_at = NOW() WHERE id = ?",
        [companyId],
      );

      // บันทึกข้อมูลลงในตาราง member_INFO_existing
      await query(
        `
        INSERT INTO member_INFO_existing (
          user_id,
          MEMBER_CODE,
          REGIST_CODE,
          MEMBER_TYPE_CODE,
          MEMBER_STATUS_CODE,
          COMP_PERSON_CODE,
          TAX_ID,
          COMPANY_NAME,
          COMP_PERSON_NAME_EN,
          ProductDesc_TH,
          ProductDesc_EN,
          admin_id,
          admin_username
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          userId,
          memberInfo.MEMBER_CODE,
          memberInfo.REGIST_CODE,
          memberInfo.MEMBER_TYPE_CODE,
          memberInfo.MEMBER_STATUS_CODE,
          memberInfo.COMP_PERSON_CODE,
          memberInfo.TAX_ID,
          memberInfo.COMPANY_NAME,
          memberInfo.COMP_PERSON_NAME_EN,
          memberInfo.ProductDesc_TH,
          memberInfo.ProductDesc_EN,
          admin.id,
          admin.username,
        ],
      );

      // Commit transaction
      await query("COMMIT");

      // บันทึก log
      const ip = getClientIp(request);
      const userAgent = request.headers.get("user-agent") || "";

      await logAdminAction(
        admin.id,
        "verify_existing_member",
        userId,
        {
          userId,
          memberCode,
          companyId,
          userName: user.name,
          companyName: memberInfo.COMPANY_NAME,
        },
        request,
        userId,
      );

      // ส่งอีเมลแจ้งเตือนผู้ใช้
      try {
        console.log("Attempting to send approval email to:", user.email);
        console.log("Postmark API Key exists:", !!process.env.POSTMARK_API_KEY);

        const emailResponse = await sendExistingMemberApprovalEmail(
          user.email,
          user.firstname || "",
          user.lastname || "",
          memberCode,
          memberInfo.COMPANY_NAME || "ไม่ระบุ",
        );

        console.log("✅ Existing member approval email sent successfully!");
        console.log("Email to:", user.email);
        console.log("Postmark MessageID:", emailResponse?.MessageID);
      } catch (emailError) {
        console.error("❌ Error sending existing member approval email:");
        console.error("Error details:", emailError.message);
        console.error("Error code:", emailError.code);
        console.error("Full error:", JSON.stringify(emailError, null, 2));
        // Continue with the process even if email sending fails
      }

      return NextResponse.json({
        success: true,
        message: "ยืนยันสมาชิกเดิมสำเร็จ",
        memberInfo: {
          ...memberInfo,
          user: {
            id: userId,
            name: user.name,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
          },
        },
      });
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error verifying existing member:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการยืนยันสมาชิกเดิม" },
      { status: 500 },
    );
  }
}
