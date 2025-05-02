import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { executeQuery } from '@/app/lib/db';

/**
 * API route to verify if the current user is the owner of a specific member code
 * This is used for security to prevent unauthorized access to member details
 */
export async function GET(request) {
  try {
    // Get the JWT token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('jwt')?.value;

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่' 
      }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get the member code from the query parameters
    const { searchParams } = new URL(request.url);
    const memberCode = searchParams.get('memberCode');

    if (!memberCode) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่ได้ระบุรหัสสมาชิก' 
      }, { status: 400 });
    }

    // Query the database to check if the user owns this member code
    const query = `
      SELECT COUNT(*) as count 
      FROM companies_Member 
      WHERE user_id = ? AND MEMBER_CODE = ?
    `;
    
    const result = await executeQuery(query, [userId, memberCode]);
    
    // Check if any records were found
    const isOwner = result[0]?.count > 0;
    
    if (isOwner) {
      return NextResponse.json({ 
        success: true, 
        isOwner: true 
      });
    } else {
      // If not found in companies_Member, check if it's in the approved companies
      const approvedQuery = `
        SELECT COUNT(*) as count 
        FROM approved_companies 
        WHERE user_id = ? AND MEMBER_CODE = ?
      `;
      
      const approvedResult = await executeQuery(approvedQuery, [userId, memberCode]);
      const isApprovedOwner = approvedResult[0]?.count > 0;
      
      return NextResponse.json({ 
        success: true, 
        isOwner: isApprovedOwner,
        message: isApprovedOwner ? '' : 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลสมาชิกนี้'
      });
    }
  } catch (error) {
    console.error('Error verifying member ownership:', error);
    
    // Handle JWT verification errors specifically
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ 
        success: false, 
        message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' 
    }, { status: 500 });
  }
}
