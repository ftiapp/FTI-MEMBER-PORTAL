import { query } from '@/app/lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/ic-membership/check-id-card
 * ตรวจสอบเลขบัตรประชาชนว่ามีในระบบแล้วหรือไม่
 */
export async function POST(request) {
  try {
    // รับข้อมูลจาก request body
    const { idCardNumber } = await request.json();
    
    if (!idCardNumber) {
      return NextResponse.json(
        { error: 'กรุณาระบุเลขบัตรประชาชน' },
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่าเลขบัตรประชาชนมีในระบบใหม่แล้วหรือไม่
    const checkIdCardQuery = `
      SELECT id, status FROM MemberRegist_IC_Main WHERE id_card_number = ?
    `;
    
    const idCardResult = await query(checkIdCardQuery, [idCardNumber]);
    
    // ถ้ามีเลขบัตรประชาชนในระบบแล้ว
    if (idCardResult.length > 0) {
      // ถ้าสถานะเป็น 0 (รอพิจารณา)
      if (idCardResult[0].status === 0) {
        return NextResponse.json(
          { 
            isAvailable: false,
            error: 'คำขอสมัครสมาชิกของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน' 
          },
          { status: 200 }
        );
      }
      
      // ถ้าสถานะเป็น 1 (อนุมัติ)
      if (idCardResult[0].status === 1) {
        return NextResponse.json(
          { 
            isAvailable: false,
            error: 'หมายเลขบัตรประชาชนนี้ได้เป็นสมาชิกแล้ว กรุณาตรวจสอบหน้าข้อมูลสมาชิก' 
          },
          { status: 200 }
        );
      }
    }
    
    // ถ้าไม่พบเลขบัตรประชาชนในระบบ หรือพบแต่สถานะเป็น 2 (ปฏิเสธ) สามารถสมัครใหม่ได้
    return NextResponse.json({ isAvailable: true }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน' },
      { status: 500 }
    );
  }
}
