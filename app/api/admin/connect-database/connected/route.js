import { NextResponse } from "next/server";
import { getAdminFromSession } from "../../../../lib/adminAuth";
import { connectDB } from "../../../../lib/db";

export async function GET(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const offset = (page - 1) * limit;

    const connection = await connectDB();

    // Base subquery: union all connected registrations (member_code present)
    const unionSubquery = `(
      SELECT id, 'OC' AS member_type, member_code, company_name_th, company_name_en, tax_id, user_id, updated_at AS connected_at
      FROM MemberRegist_OC_Main
      WHERE status = 1 AND member_code IS NOT NULL AND member_code <> ''
      UNION ALL
      SELECT id, 'AC' AS member_type, member_code, company_name_th, company_name_en, tax_id, user_id, updated_at AS connected_at
      FROM MemberRegist_AC_Main
      WHERE status = 1 AND member_code IS NOT NULL AND member_code <> ''
      UNION ALL
      SELECT id, 'AM' AS member_type, member_code, company_name_th, company_name_en, tax_id, user_id, updated_at AS connected_at
      FROM MemberRegist_AM_Main
      WHERE status = 1 AND member_code IS NOT NULL AND member_code <> ''
      UNION ALL
      SELECT id,
             'IC' AS member_type,
             member_code,
             CONCAT(COALESCE(first_name_th,''), ' ', COALESCE(last_name_th,'')) AS company_name_th,
             CONCAT(COALESCE(first_name_en,''), ' ', COALESCE(last_name_en,'')) AS company_name_en,
             id_card_number AS tax_id,
             user_id,
             updated_at AS connected_at
      FROM MemberRegist_IC_Main
      WHERE status = 1 AND member_code IS NOT NULL AND member_code <> ''
    ) AS m`;

    const whereParts = [];
    const params = [];
    if (search) {
      const like = `%${search}%`;
      whereParts.push(`(
        m.member_code LIKE ?
        OR m.company_name_th LIKE ?
        OR m.company_name_en LIKE ?
        OR u.email LIKE ?
        OR CONCAT(COALESCE(u.firstname,''), ' ', COALESCE(u.lastname,'')) LIKE ?
        OR u.name LIKE ?
      )`);
      params.push(like, like, like, like, like, like);
    }
    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    // Count total
    const [countRows] = await connection.query(
      `SELECT COUNT(*) AS total FROM ${unionSubquery} LEFT JOIN FTI_Portal_User u ON u.id = m.user_id ${whereSql}`,
      params,
    );
    const total = countRows?.[0]?.total || 0;

    // Main rows
    const [rows] = await connection.query(
      `SELECT 
         m.id,
         m.member_type,
         m.member_code,
         COALESCE(m.company_name_th, m.company_name_en, '') AS company_name,
         m.tax_id,
         m.connected_at,
         m.user_id,
         u.email AS user_email,
         u.firstname,
         u.lastname,
         u.name AS username
       FROM ${unionSubquery}
       LEFT JOIN FTI_Portal_User u ON u.id = m.user_id
       ${whereSql}
       ORDER BY m.connected_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    connection.release();

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching connected members:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
