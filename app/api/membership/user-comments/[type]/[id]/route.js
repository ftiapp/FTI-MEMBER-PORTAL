import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

export async function GET(request, { params }) {
  const { type, id } = params;

  // 1. Check user session to ensure they are logged in
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate parameters
  const validTypes = ["oc", "am", "ac", "ic"];
  if (!validTypes.includes(type) || !id || isNaN(parseInt(id))) {
    return NextResponse.json({ success: false, message: "Invalid parameters" }, { status: 400 });
  }

  let connection;
  try {
    connection = await getConnection();

    // 3. Verify that the logged-in user owns this application
    const mainTableMap = {
      oc: "MemberRegist_OC_Main",
      am: "MemberRegist_AM_Main",
      ac: "MemberRegist_AC_Main",
      ic: "MemberRegist_IC_Main",
    };
    const mainTable = mainTableMap[type];

    const [ownerCheck] = await connection.execute(`SELECT user_id FROM ${mainTable} WHERE id = ?`, [
      id,
    ]);

    if (ownerCheck.length === 0 || ownerCheck[0].user_id !== user.id) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // 4. Fetch comments, excluding 'admin_note'
    const [comments] = await connection.execute(
      `
      SELECT 
        c.id, c.comment_type, c.comment_text, c.created_at, a.name as admin_name
      FROM MemberRegist_Comments c
      LEFT JOIN admin_users a ON c.admin_id = a.id
      WHERE c.membership_type = ? 
        AND c.membership_id = ? 
        AND c.comment_type != 'admin_note'
      ORDER BY c.created_at ASC
    `,
      [type, id],
    );

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching user comments:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
