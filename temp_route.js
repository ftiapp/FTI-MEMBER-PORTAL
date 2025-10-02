import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

/**
 * GET /api/admin/address-update/list
 *
 * ดึงข้อมูลคำขอแก้ไขที่อยู่ทั้งหมดที่รอการอนุมัติ
 * ต้องมีสิทธิ์ admin
 */
export async function GET() {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      console.log("Admin authentication failed: No admin session found");
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    console.log("Admin authenticated:", admin.username);

    // ตรวจสอบว่ามีตาราง pending_address_updates หรือไม่
    try {
      // ตรวจสอบว่ามีตารางหรือไม่
      const tableCheck = await query(
        "SELECT COUNT(*) as table_exists FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'pending_address_updates'",
      );

      if (!tableCheck || !tableCheck[0] || tableCheck[0].table_exists === 0) {
        console.log("Table pending_address_updates does not exist");
        // สร้างข้อมูลจำลองสำหรับการทดสอบ
        return NextResponse.json({
          success: true,
          updates: [],
        });
      }

      // ดึงข้อมูลคำขอแก้ไขที่อยู่ทั้งหมดที่รอการอนุมัติ
      const updates = await query(
        `SELECT 
          pau.id, 
          pau.member_code, 
          pau.type_code as address_type, 
          pau.old_address, 
          pau.new_address, 
          pau.request_date as created_at, 
          pau.status,
          c.company_name
        FROM 
          pending_address_updates pau
        LEFT JOIN 
          companies_Member c ON pau.member_code = c.MEMBER_CODE
        WHERE 
          pau.status = 'pending'
        ORDER BY 
          pau.request_date DESC`,
      );

      console.log(`Found ${updates.length} pending address updates`);
      return NextResponse.json({ success: true, updates });
    } catch (dbError) {
      console.error("Database error:", dbError);
      console.error("SQL Error details:", JSON.stringify(dbError, null, 2));
      // ส่งข้อมูลจำลองสำหรับการทดสอบ
      return NextResponse.json({
        success: true,
        updates: [],
        debug: { error: dbError.message, code: dbError.code },
      });
    }
  } catch (error) {
    console.error("Error fetching address updates:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 },
    );
  }
}
