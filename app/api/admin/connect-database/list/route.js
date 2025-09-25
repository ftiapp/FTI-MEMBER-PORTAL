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
      // OC Members (join users)
      `SELECT 
        m.id, 'OC' as member_type, m.company_name_th, m.company_name_en, m.tax_id, m.approved_at, m.updated_at,
        u.firstname, u.lastname, u.email AS user_email, u.phone AS user_phone, u.name AS username
       FROM MemberRegist_OC_Main m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.status = 1 AND (m.member_code IS NULL OR m.member_code = '')`,
      
      // AC Members  (join users)
      `SELECT 
        m.id, 'AC' as member_type, m.company_name_th, m.company_name_en, m.tax_id, m.approved_at, m.updated_at,
        u.firstname, u.lastname, u.email AS user_email, u.phone AS user_phone, u.name AS username
       FROM MemberRegist_AC_Main m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.status = 1 AND (m.member_code IS NULL OR m.member_code = '')`,
       
      // AM Members (join users)
      `SELECT 
        m.id, 'AM' as member_type, m.company_name_th, m.company_name_en, m.tax_id, m.approved_at, m.updated_at,
        u.firstname, u.lastname, u.email AS user_email, u.phone AS user_phone, u.name AS username
       FROM MemberRegist_AM_Main m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.status = 1 AND (m.member_code IS NULL OR m.member_code = '')`,

      // IC Members (join users). Alias full name as company_name_*; IC has no tax_id.
      `SELECT 
        m.id, 'IC' as member_type,
        CONCAT(m.first_name_th, ' ', m.last_name_th) AS company_name_th,
        CONCAT(m.first_name_en, ' ', m.last_name_en) AS company_name_en,
        m.id_card_number AS tax_id,
        m.approved_at,
        m.updated_at,
        u.firstname, u.lastname, u.email AS user_email, u.phone AS user_phone, u.name AS username
       FROM MemberRegist_IC_Main m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.status = 1 AND (m.member_code IS NULL OR m.member_code = '')`
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
      allMembers.sort((a, b) => new Date(b.updated_at || b.approved_at) - new Date(a.updated_at || a.approved_at));
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
