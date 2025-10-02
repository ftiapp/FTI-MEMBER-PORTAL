import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ข้อมูลประเภทธุรกิจแบบ hardcoded
    const businessCategories = [
      { id: "manufacturer", name: "ผู้ผลิต" },
      { id: "distributor", name: "ผู้จัดจำหน่าย" },
      { id: "importer", name: "ผู้นำเข้า" },
      { id: "exporter", name: "ผู้ส่งออก" },
      { id: "service", name: "ผู้ให้บริการ" },
      { id: "other", name: "อื่นๆ" },
    ];

    return NextResponse.json({
      success: true,
      data: businessCategories,
    });
  } catch (error) {
    console.error("Error fetching business categories:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทธุรกิจ" },
      { status: 500 },
    );
  }
}
