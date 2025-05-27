import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

/**
 * API endpoint to update the display mode of a company logo
 * @route POST /api/member/logo/update-display
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, displayMode, userId: bodyUserId } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ไม่พบ ID โลโก้' }, { status: 400 });
    }

    if (!displayMode || !['circle', 'square'].includes(displayMode)) {
      return NextResponse.json({ success: false, message: 'รูปแบบการแสดงผลไม่ถูกต้อง' }, { status: 400 });
    }

    // ใช้ user ID จาก body หรือจาก token
    let userId = bodyUserId;
    
    // ถ้าไม่มี userId จาก body ให้ใช้จาก token
    if (!userId) {
      // Verify user authentication - using await with cookies()
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;

      if (!token) {
        return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลการเข้าสู่ระบบ' }, { status: 401 });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.id;
      } catch (err) {
        console.error('JWT verification error:', err);
        return NextResponse.json({ success: false, message: 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง' }, { status: 401 });
      }
    }

    // Get logo information before updating
    const logoResult = await query(
      'SELECT member_code FROM company_logos WHERE id = ?',
      [id]
    );

    if (logoResult.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลโลโก้' }, { status: 404 });
    }

    const memberCode = logoResult[0].member_code;

    // Update display mode
    await query(
      'UPDATE company_logos SET display_mode = ?, updated_at = NOW() WHERE id = ?',
      [displayMode, id]
    );

    // Log the action in Member_portal_User_log
    try {
      // Get client IP and user agent from headers
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || 'Unknown';

      // ตรวจสอบว่า userId มีอยู่จริงในฐานข้อมูล
      const userCheckQuery = await query(
        'SELECT id FROM users WHERE id = ? LIMIT 1',
        [userId]
      );
      
      let validUserId;
      
      if (userCheckQuery.length > 0) {
        // ใช้ userId ที่มีอยู่จริง
        validUserId = userCheckQuery[0].id;
      } else {
        // ถ้าไม่พบ userId ในฐานข้อมูล ให้หา user อื่นแทน
        console.log('User ID not found in database, searching for alternative user');
        
        // ค้นหา user ที่เป็น admin
        const adminUserQuery = await query(
          'SELECT id FROM users WHERE role = "admin" LIMIT 1'
        );
        
        if (adminUserQuery.length > 0) {
          validUserId = adminUserQuery[0].id;
          console.log(`Using admin user ID: ${validUserId}`);
        } else {
          // ค้นหา user คนแรกในระบบ
          const anyUserQuery = await query(
            'SELECT id FROM users ORDER BY id LIMIT 1'
          );
          
          if (anyUserQuery.length > 0) {
            validUserId = anyUserQuery[0].id;
            console.log(`Using first available user ID: ${validUserId}`);
          } else {
            // ถ้าไม่มี user ในระบบเลย ให้ข้ามการบันทึก log
            console.error('No users found in database, skipping log entry');
            throw new Error('No users found in database');
          }
        }
      }

      await query(
        `INSERT INTO Member_portal_User_log 
         (user_id, action, details, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          validUserId,
          'logo_update',
          `Updated logo display mode to ${displayMode} for member ${memberCode}`,
          ip,
          userAgent
        ]
      );
    } catch (err) {
      console.error('Error logging action to Member_portal_User_log:', err);
      // Continue anyway, this is not critical
    }

    // Fetch the updated logo data
    const updatedLogo = await query(
      'SELECT id, member_code, logo_url, public_id, display_mode, created_at, updated_at FROM company_logos WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      success: true,
      data: updatedLogo[0],
      message: 'อัปเดตรูปแบบการแสดงผลสำเร็จ'
    });
  } catch (error) {
    console.error('Error in update logo display mode API:', error);
    return NextResponse.json({
      success: false,
      message: `เกิดข้อผิดพลาดในการอัปเดตรูปแบบการแสดงผล: ${error.message || 'ไม่ทราบสาเหตุ'}`
    }, { status: 500 });
  }
}
