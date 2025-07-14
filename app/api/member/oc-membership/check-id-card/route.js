import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const { idCardNumber } = data;

    if (!idCardNumber || idCardNumber.length !== 13) {
      return NextResponse.json(
        { error: 'เลขบัตรประชาชนไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบในตาราง MemberRegist_OC_Representatives ก่อน (ตารางใหม่)
    const newTableResult = await query(
      `SELECT r.id 
       FROM MemberRegist_OC_Representatives r
       JOIN MemberRegist_OC_Main m ON r.member_id = m.id
       WHERE r.id_card = ? AND (m.status = 0 OR m.status = 1)
       LIMIT 1`,
      [idCardNumber]
    );

    // ถ้าพบในตารางใหม่
    if (newTableResult.length > 0) {
      return NextResponse.json(
        { exists: true, message: 'เลขบัตรประชาชนนี้มีการสมัครที่อยู่ระหว่างการพิจารณาหรือเป็นสมาชิกอยู่แล้ว' },
        { status: 200 }
      );
    }

    // ตรวจสอบในตาราง OCmember_Representatives (ตารางเก่า) เผื่อมีข้อมูลเก่าอยู่
    const oldTableResult = await query(
      `SELECT r.id 
       FROM OCmember_Representatives r
       JOIN OCmember_Info i ON r.member_id = i.id
       WHERE r.id_card = ? AND (i.status = 1 OR i.status = 2)
       LIMIT 1`,
      [idCardNumber]
    );

    if (oldTableResult.length > 0) {
      return NextResponse.json(
        { exists: true, message: 'เลขบัตรประชาชนนี้มีการสมัครที่อยู่ระหว่างการพิจารณาหรือเป็นสมาชิกอยู่แล้ว' },
        { status: 200 }
      );
    }

    // ไม่พบข้อมูลในทั้งสองตาราง
    return NextResponse.json(
      { exists: false, message: 'เลขบัตรประชาชนนี้สามารถใช้สมัครสมาชิกได้' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error checking ID card:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน' },
      { status: 500 }
    );
  }
}
