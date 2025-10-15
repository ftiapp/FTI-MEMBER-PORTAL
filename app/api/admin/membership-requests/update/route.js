import { NextResponse } from "next/server";
import { executeQueryWithoutTransaction } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

export async function POST(request) {
  try {
    // ตรวจสอบสิทธิ์แอดมิน
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

// ฟังก์ชันสำหรับอัปเดตข้อมูลทางการเงิน (OC/AC/AM)
async function updateFinancialInfo(applicationId, type, data) {
  const upper = type.toUpperCase();
  const tableName = `MemberRegist_${upper}_Main`;

  // ตรวจสอบคอลัมน์ที่มีอยู่จริงในตาราง เพื่อหลีกเลี่ยง error ระหว่าง type ต่างๆ
  const columns = await executeQueryWithoutTransaction(`SHOW COLUMNS FROM ${tableName}`);
  const columnNames = columns.map((c) => c.Field);

  const updateFields = [];
  const updateValues = [];

  const toNumberOrNull = (v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const addField = (key, column, value, numeric = false) => {
    if (value !== undefined && columnNames.includes(column)) {
      updateFields.push(`${column} = ?`);
      updateValues.push(numeric ? toNumberOrNull(value) : value);
    }
  };

  // Map fields from FinancialInfoSection
  addField("registeredCapital", "registered_capital", data.registeredCapital, true);
  addField(
    "productionCapacityValue",
    "production_capacity_value",
    data.productionCapacityValue,
    true
  );
  addField("productionCapacityUnit", "production_capacity_unit", data.productionCapacityUnit);
  addField("salesDomestic", "sales_domestic", data.salesDomestic, true);
  addField("salesExport", "sales_export", data.salesExport, true);
  addField(
    "shareholderThaiPercent",
    "shareholder_thai_percent",
    data.shareholderThaiPercent,
    true
  );
  addField(
    "shareholderForeignPercent",
    "shareholder_foreign_percent",
    data.shareholderForeignPercent,
    true
  );
  addField("revenueLastYear", "revenue_last_year", data.revenueLastYear, true);
  addField("revenuePreviousYear", "revenue_previous_year", data.revenuePreviousYear, true);

  if (updateFields.length === 0) return { updated: 0 };

  updateValues.push(applicationId);
  await executeQueryWithoutTransaction(
    `UPDATE ${tableName} SET ${updateFields.join(", ")} WHERE id = ?`,
    updateValues,
  );

  return { updated: updateFields.length };
}

// ฟังก์ชันสำหรับอัปเดตประเภทธุรกิจ
async function updateBusinessTypes(applicationId, type, data) {
  const upper = type.toUpperCase();
  const base = `MemberRegist_${upper}`;

  const allowedTypes = new Set([
    "manufacturer",
    "distributor",
    "importer",
    "exporter",
    "service",
    "other",
  ]);

  // Normalize input
  const selected = Array.isArray(data?.businessTypes) ? data.businessTypes : [];
  const filtered = selected.filter((t) => allowedTypes.has(String(t)));
  const otherDetail = data?.businessTypeOther || data?.otherDetail || null;

  // Resolve table names and column differences
  const businessTypesTable = `${base}_BusinessTypes`;
  const otherTable = `${base}_BusinessTypeOther`;
  const otherColumn = type === "ic" ? "other_type" : "detail";

  // Delete old rows
  await executeQueryWithoutTransaction(`DELETE FROM ${businessTypesTable} WHERE main_id = ?`, [
    applicationId,
  ]);
  await executeQueryWithoutTransaction(`DELETE FROM ${otherTable} WHERE main_id = ?`, [
    applicationId,
  ]).catch(() => {});

  // Insert new business types
  for (const bt of filtered) {
    await executeQueryWithoutTransaction(
      `INSERT INTO ${businessTypesTable} (main_id, business_type) VALUES (?, ?)`,
      [applicationId, bt],
    );
  }

  // Insert other detail if provided and 'other' selected
  if (filtered.includes("other") && otherDetail) {
    await executeQueryWithoutTransaction(
      `INSERT INTO ${otherTable} (main_id, ${otherColumn}) VALUES (?, ?)`,
      [applicationId, otherDetail],
    ).catch(() => {});
  }

  return { updated: filtered.length, other: !!otherDetail };
}

    const { applicationId, type, section, data } = await request.json();

    if (!applicationId || !type || !section || !data) {
      return NextResponse.json(
        {
          error: "ข้อมูลไม่ครบถ้วน",
        },
        { status: 400 },
      );
    }

    try {
      let updateResult;

      switch (section) {
        case "products":
          updateResult = await updateProducts(applicationId, type, data);
          break;
        case "addresses":
          updateResult = await updateAddresses(applicationId, type, data);
          break;
        case "businessTypes":
          updateResult = await updateBusinessTypes(applicationId, type, data);
          break;
        case "industrialGroups":
          updateResult = await updateIndustrialGroups(applicationId, type, data);
          break;
        case "representatives":
          updateResult = await updateRepresentatives(applicationId, type, data);
          break;
        case "contactPersons":
          updateResult = await updateContactPersons(applicationId, type, data);
          break;
        case "companyInfo":
          updateResult = await updateCompanyInfo(applicationId, type, data);
          break;
        case "applicantInfo":
          updateResult = await updateApplicantInfo(applicationId, type, data);
          break;
        case "financialInfo":
          updateResult = await updateFinancialInfo(applicationId, type, data);
          break;
        default:
          throw new Error(`ไม่รองรับการแก้ไขส่วน: ${section}`);
      }

      // บันทึก log การแก้ไข
      await executeQueryWithoutTransaction(
        `INSERT INTO FTI_Portal_Admin_Actions_Logs (admin_id, action_type, target_id, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          admin.id,
          "Admin_Update_MemberRegist", // ใช้ ENUM ใหม่ที่เพิ่มเข้าไปในตาราง
          applicationId,
          JSON.stringify({ type, section, changes: data }),
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "::1",
          request.headers.get("user-agent") || "",
        ],
      );

      return NextResponse.json({
        success: true,
        message: "อัปเดตข้อมูลสำเร็จ",
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating membership data:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// ฟังก์ชันสำหรับอัปเดตสินค้า
async function updateProducts(applicationId, type, data) {
  const tableName = `MemberRegist_${type.toUpperCase()}_Products`;
  await executeQueryWithoutTransaction(`DELETE FROM ${tableName} WHERE main_id = ?`, [
    applicationId,
  ]);

  // เพิ่มข้อมูลใหม่
  if (data.products && data.products.length > 0) {
    for (const product of data.products) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${tableName} (main_id, name_th, name_en) VALUES (?, ?, ?)`,
        [
          applicationId,
          product.productNameTh || product.nameTh || product.name_th || "",
          product.productNameEn || product.nameEn || product.name_en || "",
        ],
      );
    }
  }

  return { updated: data.products?.length || 0 };
}

// ฟังก์ชันสำหรับอัปเดตที่อยู่
async function updateAddresses(applicationId, type, addressData) {
  const tableName = `MemberRegist_${type.toUpperCase()}_Address`;

  // รองรับทั้ง object เดี่ยวและ array
  const addresses = Array.isArray(addressData) ? addressData : [addressData];

  // ลบข้อมูลเก่า
  await executeQueryWithoutTransaction(`DELETE FROM ${tableName} WHERE main_id = ?`, [
    applicationId,
  ]);

  // เพิ่มข้อมูลใหม่
  if (addresses && addresses.length > 0) {
    for (const [index, address] of addresses.entries()) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${tableName} (
          main_id, building, address_number, moo, soi, street, 
          sub_district, district, province, postal_code, 
          phone, email, website, address_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          address.building || "",
          address.addressNumber || address.address_number || "",
          address.moo || "",
          address.soi || "",
          address.street || "",
          address.subDistrict || address.subdistrict || address.sub_district || "",
          address.district || "",
          address.province || "",
          address.postalCode || address.postal_code || "",
          address.phone || "",
          address.email || "",
          address.website || "",
          address.addressType || (index + 1).toString(),
        ],
      );
    }
  }

  return { updated: addresses.length };
}

