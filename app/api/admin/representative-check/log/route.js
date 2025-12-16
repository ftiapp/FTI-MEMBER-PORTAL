import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { getAdminFromSession } from "../../../../lib/adminAuth";

export async function GET(request) {
  try {
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 5)));

    const searchUser = (searchParams.get("user") || "").trim();
    const searchTerm = (searchParams.get("term") || "").trim();
    const dateFrom = searchParams.get("from") || "";
    const dateTo = searchParams.get("to") || "";

    let whereClauses = [];
    let params = [];

    if (searchUser) {
      whereClauses.push("(l.admin_username LIKE ? OR l.admin_name LIKE ?)");
      params.push(`%${searchUser}%`, `%${searchUser}%`);
    }
    if (searchTerm) {
      whereClauses.push("l.search_query LIKE ?");
      params.push(`%${searchTerm}%`);
    }
    if (dateFrom) {
      whereClauses.push("DATE(l.created_at) >= ?");
      params.push(dateFrom);
    }
    if (dateTo) {
      whereClauses.push("DATE(l.created_at) <= ?");
      params.push(dateTo);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countRows = await query(
      `SELECT COUNT(1) AS total
       FROM FTI_Portal_Admin_Representative_Check_Log l
       ${whereSQL}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * pageSize;

    const rows = await query(
      `SELECT l.id, l.admin_username, l.admin_name, l.search_query, l.created_at, l.reason_id,
              r.reason_text
       FROM FTI_Portal_Admin_Representative_Check_Log l
       LEFT JOIN FTI_Portal_Admin_Representative_Check_Reason r ON l.reason_id = r.id
       ${whereSQL}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    );

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page: safePage,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching representative check logs:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล log" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchQuery, reasonId } = await request.json();

    const q = (searchQuery ?? "").toString().trim();
    if (!q) {
      return NextResponse.json({ success: false, message: "กรุณาระบุคำค้นหา" }, { status: 400 });
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown-ip";

    const userAgent = request.headers.get("user-agent") || "";

    const reasonIdNum = reasonId ? Number(reasonId) : null;

    await query(
      `INSERT INTO FTI_Portal_Admin_Representative_Check_Log
       (admin_id, admin_username, admin_name, search_query, reason_id, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      [
        admin.id,
        admin.username || "",
        admin.name || admin.username || "",
        q,
        reasonIdNum,
        ipAddress,
        userAgent,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving representative check log:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการบันทึก log" },
      { status: 500 },
    );
  }
}
