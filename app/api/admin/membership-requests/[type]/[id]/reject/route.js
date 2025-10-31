import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";
import { sendRejectionEmail } from "@/app/lib/postmark";
import { createSnapshot } from "@/app/lib/history-snapshot";

/**
 * Admin Reject API - Updated to use Conversations system
 * No longer uses MemberRegist_Reject_DATA table
 */

// DEPRECATED: No longer needed - keeping for reference only
async function fetchCompleteApplicationData_DEPRECATED(connection, type, id) {
  const data = { type, id };

  try {
    // Fetch main application data
    const tableMap = {
      oc: "MemberRegist_OC_Main",
      am: "MemberRegist_AM_Main",
      ac: "MemberRegist_AC_Main",
      ic: "MemberRegist_IC_Main",
    };

    const mainTable = tableMap[type];
    const [mainRows] = await connection.execute(`SELECT * FROM ${mainTable} WHERE id = ?`, [id]);
    data.main = mainRows[0] || {};

    // Fetch related data based on membership type
    if (type === "oc") {
      // OC specific tables
      const [addresses] = await connection.execute(
        `SELECT * FROM MemberRegist_OC_Address WHERE main_id = ?`,
        [id],
      );
      const [contactPersons] = await connection.execute(
        `SELECT * FROM MemberRegist_OC_ContactPerson WHERE main_id = ?`,
        [id],
      );
      const [representatives] = await connection.execute(
        `SELECT * FROM MemberRegist_OC_Representatives WHERE main_id = ?`,
        [id],
      );
      const [businessTypes] = await connection.execute(
        `SELECT * FROM MemberRegist_OC_BusinessTypes WHERE main_id = ?`,
        [id],
      );
      const [businessTypeOther] = await connection.execute(
        `SELECT * FROM MemberRegist_OC_BusinessTypeOther WHERE main_id = ?`,
        [id],
      );
      const [products] = await connection.execute(
        `SELECT * FROM MemberRegist_OC_Products WHERE main_id = ?`,
        [id],
      );
      const [industryGroups] = await connection.execute(
        `SELECT * FROM MemberRegist_OC_IndustryGroups WHERE main_id = ?`,
        [id],
      );
      const [provinceChapters] = await connection.execute(
        `SELECT * FROM MemberRegist_OC_ProvinceChapters WHERE main_id = ?`,
        [id],
      );
      const [documents] = await connection.execute(
        `SELECT * FROM MemberRegist_OC_Documents WHERE main_id = ?`,
        [id],
      );
      const [signatureName] = await connection.execute(
        `SELECT * FROM MemberRegist_OC_Signature_Name WHERE main_id = ?`,
        [id],
      );

      data.addresses = addresses;
      data.contactPersons = contactPersons;
      data.representatives = representatives;
      data.businessTypes = businessTypes;
      data.businessTypeOther = businessTypeOther;
      data.products = products;
      data.industryGroups = industryGroups;
      data.provinceChapters = provinceChapters;
      data.documents = documents;
      data.signatureName = signatureName.length > 0 ? signatureName[0] : null;
    } else if (type === "ac") {
      // AC specific tables
      const [addresses] = await connection.execute(
        `SELECT * FROM MemberRegist_AC_Address WHERE main_id = ?`,
        [id],
      );
      const [contactPersons] = await connection.execute(
        `SELECT * FROM MemberRegist_AC_ContactPerson WHERE main_id = ?`,
        [id],
      );
      const [representatives] = await connection.execute(
        `SELECT * FROM MemberRegist_AC_Representatives WHERE main_id = ?`,
        [id],
      );
      const [businessTypes] = await connection.execute(
        `SELECT * FROM MemberRegist_AC_BusinessTypes WHERE main_id = ?`,
        [id],
      );
      const [businessTypeOther] = await connection.execute(
        `SELECT * FROM MemberRegist_AC_BusinessTypeOther WHERE main_id = ?`,
        [id],
      );
      const [products] = await connection.execute(
        `SELECT * FROM MemberRegist_AC_Products WHERE main_id = ?`,
        [id],
      );
      const [industryGroups] = await connection.execute(
        `SELECT * FROM MemberRegist_AC_IndustryGroups WHERE main_id = ?`,
        [id],
      );
      const [provinceChapters] = await connection.execute(
        `SELECT * FROM MemberRegist_AC_ProvinceChapters WHERE main_id = ?`,
        [id],
      );
      const [documents] = await connection.execute(
        `SELECT * FROM MemberRegist_AC_Documents WHERE main_id = ?`,
        [id],
      );
      const [signatureName] = await connection.execute(
        `SELECT * FROM MemberRegist_AC_Signature_Name WHERE main_id = ?`,
        [id],
      );

      data.addresses = addresses;
      data.contactPersons = contactPersons;
      data.representatives = representatives;
      data.businessTypes = businessTypes;
      data.businessTypeOther = businessTypeOther;
      data.products = products;
      data.industryGroups = industryGroups;
      data.provinceChapters = provinceChapters;
      data.documents = documents;
      data.signatureName = signatureName.length > 0 ? signatureName[0] : null;
    } else if (type === "am") {
      // AM specific tables
      const [addresses] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_Address WHERE main_id = ?`,
        [id],
      );
      const [contactPersons] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_ContactPerson WHERE main_id = ?`,
        [id],
      );
      const [representatives] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_Representatives WHERE main_id = ?`,
        [id],
      );
      const [businessTypes] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?`,
        [id],
      );
      const [businessTypeOther] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_BusinessTypeOther WHERE main_id = ?`,
        [id],
      );
      const [products] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_Products WHERE main_id = ?`,
        [id],
      );
      const [industryGroups] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_IndustryGroups WHERE main_id = ?`,
        [id],
      );
      const [provinceChapters] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_ProvinceChapters WHERE main_id = ?`,
        [id],
      );
      const [documents] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_Documents WHERE main_id = ?`,
        [id],
      );
      const [signatureName] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_Signature_Name WHERE main_id = ?`,
        [id],
      );

      data.addresses = addresses;
      data.contactPersons = contactPersons;
      data.representatives = representatives;
      data.businessTypes = businessTypes;
      data.businessTypeOther = businessTypeOther;
      data.products = products;
      data.industryGroups = industryGroups;
      data.provinceChapters = provinceChapters;
      data.documents = documents;
      data.signatureName = signatureName.length > 0 ? signatureName[0] : null;
    } else if (type === "ic") {
      // IC specific tables
      const [addresses] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_Address WHERE ic_main_id = ?`,
        [id],
      );
      const [representatives] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_Representatives WHERE ic_main_id = ?`,
        [id],
      );
      const [businessTypes] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_BusinessTypes WHERE ic_main_id = ?`,
        [id],
      );
      const [businessTypeOther] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_BusinessTypeOther WHERE ic_main_id = ?`,
        [id],
      );
      const [products] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_Products WHERE ic_main_id = ?`,
        [id],
      );
      const [industryGroups] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_IndustryGroups WHERE ic_main_id = ?`,
        [id],
      );
      const [provinceChapters] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_ProvinceChapters WHERE ic_main_id = ?`,
        [id],
      );
      const [documents] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_Documents WHERE ic_main_id = ?`,
        [id],
      );
      const [signatureName] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_Signature_Name WHERE ic_main_id = ?`,
        [id],
      );

      data.addresses = addresses;
      data.representatives = representatives;
      data.businessTypes = businessTypes;
      data.businessTypeOther = businessTypeOther;
      data.products = products;
      data.industryGroups = industryGroups;
      data.provinceChapters = provinceChapters;
      data.documents = documents;
      data.signatureName = signatureName.length > 0 ? signatureName[0] : null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching complete application data:", error);
    throw error;
  }
}

export async function GET(request, { params }) {
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

    connection = await getConnection();

    let query;
    if (type === "ic") {
      query = `
        SELECT u.email AS email,
               u.firstname AS first_name,
               u.lastname AS last_name,
               CONCAT(m.first_name_th, ' ', m.last_name_th) AS company_name,
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
               m.tax_id AS tax_id
        FROM ${table} m
        INNER JOIN FTI_Portal_User u ON u.id = m.user_id
        WHERE m.id = ?`;
    }

    const [rows] = await connection.execute(query, [id]);
    const email = rows?.[0]?.email || null;
    const firstName = rows?.[0]?.first_name || "";
    const lastName = rows?.[0]?.last_name || "";
    const recipientName = `${firstName} ${lastName}`.trim() || null;
    const companyName = rows?.[0]?.company_name || null;
    const taxId = rows?.[0]?.tax_id || null;

    return NextResponse.json({
      success: true,
      recipientEmail: email,
      recipientName,
      companyName,
      taxId,
    });
  } catch (error) {
    console.error("Error in GET reject preview:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch recipient preview" },
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

export async function POST(request, { params }) {
  let connection;

  try {
    // Verify admin token
    const adminData = await checkAdminSession();
    if (!adminData) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await params;

    // Validate type parameter
    const validTypes = ["oc", "am", "ac", "ic"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid membership type" },
        { status: 400 },
      );
    }

    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { adminNote, rejectionReason } = body;

    // Validate rejection reason
    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Rejection reason is required",
        },
        { status: 400 },
      );
    }

    // Get database connection
    connection = await getConnection();

    // Begin transaction
    await connection.beginTransaction();

    try {
      // Update membership request status to rejected (2)
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

      // Get current status and user_id from the main table
      const [appRows] = await connection.execute(
        `SELECT status, user_id FROM ${tableName} WHERE id = ?`,
        [id],
      );

      if (appRows.length === 0) {
        throw new Error("Application not found");
      }

      const currentStatus = appRows[0].status;
      const userId = appRows[0].user_id;

      // Create history snapshot FIRST
      console.log(`📸 Creating history snapshot for ${type} ${id}`);
      const historyId = await createSnapshot(connection, type, id, "rejection", adminData.id);
      console.log(`✅ History snapshot created: ${historyId}`);

      // Update Main table with rejection info
      await connection.execute(
        `UPDATE ${tableName} 
         SET status = 2,
             rejection_reason = ?,
             rejected_by = ?,
             rejected_at = NOW()
         WHERE id = ?`,
        [rejectionReason, adminData.id, id],
      );

      // Create rejection record in MemberRegist_Rejections
      const [rejectionResult] = await connection.execute(
        `INSERT INTO MemberRegist_Rejections (
          user_id, membership_type, membership_id, history_snapshot_id,
          rejected_by, rejection_reason, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending_fix')`,
        [userId, type, id, historyId, adminData.id, rejectionReason],
      );

      const rejectionId = rejectionResult.insertId;
      console.log(`✅ Rejection record created: ${rejectionId}`);

      // Create initial conversation message with rejection reason
      if (rejectionReason && rejectionReason.trim()) {
        await connection.execute(
          `INSERT INTO MemberRegist_Rejection_Conversations (
            rejection_id, sender_type, sender_id, message
          ) VALUES (?, 'admin', ?, ?)`,
          [rejectionId, adminData.id, rejectionReason.trim()],
        );

        await connection.execute(
          `UPDATE MemberRegist_Rejections 
           SET last_conversation_at = NOW(), unread_member_count = 1
           WHERE id = ?`,
          [rejectionId],
        );
      }

      // Add admin note as separate message if provided
      if (adminNote && adminNote.trim()) {
        await connection.execute(
          `INSERT INTO MemberRegist_Rejection_Conversations (
            rejection_id, sender_type, sender_id, message
          ) VALUES (?, 'admin', ?, ?)`,
          [rejectionId, adminData.id, adminNote.trim()],
        );
      }

      // Fetch applicant details for email notification and description
      let email = "";
      let firstName = "";
      let lastName = "";
      let companyName = "";
      let memberCode = "";

      try {
        let query;
        if (type === "ic") {
          // For IC, send to the account owner's email from users; use user's name for greeting, and the applicant's full name as company_name display
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
          // For OC, AM, AC: send to users.email by user_id
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
          var taxId = rows[0].tax_id || "";
        }
      } catch (error) {
        console.error("Error fetching applicant details:", error);
        // Continue with empty values if there's an error
      }

      const memberTypeMap = {
        oc: "สน (สามัญ-โรงงาน)",
        am: "สส (สามัญ-สมาคมการค้า)",
        ac: "ทน (สมทบ-นิติบุคคล)",
        ic: "ทบ (สมทบ-บุคคลธรรมดา)",
      };

      const description = `ปฏิเสธคำขอสมัครสมาชิกประเภท ${memberTypeMap[type]} ID: ${id} เหตุผล: ${rejectionReason}`;

      await connection.execute(
        `INSERT INTO FTI_Portal_Admin_Actions_Logs (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          adminData.id,
          "reject_member",
          id,
          description,
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          request.headers.get("user-agent") || "unknown",
        ],
      );

      // Commit transaction
      await connection.commit();

      // Send rejection email if we have the required information
      // ย้าย email sending ออกมาจาก transaction เพื่อไม่ให้ blocking
      let emailSent = false;
      // Do not require memberCode; many pending applications don't have it yet
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
          console.log(`Rejection email sent to ${email}`);
          emailSent = true;
        } catch (emailError) {
          console.error("Error sending rejection email:", emailError);
          // Don't throw error here, just log it - we still want to return success
          // since the database transaction was successful
        }
      } else {
        console.warn("Could not send rejection email due to missing applicant information");
      }

      return NextResponse.json({
        success: true,
        message: "Membership request rejected successfully",
        emailSent: emailSent,
        recipientEmail: email || null,
        recipientName: `${firstName || ""} ${lastName || ""}`.trim() || null,
        companyName: companyName || null,
        taxId: taxId || null,
      });
    } catch (transactionError) {
      // Rollback transaction on error
      await connection.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error("Error rejecting membership request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reject membership request" },
      { status: 500 },
    );
  } finally {
    // ปิด connection ในทุกกรณี
    if (connection) {
      try {
        connection.release(); // เปลี่ยนจาก connection.end() เป็น connection.release()
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}
