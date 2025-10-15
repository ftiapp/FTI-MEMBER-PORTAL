import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/app/lib/adminAuth";
import { query as dbQuery } from "@/app/lib/db";

export async function GET(request) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // รับพารามิเตอร์จาก URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // คำนวณ offset สำหรับการแบ่งหน้า
    const offset = (page - 1) * limit;

    // เปลี่ยนวิธีการดึงข้อมูลเพื่อแก้ปัญหา prepared statements
    let whereConditions = [];
    let queryParams = [];

    // สร้างเงื่อนไขการค้นหา
    if (search) {
      whereConditions.push(
        "(pau.member_code LIKE CONCAT('%', ?, '%') OR cm.COMPANY_NAME LIKE CONCAT('%', ?, '%'))",
      );
      queryParams.push(search, search);
    }

    // สร้างเงื่อนไขการกรองตามสถานะ
    if (status && status !== "all") {
      whereConditions.push("pau.status = ?");
      queryParams.push(status);
    }

    // สร้าง WHERE clause
    const whereSQL = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // นับจำนวนรายการทั้งหมด
    let countSQL = `
      SELECT COUNT(*) as total 
      FROM FTI_Original_Membership_Pending_Address_Updates pau 
      LEFT JOIN FTI_Original_Membership cm ON pau.member_code = cm.MEMBER_CODE 
      LEFT JOIN FTI_Portal_User u ON pau.user_id = u.id 
      ${whereSQL}
    `;

    // ดึงจำนวนรายการทั้งหมด
    const countResults = await dbQuery(countSQL, queryParams);
    const total = countResults[0]?.total || 0;

    // สร้าง SQL สำหรับดึงข้อมูล
    const dataSQL = `
      SELECT 
        pau.id,
        pau.user_id,
        pau.member_code,
        pau.comp_person_code,
        pau.member_type,
        pau.member_group_code,
        pau.type_code,
        pau.addr_code,
        pau.addr_lang,
        pau.old_address,
        pau.new_address,
        pau.request_date,
        pau.processed_date,
        pau.status,
        pau.admin_comment,
        pau.admin_notes,
        pau.document_url,
        cm.COMPANY_NAME as company_name,
        u.name,
        u.firstname,
        u.lastname,
        u.email,
        u.phone
      FROM FTI_Original_Membership_Pending_Address_Updates pau
      LEFT JOIN FTI_Original_Membership cm ON pau.member_code = cm.MEMBER_CODE
      LEFT JOIN FTI_Portal_User u ON pau.user_id = u.id
      ${whereSQL}
      ORDER BY pau.request_date DESC
      LIMIT ?
      OFFSET ?
    `;

    // เพิ่มพารามิเตอร์สำหรับ LIMIT และ OFFSET
    const allParams = [...queryParams, limit, offset];

    // ดึงข้อมูล
    const updates = await dbQuery(dataSQL, allParams);

    // คำนวณจำนวนหน้าทั้งหมด
    const totalPages = Math.ceil(total / limit);

    // ส่งข้อมูลกลับไปพร้อมกับข้อมูลการแบ่งหน้า
    return NextResponse.json({
      success: true,
      updates,
      pagination: {
        total,
        limit,
        page,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching address updates:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch address updates", error: error.message },
      { status: 500 },
    );
  }
}

// ฟังก์ชันตรวจสอบว่ามีตารางในฐานข้อมูลหรือไม่
async function checkTableExists(tableName) {
  try {
    const rows = await dbQuery(
      `
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = ?
    `,
      [tableName],
    );

    return rows[0]?.count > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}
