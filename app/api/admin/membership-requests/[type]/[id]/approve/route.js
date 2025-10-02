import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";

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
    const { adminNote } = body;

    // Get database connection
    connection = await getConnection();

    // Begin transaction
    await connection.beginTransaction();

    try {
      // Update membership request status to approved (1)
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

      // Update status to approved (1)
      await connection.execute(`UPDATE ${tableName} SET status = 1 WHERE id = ?`, [id]);

      // Save admin note directly to the main table if provided
      if (adminNote && adminNote.trim()) {
        await connection.execute(
          `UPDATE ${tableName} SET admin_note = ?, admin_note_by = ?, admin_note_at = NOW() WHERE id = ?`,
          [adminNote, adminData.id, id],
        );
      }

      // Fetch tax ID and company name for the description
      let taxId = "";
      let companyName = "";

      try {
        let query;
        if (type === "ic") {
          // For IC, use id_card_number instead of tax_id and name instead of company_name
          query = `SELECT id_card_number as tax_id, CONCAT(first_name_th, ' ', last_name_th) as company_name FROM MemberRegist_IC_Main WHERE id = ?`;
        } else {
          // For OC, AM, AC
          const fieldMap = {
            oc: { table: "MemberRegist_OC_Main", taxField: "tax_id", nameField: "company_name_th" },
            am: { table: "MemberRegist_AM_Main", taxField: "tax_id", nameField: "company_name_th" },
            ac: { table: "MemberRegist_AC_Main", taxField: "tax_id", nameField: "company_name_th" },
          };

          const { table, taxField, nameField } = fieldMap[type];
          query = `SELECT ${taxField} as tax_id, ${nameField} as company_name FROM ${table} WHERE id = ?`;
        }

        const [rows] = await connection.execute(query, [id]);
        if (rows && rows.length > 0) {
          taxId = rows[0].tax_id || "";
          companyName = rows[0].company_name || "";
        }
      } catch (error) {
        console.error("Error fetching member details:", error);
        // Continue with empty values if there's an error
      }

      // Log admin action
      const memberTypeMap = {
        oc: "สน (สามัญ-โรงงาน)",
        am: "สส (สามัญ-สมาคมการค้า)",
        ac: "ทน (สมทบ-นิติบุคคล)",
        ic: "ทบ (สมทบ-บุคคลธรรมดา)",
      };

      const description = `อนุมัติคำขอสมัครสมาชิกประเภท ${memberTypeMap[type]} ID: ${id} TAX ID: ${taxId} ชื่อ: ${companyName}`;

      await connection.execute(
        `INSERT INTO admin_actions_log (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          adminData.id,
          "approve_member",
          id,
          description,
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          request.headers.get("user-agent") || "unknown",
        ],
      );

      // Commit transaction
      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Membership request approved successfully",
      });
    } catch (transactionError) {
      // Rollback transaction on error
      await connection.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error("Error approving membership request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to approve membership request" },
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
