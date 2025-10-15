 import { query } from "../../../../lib/db";
 import { getAdminFromSession } from "../../../../lib/adminAuth";

/**
 * API สำหรับเปลี่ยนประเภทสมาชิก (OC ↔ AC)
 * POST /api/admin/membership-requests/switch-type
 */
export async function POST(request) {
  try {
    // ตรวจสอบสิทธิ์แอดมิน
    const admin = await getAdminFromSession();
    if (!admin) {
      return Response.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationId, fromType, toType } = body;

    // Validate input
    if (!applicationId || !fromType || !toType) {
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // รองรับเฉพาะ OC ↔ AC
    const validTypes = ["OC", "AC"];
    if (!validTypes.includes(fromType) || !validTypes.includes(toType)) {
      return Response.json(
        { success: false, message: "Invalid membership type. Only OC and AC are supported." },
        { status: 400 }
      );
    }

    if (fromType === toType) {
      return Response.json(
        { success: false, message: "Source and target types must be different" },
        { status: 400 }
      );
    }

    console.log(`[Switch Type] Starting migration: ${fromType} → ${toType} for application ID: ${applicationId}`);

    // เริ่ม transaction
    await query("START TRANSACTION");

    try {
      // 1. ดึงข้อมูลจากตารางเดิม
      const mainData = await fetchMainData(applicationId, fromType);
      if (!mainData) {
        throw new Error(`Application not found in ${fromType} table`);
      }

      // 2. ตรวจสอบว่า tax_id ซ้ำในตารางปลายทางหรือไม่
      const existingInTarget = await query(
        `SELECT id FROM MemberRegist_${toType}_Main WHERE tax_id = ? AND id != ?`,
        [mainData.tax_id, applicationId]
      );

      if (existingInTarget.length > 0) {
        throw new Error(`Tax ID ${mainData.tax_id} already exists in ${toType} table`);
      }

      // 3. คัดลอกข้อมูลไปตารางใหม่
      const newMainId = await copyMainData(mainData, toType, admin.id);
      await copyRelatedData(applicationId, newMainId, fromType, toType);

      // 4. ลบข้อมูลเก่า (CASCADE จะลบตารางย่อยอัตโนมัติ)
      await query(`DELETE FROM MemberRegist_${fromType}_Main WHERE id = ?`, [applicationId]);

      // 5. บันทึก log
      await query(
        `INSERT INTO FTI_Portal_Admin_Actions_Logs (admin_id, action_type, target_id, description, created_at)
         VALUES (?, 'Admin_Update_MemberRegist', ?, ?, NOW())`,
        [
          admin.id,
          newMainId,
          JSON.stringify({
            event: 'switch_membership_type',
            fromType,
            toType,
            oldId: applicationId,
            newId: newMainId,
            taxId: mainData.tax_id,
            companyName: mainData.company_name_th,
          }),
        ]
      );

      await query("COMMIT");

      console.log(`[Switch Type] Success: ${fromType} → ${toType}, Old ID: ${applicationId}, New ID: ${newMainId}`);

      return Response.json({
        success: true,
        message: `เปลี่ยนประเภทสมาชิกจาก ${fromType} เป็น ${toType} สำเร็จ`,
        data: {
          newId: newMainId,
          newType: toType,
        },
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[Switch Type] Error:", error);
    return Response.json(
      {
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนประเภทสมาชิก",
      },
      { status: 500 }
    );
  }
}

/**
 * ดึงข้อมูลหลักจากตารางต้นทาง
 */
async function fetchMainData(id, type) {
  const results = await query(`SELECT * FROM MemberRegist_${type}_Main WHERE id = ?`, [id]);
  return results[0] || null;
}

/**
 * คัดลอกข้อมูลหลักไปตารางปลายทาง
 */
async function copyMainData(mainData, toType, adminId) {
  // Base fields common across OC/AC
  const baseFields = new Set([
    "user_id",
    "company_name_th",
    "company_name_en",
    "tax_id",
    "company_email",
    "company_phone",
    "factory_type",
    "number_of_employees",
    "status",
    "created_at",
    "updated_at",
    "approved_at",
    "approved_by",
    "rejected_at",
    "rejected_by",
    "rejection_reason",
  ]);

  // Inspect target table columns
  const columns = await query(`SHOW COLUMNS FROM MemberRegist_${toType}_Main`);

  // Determine required additional fields (NOT NULL and no default), excluding id and those already in baseFields
  const requiredExtra = columns
    .filter((col) =>
      col.Field !== "id" &&
      !baseFields.has(col.Field) &&
      col.Null === "NO" &&
      (col.Default === null || typeof col.Default === "undefined")
    )
    .map((col) => ({ name: col.Field, type: String(col.Type || "").toLowerCase() }));

  // Build final field list
  const fields = [...baseFields];
  for (const col of requiredExtra) fields.push(col.name);

  // Helper: safe default per type
  const safeDefault = (type) => {
    if (type.includes("int") || type.includes("decimal") || type.includes("float") || type.includes("double")) return 0;
    if (type.includes("timestamp") || type.includes("datetime")) return new Date();
    // varchar/text or others
    return "";
  };

  // Build values aligned to fields
  const values = fields.map((field) => {
    if (mainData[field] !== undefined) return mainData[field];
    const meta = requiredExtra.find((c) => c.name === field);
    return meta ? safeDefault(meta.type) : null;
  });

  const placeholders = fields.map(() => "?").join(", ");
  const fieldNames = fields.join(", ");

  const result = await query(
    `INSERT INTO MemberRegist_${toType}_Main (${fieldNames}) VALUES (${placeholders})`,
    values
  );

  return result.insertId;
}

/**
 * คัดลอกข้อมูลตารางย่อยทั้งหมด
 */
async function copyRelatedData(oldMainId, newMainId, fromType, toType) {
  // ตารางที่ต้องคัดลอก
  const tables = [
    { name: "Address", fields: ["address_number", "moo", "soi", "street", "sub_district", "district", "province", "postal_code", "phone", "email", "website", "building", "address_type"] },
    { name: "ContactPerson", fields: ["first_name_th", "last_name_th", "first_name_en", "last_name_en", "position", "email", "phone", "phone_extension", "type_contact_id", "type_contact_name", "type_contact_other_detail", "prename_th", "prename_en", "prename_other_th", "prename_other_en"] },
    { name: "Representatives", fields: ["first_name_th", "last_name_th", "first_name_en", "last_name_en", "position", "email", "phone", "is_primary", "phone_extension", "prename_th", "prename_en", "prename_other_th", "prename_other_en"] },
    { name: "BusinessTypes", fields: ["business_type"] },
    { name: "BusinessTypeOther", fields: ["detail"] },
    { name: "Products", fields: ["name_th", "name_en", "description"] },
    { name: "IndustryGroups", fields: ["industry_group_id", "industry_group_name"] },
    { name: "ProvinceChapters", fields: ["province_chapter_id", "province_chapter_name"] },
    { name: "Documents", fields: ["document_type", "file_name", "file_path", "file_size", "mime_type", "cloudinary_id", "cloudinary_url"] },
    // Signature name needs to be migrated as well (OC <-> AC)
    { name: "Signature_Name", fields: [
      "prename_th",
      "prename_en",
      "prename_other",
      "prename_other_en",
      "first_name_th",
      "last_name_th",
      "first_name_en",
      "last_name_en",
      "position_th",
      "position_en",
    ] },
  ];

  for (const table of tables) {
    try {
      // ดึงข้อมูลจากตารางเดิม
      const oldData = await query(
        `SELECT * FROM MemberRegist_${fromType}_${table.name} WHERE main_id = ?`,
        [oldMainId]
      );

      if (oldData.length === 0) continue;

      // Insert ข้อมูลไปตารางใหม่
      for (const row of oldData) {
        const availableFields = table.fields.filter((field) => row[field] !== undefined);
        const values = availableFields.map((field) => row[field] ?? null);

        if (availableFields.length === 0) continue;

        const fieldNames = ["main_id", ...availableFields].join(", ");
        const placeholders = ["?", ...availableFields.map(() => "?")].join(", ");

        await query(
          `INSERT INTO MemberRegist_${toType}_${table.name} (${fieldNames}) VALUES (${placeholders})`,
          [newMainId, ...values]
        );
      }

      console.log(`[Switch Type] Copied ${oldData.length} rows from ${table.name}`);
    } catch (error) {
      console.error(`[Switch Type] Error copying ${table.name}:`, error.message);
      // ถ้าตารางไม่มีฟิลด์บางอัน ให้ข้ามไป
      if (!error.message.includes("Unknown column")) {
        throw error;
      }
    }
  }
}
