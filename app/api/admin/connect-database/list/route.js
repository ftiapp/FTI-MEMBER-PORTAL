import { NextResponse } from 'next/server';
import { getAdminFromSession } from '../../../../lib/adminAuth';
import { connectDB } from '../../../../lib/db';

export async function GET() {
  try {
    // ตรวจสอบสิทธิ์แอดมิน
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const connection = await connectDB();

    // ดึงข้อมูลสมาชิกที่ได้รับการอนุมัติแล้วแต่ยังไม่มี member_code
    const queries = [
      // OC Members
      `SELECT 
        id, 'OC' as member_type, company_name_th, company_name_en, tax_id, approved_at
       FROM MemberRegist_OC_Main 
       WHERE status = 1 AND (member_code IS NULL OR member_code = '')`,
      
      // AC Members  
      `SELECT 
        id, 'AC' as member_type, company_name_th, company_name_en, tax_id, approved_at
       FROM MemberRegist_AC_Main 
       WHERE status = 1 AND (member_code IS NULL OR member_code = '')`,
       
      // AM Members
      `SELECT 
        id, 'AM' as member_type, company_name_th, company_name_en, tax_id, approved_at
       FROM MemberRegist_AM_Main 
       WHERE status = 1 AND (member_code IS NULL OR member_code = '')`
    ];

    let allMembers = [];

    try {
      // รวมข้อมูลจากทุกตาราง
      for (const query of queries) {
        try {
          const [rows] = await connection.query(query);
          allMembers = allMembers.concat(rows);
        } catch (error) {
          console.error('Error executing query:', query, error);
          // ถ้าตารางไม่มีอยู่ ให้ข้ามไป
          continue;
        }
      }

      // เรียงลำดับตามวันที่อนุมัติ (ใหม่สุดก่อน)
      allMembers.sort((a, b) => new Date(b.approved_at) - new Date(a.approved_at));
    } finally {
      // Release the connection back to the pool instead of ending it
      connection.release();
    }

    return NextResponse.json({
      success: true,
      members: allMembers
    });

  } catch (error) {
    console.error('Error fetching approved members:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
