import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/app/lib/adminAuth';
import { query } from '@/app/lib/db';

// Helper function to log objects safely
function safeLog(label, obj) {
  try {
    console.log(label, JSON.stringify(obj));
  } catch (e) {
    console.log(label, 'Error stringifying object:', e.message);
  }
}

/**
 * API endpoint to get a list of TSIC update requests
 */
export async function GET(request) {
  try {
    // ตรวจสอบสิทธิ์ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build SQL query - ทำให้เรียบง่ายที่สุดเพื่อดึงข้อมูลทั้งหมด
    let sql = `
      SELECT 
        pt.id,
        pt.user_id,
        pt.member_code,
        pt.tsic_data,
        pt.request_date,
        pt.status,
        pt.admin_id,
        pt.admin_comment,
        pt.processed_date
      FROM 
        pending_tsic_updates pt
      WHERE 1=1
    `;
    
    console.log('Checking if table exists with simple query');
    // ทดสอบว่าตารางมีอยู่จริงหรือไม่
    try {
      const [testResult] = await query('SELECT 1 FROM pending_tsic_updates LIMIT 1');
      console.log('Table exists check result:', testResult);
    } catch (error) {
      console.error('Error checking if table exists:', error);
    }
    
    const params = [];
    
    // Add status filter if provided
    if (status && status !== 'all') {
      sql += ' AND pt.status = ?';
      params.push(status);
      console.log('Filtering by status:', status);
    } else {
      console.log('No status filter applied, showing all statuses');
    }
    
    // Add search filter if provided
    if (search) {
      sql += ' AND pt.member_code LIKE ?';
      params.push(`%${search}%`);
      console.log('Filtering by search term:', search);
    }
    
    // Add order by and pagination
    sql += ' ORDER BY pt.request_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // สร้างคำสั่ง SQL สำหรับนับจำนวนรายการทั้งหมด (ใช้คำสั่งที่เรียบง่ายที่สุด)
    let countSql = `
      SELECT COUNT(*) as total
      FROM pending_tsic_updates pt
      WHERE 1=1
    `;
    
    const countParams = [];
    
    // Add status filter if provided
    if (status && status !== 'all') {
      countSql += ' AND pt.status = ?';
      countParams.push(status);
      console.log('Count query filtering by status:', status);
    } else {
      console.log('Count query: No status filter applied, showing all statuses');
    }
    
    // Add search filter if provided
    if (search) {
      countSql += ' AND pt.member_code LIKE ?';
      countParams.push(`%${search}%`);
    }
    
    // Execute queries
    console.log('Executing main query:', sql, params);
    let requests = [];
    try {
      const result = await query(sql, params);
      
      // Debug the result structure
      safeLog('Raw query result:', result);
      
      // MySQL returns results as [rows, fields]
      if (result && Array.isArray(result)) {
        if (result.length > 0 && Array.isArray(result[0])) {
          // Standard format: [rows, fields]
          requests = result[0];
        } else {
          // Alternative format: just rows
          requests = result;
        }
      }
      
      // Process each request to ensure tsic_data is properly parsed
      requests = requests.map(req => {
        try {
          // If tsic_data is a string, try to parse it
          if (req.tsic_data && typeof req.tsic_data === 'string') {
            req.tsic_data = JSON.parse(req.tsic_data);
          }
        } catch (e) {
          console.error('Error parsing tsic_data for request:', req.id, e);
          // Keep the original string if parsing fails
        }
        return req;
      });
      
      safeLog('Processed requests:', requests);
      console.log('Requests found:', requests.length);
    } catch (error) {
      console.error('Error executing main query:', error);
      // Continue with empty requests array
    }
    
    // ตรวจสอบว่าตาราง pending_tsic_updates มีอยู่จริงหรือไม่
    let total = 0;
    let totalPages = 1;
    
    try {
      let countResults = [];
      try {
        const result = await query(countSql, countParams);
        // MySQL returns results as [rows, fields]
        if (result && Array.isArray(result) && result.length > 0) {
          // Ensure we have an array of rows
          countResults = Array.isArray(result[0]) ? result[0] : [];
        }
      } catch (countError) {
        console.error('Error executing count query:', countError);
      }
      
      // ตรวจสอบผลลัพธ์และคำนวณการแบ่งหน้า
      console.log('Count results:', countResults); // เพิ่ม log เพื่อดูผลลัพธ์
      
      if (countResults && countResults.length > 0) {
        // ตรวจสอบว่ามี total หรือไม่
        if ('total' in countResults[0]) {
          total = countResults[0].total;
        } else if ('COUNT(*)' in countResults[0]) {
          // บางครั้ง MySQL อาจจะส่งคืนชื่อคอลัมน์เป็น COUNT(*)
          total = countResults[0]['COUNT(*)'];
        }
        
        totalPages = Math.ceil(total / limit);
      }
    } catch (error) {
      console.error('Error calculating pagination:', error);
      // ใช้ค่าเริ่มต้นสำหรับการแบ่งหน้า
      total = requests.length;
      totalPages = 1;
    }
    
    // Return response
    return NextResponse.json({
      success: true,
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error fetching TSIC update requests:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไข TSIC' },
      { status: 500 }
    );
  }
}
