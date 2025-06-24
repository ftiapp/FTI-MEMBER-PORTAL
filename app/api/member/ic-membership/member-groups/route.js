import { NextResponse } from 'next/server';
import { mssqlQuery } from '@/app/lib/mssql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'industry', 'province', or 'all'
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const ids = searchParams.get('ids'); // Comma-separated list of IDs
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Base query
    let query = `
      SELECT 
        MEMBER_MAIN_GROUP_CODE,
        MEMBER_GROUP_CODE,
        MEMBER_GROUP_NAME
      FROM 
        [FTI].[dbo].[MB_MEMBER_GROUP]
      WHERE 
        MEMBER_MAIN_GROUP_CODE NOT IN (300, 401, 402, 500, 600, 000)
    `;
    
    // If IDs are provided, fetch specific records
    if (ids) {
      const idArray = ids.split(',').map(id => id.trim());
      if (idArray.length > 0) {
        query = `
          SELECT 
            MEMBER_MAIN_GROUP_CODE,
            MEMBER_GROUP_CODE,
            MEMBER_GROUP_NAME
          FROM 
            [FTI].[dbo].[MB_MEMBER_GROUP]
          WHERE 
            MEMBER_GROUP_CODE IN (${idArray.map(id => `'${id}'`).join(',')})
        `;
        
        // Execute query for specific IDs
        const results = await mssqlQuery(query);
        
        // Format the results
        const formattedResults = results.map(item => ({
          id: item.MEMBER_GROUP_CODE,
          name: item.MEMBER_GROUP_NAME,
          type: item.MEMBER_MAIN_GROUP_CODE === 100 ? 'industry' : 'province'
        }));
        
        // Return the results without pagination
        return NextResponse.json({
          success: true,
          data: formattedResults
        });
      }
    }
    
    // Add type filter if specified
    if (type === 'industry') {
      query += ` AND MEMBER_MAIN_GROUP_CODE = 100`;
    } else if (type === 'province') {
      query += ` AND MEMBER_MAIN_GROUP_CODE = 200`;
    }
    
    // Add search filter if provided
    if (search) {
      query += ` AND MEMBER_GROUP_NAME LIKE '%${search}%'`;
    }
    
    // Add order by
    query += ` ORDER BY MEMBER_MAIN_GROUP_CODE, MEMBER_GROUP_NAME`;
    
    // Add pagination
    query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    
    // Execute query
    const results = await mssqlQuery(query);
    
    // Count total records for pagination
    let countQuery = `
      SELECT 
        COUNT(*) AS total
      FROM 
        [FTI].[dbo].[MB_MEMBER_GROUP]
      WHERE 
        MEMBER_MAIN_GROUP_CODE NOT IN (300, 401, 402, 500, 600, 000)
    `;
    
    // Add type filter to count query if specified
    if (type === 'industry') {
      countQuery += ` AND MEMBER_MAIN_GROUP_CODE = 100`;
    } else if (type === 'province') {
      countQuery += ` AND MEMBER_MAIN_GROUP_CODE = 200`;
    }
    
    // Add search filter to count query if provided
    if (search) {
      countQuery += ` AND MEMBER_GROUP_NAME LIKE '%${search}%'`;
    }
    
    const countResult = await mssqlQuery(countQuery);
    const total = countResult[0].total;
    
    // Format the results
    const formattedResults = results.map(item => ({
      id: item.MEMBER_GROUP_CODE,
      name: item.MEMBER_GROUP_NAME,
      type: item.MEMBER_MAIN_GROUP_CODE === 100 ? 'industry' : 'province'
    }));
    
    // Return the results with pagination metadata
    return NextResponse.json({
      success: true,
      data: formattedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching member groups:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่มสมาชิก: ' + error.message },
      { status: 500 }
    );
  }
}