// ฟังก์ชันสำหรับอัปเดตกลุ่มอุตสาหกรรม
async function updateIndustrialGroups(applicationId, type, data) {
  const industrialTable = `MemberRegist_${type.toUpperCase()}_IndustryGroups`;
  const provincialTable = `MemberRegist_${type.toUpperCase()}_ProvinceChapters`;

  // ลบข้อมูลเก่า
  await executeQueryWithoutTransaction(`DELETE FROM ${industrialTable} WHERE main_id = ?`, [
    applicationId,
  ]);
  await executeQueryWithoutTransaction(`DELETE FROM ${provincialTable} WHERE main_id = ?`, [
    applicationId,
  ]);

  // เพิ่มข้อมูลกลุ่มอุตสาหกรรมใหม่
  if (data.industrialGroups && data.industrialGroups.length > 0) {
    for (const group of data.industrialGroups) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${industrialTable} (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?)`,
        [
          applicationId,
          group.id || group.industry_group_id,
          group.name || group.industry_group_name || "",
        ],
      );
    }
  }

  // เพิ่มข้อมูลสภาจังหวัดใหม่
  if (data.provincialChapters && data.provincialChapters.length > 0) {
    for (const chapter of data.provincialChapters) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${provincialTable} (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?)`,
        [
          applicationId,
          chapter.id || chapter.province_chapter_id,
          chapter.name || chapter.province_chapter_name || "",
        ],
      );
    }
  }

  return {
    industrialGroups: data.industrialGroups?.length || 0,
    provincialChapters: data.provincialChapters?.length || 0,
  };
}

