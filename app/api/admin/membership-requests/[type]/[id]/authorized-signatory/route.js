import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";

export async function POST(request, { params }) {
  let connection;
  
  try {
    // Verify admin session
    const adminData = await checkAdminSession();
    if (!adminData) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await params;
    
    // Validate type parameter
    const validTypes = ["oc", "am", "ac", "ic"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid membership type" },
        { status: 400 }
      );
    }

    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const {
      prename_th,
      prename_other,
      first_name_th,
      last_name_th,
      position_th,
    } = body;

    // Validate required Thai fields
    if (!prename_th || prename_th.trim() === "") {
      return NextResponse.json(
        { success: false, message: "กรุณาเลือกคำนำหน้าชื่อ (ภาษาไทย)" },
        { status: 400 }
      );
    }

    if (prename_th === "อื่นๆ" && (!prename_other || prename_other.trim() === "")) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุคำนำหน้าชื่อ (อื่นๆ)" },
        { status: 400 }
      );
    }

    if (!first_name_th || first_name_th.trim() === "") {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุชื่อ (ภาษาไทย)" },
        { status: 400 }
      );
    }

    if (!last_name_th || last_name_th.trim() === "") {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุนามสกุล (ภาษาไทย)" },
        { status: 400 }
      );
    }

    if (!position_th || position_th.trim() === "") {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุตำแหน่ง (ภาษาไทย)" },
        { status: 400 }
      );
    }

    // Get database connection
    connection = await getConnection();

    // Determine table and column names based on membership type
    let signatureTable, mainIdColumn;
    switch (type) {
      case "oc":
        signatureTable = "MemberRegist_OC_Signature_Name";
        mainIdColumn = "main_id";
        break;
      case "am":
        signatureTable = "MemberRegist_AM_Signature_Name";
        mainIdColumn = "main_id";
        break;
      case "ac":
        signatureTable = "MemberRegist_AC_Signature_Name";
        mainIdColumn = "main_id";
        break;
      case "ic":
        signatureTable = "MemberRegist_IC_Signature_Name";
        mainIdColumn = "ic_main_id";
        break;
      default:
        throw new Error("Unsupported membership type");
    }

    // Check if signature record already exists
    const [existingRecords] = await connection.execute(
      `SELECT id FROM ${signatureTable} WHERE ${mainIdColumn} = ?`,
      [id]
    );

    let result;
    if (existingRecords.length > 0) {
      // Update existing record
      result = await connection.execute(
        `UPDATE ${signatureTable} 
         SET prename_th = ?, prename_other = ?, first_name_th = ?, last_name_th = ?, position_th = ?,
             prename_en = '', prename_other_en = '', first_name_en = '', last_name_en = '', position_en = '',
             updated_at = NOW()
         WHERE ${mainIdColumn} = ?`,
        [
          prename_th,
          prename_other || "",
          first_name_th,
          last_name_th,
          position_th,
          id,
        ]
      );
    } else {
      // Insert new record
      result = await connection.execute(
        `INSERT INTO ${signatureTable} (
          ${mainIdColumn}, prename_th, prename_other, first_name_th, last_name_th, position_th,
          prename_en, prename_other_en, first_name_en, last_name_en, position_en,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, '', '', '', '', '', NOW(), NOW())`,
        [
          id,
          prename_th,
          prename_other || "",
          first_name_th,
          last_name_th,
          position_th,
        ]
      );
    }

    // Log admin action
    await connection.execute(
      `INSERT INTO FTI_Portal_Admin_Actions_Logs (admin_id, action_type, target_id, description, ip_address, user_agent, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        adminData.id,
        "update_authorized_signatory",
        id,
        `อัปเดตข้อมูลผู้มีอำนาจลงนามสำหรับคำข้สมัครประเภท ${type.toUpperCase()} ID: ${id}`,
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        request.headers.get("user-agent") || "unknown",
      ]
    );

    return NextResponse.json({
      success: true,
      message: existingRecords.length > 0 ? "อัปเดตข้อมูลผู้มีอำนาจลงนามสำเร็จ" : "เพิ่มข้อมูลผู้มีอำนาจลงนามสำเร็จ",
      action: existingRecords.length > 0 ? "updated" : "created",
    });

  } catch (error) {
    console.error("Error saving authorized signatory:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save authorized signatory data" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

export async function GET(request, { params }) {
  let connection;
  
  try {
    // Verify admin session
    const adminData = await checkAdminSession();
    if (!adminData) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await params;
    
    // Validate type parameter
    const validTypes = ["oc", "am", "ac", "ic"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid membership type" },
        { status: 400 }
      );
    }

    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    // Get database connection
    connection = await getConnection();

    // Determine table and column names based on membership type
    let signatureTable, mainIdColumn;
    switch (type) {
      case "oc":
        signatureTable = "MemberRegist_OC_Signature_Name";
        mainIdColumn = "main_id";
        break;
      case "am":
        signatureTable = "MemberRegist_AM_Signature_Name";
        mainIdColumn = "main_id";
        break;
      case "ac":
        signatureTable = "MemberRegist_AC_Signature_Name";
        mainIdColumn = "main_id";
        break;
      case "ic":
        signatureTable = "MemberRegist_IC_Signature_Name";
        mainIdColumn = "ic_main_id";
        break;
      default:
        throw new Error("Unsupported membership type");
    }

    // Fetch signature data
    const [signatureRecords] = await connection.execute(
      `SELECT * FROM ${signatureTable} WHERE ${mainIdColumn} = ?`,
      [id]
    );

    const signatureData = signatureRecords.length > 0 ? signatureRecords[0] : null;

    return NextResponse.json({
      success: true,
      data: signatureData,
    });

  } catch (error) {
    console.error("Error fetching authorized signatory:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch authorized signatory data" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}
