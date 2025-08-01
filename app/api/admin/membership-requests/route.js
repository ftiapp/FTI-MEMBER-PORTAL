import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getConnection } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';

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
      return NextResponse.json({ success: false, message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'pending';
    const type = searchParams.get('type') || 'all';
    const search = searchParams.get('search') || '';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Convert status string to numeric value
    let statusValue;
    switch (status) {
      case 'pending':
        statusValue = 0;
        break;
      case 'approved':
        statusValue = 1;
        break;
      case 'rejected':
        statusValue = 2;
        break;
      default:
        statusValue = null; // 'all' or invalid status
    }
    
    // Get database connection
    const connection = await getConnection();
    
    try {
      // Prepare base queries for each membership type
      let queries = [];
      let countQueries = [];
      let params = [];
      let countParams = [];
      
      // Helper function to add type-specific queries
      const addTypeQuery = (tableName, idField, nameThField, nameEnField, idTypeField, typeValue) => {
        let query = `SELECT 
          ${tableName}.id, 
          '${typeValue}' as type, 
          ${nameThField} as companyNameTh, 
          ${nameEnField} as companyNameEn, 
          ${idTypeField} as taxId, 
          NULL as idCard, 
          ${tableName}.status, 
          ${tableName}.created_at as createdAt,
          ${tableName}.user_id,
          users.firstname,
          users.lastname,
          users.email,
          users.phone
        FROM ${tableName} 
        LEFT JOIN users ON ${tableName}.user_id = users.id
        WHERE 1=1`;
        
        let countQuery = `SELECT COUNT(*) as count FROM ${tableName} WHERE 1=1`;
        
        let queryParams = [];
        let countQueryParams = [];
        
        // Add status filter if specified
        if (statusValue !== null) {
          query += ` AND ${tableName}.status = ?`;
          countQuery += ` AND status = ?`;
          queryParams.push(statusValue);
          countQueryParams.push(statusValue);
        }
        
        // Add search filter if specified
        if (search) {
          query += ` AND (${nameThField} LIKE ? OR ${nameEnField} LIKE ? OR ${idTypeField} LIKE ?)`;
          countQuery += ` AND (${nameThField} LIKE ? OR ${nameEnField} LIKE ? OR ${idTypeField} LIKE ?)`;
          const searchPattern = `%${search}%`;
          queryParams.push(searchPattern, searchPattern, searchPattern);
          countQueryParams.push(searchPattern, searchPattern, searchPattern);
        }
        
        return {
          query,
          countQuery,
          queryParams,
          countQueryParams
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
          MemberRegist_IC_Main.user_id,
          users.firstname,
          users.lastname,
          users.email,
          users.phone
        FROM MemberRegist_IC_Main 
        LEFT JOIN users ON MemberRegist_IC_Main.user_id = users.id
        WHERE 1=1`;
        
        let countQuery = `SELECT COUNT(*) as count FROM MemberRegist_IC_Main WHERE 1=1`;
        
        let queryParams = [];
        let countQueryParams = [];
        
        // Add status filter if specified
        if (statusValue !== null) {
          query += ` AND MemberRegist_IC_Main.status = ?`;
          countQuery += ` AND MemberRegist_IC_Main.status = ?`;
          queryParams.push(statusValue);
          countQueryParams.push(statusValue);
        }
        
        // Add search filter if specified
        if (search) {
          query += ` AND (first_name_th LIKE ? OR last_name_th LIKE ? OR first_name_en LIKE ? OR last_name_en LIKE ? OR id_card_number LIKE ?)`;
          countQuery += ` AND (first_name_th LIKE ? OR last_name_th LIKE ? OR first_name_en LIKE ? OR last_name_en LIKE ? OR id_card_number LIKE ?)`;
          const searchPattern = `%${search}%`;
          queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
          countQueryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }
        
        return {
          query,
          countQuery,
          queryParams,
          countQueryParams
        };
      };
      
      // Add type-specific queries based on the type filter
      if (type === 'all' || type === 'oc') {
        const ocQuery = addTypeQuery(
          'MemberRegist_OC_Main',
          'id',
          'company_name_th',
          'company_name_en',
          'tax_id',
          'oc'
        );
        queries.push(ocQuery.query);
        countQueries.push(ocQuery.countQuery);
        params = [...params, ...ocQuery.queryParams];
        countParams = [...countParams, ...ocQuery.countQueryParams];
      }
      
      if (type === 'all' || type === 'am') {
        const amQuery = addTypeQuery(
          'MemberRegist_AM_Main',
          'id',
          'company_name_th',
          'company_name_en',
          'tax_id',
          'am'
        );
        queries.push(amQuery.query);
        countQueries.push(amQuery.countQuery);
        params = [...params, ...amQuery.queryParams];
        countParams = [...countParams, ...amQuery.countQueryParams];
      }
      
      if (type === 'all' || type === 'ac') {
        const acQuery = addTypeQuery(
          'MemberRegist_AC_Main',
          'id',
          'company_name_th',
          'company_name_en',
          'tax_id',
          'ac'
        );
        queries.push(acQuery.query);
        countQueries.push(acQuery.countQuery);
        params = [...params, ...acQuery.queryParams];
        countParams = [...countParams, ...acQuery.countQueryParams];
      }
      
      if (type === 'all' || type === 'ic') {
        const icQuery = addICTypeQuery();
        queries.push(icQuery.query);
        countQueries.push(icQuery.countQuery);
        params = [...params, ...icQuery.queryParams];
        countParams = [...countParams, ...icQuery.countQueryParams];
      }
      
      // Combine all queries with UNION
      let combinedQuery = queries.join(' UNION ');
      combinedQuery += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      
      // Execute the combined query
      const [rows] = await connection.query(combinedQuery, params);
      
      // Execute count queries to get total count for pagination
      let totalCount = 0;
      for (let i = 0; i < countQueries.length; i++) {
        const [countResult] = await connection.query(countQueries[i], countParams.slice(
          i * (search ? 3 : 1),
          (i + 1) * (search ? 3 : 1)
        ));
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
          totalPages
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching membership requests:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการสมัครสมาชิก' },
      { status: 500 }
    );
  }
}
