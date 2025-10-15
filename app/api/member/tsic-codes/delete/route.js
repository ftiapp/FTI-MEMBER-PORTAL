import { NextResponse } from "next/server";
import {
  executeQuery,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
} from "../../../../lib/db";
import { getUserFromSession } from "../../../../lib/userAuth";

/**
 * API endpoint to delete a specific TSIC code for a member
 * @param {Object} request - The request object
 * @returns {Object} - The response object
 */
export async function POST(request) {
  let connection = null;

  try {
    // Parse the request body
    const body = await request.json();
    const { userId, memberCode, tsicCode } = body;

    // Validate required fields
    if (!memberCode || !tsicCode) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุรหัสสมาชิกและรหัส TSIC" },
        { status: 400 },
      );
    }

    // Verify user authentication
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
        { status: 401 },
      );
    }

    // Start a transaction
    connection = await beginTransaction();

    // Check if the TSIC code exists for this member
    const checkSql = `
      SELECT id FROM FTI_Original_Membership_Member_Tsic_Codes 
      WHERE member_code = ? AND tsic_code = ?
    `;
    const checkParams = [memberCode, tsicCode];
    const existingCodes = await executeQuery(connection, checkSql, checkParams);

    if (!existingCodes || existingCodes.length === 0) {
      await rollbackTransaction(connection);
      return NextResponse.json(
        { success: false, message: `ไม่พบรหัส TSIC ${tsicCode} สำหรับสมาชิกนี้` },
        { status: 404 },
      );
    }

    // Delete the TSIC code
    const deleteSql = `
      DELETE FROM FTI_Original_Membership_Member_Tsic_Codes 
      WHERE member_code = ? AND tsic_code = ?
    `;
    const deleteParams = [memberCode, tsicCode];
    await executeQuery(connection, deleteSql, deleteParams);

    // Log the action
    const logSql = `
      INSERT INTO FTI_Portal_User_Logs (
        user_id, action, details, created_at
      ) VALUES (?, ?, ?, NOW())
    `;
    const logParams = [
      userId || user.id,
      "delete_tsic",
      `Deleted TSIC code ${tsicCode} for member ${memberCode}`,
    ];
    await executeQuery(connection, logSql, logParams);

    // Commit the transaction
    await commitTransaction(connection);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `ลบรหัส TSIC ${tsicCode} เรียบร้อยแล้ว`,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    if (connection) {
      await rollbackTransaction(connection);
    }

    console.error("Error deleting TSIC code:", error);

    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการลบรหัส TSIC กรุณาลองใหม่อีกครั้ง",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
