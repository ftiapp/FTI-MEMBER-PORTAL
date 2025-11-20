import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { query } from "@/app/lib/db";

// List resubmitted (status = 4) applications for current user, all membership types
export async function GET(request) {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเข้าสู่ระบบ",
        },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 5;
    const offset = (page - 1) * limit;

    const allApplications = [];

    // IC - สมทบ (บุคคลธรรมดา)
    try {
      const icQuery = `
        SELECT 
          m.id,
          'IC' as memberType,
          CONCAT(m.first_name_th, ' ', m.last_name_th) as displayName,
          m.id_card_number as idCardNumber,
          m.first_name_th as firstNameTh,
          m.last_name_th as lastNameTh,
          m.first_name_en as firstNameEn,
          m.last_name_en as LastNameEn,
          m.email,
          m.phone,
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt
        FROM MemberRegist_IC_Main m
        WHERE m.user_id = ? AND m.status = 4
        ORDER BY m.created_at DESC
      `;

      const icResults = await query(icQuery, [userId]);
      allApplications.push(...icResults);
    } catch (error) {
      console.error("Error fetching IC resubmitted applications:", error);
    }

    // OC - สามัญ (โรงงาน)
    try {
      const ocQuery = `
        SELECT 
          m.id,
          'OC' as memberType,
          m.company_name_th as displayName,
          m.company_name_en as companyNameEn,
          m.tax_id as taxId,
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt
        FROM MemberRegist_OC_Main m
        WHERE m.user_id = ? AND m.status = 4
        ORDER BY m.created_at DESC
      `;

      const ocResults = await query(ocQuery, [userId]);
      allApplications.push(...ocResults);
    } catch (error) {
      console.error("Error fetching OC resubmitted applications:", error);
    }

    // AC - สมทบ (นิติบุคคล)
    try {
      const acQuery = `
        SELECT 
          m.id,
          'AC' as memberType,
          m.company_name_th as displayName,
          m.company_name_en as companyNameEn,
          m.tax_id as taxId,
          m.number_of_employees as employeeCount,
          m.company_email,
          m.company_phone,
          m.company_website,
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt
        FROM MemberRegist_AC_Main m
        WHERE m.user_id = ? AND m.status = 4
        ORDER BY m.created_at DESC
      `;

      const acResults = await query(acQuery, [userId]);
      allApplications.push(...acResults);
    } catch (error) {
      console.error("Error fetching AC resubmitted applications:", error);
    }

    // AM - สามัญ (สมาคมการค้า)
    try {
      const amQuery = `
        SELECT 
          m.id,
          'AM' as memberType,
          m.company_name_th as displayName,
          m.company_name_en as companyNameEn,
          m.tax_id as taxId,
          m.number_of_employees as employeeCount,
          m.number_of_member as memberCount,
          m.company_email,
          m.company_phone,
          m.factory_type,
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt
        FROM MemberRegist_AM_Main m
        WHERE m.user_id = ? AND m.status = 4
        ORDER BY m.created_at DESC
      `;

      const amResults = await query(amQuery, [userId]);
      allApplications.push(...amResults);
    } catch (error) {
      console.error("Error fetching AM resubmitted applications:", error);
    }

    // Sort by createdAt desc
    allApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalItems = allApplications.length;
    const paginatedApplications = allApplications.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      applications: paginatedApplications,
      pagination: {
        currentPage: page,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching resubmitted applications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลใบสมัครที่แก้ไขแล้ว",
      },
      { status: 500 },
    );
  }
}
