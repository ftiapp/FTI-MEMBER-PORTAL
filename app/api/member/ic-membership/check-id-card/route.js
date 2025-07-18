import { getConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  let connection;
  try {
    const { idCardNumber } = await request.json();
    
    if (!idCardNumber || idCardNumber.length !== 13) {
      return NextResponse.json(
        { error: 'เลขบัตรประชาชนต้องมี 13 หลัก' },
        { status: 400 }
      );
    }
    
    // ตรวจสอบในฐานข้อมูล
    connection = await getConnection();
    const [results] = await connection.query(
      `SELECT id, status FROM MemberRegist_IC_Main WHERE id_card_number = ?`,
      [idCardNumber]
    );
    
    if (results.length > 0) {
      const member = results[0];
      return NextResponse.json(
        { 
          exists: true,
          status: member.status,
          message: 'เลขบัตรประชาชนนี้มีการสมัครแล้ว' 
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { exists: false, message: 'สามารถใช้เลขบัตรประชาชนนี้ได้' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error checking ID card:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
