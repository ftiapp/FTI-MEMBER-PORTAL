import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { query } from "@/app/lib/db";

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

    console.log("🔍 Fetching submitted applications - Page:", page, "Limit:", limit);

    const allApplications = [];

    // IC Applications - Individual Contributor
    try {
      const icQuery = `
        SELECT 
          m.id,
          'IC' as memberType,
          CONCAT(m.first_name_th, ' ', m.last_name_th) as displayName,
          m.id_card_number as idCardNumber,
          m.member_code,
          m.first_name_th as firstNameTh,
          m.last_name_th as lastNameTh,
          m.first_name_en as firstNameEn,
          m.last_name_en as lastNameEn,
          m.email,
          m.phone,
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt
        FROM MemberRegist_IC_Main m
        WHERE m.user_id = ? AND m.status IN (0, 1)
        ORDER BY m.created_at DESC
      `;

      const icResults = await query(icQuery, [userId]);
      console.log("📊 IC applications found:", icResults.length);

      // Don't fetch additional data yet - just add to list
      allApplications.push(...icResults);
    } catch (error) {
      console.error("Error fetching IC applications:", error);
    }

    // OC Applications - Ordinary Company
    try {
      const ocQuery = `
        SELECT 
          m.id,
          'OC' as memberType,
          m.company_name_th as displayName,
          m.company_name_en as companyNameEn,
          m.tax_id as taxId,
          m.member_code,
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt
        FROM MemberRegist_OC_Main m
        WHERE m.user_id = ? AND m.status IN (0, 1)
        ORDER BY m.created_at DESC
      `;

      const ocResults = await query(ocQuery, [userId]);
      console.log("📊 OC applications found:", ocResults.length);

      // Don't fetch additional data yet - just add to list
      allApplications.push(...ocResults);
    } catch (error) {
      console.error("Error fetching OC applications:", error);
    }

    // AC Applications - Associate Company
    try {
      const acQuery = `
        SELECT 
          m.id,
          'AC' as memberType,
          m.company_name_th as displayName,
          m.company_name_en as companyNameEn,
          m.tax_id as taxId,
          m.member_code,
          m.number_of_employees as employeeCount,
          m.company_email,
          m.company_phone,
          m.company_website,
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt
        FROM MemberRegist_AC_Main m
        WHERE m.user_id = ? AND m.status IN (0, 1)
        ORDER BY m.created_at DESC
      `;

      const acResults = await query(acQuery, [userId]);
      console.log("📊 AC applications found:", acResults.length);

      // Don't fetch additional data yet - just add to list
      allApplications.push(...acResults);
    } catch (error) {
      console.error("Error fetching AC applications:", error);
    }

    // AM Applications - Association Member
    try {
      const amQuery = `
        SELECT 
          m.id,
          'AM' as memberType,
          m.company_name_th as displayName,
          m.company_name_en as companyNameEn,
          m.tax_id as taxId,
          m.member_code,
          m.number_of_employees as employeeCount,
          m.number_of_member as memberCount,
          m.company_email,
          m.company_phone,
          m.factory_type,
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt
        FROM MemberRegist_AM_Main m
        WHERE m.user_id = ? AND m.status IN (0, 1)
        ORDER BY m.created_at DESC
      `;

      const amResults = await query(amQuery, [userId]);
      console.log("📊 AM applications found:", amResults.length);

      // Don't fetch additional data yet - just add to list
      allApplications.push(...amResults);
    } catch (error) {
      console.error("Error fetching AM applications:", error);
    }

    // Sort by createdAt descending
    allApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination FIRST
    const totalItems = allApplications.length;
    const paginatedApplications = allApplications.slice(offset, offset + limit);

    console.log(
      "✂️ Paginated:",
      paginatedApplications.length,
      "out of",
      totalItems,
      "total applications",
    );
    console.log(
      "⚡ Performance: Reduced queries from",
      totalItems * 6,
      "to",
      paginatedApplications.length * 0,
      "(no detail queries needed for list view)",
    );

    console.log("✅ Returning", paginatedApplications.length, "applications");

    return NextResponse.json({
      success: true,
      applications: paginatedApplications,
      pagination: {
        currentPage: page,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching submitted applications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลใบสมัคร",
      },
      { status: 500 },
    );
  }
}
