import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { executeQuery, getConnection } from '@/app/lib/db';

/**
 * API endpoint to get product/TSIC update status for a user
 */
export async function GET(request) {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    // If no userId provided, try to get from JWT token
    if (!userId) {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      
      if (!token) {
        return NextResponse.json({ 
          success: false, 
          message: 'ไม่พบข้อมูลผู้ใช้' 
        }, { status: 401 });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        console.error('Error verifying token:', error);
        return NextResponse.json({ 
          success: false, 
          message: 'โทเคนไม่ถูกต้อง' 
        }, { status: 401 });
      }
    }
    
    // ตรวจสอบว่า userId มีค่าและเป็นตัวเลข
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        success: false, 
        message: 'รหัสผู้ใช้ไม่ถูกต้อง'
      }, { status: 400 });
    }

    // Fetch TSIC updates from the database (pending_tsic_updates table)
    const query = `
      SELECT p.id, p.member_code, p.tsic_data, p.request_date, p.status, p.admin_comment,
             c.company_name_th as company_name
      FROM pending_tsic_updates p
      LEFT JOIN companies_Member c ON p.member_code = c.MEMBER_CODE
      WHERE p.user_id = ?
      ORDER BY p.request_date DESC
    `;
    
    const connection = await getConnection();
    const tsicUpdates = await executeQuery(connection, query, [userId]);
    
    // Format the response
    if (tsicUpdates && tsicUpdates.length > 0) {
      const formattedUpdates = tsicUpdates.map(update => {
        // Parse the TSIC data JSON
        let tsicData = [];
        try {
          tsicData = JSON.parse(update.tsic_data);
        } catch (e) {
          console.error('Error parsing TSIC data:', e);
        }
        
        // Count the number of TSIC codes
        let tsicCount = 0;
        if (Array.isArray(tsicData)) {
          tsicCount = tsicData.length;
        } else if (tsicData && typeof tsicData === 'object') {
          // Handle case where tsicData is an object with categories
          Object.keys(tsicData).forEach(key => {
            if (Array.isArray(tsicData[key])) {
              tsicCount += tsicData[key].length;
            }
          });
        }
        
        return {
          id: update.id,
          title: 'อัปเดตรหัส TSIC',
          description: `บริษัท: ${update.company_name || update.member_code} (${tsicCount} รายการ)`,
          status: update.status || 'pending',
          created_at: update.request_date,
          type: 'อัปเดตรหัส TSIC',
          member_code: update.member_code,
          company_name: update.company_name,
          tsic_data: tsicData,
          admin_comment: update.admin_comment
        };
      });
      
      return NextResponse.json({
        success: true,
        updates: formattedUpdates
      });
    } else {
      // Return a placeholder if no TSIC updates found
      return NextResponse.json({
        success: true,
        updates: [{
          id: Date.now(),
          title: 'อัปเดตรหัส TSIC',
          description: 'คุณยังไม่มีการอัปเดตรหัส TSIC',
          status: 'none',
          created_at: new Date().toISOString(),
          type: 'อัปเดตรหัส TSIC'
        }]
      });
    }
  } catch (error) {
    console.error('Error fetching TSIC status:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะรหัส TSIC',
      error: error.message
    }, { status: 500 });
  }
}
