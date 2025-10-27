import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * GET single rejected application data
 * Load from Main table + related tables (no Reject_DATA)
 */

export async function GET(request, { params }) {
  let connection;

  try {
    const { type, id } = await params;
    
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    connection = await getConnection();

    // Map type to tables
    const tableConfig = {
      oc: {
        main: "MemberRegist_OC_Main",
        address: "MemberRegist_OC_Address",
        representatives: "MemberRegist_OC_Representatives",
        contactPersons: "MemberRegist_OC_ContactPerson",
        businessTypes: "MemberRegist_OC_BusinessTypes",
        products: "MemberRegist_OC_Products",
        industryGroups: "MemberRegist_OC_IndustryGroups",
        provinceChapters: "MemberRegist_OC_ProvinceChapters",
        documents: "MemberRegist_OC_Documents",
        signatureName: "MemberRegist_OC_Signature_Name",
        idField: "main_id",
      },
      ac: {
        main: "MemberRegist_AC_Main",
        address: "MemberRegist_AC_Address",
        representatives: "MemberRegist_AC_Representatives",
        contactPersons: "MemberRegist_AC_ContactPerson",
        businessTypes: "MemberRegist_AC_BusinessTypes",
        products: "MemberRegist_AC_Products",
        industryGroups: "MemberRegist_AC_IndustryGroups",
        provinceChapters: "MemberRegist_AC_ProvinceChapters",
        documents: "MemberRegist_AC_Documents",
        signatureName: "MemberRegist_AC_Signature_Name",
        idField: "main_id",
      },
      am: {
        main: "MemberRegist_AM_Main",
        address: "MemberRegist_AM_Address",
        representatives: "MemberRegist_AM_Representatives",
        contactPersons: "MemberRegist_AM_ContactPerson",
        businessTypes: "MemberRegist_AM_BusinessTypes",
        products: "MemberRegist_AM_Products",
        industryGroups: "MemberRegist_AM_IndustryGroups",
        provinceChapters: "MemberRegist_AM_ProvinceChapters",
        documents: "MemberRegist_AM_Documents",
        signatureName: "MemberRegist_AM_Signature_Name",
        idField: "main_id",
      },
      ic: {
        main: "MemberRegist_IC_Main",
        address: "MemberRegist_IC_Address",
        representatives: "MemberRegist_IC_Representatives",
        businessTypes: "MemberRegist_IC_BusinessTypes",
        products: "MemberRegist_IC_Products",
        industryGroups: "MemberRegist_IC_IndustryGroups",
        provinceChapters: "MemberRegist_IC_ProvinceChapters",
        documents: "MemberRegist_IC_Documents",
        signatureName: "MemberRegist_IC_Signature_Name",
        idField: "ic_main_id",
      },
    };

    const config = tableConfig[type];
    if (!config) {
      return NextResponse.json(
        { success: false, message: "Invalid membership type" },
        { status: 400 }
      );
    }

    // 1. Get main data
    const [mainData] = await connection.execute(
      `SELECT * FROM ${config.main} WHERE id = ? AND user_id = ? AND status = 2 AND is_archived = 0`,
      [id, user.id]
    );

    if (!mainData.length) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลใบสมัครที่ถูกปฏิเสธ หรือคุณไม่มีสิทธิ์เข้าถึง" },
        { status: 404 }
      );
    }

    const data = { main: mainData[0] };

    // 2. Get related data
    const [addresses] = await connection.execute(
      `SELECT * FROM ${config.address} WHERE ${config.idField} = ?`,
      [id]
    );
    data.addresses = addresses;

    const [representatives] = await connection.execute(
      `SELECT * FROM ${config.representatives} WHERE ${config.idField} = ?`,
      [id]
    );
    data.representatives = representatives;

    if (config.contactPersons) {
      const [contactPersons] = await connection.execute(
        `SELECT * FROM ${config.contactPersons} WHERE ${config.idField} = ?`,
        [id]
      );
      data.contactPersons = contactPersons;
    }

    const [businessTypes] = await connection.execute(
      `SELECT * FROM ${config.businessTypes} WHERE ${config.idField} = ?`,
      [id]
    );
    data.businessTypes = businessTypes;

    const [products] = await connection.execute(
      `SELECT * FROM ${config.products} WHERE ${config.idField} = ?`,
      [id]
    );
    data.products = products;

    if (config.industryGroups) {
      const [industryGroups] = await connection.execute(
        `SELECT * FROM ${config.industryGroups} WHERE ${config.idField} = ?`,
        [id]
      );
      data.industryGroups = industryGroups;
    }

    if (config.provinceChapters) {
      const [provinceChapters] = await connection.execute(
        `SELECT * FROM ${config.provinceChapters} WHERE ${config.idField} = ?`,
        [id]
      );
      data.provinceChapters = provinceChapters;
    }

    const [documents] = await connection.execute(
      `SELECT * FROM ${config.documents} WHERE ${config.idField} = ?`,
      [id]
    );
    data.documents = documents;

    const [signatureName] = await connection.execute(
      `SELECT * FROM ${config.signatureName} WHERE ${config.idField} = ?`,
      [id]
    );
    data.signatureName = signatureName.length > 0 ? signatureName[0] : null;

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Error fetching rejected application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลได้",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
