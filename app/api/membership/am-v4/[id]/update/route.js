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
      "SELECT user_id FROM MemberRegist_AM_Main WHERE id = ?",
      [id],
    );

    if (!rows.length || rows[0].user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบใบสมัครนี้หรือคุณไม่มีสิทธิ์แก้ไข" },
        { status: 403 },
      );
    }

    await connection.beginTransaction();

    // 1) Derive association/company contact from document delivery address (type 2) if addresses are provided
    let associationEmail = formData.associationEmail || formData.companyEmail || "";
    let associationPhone = formData.associationPhone || formData.companyPhone || "";
    let associationPhoneExtension =
      formData.associationPhoneExtension || formData.companyPhoneExtension || null;

    if (formData.addresses && typeof formData.addresses === "object") {
      try {
        const addresses = formData.addresses || {};
        const documentAddress = addresses["2"] || addresses[2];
        if (documentAddress) {
          associationEmail =
            documentAddress["email-2"] || documentAddress.email || associationEmail;
          associationPhone =
            documentAddress["phone-2"] || documentAddress.phone || associationPhone;
          associationPhoneExtension =
            documentAddress["phoneExtension-2"] ||
            documentAddress.phoneExtension ||
            associationPhoneExtension;
        }
      } catch (e) {
        console.error("[AM-V4] Error deriving association contact from addresses:", e);
      }
    }

    const mainSql = `
      UPDATE MemberRegist_AM_Main
      SET
        company_name_th = ?,
        company_name_en = ?,
        tax_id = ?,
        company_email = ?,
        company_phone = ?,
        company_phone_extension = ?,
        number_of_member = ?,
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
      formData.associationName || formData.companyName || "",
      formData.associationNameEn || formData.companyNameEn || "",
      formData.taxId || "",
      associationEmail,
      associationPhone,
      associationPhoneExtension,
      formData.memberCount ? parseInt(formData.memberCount, 10) || null : null,
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

    // 2) Update addresses
    if (formData.addresses) {
      const addresses = formData.addresses || {};
      await connection.execute("DELETE FROM MemberRegist_AM_Address WHERE main_id = ?", [id]);

      for (const key of Object.keys(addresses)) {
        const addr = addresses[key] || {};

        // Normalize contact fields: รองรับทั้งคีย์ปกติและคีย์ไดนามิกจาก UI เช่น phone-1, email-2
        const addressTypeKey = String(addr.addressType || key || "");

        const emailVal =
          (addressTypeKey && addr[`email-${addressTypeKey}`]) !== undefined
            ? addr[`email-${addressTypeKey}`]
            : addr.email || "";

        const phoneVal =
          (addressTypeKey && addr[`phone-${addressTypeKey}`]) !== undefined
            ? addr[`phone-${addressTypeKey}`]
            : addr.phone || "";

        const phoneExtVal =
          (addressTypeKey && addr[`phoneExtension-${addressTypeKey}`]) !== undefined
            ? addr[`phoneExtension-${addressTypeKey}`]
            : addr.phoneExtension || "";

        const websiteVal =
          (addressTypeKey && addr[`website-${addressTypeKey}`]) !== undefined
            ? addr[`website-${addressTypeKey}`]
            : addr.website || "";

        await connection.execute(
          `INSERT INTO MemberRegist_AM_Address (
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

    // 9) Update authorized signatory names (supports multiple signatories)
    if (formData.signatories || formData.authorizedSignatoryFirstNameTh) {
      await connection.execute(
        "DELETE FROM MemberRegist_AM_Signature_Name WHERE main_id = ?",
        [id],
      );

      let signatories = [];

      if (Array.isArray(formData.signatories) && formData.signatories.length > 0) {
        signatories = formData.signatories;
      } else {
        const sigFirstTh =
          formData.authorizedSignatoryFirstNameTh ||
          formData.authorizedSignatureFirstNameTh ||
          "";
        const sigLastTh =
          formData.authorizedSignatoryLastNameTh ||
          formData.authorizedSignatureLastNameTh ||
          "";
        const sigFirstEn =
          formData.authorizedSignatoryFirstNameEn ||
          formData.authorizedSignatureFirstNameEn ||
          "";
        const sigLastEn =
          formData.authorizedSignatoryLastNameEn ||
          formData.authorizedSignatureLastNameEn ||
          "";
        const posTh =
          formData.authorizedSignatoryPositionTh ||
          formData.authorizedSignaturePositionTh ||
          null;
        const posEn =
          formData.authorizedSignatoryPositionEn ||
          formData.authorizedSignaturePositionEn ||
          "";

        if (sigFirstTh && sigLastTh) {
          signatories = [
            {
              prenameTh: formData.authorizedSignatoryPrenameTh || null,
              prenameEn: formData.authorizedSignatoryPrenameEn || "",
              prenameOther: formData.authorizedSignatoryPrenameOther || null,
              prenameOtherEn: formData.authorizedSignatoryPrenameOtherEn || null,
              firstNameTh: sigFirstTh,
              lastNameTh: sigLastTh,
              firstNameEn: sigFirstEn || "",
              lastNameEn: sigLastEn || "",
              positionTh: posTh,
              positionEn: posEn,
            },
          ];
        }
      }

      for (const signatory of signatories) {
        const s = signatory || {};
        await connection.execute(
          `INSERT INTO MemberRegist_AM_Signature_Name (
            main_id, prename_th, prename_en, prename_other, prename_other_en,
            first_name_th, last_name_th, first_name_en, last_name_en,
            position_th, position_en
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            s.prenameTh || null,
            s.prenameEn || "",
            s.prenameOther || null,
            s.prenameOtherEn || null,
            s.firstNameTh || null,
            s.lastNameTh || null,
            s.firstNameEn || "",
            s.lastNameEn || "",
            s.positionTh && String(s.positionTh).trim() ? s.positionTh : null,
            s.positionEn && String(s.positionEn).trim() ? s.positionEn : "",
          ],
        );
      }
    }

    // 3) Update contact persons
    if (formData.contactPersons) {
      const contactPersons = ensureArray(formData.contactPersons);
      await connection.execute("DELETE FROM MemberRegist_AM_ContactPerson WHERE main_id = ?", [id]);

      for (const cp of contactPersons) {
        await connection.execute(
          `INSERT INTO MemberRegist_AM_ContactPerson (
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
      await connection.execute("DELETE FROM MemberRegist_AM_Representatives WHERE main_id = ?", [id]);

      let order = 1;
      for (const rep of representatives) {
        await connection.execute(
          `INSERT INTO MemberRegist_AM_Representatives (
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
      await connection.execute("DELETE FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?", [id]);

      for (const key of Object.keys(businessTypes)) {
        if (businessTypes[key]) {
          await connection.execute(
            `INSERT INTO MemberRegist_AM_BusinessTypes (main_id, business_type) VALUES (?, ?)`,
            [id, key],
          );
        }
      }

      await connection.execute("DELETE FROM MemberRegist_AM_BusinessTypeOther WHERE main_id = ?", [id]);
      if (formData.otherBusinessTypeDetail) {
        await connection.execute(
          `INSERT INTO MemberRegist_AM_BusinessTypeOther (main_id, detail) VALUES (?, ?)`,
          [id, formData.otherBusinessTypeDetail],
        );
      }
    }

    // 6) Update products
    if (formData.products) {
      const products = ensureArray(formData.products);
      await connection.execute("DELETE FROM MemberRegist_AM_Products WHERE main_id = ?", [id]);

      for (const product of products) {
        await connection.execute(
          `INSERT INTO MemberRegist_AM_Products (main_id, name_th, name_en) VALUES (?, ?, ?)`,
          [id, product.nameTh || "", product.nameEn || ""],
        );
      }
    }

    // 7) Update industry groups
    if (formData.industrialGroupIds) {
      const ids = ensureArray(formData.industrialGroupIds);
      const names = ensureArray(formData.industrialGroupNames || []);
      await connection.execute("DELETE FROM MemberRegist_AM_IndustryGroups WHERE main_id = ?", [id]);

      for (let i = 0; i < ids.length; i++) {
        const groupId = ids[i];
        if (!groupId) continue;
        const groupName = names[i] || "";
        await connection.execute(
          `INSERT INTO MemberRegist_AM_IndustryGroups (main_id, industry_group_id, industry_group_name) VALUES (?, ?, ?)`,
          [id, groupId, groupName],
        );
      }
    }

    // 8) Update provincial chapters
    if (formData.provincialChapterIds) {
      const ids = ensureArray(formData.provincialChapterIds);
      const names = ensureArray(formData.provincialChapterNames || []);
      await connection.execute("DELETE FROM MemberRegist_AM_ProvinceChapters WHERE main_id = ?", [id]);

      for (let i = 0; i < ids.length; i++) {
        const chapterId = ids[i];
        if (!chapterId) continue;
        const chapterName = names[i] || "";
        await connection.execute(
          `INSERT INTO MemberRegist_AM_ProvinceChapters (main_id, province_chapter_id, province_chapter_name) VALUES (?, ?, ?)`,
          [id, chapterId, chapterName],
        );
      }
    }

    await connection.commit();

    try {
      const email = formData.associationEmail || formData.companyEmail || user.email;
      if (email) {
        const displayName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "ผู้สมัคร";
        const companyName = formData.associationName || formData.companyName || "";
        await sendOCMembershipEditConfirmationEmail(email, displayName, "AM", companyName);
      }
    } catch (emailError) {
      console.error("[AM-V4] Failed to send edit confirmation email:", emailError);
    }

    return NextResponse.json({ success: true, message: "บันทึกการแก้ไขใบสมัครเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("[AM-V4] Error updating application:", error);
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
