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

    const allApplications = [];

    // IC Applications - Individual Contributor
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

      // Fetch additional data for IC applications
      for (const app of icResults) {
        // Get address
        try {
          const addressQuery = `
            SELECT address_number, moo, soi, street, sub_district, district, province, postal_code
            FROM ICmember_Addr WHERE ic_member_id = ?
          `;
          const addressResults = await query(addressQuery, [app.id]);
          app.address = addressResults[0] || {};
        } catch (err) {
          app.address = {};
        }

        // Get representative
        try {
          const repQuery = `
            SELECT first_name_th, last_name_th, first_name_en, last_name_en, email, phone
            FROM ICmember_Representatives WHERE ic_member_id = ?
          `;
          const repResults = await query(repQuery, [app.id]);
          app.representative = repResults[0] || null;
        } catch (err) {
          app.representative = null;
        }

        // Get products
        try {
          const productQuery = `
            SELECT name_th as nameTh, name_en as nameEn
            FROM ICmember_Products WHERE ic_member_id = ?
          `;
          const productResults = await query(productQuery, [app.id]);
          app.products = productResults;
        } catch (err) {
          app.products = [];
        }

        // Get business types
        try {
          const businessQuery = `
            SELECT business_type
            FROM ICmember_Business_TYPE WHERE ic_member_id = ?
          `;
          const businessResults = await query(businessQuery, [app.id]);
          app.businessTypes = businessResults.map((b) => b.business_type);
        } catch (err) {
          app.businessTypes = [];
        }

        // Get documents
        try {
          const docQuery = `
            SELECT document_type, file_name, cloudinary_url
            FROM MemberRegist_IC_Documents WHERE main_id = ?
          `;
          const docResults = await query(docQuery, [app.id]);
          app.documents = docResults;
        } catch (err) {
          app.documents = [];
        }
      }

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
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt
        FROM MemberRegist_OC_Main m
        WHERE m.user_id = ? AND m.status IN (0, 1)
        ORDER BY m.created_at DESC
      `;

      const ocResults = await query(ocQuery, [userId]);

      // Fetch additional data for OC applications
      for (const app of ocResults) {
        // Get address
        try {
          const addressQuery = `
            SELECT address_number, moo, soi, street, sub_district, district, province, postal_code, phone, email, website
            FROM MemberRegist_OC_Address WHERE main_id = ?
          `;
          const addressResults = await query(addressQuery, [app.id]);
          app.address = addressResults[0] || {};
        } catch (err) {
          app.address = {};
        }

        // Get contact person
        try {
          const contactQuery = `
            SELECT first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone
            FROM MemberRegist_OC_ContactPerson WHERE main_id = ?
          `;
          const contactResults = await query(contactQuery, [app.id]);
          app.contactPerson = contactResults[0] || null;
        } catch (err) {
          app.contactPerson = null;
        }

        // Get representatives
        try {
          const repQuery = `
            SELECT first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone
            FROM MemberRegist_OC_Representatives WHERE main_id = ?
          `;
          const repResults = await query(repQuery, [app.id]);
          app.representatives = repResults;
        } catch (err) {
          app.representatives = [];
        }

        // Get products
        try {
          const productQuery = `
            SELECT name_th as nameTh, name_en as nameEn
            FROM MemberRegist_OC_Products WHERE main_id = ?
          `;
          const productResults = await query(productQuery, [app.id]);
          app.products = productResults;
        } catch (err) {
          app.products = [];
        }

        // Get business types
        try {
          const businessQuery = `
            SELECT business_type
            FROM MemberRegist_OC_BusinessTypes WHERE main_id = ?
          `;
          const businessResults = await query(businessQuery, [app.id]);
          app.businessTypes = businessResults.map((b) => b.business_type);
        } catch (err) {
          app.businessTypes = [];
        }

        // Get documents
        try {
          const docQuery = `
            SELECT document_type, file_name, cloudinary_url
            FROM MemberRegist_OC_Documents WHERE main_id = ?
          `;
          const docResults = await query(docQuery, [app.id]);
          app.documents = docResults;
        } catch (err) {
          app.documents = [];
        }
      }

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

      // Fetch additional data for AC applications
      for (const app of acResults) {
        // Get address
        try {
          const addressQuery = `
            SELECT address_number, moo, soi, street, sub_district, district, province, postal_code, phone, email, website
            FROM MemberRegist_AC_Address WHERE main_id = ?
          `;
          const addressResults = await query(addressQuery, [app.id]);
          app.address = addressResults[0] || {};
        } catch (err) {
          app.address = {};
        }

        // Get contact person
        try {
          const contactQuery = `
            SELECT first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone
            FROM MemberRegist_AC_ContactPerson WHERE main_id = ?
          `;
          const contactResults = await query(contactQuery, [app.id]);
          app.contactPerson = contactResults[0] || null;
        } catch (err) {
          app.contactPerson = null;
        }

        // Get representatives
        try {
          const repQuery = `
            SELECT first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone
            FROM MemberRegist_AC_Representatives WHERE main_id = ?
          `;
          const repResults = await query(repQuery, [app.id]);
          app.representatives = repResults;
        } catch (err) {
          app.representatives = [];
        }

        // Get products
        try {
          const productQuery = `
            SELECT name_th as nameTh, name_en as nameEn
            FROM MemberRegist_AC_Products WHERE main_id = ?
          `;
          const productResults = await query(productQuery, [app.id]);
          app.products = productResults;
        } catch (err) {
          app.products = [];
        }

        // Get business types
        try {
          const businessQuery = `
            SELECT business_type
            FROM MemberRegist_AC_BusinessTypes WHERE main_id = ?
          `;
          const businessResults = await query(businessQuery, [app.id]);
          app.businessTypes = businessResults.map((b) => b.business_type);
        } catch (err) {
          app.businessTypes = [];
        }

        // Get industrial groups
        try {
          const industryQuery = `
            SELECT industry_group_id
            FROM MemberRegist_AC_IndustryGroups WHERE main_id = ?
          `;
          const industryResults = await query(industryQuery, [app.id]);
          app.industrialGroups = industryResults.map((i) => i.industry_group_id);
        } catch (err) {
          app.industrialGroups = [];
        }

        // Get provincial chapters
        try {
          const provinceQuery = `
            SELECT province_chapter_id
            FROM MemberRegist_AC_ProvinceChapters WHERE main_id = ?
          `;
          const provinceResults = await query(provinceQuery, [app.id]);
          app.provincialChapters = provinceResults.map((p) => p.province_chapter_id);
        } catch (err) {
          app.provincialChapters = [];
        }

        // Get documents
        try {
          const docQuery = `
            SELECT document_type, file_name, cloudinary_url
            FROM MemberRegist_AC_Documents WHERE main_id = ?
          `;
          const docResults = await query(docQuery, [app.id]);
          app.documents = docResults;
        } catch (err) {
          app.documents = [];
        }
      }

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

      // Fetch additional data for AM applications
      for (const app of amResults) {
        // Get address
        try {
          const addressQuery = `
            SELECT address_number, moo, soi, street, sub_district, district, province, postal_code, phone, email, website
            FROM MemberRegist_AM_Address WHERE main_id = ?
          `;
          const addressResults = await query(addressQuery, [app.id]);
          app.address = addressResults[0] || {};
        } catch (err) {
          app.address = {};
        }

        // Get contact person
        try {
          const contactQuery = `
            SELECT first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone
            FROM MemberRegist_AM_ContactPerson WHERE main_id = ?
          `;
          const contactResults = await query(contactQuery, [app.id]);
          app.contactPerson = contactResults[0] || null;
        } catch (err) {
          app.contactPerson = null;
        }

        // Get representatives
        try {
          const repQuery = `
            SELECT first_name_th, last_name_th, first_name_en, last_name_en, position, email, phone
            FROM MemberRegist_AM_Representatives WHERE main_id = ?
          `;
          const repResults = await query(repQuery, [app.id]);
          app.representatives = repResults;
        } catch (err) {
          app.representatives = [];
        }

        // Get business types
        try {
          const businessQuery = `
            SELECT business_type
            FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?
          `;
          const businessResults = await query(businessQuery, [app.id]);
          app.businessTypes = businessResults.map((b) => b.business_type);
        } catch (err) {
          app.businessTypes = [];
        }

        // Get industrial groups
        try {
          const industryQuery = `
            SELECT industry_group_id
            FROM MemberRegist_AM_IndustryGroups WHERE main_id = ?
          `;
          const industryResults = await query(industryQuery, [app.id]);
          app.industrialGroups = industryResults.map((i) => i.industry_group_id);
        } catch (err) {
          app.industrialGroups = [];
        }

        // Get provincial chapters
        try {
          const provinceQuery = `
            SELECT province_chapter_id
            FROM MemberRegist_AM_ProvinceChapters WHERE main_id = ?
          `;
          const provinceResults = await query(provinceQuery, [app.id]);
          app.provincialChapters = provinceResults.map((p) => p.province_chapter_id);
        } catch (err) {
          app.provincialChapters = [];
        }

        // Get documents
        try {
          const docQuery = `
            SELECT document_type, file_name, cloudinary_url
            FROM MemberRegist_AM_Documents WHERE main_id = ?
          `;
          const docResults = await query(docQuery, [app.id]);
          app.documents = docResults;
        } catch (err) {
          app.documents = [];
        }
      }

      allApplications.push(...amResults);
    } catch (error) {
      console.error("Error fetching AM applications:", error);
    }

    // Sort by createdAt descending
    allApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const totalItems = allApplications.length;
    const paginatedApplications = allApplications.slice(offset, offset + limit);

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
