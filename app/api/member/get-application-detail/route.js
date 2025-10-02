import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { executeQueryWithoutTransaction } from "@/app/lib/db";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // OC, IC, AM, AC

    if (!id || !type) {
      return NextResponse.json({ error: "กรุณาระบุ ID และประเภทสมาชิก" }, { status: 400 });
    }

    let application = null;
    let addresses = [];
    let contactPersons = [];
    let representatives = [];
    let businessTypes = [];
    let products = [];
    let documents = [];

    // Get main application data
    const memberTypeMap = {
      OC: "สน",
      IC: "ทบ",
      AM: "สส",
      AC: "ทน",
    };

    const mainQuery = `
      SELECT 
        m.id,
        m.user_id,
        m.companyname as company_name,
        m.companyname_eng as company_name_eng,
        m.tax_id,
        m.company_email,
        m.company_phone,
        m.company_website,
        m.number_of_employees,
        m.factory_type,
        m.other_business_type,
        m.status,
        m.member_code,
        m.created_at,
        m.updated_at,
        '${memberTypeMap[type]}' as member_type_th
      FROM MemberRegist_${type}_Main m
      WHERE m.id = ?
    `;

    const mainResult = await executeQueryWithoutTransaction(mainQuery, [id]);
    if (mainResult.length === 0) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการสมัคร" }, { status: 404 });
    }

    application = mainResult[0];

    // Get related data based on member type
    try {
      // Addresses
      const addressesQuery = `SELECT 
        address_number,
        moo,
        soi,
        street,
        sub_district,
        district,
        province,
        postal_code
      FROM MemberRegist_${type}_Address WHERE application_id = ?`;
      addresses = await executeQueryWithoutTransaction(addressesQuery, [id]);

      // Contact persons
      const contactQuery = `SELECT 
        first_name,
        last_name,
        first_name_eng,
        last_name_eng,
        position,
        email,
        phone
      FROM MemberRegist_${type}_ContactPerson WHERE application_id = ?`;
      contactPersons = await executeQueryWithoutTransaction(contactQuery, [id]);

      // Representatives
      const repsQuery = `SELECT 
        first_name_th,
        last_name_th,
        first_name_en,
        last_name_en,
        email,
        phone
      FROM MemberRegist_${type}_Representatives WHERE application_id = ?`;
      representatives = await executeQueryWithoutTransaction(repsQuery, [id]);

      // Business types
      const businessQuery = `SELECT business_type FROM MemberRegist_${type}_BusinessTypes WHERE application_id = ?`;
      businessTypes = await executeQueryWithoutTransaction(businessQuery, [id]);

      // Products
      const productsQuery = `SELECT product_th, product_eng FROM MemberRegist_${type}_Products WHERE application_id = ?`;
      products = await executeQueryWithoutTransaction(productsQuery, [id]);

      // Documents
      const docsQuery = `SELECT 
        document_name,
        cloudinary_url,
        description
      FROM MemberRegist_${type}_Documents WHERE application_id = ?`;
      documents = await executeQueryWithoutTransaction(docsQuery, [id]);
    } catch (error) {
      console.warn(`Could not fetch related data for ${type}:`, error.message);
    }

    return NextResponse.json({
      application,
      addresses,
      contactPersons,
      representatives,
      businessTypes,
      products,
      documents,
    });
  } catch (error) {
    console.error("Error fetching application detail:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
