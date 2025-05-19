import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { query } from '@/app/lib/db';
import { authOptions } from '@/app/lib/auth';

/**
 * API endpoint to submit TSIC code updates
 * POST /api/member/submit-tsic-update
 */
export async function POST(request) {
  try {
    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' },
        { status: 401 }
      );
    }

    // Get request body
    const { 
      memberCode, 
      categoryCode, 
      categoryName, 
      tsicCode, 
      tsicDescription, 
      categoryOrder,
      positiveList = 'No'
    } = await request.json();

    // Validate required fields
    const requiredFields = { memberCode, categoryCode, tsicCode, tsicDescription, categoryOrder };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง',
          missingFields 
        },
        { status: 400 }
      );
    }


    // Check if user has permission to update this member code
    if (session.user.role !== 'admin' && session.user.memberCode !== memberCode) {
      return NextResponse.json(
        { success: false, message: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้' },
        { status: 403 }
      );
    }

    // Check if TSIC code exists
    const [tsicCheck] = await query(
      'SELECT 1 FROM tsic_categories WHERE tsic_code = ?',
      [tsicCode]
    );

    if (!tsicCheck || tsicCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'รหัส TSIC ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Check for duplicate pending request
    const [existing] = await query(
      `SELECT id FROM pending_tsic_updates 
       WHERE member_code = ? 
       AND tsic_code = ? 
       AND status = 'pending'`,
      [memberCode, tsicCode]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'มีการร้องขอแก้ไขรหัส TSIC นี้อยู่ระหว่างรอการอนุมัติอยู่แล้ว' 
        },
        { status: 400 }
      );
    }

    // Insert new pending TSIC update
    await query(
      `INSERT INTO pending_tsic_updates (
        user_id, 
        member_code, 
        category_code,
        category_name,
        tsic_code,
        tsic_description,
        category_order,
        positive_list,
        request_date,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')`,
      [
        session.user.id,
        memberCode,
        categoryCode,
        categoryName,
        tsicCode,
        tsicDescription,
        categoryOrder,
        positiveList
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'ส่งคำขอแก้ไขรหัส TSIC เรียบร้อยแล้ว รอการอนุมัติจากผู้ดูแลระบบ'
    });

  } catch (error) {
    console.error('Error submitting TSIC update:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