// ฟังก์ชันสำหรับอัปเดตผู้แทน
async function updateRepresentatives(applicationId, type, data) {
  const tableName = `MemberRegist_${type.toUpperCase()}_Representatives`;

  // ลบข้อมูลเก่า
  await executeQueryWithoutTransaction(`DELETE FROM ${tableName} WHERE main_id = ?`, [
    applicationId,
  ]);

  // เพิ่มข้อมูลใหม่
  if (data && data.length > 0) {
    for (const rep of data) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${tableName} (
          main_id, first_name_th, last_name_th, first_name_en, last_name_en,
          position, email, phone, phone_extension
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          rep.firstNameTh || "",
          rep.lastNameTh || "",
          rep.firstNameEn || "",
          rep.lastNameEn || "",
          rep.position || "",
          rep.email || "",
          rep.phone || "",
          rep.phoneExtension || "",
        ],
      );
    }
  }

  return { updated: data?.length || 0 };
}

// ฟังก์ชันสำหรับอัปเดตข้อมูลบริษัท
async function updateCompanyInfo(applicationId, type, data) {
  const tableName = `MemberRegist_${type.toUpperCase()}_Main`;

  // Get existing columns from table
  const columns = await executeQueryWithoutTransaction(`SHOW COLUMNS FROM ${tableName}`);
  const columnNames = columns.map((col) => col.Field);

  const updateFields = [];
  const updateValues = [];

  // Helper to add field if column exists
  const addField = (dataKey, columnName, value) => {
    if (value !== undefined && columnNames.includes(columnName)) {
      updateFields.push(`${columnName} = ?`);
      updateValues.push(value);
    }
  };

  // สร้าง dynamic update query
  addField("companyName", "company_name", data.companyName);
  addField("companyNameTh", "company_name_th", data.companyNameTh);
  addField("companyNameEn", "company_name_en", data.companyNameEn);
  addField("registrationNumber", "registration_number", data.registrationNumber);
  addField("taxId", "tax_id", data.taxId);
  addField("email", "company_email", data.email);
  addField("phone", "company_phone", data.phone);
  addField("phoneExtension", "company_phone_extension", data.phoneExtension);
  addField("website", "company_website", data.website);
  addField("factoryType", "factory_type", data.factoryType);
  addField("numberOfEmployees", "number_of_employees", data.numberOfEmployees);
  addField("numberOfMembers", "number_of_members", data.numberOfMembers);
  addField("registeredCapital", "registered_capital", data.registeredCapital);
  addField("productionCapacityValue", "production_capacity_value", data.productionCapacityValue);
  addField("productionCapacityUnit", "production_capacity_unit", data.productionCapacityUnit);
  addField("salesDomestic", "sales_domestic", data.salesDomestic);
  addField("salesExport", "sales_export", data.salesExport);
  addField("shareholderThaiPercent", "shareholder_thai_percent", data.shareholderThaiPercent);
  addField("shareholderForeignPercent", "shareholder_foreign_percent", data.shareholderForeignPercent);
  addField("revenueLastYear", "revenue_last_year", data.revenueLastYear);
  addField("revenuePreviousYear", "revenue_previous_year", data.revenuePreviousYear);

  if (updateFields.length > 0) {
    updateValues.push(applicationId);
    await executeQueryWithoutTransaction(
      `UPDATE ${tableName} SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    );
  }

  return { updated: updateFields.length };
}

// ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ติดต่อ
async function updateContactPersons(applicationId, type, data) {
  const tableName = `MemberRegist_${type.toUpperCase()}_ContactPerson`;

  // ลบข้อมูลเก่า
  await executeQueryWithoutTransaction(`DELETE FROM ${tableName} WHERE main_id = ?`, [
    applicationId,
  ]);

  // เพิ่มข้อมูลใหม่
  if (data && data.length > 0) {
    for (const contact of data) {
      await executeQueryWithoutTransaction(
        `INSERT INTO ${tableName} (
          main_id,
          prename_th, prename_en, prename_other, prename_other_en,
          first_name_th, last_name_th, first_name_en, last_name_en,
          position, email, phone, phone_extension,
          type_contact_id, type_contact_name, type_contact_other_detail
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          contact.prenameTh || "",
          contact.prenameEn || "",
          contact.prenameOther || "",
          contact.prenameOtherEn || "",
          contact.firstNameTh || "",
          contact.lastNameTh || "",
          contact.firstNameEn || "",
          contact.lastNameEn || "",
          contact.position || "",
          contact.email || "",
          contact.phone || "",
          contact.phoneExtension || "",
          contact.typeContactId || null,
          contact.typeContactName || "",
          contact.typeContactOtherDetail || "",
        ],
      );
    }
  }

  return { updated: data?.length || 0 };
}

