import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";
import { sendOCMembershipEditConfirmationEmail } from "@/app/lib/postmark";

// Helper: parse JSON safely
async function parseJsonBody(request) {
  try {
    const body = await request.json();
    return body || {};
  } catch (e) {
    return {};
  }
}

// Helper: ensure array from possible JSON/string/array input
function ensureArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      return parsed ? [parsed] : [];
    } catch {
      return [value];
    }
  }
  return [value];
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

    const { formData } = await parseJsonBody(request);
    if (!formData || typeof formData !== "object") {
      return NextResponse.json({ success: false, message: "ข้อมูลฟอร์มไม่ถูกต้อง" }, { status: 400 });
    }

    connection = await getConnection();

    // ตรวจสอบว่าใบสมัครนี้เป็นของ user คนนี้จริง
    const [rows] = await connection.execute(
      "SELECT user_id FROM MemberRegist_OC_Main WHERE id = ?",
      [id],
    );

    if (!rows.length || rows[0].user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบใบสมัครนี้หรือคุณไม่มีสิทธิ์แก้ไข" },
        { status: 403 },
      );
    }

    await connection.beginTransaction();

    // 1) Update main table and mark as resubmitted (status = 4)
    const mainSql = `
      UPDATE MemberRegist_OC_Main
      SET
        company_name_th = ?,
        company_name_en = ?,
        tax_id = ?,
        company_email = ?,
        company_phone = ?,
        company_phone_extension = ?,
        factory_type = ?,
        number_of_employees = ?,
        registered_capital = ?,
        production_capacity_value = ?,
        production_capacity_unit = ?,
        sales_domestic = ?,
        sales_export = ?,
        revenue_last_year = ?,
        revenue_previous_year = ?,
        shareholder_thai_percent = ?,
        shareholder_foreign_percent = ?,
        status = 4,
        resubmission_count = COALESCE(resubmission_count, 0) + 1,
        resubmitted_at = NOW(),
        updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `;

    await connection.execute(mainSql, [
      formData.companyName || "",
      formData.companyNameEng || "",
      formData.taxId || "",
      formData.companyEmail || "",
      formData.companyPhone || "",
      formData.companyPhoneExtension || null,
      formData.factoryType || null,
      formData.numberOfEmployees ? parseInt(formData.numberOfEmployees, 10) || null : null,
      formData.registeredCapital || null,
      formData.productionCapacityValue || null,
      formData.productionCapacityUnit || null,
      formData.salesDomestic || null,
      formData.salesExport || null,
      formData.revenueLastYear || null,
      formData.revenuePreviousYear || null,
      formData.shareholderThaiPercent || null,
      formData.shareholderForeignPercent || null,
      id,
      user.id,
    ]);

    // 2) Update addresses (ลบทั้งหมดแล้ว insert ใหม่จาก formData.addresses ถ้ามี)
    if (formData.addresses) {
      const addresses = formData.addresses || {};
      await connection.execute("DELETE FROM MemberRegist_OC_Address WHERE main_id = ?", [id]);

      for (const key of Object.keys(addresses)) {
        const addr = addresses[key] || {};
        await connection.execute(
          `INSERT INTO MemberRegist_OC_Address (
             main_id, address_number, building, moo, soi, street,
             sub_district, district, province, postal_code,
             phone, phone_extension, email, website, address_type
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            addr.addressNumber || "",
            addr.building || "",
            addr.moo || "",
            addr.soi || "",
            addr.street || "",
            addr.subDistrict || "",
            addr.district || "",
            addr.province || "",
            addr.postalCode || "",
            addr.phone || "",
            addr.phoneExtension || "",
            addr.email || "",
            addr.website || "",
            addr.addressType || key,
          ],
        );
      }
    }

    // 3) Update contact persons
    if (formData.contactPersons) {
      const contactPersons = ensureArray(formData.contactPersons);
      await connection.execute("DELETE FROM MemberRegist_OC_ContactPerson WHERE main_id = ?", [id]);

      for (const cp of contactPersons) {
        await connection.execute(
          `INSERT INTO MemberRegist_OC_ContactPerson (
             main_id, prename_th, prename_en, prename_other, prename_other_en, first_name_th, last_name_th,
             first_name_en, last_name_en, position, email, phone, phone_extension,
             type_contact_id, type_contact_name, type_contact_other_detail
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            cp.prenameTh || null,
            cp.prenameEn || "",
            cp.prenameOther || null,
            cp.prenameOtherEn || null,
            cp.firstNameTh || null,
            cp.lastNameTh || null,
            cp.firstNameEn || "",
            cp.lastNameEn || "",
            cp.position || null,
            cp.email || null,
            cp.phone || null,
            cp.phoneExtension || null,
            cp.typeContactId || null,
            cp.typeContactName || "",
            cp.typeContactOtherDetail || null,
          ],
        );
      }
    }

    // 4) Update representatives
    if (formData.representatives) {
      const representatives = ensureArray(formData.representatives);
      await connection.execute("DELETE FROM MemberRegist_OC_Representatives WHERE main_id = ?", [id]);

      let order = 1;
      for (const rep of representatives) {
        await connection.execute(
          `INSERT INTO MemberRegist_OC_Representatives (
             main_id, prename_th, prename_en, prename_other, prename_other_en,
             first_name_th, last_name_th, first_name_en, last_name_en,
             position, email, phone, phone_extension, is_primary, rep_order
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            rep.prenameTh || rep.prename_th || null,
            rep.prenameEn || rep.prename_en || "",
            rep.prenameOther || rep.prename_other || null,
            rep.prenameOtherEn || rep.prename_other_en || null,
            rep.firstNameThai || rep.firstNameTh || rep.first_name_th || null,
            rep.lastNameThai || rep.lastNameTh || rep.last_name_th || null,
            rep.firstNameEn || rep.first_name_en || rep.firstNameEnglish || "",
            rep.lastNameEn || rep.last_name_en || rep.lastNameEnglish || "",
            rep.position || null,
            rep.email || null,
            rep.phone || null,
            rep.phoneExtension || rep.phone_extension || null,
            rep.isPrimary ? 1 : 0,
            order++,
          ],
        );
      }
    }

    // 5) Update business types and other detail
    if (formData.businessTypes) {
      const businessTypes = formData.businessTypes || {};
      await connection.execute("DELETE FROM MemberRegist_OC_BusinessTypes WHERE main_id = ?", [id]);

      for (const key of Object.keys(businessTypes)) {
        if (businessTypes[key]) {
          await connection.execute(
            `INSERT INTO MemberRegist_OC_BusinessTypes (main_id, business_type) VALUES (?, ?)`,
            [id, key],
          );
        }
      }

      await connection.execute("DELETE FROM MemberRegist_OC_BusinessTypeOther WHERE main_id = ?", [id]);
      if (formData.otherBusinessTypeDetail) {
        await connection.execute(
          `INSERT INTO MemberRegist_OC_BusinessTypeOther (main_id, detail) VALUES (?, ?)`,
          [id, formData.otherBusinessTypeDetail],
        );
      }
    }

    // 6) Update products
    if (formData.products) {
      const products = ensureArray(formData.products);
      await connection.execute("DELETE FROM MemberRegist_OC_Products WHERE main_id = ?", [id]);

      for (const product of products) {
        await connection.execute(
          `INSERT INTO MemberRegist_OC_Products (main_id, name_th, name_en) VALUES (?, ?, ?)`,
          [id, product.nameTh || "", product.nameEn || ""],
        );
      }
    }

    // 7) Update industry groups
    if (formData.industrialGroupIds) {
      const ids = ensureArray(formData.industrialGroupIds);
      const names = ensureArray(formData.industrialGroupNames || []);
      await connection.execute("DELETE FROM MemberRegist_OC_IndustryGroups WHERE main_id = ?", [id]);

      for (let i = 0; i < ids.length; i++) {
        const groupId = ids[i];
        if (!groupId) continue;
        const groupName = names[i] || "";
        await connection.execute(
          `INSERT INTO MemberRegist_OC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?)`,
          [id, groupId, groupName],
        );
      }
    }

    // 8) Update province chapters
    if (formData.provincialChapterIds) {
      const ids = ensureArray(formData.provincialChapterIds);
      const names = ensureArray(formData.provincialChapterNames || []);
      await connection.execute("DELETE FROM MemberRegist_OC_ProvinceChapters WHERE main_id = ?", [id]);

      for (let i = 0; i < ids.length; i++) {
        const chapterId = ids[i];
        if (!chapterId) continue;
        const chapterName = names[i] || "";
        await connection.execute(
          `INSERT INTO MemberRegist_OC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?)`,
          [id, chapterId, chapterName],
        );
      }
    }

    await connection.commit();

    // Fire-and-forget: send email notification about successful edit submission
    try {
      const email = formData.companyEmail || user.email;
      if (email) {
        const displayName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "ผู้สมัคร";
        const companyName = formData.companyName || "";
        await sendOCMembershipEditConfirmationEmail(email, displayName, "OC", companyName);
      }
    } catch (emailError) {
      console.error("[OC-V4] Failed to send edit confirmation email:", emailError);
    }

    return NextResponse.json({ success: true, message: "บันทึกการแก้ไขใบสมัครเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("[OC-V4] Error updating application:", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }
    return NextResponse.json(
      { success: false, message: "ไม่สามารถบันทึกการแก้ไขใบสมัครได้" },
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
