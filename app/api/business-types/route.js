import { NextResponse } from "next/server";

export async function GET() {
  try {
    const businessTypes = [
      { id: "manufacturer", nameTh: "ผู้ผลิต" },
      { id: "distributor", nameTh: "ผู้จัดจำหน่าย" },
      { id: "importer", nameTh: "ผู้นำเข้า" },
      { id: "exporter", nameTh: "ผู้ส่งออก" },
      { id: "service", nameTh: "ผู้ให้บริการ" },
      { id: "other", nameTh: "อื่นๆ" },
    ];

    return NextResponse.json(businessTypes);
  } catch (error) {
    console.error("Error fetching business types:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทธุรกิจ" }, { status: 500 });
  }
}
