import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";
import { sendOCMembershipEditConfirmationEmail } from "@/app/lib/postmark";

async function parseJsonBody(request) {
  try {
    const body = await request.json();
    return body || {};
  } catch (e) {
    return {};
  }
}

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

    const [rows] = await connection.execute(
      "SELECT user_id FROM MemberRegist_IC_Main WHERE id = ?",
      [id],
    );

    if (!rows.length || rows[0].user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบใบสมัครนี้หรือคุณไม่มีสิทธิ์แก้ไข" },
        { status: 403 },
      );
    }

    await connection.beginTransaction();

    const mainSql = `
      UPDATE MemberRegist_IC_Main
      SET
        prename_th = ?,
        prename_en = ?,
        prename_other = ?,
        prename_other_en = ?,
        first_name_th = ?,
        last_name_th = ?,
        first_name_en = ?,
        last_name_en = ?,
        phone = ?,
        phone_extension = ?,
        email = ?,
        website = ?,
        status = 4,
        resubmission_count = COALESCE(resubmission_count, 0) + 1,
        resubmitted_at = NOW(),
        updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `;

    await connection.execute(mainSql, [
      formData.prenameTh || formData.prename_th || null,
      formData.prenameEn || formData.prename_en || null,
      formData.prenameOther || formData.prename_other || null,
      formData.prenameOtherEn || formData.prename_other_en || null,
      formData.firstNameThai || formData.firstNameTh || formData.first_name_th || null,
      formData.lastNameThai || formData.lastNameTh || formData.last_name_th || null,
      formData.firstNameEng || formData.firstNameEn || formData.first_name_en || null,
      formData.lastNameEng || formData.lastNameEn || formData.last_name_en || null,
      formData.phone || null,
      formData.phoneExtension || null,
      formData.email || null,
      formData.website || null,
      id,
      user.id,
    ]);

    if (formData.addresses) {
      const addresses = formData.addresses || {};
      await connection.execute("DELETE FROM MemberRegist_IC_Address WHERE main_id = ?", [id]);

      for (const key of Object.keys(addresses)) {
        const addr = addresses[key] || {};

        // Normalize contact fields: รองรับทั้งคีย์ปกติและคีย์ไดนามิกจาก UI เช่น phone-1, email-2
        const addressTypeKey = String(addr.addressType || key || "");

        const emailVal =
          (addressTypeKey && addr[`email-${addressTypeKey}`]) !== undefined
            ? addr[`email-${addressTypeKey}`]
            : addr.email || formData.email || "";

        const phoneVal =
          (addressTypeKey && addr[`phone-${addressTypeKey}`]) !== undefined
            ? addr[`phone-${addressTypeKey}`]
            : addr.phone || formData.phone || "";

        const phoneExtVal =
          (addressTypeKey && addr[`phoneExtension-${addressTypeKey}`]) !== undefined
            ? addr[`phoneExtension-${addressTypeKey}`]
            : addr.phoneExtension || addr.phone_extension || formData.phoneExtension || "";

        const websiteVal =
          (addressTypeKey && addr[`website-${addressTypeKey}`]) !== undefined
            ? addr[`website-${addressTypeKey}`]
            : addr.website || formData.website || "";

        await connection.execute(
          `INSERT INTO MemberRegist_IC_Address (
             main_id, address_number, building, moo, soi, street,
             sub_district, district, province, postal_code,
             phone, phone_extension, email, website, address_type
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            addr.addressNumber || addr.address_number || "",
            addr.building || "",
            addr.moo || "",
            addr.soi || "",
            addr.street || addr.road || "",
            addr.subDistrict || addr.sub_district || "",
            addr.district || "",
            addr.province || "",
            addr.postalCode || addr.postal_code || "",
            phoneVal || "",
            phoneExtVal || "",
            emailVal || "",
            websiteVal || "",
            addr.addressType || key,
          ],
        );
      }
    }

    if (formData.representative) {
      const rep = formData.representative;
      await connection.execute("DELETE FROM MemberRegist_IC_Representatives WHERE main_id = ?", [id]);

      await connection.execute(
        `INSERT INTO MemberRegist_IC_Representatives (
           main_id, prename_th, prename_en, prename_other, prename_other_en,
           first_name_th, last_name_th, first_name_en, last_name_en,
           phone, phone_extension, email, position, rep_order
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          rep.prenameTh || rep.prename_th || null,
          rep.prenameEn || rep.prename_en || null,
          rep.prenameOther || rep.prename_other || null,
          rep.prenameOtherEn || rep.prename_other_en || null,
          rep.firstNameThai || rep.firstNameTh || rep.first_name_th || null,
          rep.lastNameThai || rep.lastNameTh || rep.last_name_th || null,
          rep.firstNameEng || rep.firstNameEn || rep.first_name_en || null,
          rep.lastNameEng || rep.lastNameEn || rep.last_name_en || null,
          rep.phone || null,
          rep.phoneExtension || rep.phone_extension || null,
          rep.email || null,
          rep.position || null,
          1,
        ],
      );
    }

    if (formData.businessTypes) {
      const businessTypes = ensureArray(formData.businessTypes);
      await connection.execute("DELETE FROM MemberRegist_IC_BusinessTypes WHERE main_id = ?", [id]);

      const businessTypeMap = {
        manufacturer: "manufacturer",
        distributor: "distributor",
        importer: "importer",
        exporter: "exporter",
        service: "service_provider",
        service_provider: "service_provider",
        other: "other",
      };

      for (const type of businessTypes) {
        if (!type) continue;
        const mapped = businessTypeMap[type] || type;
        await connection.execute(
          `INSERT INTO MemberRegist_IC_BusinessTypes (main_id, business_type) VALUES (?, ?)`,
          [id, mapped],
        );
      }

      await connection.execute("DELETE FROM MemberRegist_IC_BusinessTypeOther WHERE main_id = ?", [id]);
      if (formData.otherBusinessTypeDetail || formData.businessCategoryOther) {
        await connection.execute(
          `INSERT INTO MemberRegist_IC_BusinessTypeOther (main_id, other_type) VALUES (?, ?)`,
          [id, formData.otherBusinessTypeDetail || formData.businessCategoryOther],
        );
      }
    }

    if (formData.products) {
      const products = ensureArray(formData.products);
      await connection.execute("DELETE FROM MemberRegist_IC_Products WHERE main_id = ?", [id]);

      for (const product of products) {
        const nameTh = product.nameTh || product.name_th || "";
        const nameEn = product.nameEn || product.name_en || "";
        if (!nameTh) continue;
        await connection.execute(
          `INSERT INTO MemberRegist_IC_Products (main_id, name_th, name_en) VALUES (?, ?, ?)`,
          [id, nameTh, nameEn],
        );
      }
    }

    if (formData.industryGroups || formData.industrialGroupId) {
      await connection.execute("DELETE FROM MemberRegist_IC_IndustryGroups WHERE main_id = ?", [id]);

      const idsRaw = formData.industryGroups || formData.industrialGroupId;
      const ids = ensureArray(idsRaw);
      const names = ensureArray(formData.industrialGroupNames || []);

      for (let i = 0; i < ids.length; i++) {
        const groupId = ids[i];
        if (!groupId) continue;
        const groupName = names[i] || "ไม่ระบุ";
        await connection.execute(
          `INSERT INTO MemberRegist_IC_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?)`,
          [id, groupId.toString(), groupName],
        );
      }
    }

    if (formData.provinceChapters || formData.provincialChapterId) {
      await connection.execute("DELETE FROM MemberRegist_IC_ProvinceChapters WHERE main_id = ?", [id]);

      const idsRaw = formData.provinceChapters || formData.provincialChapterId;
      const ids = ensureArray(idsRaw);
      const names = ensureArray(formData.provincialChapterNames || formData.provincialCouncilNames || []);

      for (let i = 0; i < ids.length; i++) {
        const chapterId = ids[i];
        if (!chapterId) continue;
        const chapterName = names[i] || "ไม่ระบุ";
        await connection.execute(
          `INSERT INTO MemberRegist_IC_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?)`,
          [id, chapterId.toString(), chapterName],
        );
      }
    }

    await connection.commit();

    try {
      const email = formData.email || user.email;
      if (email) {
        const displayName = `${formData.firstNameThai || formData.firstNameTh || user.firstname || ""} ${formData.lastNameThai || formData.lastNameTh || user.lastname || ""}`.trim() || "ผู้สมัคร";
        const applicantName = displayName;
        await sendOCMembershipEditConfirmationEmail(email, displayName, "IC", applicantName);
      }
    } catch (emailError) {
      console.error("[IC-V4] Failed to send edit confirmation email:", emailError);
    }

    return NextResponse.json({ success: true, message: "บันทึกการแก้ไขใบสมัครเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("[IC-V4] Error updating application:", error);
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
