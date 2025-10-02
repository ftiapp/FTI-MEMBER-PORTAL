import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";
import sql from "mssql";

// Configuration for MSSQL connection
const mssqlConfig = {
  user: process.env.MSSQL_USER || "your_mssql_user",
  password: process.env.MSSQL_PASSWORD || "your_mssql_password",
  server: process.env.MSSQL_SERVER || "your_mssql_server",
  database: process.env.MSSQL_DATABASE || "FTI",
  options: {
    encrypt: true, // For Azure
    trustServerCertificate: true, // For local dev / self-signed certs
  },
};

export async function POST(request, { params }) {
  try {
    // Verify admin token
    const adminData = await checkAdminSession();
    if (!adminData) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    // Get MySQL connection
    const mysqlConnection = await getConnection();

    try {
      // Get the id_card_number from ICmember_Info
      const [memberRows] = await mysqlConnection.execute(
        'SELECT id_card_number, CONCAT(first_name_th, " ", last_name_th) as full_name FROM ICmember_Info WHERE id = ? AND status = 1',
        [id],
      );

      if (!memberRows || memberRows.length === 0) {
        await mysqlConnection.end();
        return NextResponse.json(
          {
            success: false,
            message: "Member not found or not approved",
          },
          { status: 404 },
        );
      }

      const { id_card_number, full_name } = memberRows[0];

      // Check if member_code already exists
      const [existingCodeRows] = await mysqlConnection.execute(
        "SELECT member_code FROM ICmember_Info WHERE id = ? AND member_code IS NOT NULL",
        [id],
      );

      if (existingCodeRows && existingCodeRows.length > 0 && existingCodeRows[0].member_code) {
        await mysqlConnection.end();
        return NextResponse.json(
          {
            success: false,
            message: "Member code already connected",
            member_code: existingCodeRows[0].member_code,
          },
          { status: 409 },
        );
      }

      // Connect to MSSQL to get the MEMBER_CODE
      let mssqlPool;
      try {
        mssqlPool = await sql.connect(mssqlConfig);

        // Query MSSQL for the MEMBER_CODE using TAX_ID (id_card_number for IC members)
        const result = await mssqlPool.request().input("tax_id", sql.VarChar, id_card_number)
          .query(`
            SELECT  [MEMBER_CODE]
                  ,[REGIST_CODE]
                  ,[COMP_PERSON_CODE]
                  ,[COMPANY_NAME]
                  ,[MEMBER_MAIN_TYPE_CODE]
                  ,[MEMBER_TYPE_CODE]
                  ,[TAX_ID]
            FROM [FTI].[dbo].[FTI_MEMBER_PORTAL]
            WHERE [TAX_ID] = @tax_id
          `);

        if (!result.recordset || result.recordset.length === 0) {
          await mysqlConnection.end();
          return NextResponse.json(
            {
              success: false,
              message: "Member code not found in external database",
            },
            { status: 404 },
          );
        }

        const memberData = result.recordset[0];
        const member_code = memberData.MEMBER_CODE;

        // Begin transaction
        await mysqlConnection.beginTransaction();

        // Update the ICmember_Info table with the MEMBER_CODE
        await mysqlConnection.execute(
          "UPDATE ICmember_Info SET member_code = ?, connection_status = 1, updated_at = NOW() WHERE id = ?",
          [member_code, id],
        );

        // Insert into companies_Member table
        await mysqlConnection.execute(
          `INSERT INTO companies_Member 
           (user_id, MEMBER_CODE, COMP_PERSON_CODE, REGIST_CODE, company_name, company_type, tax_id, created_at, updated_at, Admin_Submit, admin_id, admin_name) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 1, ?, ?)`,
          [
            memberRows[0].user_id || null,
            memberData.MEMBER_CODE,
            memberData.COMP_PERSON_CODE || null,
            memberData.REGIST_CODE || null,
            full_name,
            "IC", // IC for Individual Contributor
            id_card_number,
            adminData.id,
            adminData.name || "Admin",
          ],
        );

        // Log admin action
        await mysqlConnection.execute(
          `INSERT INTO admin_actions_log 
           (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [
            adminData.id,
            "connect_member_code", // New action type
            id,
            `เชื่อมต่อหมายเลขสมาชิก ${member_code} สำหรับสมาชิกประเภท ทบ (สมทบ-บุคคลธรรมดา) ID: ${id} เลขบัตรประชาชน: ${id_card_number} ชื่อ: ${full_name}`,
            request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
            request.headers.get("user-agent") || "unknown",
          ],
        );

        // Commit transaction
        await mysqlConnection.commit();

        // Close MySQL connection
        await mysqlConnection.end();

        return NextResponse.json({
          success: true,
          message: "Member code connected successfully",
          member_code,
        });
      } catch (mssqlError) {
        console.error("MSSQL Error:", mssqlError);
        return NextResponse.json(
          {
            success: false,
            message: "Error connecting to external database",
            error: mssqlError.message,
          },
          { status: 500 },
        );
      } finally {
        if (mssqlPool) {
          await mssqlPool.close();
        }
      }
    } catch (mysqlError) {
      // Rollback transaction on error
      if (mysqlConnection.connection._pool) {
        await mysqlConnection.rollback();
      }
      throw mysqlError;
    }
  } catch (error) {
    console.error("Error connecting member code:", error);
    return NextResponse.json(
      { success: false, message: "Failed to connect member code", error: error.message },
      { status: 500 },
    );
  }
}
