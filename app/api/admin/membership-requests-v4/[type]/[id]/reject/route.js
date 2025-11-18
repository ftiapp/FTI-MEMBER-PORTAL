import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";
import { sendRejectionEmail } from "@/app/lib/postmark";

// V4 Reject API - status update only (no history snapshot, no MemberRegist_Rejections)
export async function POST(request, { params }) {
  let connection;

  try {
    const adminData = await checkAdminSession();
    if (!adminData) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await params;

    const validTypes = ["oc", "am", "ac", "ic"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid membership type" },
        { status: 400 },
      );
    }

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { adminNote, rejectionReason } = body || {};

    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Rejection reason is required",
        },
        { status: 400 },
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();

    try {
      let tableName;
      switch (type) {
        case "oc":
          tableName = "MemberRegist_OC_Main";
          break;
        case "am":
          tableName = "MemberRegist_AM_Main";
          break;
        case "ac":
          tableName = "MemberRegist_AC_Main";
          break;
        case "ic":
          tableName = "MemberRegist_IC_Main";
          break;
      }

      const [appRows] = await connection.execute(
        `SELECT status, user_id FROM ${tableName} WHERE id = ?`,
        [id],
      );

      if (appRows.length === 0) {
        throw new Error("Application not found");
      }

      const currentStatus = appRows[0].status;
      const userId = appRows[0].user_id;

      // Update main table status & rejection info (status = 2 = rejected)
      await connection.execute(
        `UPDATE ${tableName}
           SET status = 2,
               rejection_reason = ?,
               rejected_by = ?,
               rejected_at = NOW()
         WHERE id = ?`,
        [rejectionReason, adminData.id, id],
      );

      // Insert conversation record for this rejection (V4 uses unified conversations table)
      try {
        const adminName = `${adminData.firstname || ""} ${adminData.lastname || ""}`.trim() || "Admin";

        await connection.execute(
          `INSERT INTO MemberRegist_Conversations 
           (membership_type, membership_id, message_type, message,
            author_type, author_id, author_name,
            status_before, status_after, is_internal, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            type,
            id,
            "rejection",
            rejectionReason,
            "admin",
            adminData.id,
            adminName,
            currentStatus,
            2, // rejected
            0, // is_internal = 0 (visible to user)
          ],
        );
      } catch (conversationError) {
        console.error("[V4] Error inserting rejection conversation:", conversationError);
        // Do not throw here to avoid breaking the main rejection flow; log only
      }

      // Fetch applicant details for email
      let email = "";
      let firstName = "";
      let lastName = "";
      let companyName = "";
      let memberCode = "";
      let taxId = "";

      try {
        let query;
        if (type === "ic") {
          query = `
            SELECT u.email AS email,
                   u.firstname AS first_name,
                   u.lastname AS last_name,
                   CONCAT(m.first_name_th, ' ', m.last_name_th) AS company_name,
                   NULL AS member_code,
                   m.id_card_number AS tax_id
            FROM MemberRegist_IC_Main m
            INNER JOIN FTI_Portal_User u ON u.id = m.user_id
            WHERE m.id = ?`;
        } else {
          const tableMap = {
            oc: "MemberRegist_OC_Main",
            am: "MemberRegist_AM_Main",
            ac: "MemberRegist_AC_Main",
          };
          const table = tableMap[type];
          query = `
            SELECT u.email AS email,
                   u.firstname AS first_name,
                   u.lastname AS last_name,
                   m.company_name_th AS company_name,
                   m.member_code AS member_code,
                   m.tax_id AS tax_id
            FROM ${table} m
            INNER JOIN FTI_Portal_User u ON u.id = m.user_id
            WHERE m.id = ?`;
        }

        const [rows] = await connection.execute(query, [id]);
        if (rows && rows.length > 0) {
          email = rows[0].email || "";
          firstName = rows[0].first_name || "";
          lastName = rows[0].last_name || "";
          companyName = rows[0].company_name || "";
          memberCode = rows[0].member_code || "";
          taxId = rows[0].tax_id || "";
        }
      } catch (e) {
        console.error("[V4] Error fetching applicant details:", e);
      }

      const memberTypeMap = {
        oc: "สน (สามัญ-โรงงาน)",
        am: "สส (สามัญ-สมาคมการค้า)",
        ac: "ทน (สมทบ-นิติบุคคล)",
        ic: "ทบ (สมทบ-บุคคลธรรมดา)",
      };

      const description = `V4: ปฏิเสธคำขอสมัครสมาชิกประเภท ${memberTypeMap[type]} ID: ${id} เหตุผล: ${rejectionReason}`;

      await connection.execute(
        `INSERT INTO FTI_Portal_Admin_Actions_Logs (admin_id, action_type, target_id, description, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          adminData.id,
          "reject_member", // ใช้ค่าเดิมให้ตรงกับ schema/enum
          id,
          description,
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          request.headers.get("user-agent") || "unknown",
        ],
      );

      await connection.commit();

      // Send rejection email (outside transaction)
      let emailSent = false;
      if (email && (firstName || lastName)) {
        try {
          await sendRejectionEmail(
            email,
            firstName,
            lastName,
            memberCode || "-",
            companyName || "-",
            rejectionReason || "-",
          );
          emailSent = true;
        } catch (emailError) {
          console.error("[V4] Error sending rejection email:", emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Membership request rejected successfully (V4)",
        emailSent,
        recipientEmail: email || null,
        recipientName: `${firstName || ""} ${lastName || ""}`.trim() || null,
        companyName: companyName || null,
        taxId: taxId || null,
      });
    } catch (txError) {
      if (connection) {
        try {
          await connection.rollback();
        } catch {}
      }
      throw txError;
    }
  } catch (error) {
    console.error("[V4] Error rejecting membership request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reject membership request (V4)" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("[V4] Error releasing connection:", releaseError);
      }
    }
  }
}
