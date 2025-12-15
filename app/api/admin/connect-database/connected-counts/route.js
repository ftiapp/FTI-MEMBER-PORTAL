import { NextResponse } from "next/server";
import { getAdminFromSession } from "../../../../lib/adminAuth";
import { connectDB } from "../../../../lib/db";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const connection = await connectDB();

    const unionSubquery = `(
      SELECT id, 'OC' AS member_type
      FROM MemberRegist_OC_Main
      WHERE status = 1 AND member_code IS NOT NULL AND member_code <> ''
      UNION ALL
      SELECT id, 'AC' AS member_type
      FROM MemberRegist_AC_Main
      WHERE status = 1 AND member_code IS NOT NULL AND member_code <> ''
      UNION ALL
      SELECT id, 'AM' AS member_type
      FROM MemberRegist_AM_Main
      WHERE status = 1 AND member_code IS NOT NULL AND member_code <> ''
      UNION ALL
      SELECT id, 'IC' AS member_type
      FROM MemberRegist_IC_Main
      WHERE status = 1 AND member_code IS NOT NULL AND member_code <> ''
    ) AS m`;

    const [rows] = await connection.query(
      `SELECT m.member_type, COUNT(*) AS total
       FROM ${unionSubquery}
       GROUP BY m.member_type`,
    );

    connection.release();

    const counts = { OC: 0, AM: 0, AC: 0, IC: 0 };
    for (const row of rows || []) {
      const type = (row.member_type || "").toString().toUpperCase();
      if (Object.prototype.hasOwnProperty.call(counts, type)) {
        counts[type] = Number(row.total) || 0;
      }
    }

    const total = counts.OC + counts.AM + counts.AC + counts.IC;

    return NextResponse.json({
      success: true,
      counts,
      total,
    });
  } catch (error) {
    console.error("Error fetching connected member counts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
