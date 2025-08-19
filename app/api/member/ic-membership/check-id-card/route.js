import { getConnection } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  let connection;
  try {
    const { idCardNumber } = await request.json();
    
    if (!idCardNumber || idCardNumber.length !== 13) {
      return NextResponse.json(
        { 
          valid: false, 
          exists: null,
          message: 'เลขบัตรประชาชนต้องมี 13 หลัก' 
        },
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
      // พบเลขบัตรประชาชนในระบบแล้ว = ไม่สามารถใช้ได้
      const member = results[0];
      return NextResponse.json(
        { 
          valid: false,  // ไม่ valid เพราะใช้ไปแล้ว
          exists: true,  // มีอยู่ในระบบแล้ว
          status: member.status,
          message: `หมายเลขบัตรประชาชนนี้ได้ถูกใช้ในการสมัครไปแล้ว หากท่านเป็นเจ้าของบัตรประชาชนนี้ กรุณาติดต่อฝ่ายทะเบียนสมาชิก`
        },
        { status: 200 }
      );
    }
    
    // ไม่พบในระบบ = สามารถใช้ได้
    return NextResponse.json(
      { 
        valid: true,   // valid เพราะยังไม่ถูกใช้
        exists: false, // ไม่มีในระบบ
        message: 'สามารถใช้เลขบัตรประชาชนนี้ได้' 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error checking ID card:', error);
    return NextResponse.json(
      { 
        valid: false,
        exists: null,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน' 
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}