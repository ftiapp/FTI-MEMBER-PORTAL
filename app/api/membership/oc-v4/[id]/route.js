import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

export async function GET(request, { params }) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: "ไม่พบรหัสใบสมัคร" }, { status: 400 });
    }

    connection = await getConnection();

    const [rows] = await connection.execute(
      `SELECT * FROM MemberRegist_OC_Main WHERE id = ? AND user_id = ?`,
      [id, user.id],
    );

    if (!rows.length) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลใบสมัครหรือคุณไม่มีสิทธิ์เข้าถึง" },
        { status: 404 },
      );
    }

    const main = rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: main.id,
        status: main.status,
        companyName: main.company_name_th || "",
        companyNameEng: main.company_name_en || "",
        taxId: main.tax_id || "",
        companyEmail: main.company_email || "",
        companyPhone: main.company_phone || "",
      },
    });
  } catch (error) {
    console.error("[OC-V4] Error loading application:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถโหลดข้อมูลใบสมัครได้" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}

export async function POST(request, { params }) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: "ไม่พบรหัสใบสมัคร" }, { status: 400 });
    }

    const body = await request.json();
    const { formData } = body || {};

    if (!formData) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    connection = await getConnection();
    await connection.beginTransaction();

    await connection.execute(
      `UPDATE MemberRegist_OC_Main
         SET company_name_th = ?,
             company_name_en = ?,
             tax_id = ?,
             company_email = ?,
             company_phone = ?,
             updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [
        formData.companyName || "",
        formData.companyNameEng || "",
        formData.taxId || "",
        formData.companyEmail || "",
        formData.companyPhone || "",
        id,
        user.id,
      ],
    );

    await connection.commit();

    return NextResponse.json({ success: true, message: "บันทึกข้อมูลเรียบร้อยแล้ว" });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }
    console.error("[OC-V4] Error saving application:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถบันทึกข้อมูลใบสมัครได้" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
