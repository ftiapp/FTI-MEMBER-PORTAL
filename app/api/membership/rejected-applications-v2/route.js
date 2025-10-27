import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * GET rejected applications for current user
 * No Reject_DATA - read directly from Main tables
 */

export async function GET(request) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    connection = await getConnection();

    // Query all rejected applications (status = 2, not archived)
    const [ocApps] = await connection.execute(
      `SELECT 
        id, 
        'oc' as type,
        company_name_th as name,
        rejection_reason,
        rejected_at,
        created_at
       FROM MemberRegist_OC_Main 
       WHERE user_id = ? AND status = 2 AND is_archived = 0
       ORDER BY rejected_at DESC`,
      [user.id]
    );

    const [acApps] = await connection.execute(
      `SELECT 
        id, 
        'ac' as type,
        company_name_th as name,
        rejection_reason,
        rejected_at,
        created_at
       FROM MemberRegist_AC_Main 
       WHERE user_id = ? AND status = 2 AND is_archived = 0
       ORDER BY rejected_at DESC`,
      [user.id]
    );

    const [amApps] = await connection.execute(
      `SELECT 
        id, 
        'am' as type,
        company_name_th as name,
        rejection_reason,
        rejected_at,
        created_at
       FROM MemberRegist_AM_Main 
       WHERE user_id = ? AND status = 2 AND is_archived = 0
       ORDER BY rejected_at DESC`,
      [user.id]
    );

    const [icApps] = await connection.execute(
      `SELECT 
        id, 
        'ic' as type,
        CONCAT(first_name_th, ' ', last_name_th) as name,
        rejection_reason,
        rejected_at,
        created_at
       FROM MemberRegist_IC_Main 
       WHERE user_id = ? AND status = 2 AND is_archived = 0
       ORDER BY rejected_at DESC`,
      [user.id]
    );

    // Combine all
    const allRejected = [...ocApps, ...acApps, ...amApps, ...icApps]
      .sort((a, b) => new Date(b.rejected_at) - new Date(a.rejected_at));

    return NextResponse.json({
      success: true,
      data: allRejected,
    });

  } catch (error) {
    console.error("Error fetching rejected applications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลได้",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