// ฟังก์ชันสำหรับอัปเดตข้อมูลผู้สมัคร (สำหรับ IC)
async function updateApplicantInfo(applicationId, type, data) {
  const tableName = `MemberRegist_${type.toUpperCase()}_Main`;

  const updateFields = [];
  const updateValues = [];

  // สร้าง dynamic update query
  if (data.firstNameTh !== undefined) {
    updateFields.push("first_name_th = ?");
    updateValues.push(data.firstNameTh);
  }
  if (data.lastNameTh !== undefined) {
    updateFields.push("last_name_th = ?");
    updateValues.push(data.lastNameTh);
  }
  if (data.firstNameEn !== undefined) {
    updateFields.push("first_name_en = ?");
    updateValues.push(data.firstNameEn);
  }
  if (data.lastNameEn !== undefined) {
    updateFields.push("last_name_en = ?");
    updateValues.push(data.lastNameEn);
  }
  if (data.idCard !== undefined) {
    updateFields.push("id_card = ?");
    updateValues.push(data.idCard);
  }
  if (data.email !== undefined) {
    updateFields.push("email = ?");
    updateValues.push(data.email);
  }
  if (data.phone !== undefined) {
    updateFields.push("phone = ?");
    updateValues.push(data.phone);
  }

  if (updateFields.length > 0) {
    updateValues.push(applicationId);
    await executeQueryWithoutTransaction(
      `UPDATE ${tableName} SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    );
  }

  return { updated: updateFields.length };
}
