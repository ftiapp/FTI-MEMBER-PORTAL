import { NextResponse } from "next/server";
import { getAdminFromSession } from "../../../../lib/adminAuth";
import { query as dbQuery } from "../../../../lib/db";
import { sendAddressRejectionEmail } from "@/app/lib/postmark";
import { createNotification } from "../../../../lib/notifications";

export async function POST(request) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // รับข้อมูลจาก request body
    const { id, reason, admin_notes } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing required field: id" },
        { status: 400 },
      );
    }

    if (!reason || reason.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Rejection reason is required" },
        { status: 400 },
      );
    }

    // ดึงข้อมูลคำขอแก้ไขที่อยู่
    const result = await dbQuery(
      'SELECT * FROM pending_address_updates WHERE id = ? AND status = "pending"',
      [id],
    );

    console.log("Query result:", result);

    // ตรวจสอบว่า result มีข้อมูลหรือไม่
    if (
      !result ||
      !Array.isArray(result) ||
      result.length === 0 ||
      !result[0] ||
      result[0].length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Address update request not found or already processed" },
        { status: 404 },
      );
    }

    // ตรวจสอบโครงสร้างของ result
    const addressUpdate = Array.isArray(result[0]) ? result[0][0] : result[0];
    console.log("Address update:", addressUpdate);

    if (!addressUpdate || typeof addressUpdate !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid address update data structure" },
        { status: 500 },
      );
    }

    try {
      // อัปเดตสถานะคำขอเป็น 'rejected' พร้อมเหตุผล
      await dbQuery(
        'UPDATE pending_address_updates SET status = "rejected", processed_date = NOW(), admin_comment = ?, admin_notes = ? WHERE id = ?',
        [reason, admin_notes || "", id],
      );

      // ดึงข้อมูลบริษัทและข้อมูลผู้ใช้เพื่อใช้ในการบันทึก log
      const companyResult = await dbQuery(
        "SELECT c.company_name, u.firstname, u.lastname, u.email, u.phone FROM companies_Member c LEFT JOIN users u ON c.user_id = u.id WHERE c.MEMBER_CODE = ? LIMIT 1",
        [addressUpdate.member_code || ""],
      );
      const company_name =
        companyResult.length > 0 ? companyResult[0].company_name : "Unknown Company";
      const userFirstname = companyResult.length > 0 ? companyResult[0].firstname || "" : "";
      const userLastname = companyResult.length > 0 ? companyResult[0].lastname || "" : "";
      const userEmail = companyResult.length > 0 ? companyResult[0].email || "" : "";
      const userPhone = companyResult.length > 0 ? companyResult[0].phone || "" : "";

      // บันทึกการกระทำของ admin
      const oldAddress = addressUpdate.old_data ? JSON.parse(addressUpdate.old_data) : {};
      const newAddress = addressUpdate.new_data ? JSON.parse(addressUpdate.new_data) : {};

      // สร้าง JSON ข้อมูลสำหรับบันทึกลงใน log
      const logData = JSON.stringify({
        message: `Address update rejected - Member Code: ${addressUpdate.member_code || ""}, Company: ${company_name}, Address Type: ${addressUpdate.addr_code === "001" ? "Main" : "Factory"}, Language: ${addressUpdate.addr_lang === "en" ? "English" : "Thai"}, Reason: ${reason}`,
        userId: addressUpdate.user_id,
        firstname: userFirstname,
        lastname: userLastname,
        email: userEmail,
        phone: userPhone,
        member_code: addressUpdate.member_code || "",
        company_name: company_name,
        old_address: oldAddress,
        new_address: newAddress,
        reject_reason: reason,
      });

      await dbQuery(
        "INSERT INTO admin_actions_log (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [
          admin.id,
          "reject_address_update",
          id,
          logData,
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1",
          request.headers.get("user-agent") || "Unknown",
        ],
      );

      // บันทึกใน Member_portal_User_log (ถ้ามี user_id)
      if (addressUpdate.user_id) {
        try {
          // กำหนดข้อความสั้นๆ สำหรับการปฏิเสธ
          const addrTypeText = addressUpdate.addr_code === "001" ? "หลัก" : "โรงงาน";
          const langText = addressUpdate.addr_lang === "en" ? "ภาษาอังกฤษ" : "ภาษาไทย";

          await dbQuery(
            "INSERT INTO Member_portal_User_log (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())",
            [
              addressUpdate.user_id,
              "reject_address_update",
              `ปฏิเสธคำขอแก้ไขที่อยู่${addrTypeText}${langText} - รหัสสมาชิก: ${addressUpdate.member_code || ""}, บริษัท: ${company_name}, เหตุผล: ${reason}`,
            ],
          );
        } catch (userLogError) {
          console.error("Error logging user action:", userLogError.message);
          console.log("Continuing with rejection process despite user logging error");
        }
      }

      // ส่งอีเมลแจ้งเตือนการปฏิเสธ
      try {
        // ดึงข้อมูลผู้ใช้และข้อมูลบริษัทเพื่อส่งอีเมล
        const [user] = await dbQuery(
          `SELECT u.email, u.firstname, u.lastname, c.company_name 
           FROM users u 
           LEFT JOIN companies_Member c ON c.MEMBER_CODE = ? 
           WHERE u.id = ?`,
          [addressUpdate.member_code, addressUpdate.user_id],
        );

        if (user && user.email) {
          await sendAddressRejectionEmail(
            user.email,
            user.firstname || "",
            user.lastname || "",
            addressUpdate.member_code || "",
            user.company_name || addressUpdate.company_name || "บริษัทของคุณ",
            reason || "ไม่ระบุเหตุผล",
            admin.username || "ผู้ดูแลระบบ",
          );
          console.log("Rejection email sent to", user.email);

          // สร้างการแจ้งเตือนในระบบเมื่อปฏิเสธการแก้ไขที่อยู่
          try {
            const addrTypeText = addressUpdate.addr_code === "001" ? "หลัก" : "โรงงาน";
            const langText = addressUpdate.addr_lang === "en" ? "ภาษาอังกฤษ" : "ภาษาไทย";

            await createNotification(
              addressUpdate.user_id,
              "address_update",
              `คำขอแก้ไขที่อยู่${addrTypeText}${langText}ของท่าน [รหัสสมาชิก: ${addressUpdate.member_code}] [บริษัท: ${user.company_name || addressUpdate.company_name || "บริษัทของท่าน"}] ถูกปฏิเสธ: ${reason || "ไม่ระบุเหตุผล"}`,
              "/dashboard?tab=address",
              addressUpdate.member_code,
              user.company_name || addressUpdate.company_name,
              addressUpdate.member_type,
              addressUpdate.member_group_code,
              "000", // ใช้ค่า '000' เสมอแทนที่จะใช้ addressUpdate.type_code ที่มีค่าเป็น 11
              addressUpdate.addr_code,
              addressUpdate.addr_lang,
            );
            console.log(
              "Address update rejection notification created for user:",
              addressUpdate.user_id,
            );
          } catch (notificationError) {
            console.error(
              "Error creating address update rejection notification:",
              notificationError,
            );
            // Continue with the process even if notification creation fails
          }
        }
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError);
        // ไม่ต้อง throw error เพื่อไม่ให้กระทบการทำงานหลัก
      }

      return NextResponse.json({ success: true, message: "Address update rejected successfully" });
    } catch (error) {
      console.error("Error rejecting address update:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error rejecting address update:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reject address update", error: error.message },
      { status: 500 },
    );
  }
}
