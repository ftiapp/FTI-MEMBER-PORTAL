import { NextResponse } from "next/server";
import { beginTransaction, commitTransaction, executeQuery, rollbackTransaction, query } from "../../../lib/db";
import { getAdminFromSession } from "../../../lib/adminAuth";

export async function GET(request) {
  try {
    const admin = await getAdminFromSession();

    if (!admin || admin.adminLevel < 5) {
      return NextResponse.json(
        { success: false, message: "ไม่ได้รับอนุญาต เฉพาะ SuperAdmin เท่านั้น" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const adminId = Number(searchParams.get("adminId"));

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const menus = await query(
      `SELECT id, code, title, path, parent_id, sort_order
       FROM FTI_Portal_Admin_Menus
       WHERE is_active = 1
       ORDER BY COALESCE(parent_id, 0), sort_order, id`,
    );

    const allowedRows = await query(
      `SELECT menu_id
       FROM FTI_Portal_Admin_User_Menus
       WHERE user_id = ? AND can_view = 1`,
      [adminId],
    );

    const allowedSet = new Set(allowedRows.map((r) => Number(r.menu_id)));

    return NextResponse.json({
      success: true,
      data: menus.map((m) => ({
        ...m,
        can_view: allowedSet.has(Number(m.id)),
      })),
    });
  } catch (error) {
    console.error("Error fetching admin menu permissions:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  let connection;

  try {
    const admin = await getAdminFromSession();

    if (!admin || admin.adminLevel < 5) {
      return NextResponse.json(
        { success: false, message: "ไม่ได้รับอนุญาต เฉพาะ SuperAdmin เท่านั้น" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const adminId = Number(body?.adminId);
    const menuIds = Array.isArray(body?.menuIds) ? body.menuIds.map((x) => Number(x)).filter(Boolean) : [];

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    connection = await beginTransaction();

    await executeQuery(connection, `DELETE FROM FTI_Portal_Admin_User_Menus WHERE user_id = ?`, [adminId]);

    if (menuIds.length > 0) {
      const valuesPlaceholders = menuIds.map(() => "(?, ?, 1)").join(", ");
      const values = [];
      for (const menuId of menuIds) {
        values.push(adminId, menuId);
      }

      await executeQuery(
        connection,
        `INSERT INTO FTI_Portal_Admin_User_Menus (user_id, menu_id, can_view) VALUES ${valuesPlaceholders}`,
        values,
      );
    }

    await commitTransaction(connection);
    connection = null;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating admin menu permissions:", error);

    if (connection) {
      await rollbackTransaction(connection);
      connection = null;
    }

    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการอัปเดตสิทธิ์เมนู" },
      { status: 500 },
    );
  }
}
