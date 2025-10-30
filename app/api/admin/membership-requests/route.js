import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConnection } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";

/**
 * GET handler for fetching membership requests
 *
 * Fetches membership requests from all types (OC, AM, AC, IC) based on filters
 * Supports pagination, status filtering, type filtering, and search
 */
export async function GET(request) {
  try {
    // Verify admin authentication
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "pending";
    const type = searchParams.get("type") || "all";
    const search = searchParams.get("search") || "";
    const sortOrderParam = (searchParams.get("sortOrder") || "desc").toLowerCase();
    const sortOrder = sortOrderParam === "asc" ? "ASC" : "DESC";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Convert status string to numeric value
    let statusValue;
    switch (status) {
      case "pending":
        statusValue = 0;
        break;
      case "approved":
        statusValue = 1;
        break;
      case "rejected":
        statusValue = 2;
        break;
      default:
        statusValue = null; // 'all' or invalid status
    }

    // Get database connection
    const connection = await getConnection();

    try {
      // Debug: Check admin users table structure
      console.log('=== DEBUG: Admin Users Table Check ===');
      const [adminUsers] = await connection.query('SELECT id, username, name FROM FTI_Portal_Admin_Users WHERE id = 1 LIMIT 1');
      if (adminUsers.length > 0) {
        console.log('Admin user ID 1:', JSON.stringify(adminUsers[0], null, 2));
      } else {
        console.log('No admin user found with ID 1');
      }
      // Prepare base queries for each membership type
      let queries = [];
      let countQueries = [];
      let params = [];
      // Track params per count query to avoid mismatches between types
      let countParamsList = [];

      // Helper function to add type-specific queries
      const addTypeQuery = (
        tableName,
        idField,
        nameThField,
        nameEnField,
        idTypeField,
        typeValue,
      ) => {
        let query = `SELECT 
          ${tableName}.id, 
          '${typeValue}' as type, 
          ${nameThField} as companyNameTh, 
          ${nameEnField} as companyNameEn, 
          ${idTypeField} as taxId, 
          NULL as idCard, 
          ${tableName}.status, 
          ${tableName}.created_at as createdAt,
          ${tableName}.approved_at as main_approved_at,
          ${tableName}.approved_by as main_approved_by,
          ${tableName}.user_id,
          FTI_Portal_User.firstname,
          FTI_Portal_User.lastname,
          FTI_Portal_User.email,
          FTI_Portal_User.phone,
          COALESCE(NULLIF(approve_admin.name, ''), approve_admin.username, NULLIF(admin_user.name, ''), admin_user.username) as approved_by_admin_name,
          approve_admin.created_at as approved_at
        FROM ${tableName} 
        LEFT JOIN FTI_Portal_User ON ${tableName}.user_id = FTI_Portal_User.id
        LEFT JOIN FTI_Portal_Admin_Actions_Logs approve_log ON ${tableName}.id = approve_log.target_id 
          AND approve_log.action_type = 'approve_member'
        LEFT JOIN FTI_Portal_Admin_Users approve_admin ON approve_log.admin_id = approve_admin.id
        LEFT JOIN FTI_Portal_Admin_Users admin_user ON ${tableName}.approved_by = admin_user.id
        WHERE 1=1`;

        let countQuery = `SELECT COUNT(*) as count FROM ${tableName} LEFT JOIN FTI_Portal_User ON ${tableName}.user_id = FTI_Portal_User.id WHERE 1=1`;

        let queryParams = [];
        let countQueryParams = [];

        // Add status filter if specified
        if (statusValue !== null) {
          query += ` AND ${tableName}.status = ?`;
          countQuery += ` AND ${tableName}.status = ?`;
          queryParams.push(statusValue);
          countQueryParams.push(statusValue);
        }

        // Add search filter if specified (also search by applicant email/phone)
        if (search) {
          query += ` AND (${nameThField} LIKE ? OR ${nameEnField} LIKE ? OR ${idTypeField} LIKE ? OR FTI_Portal_User.email LIKE ? OR FTI_Portal_User.phone LIKE ?)`;
          countQuery += ` AND (${nameThField} LIKE ? OR ${nameEnField} LIKE ? OR ${idTypeField} LIKE ? OR FTI_Portal_User.email LIKE ? OR FTI_Portal_User.phone LIKE ?)`;
          const searchPattern = `%${search}%`;
          queryParams.push(
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
          );
          countQueryParams.push(
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
          );
        }

        return {
          query,
          countQuery,
          queryParams,
          countQueryParams,
        };
      };

      // Helper function to add IC type query (different structure)
      const addICTypeQuery = () => {
        let query = `SELECT 
          MemberRegist_IC_Main.id, 
          'ic' as type, 
          CONCAT(first_name_th, ' ', last_name_th) as companyNameTh, 
          CONCAT(first_name_en, ' ', last_name_en) as companyNameEn, 
          NULL as taxId, 
          id_card_number as idCard, 
          MemberRegist_IC_Main.status, 
          MemberRegist_IC_Main.created_at as createdAt,
          MemberRegist_IC_Main.approved_at as main_approved_at,
          MemberRegist_IC_Main.approved_by as main_approved_by,
          MemberRegist_IC_Main.user_id,
          FTI_Portal_User.firstname,
          FTI_Portal_User.lastname,
          FTI_Portal_User.email,
          FTI_Portal_User.phone,
          COALESCE(NULLIF(approve_admin.name, ''), approve_admin.username, NULLIF(admin_user.name, ''), admin_user.username) as approved_by_admin_name,
          approve_admin.created_at as approved_at
        FROM MemberRegist_IC_Main 
        LEFT JOIN FTI_Portal_User ON MemberRegist_IC_Main.user_id = FTI_Portal_User.id
        LEFT JOIN FTI_Portal_Admin_Actions_Logs approve_log ON MemberRegist_IC_Main.id = approve_log.target_id 
          AND approve_log.action_type = 'approve_member'
        LEFT JOIN FTI_Portal_Admin_Users approve_admin ON approve_log.admin_id = approve_admin.id
        LEFT JOIN FTI_Portal_Admin_Users admin_user ON MemberRegist_IC_Main.approved_by = admin_user.id
        WHERE 1=1`;

        let countQuery = `SELECT COUNT(*) as count FROM MemberRegist_IC_Main LEFT JOIN FTI_Portal_User ON MemberRegist_IC_Main.user_id = FTI_Portal_User.id WHERE 1=1`;

        let queryParams = [];
        let countQueryParams = [];

        // Add status filter if specified
        if (statusValue !== null) {
          query += ` AND MemberRegist_IC_Main.status = ?`;
          countQuery += ` AND MemberRegist_IC_Main.status = ?`;
          queryParams.push(statusValue);
          countQueryParams.push(statusValue);
        }

        // Add search filter if specified (also search by applicant email/phone)
        if (search) {
          query += ` AND (first_name_th LIKE ? OR last_name_th LIKE ? OR first_name_en LIKE ? OR last_name_en LIKE ? OR id_card_number LIKE ? OR FTI_Portal_User.email LIKE ? OR FTI_Portal_User.phone LIKE ? OR MemberRegist_IC_Main.phone LIKE ?)`;
          countQuery += ` AND (first_name_th LIKE ? OR last_name_th LIKE ? OR first_name_en LIKE ? OR last_name_en LIKE ? OR id_card_number LIKE ? OR FTI_Portal_User.email LIKE ? OR FTI_Portal_User.phone LIKE ? OR MemberRegist_IC_Main.phone LIKE ?)`;
          const searchPattern = `%${search}%`;
          queryParams.push(
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
          );
          countQueryParams.push(
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
            searchPattern,
          );
        }

        return {
          query,
          countQuery,
          queryParams,
          countQueryParams,
        };
      };

      // Add type-specific queries based on the type filter
      if (type === "all" || type === "oc") {
        const ocQuery = addTypeQuery(
          "MemberRegist_OC_Main",
          "id",
          "company_name_th",
          "company_name_en",
          "tax_id",
          "oc",
        );
        queries.push(ocQuery.query);
        countQueries.push(ocQuery.countQuery);
        params = [...params, ...ocQuery.queryParams];
        countParamsList.push(ocQuery.countQueryParams);
      }

      if (type === "all" || type === "am") {
        const amQuery = addTypeQuery(
          "MemberRegist_AM_Main",
          "id",
          "company_name_th",
          "company_name_en",
          "tax_id",
          "am",
        );
        queries.push(amQuery.query);
        countQueries.push(amQuery.countQuery);
        params = [...params, ...amQuery.queryParams];
        countParamsList.push(amQuery.countQueryParams);
      }

      if (type === "all" || type === "ac") {
        const acQuery = addTypeQuery(
          "MemberRegist_AC_Main",
          "id",
          "company_name_th",
          "company_name_en",
          "tax_id",
          "ac",
        );
        queries.push(acQuery.query);
        countQueries.push(acQuery.countQuery);
        params = [...params, ...acQuery.queryParams];
        countParamsList.push(acQuery.countQueryParams);
      }

      if (type === "all" || type === "ic") {
        const icQuery = addICTypeQuery();
        queries.push(icQuery.query);
        countQueries.push(icQuery.countQuery);
        params = [...params, ...icQuery.queryParams];
        countParamsList.push(icQuery.countQueryParams);
      }

      // Combine all queries with UNION ALL then remove duplicates
      let combinedQuery = queries.join(" UNION ALL ");
      combinedQuery = `SELECT * FROM (${combinedQuery}) AS combined_all 
                       GROUP BY id, type, companyNameTh, companyNameEn, taxId, idCard, 
                                status, createdAt, main_approved_at, main_approved_by, user_id,
                                firstname, lastname, email, phone, approved_by_admin_name, approved_at`;
      combinedQuery += ` ORDER BY createdAt ${sortOrder} LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      // Execute the combined query
      const [rows] = await connection.query(combinedQuery, params);
      
      // Debug: Log first row to see what data we're getting
      if (rows.length > 0) {
        console.log('=== DEBUG: Sample row data ===');
        console.log('First row:', JSON.stringify(rows[0], null, 2));
        
        // Check specifically for AM records with approved_by
        const amRow = rows.find(r => r.type === 'am' && r.main_approved_by);
        if (amRow) {
          console.log('=== DEBUG: AM Sample with approved_by ===');
          console.log('AM row:', JSON.stringify(amRow, null, 2));
          console.log('approved_by_admin_name:', amRow.approved_by_admin_name);
          console.log('main_approved_by:', amRow.main_approved_by);
        }
        
        // Check all records with approved_by but null name
        const problematicRows = rows.filter(r => r.main_approved_by && !r.approved_by_admin_name);
        if (problematicRows.length > 0) {
          console.log('=== DEBUG: Records with approved_by but null name ===');
          problematicRows.forEach(row => {
            console.log(`ID: ${row.id}, Type: ${row.type}, approved_by: ${row.main_approved_by}, name: ${row.approved_by_admin_name}`);
          });
        }
      }

      // Execute count queries to get total count for pagination
      // Use per-type parameter arrays to avoid placeholder mismatches
      let totalCount = 0;
      for (let i = 0; i < countQueries.length; i++) {
        const queryParamsForThisType = countParamsList[i] || [];
        const [countResult] = await connection.query(countQueries[i], queryParamsForThisType);
        totalCount += countResult[0].count;
      }

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        success: true,
        data: rows,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching membership requests:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลการสมัครสมาชิก" },
      { status: 500 },
    );
  }
}
