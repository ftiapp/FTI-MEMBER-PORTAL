'use server';

import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taxId = searchParams.get('taxId');

    if (!taxId) {
      return NextResponse.json(
        { isUnique: false, message: 'กรุณาระบุเลขประจำตัวผู้เสียภาษี' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าเลขประจำตัวผู้เสียภาษีนี้มีในระบบหรือไม่
    // ใช้ตาราง Membership_members และตรวจสอบตามประเภทสมาชิก
    
    // ตรวจสอบเลขประจำตัวผู้เสียภาษีในตาราง Membership_members
    // โดยตรวจสอบทั้งประเภทสมาชิกสามัญ (OC), สมาคม (AC) และสมาพันธ์ (AM)
    const result = await query(
      `SELECT m.status, mt.type_code 
       FROM Membership_members m 
       JOIN Membership_member_types mt ON m.member_type_id = mt.id 
       WHERE m.identification_number = ? 
       AND m.identification_type = 'TAX_ID' 
       AND mt.type_code IN ('11', '12', '21')`,
      [taxId]
    );

    if (result.length > 0) {
      const status = result[0].status;
      const typeCode = result[0].type_code;
      
      // กำหนดข้อความตามประเภทสมาชิก
      let memberType = '';
      if (typeCode === '11') { // สมาชิกสามัญ (สน)
        memberType = 'สามัญ';
      } else if (typeCode === '12') { // สมาคม (สส)
        memberType = 'สมาคม';
      } else if (typeCode === '21') { // สมาพันธ์ (ทน)
        memberType = 'สมาพันธ์';
      }
      
      if (status === 0) {
        return NextResponse.json({
          isUnique: false,
          message: `คำขอสมัครสมาชิก${memberType}ของท่านอยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน`
        });
      } else if (status === 1) {
        return NextResponse.json({
          isUnique: false,
          message: `เลขประจำตัวผู้เสียภาษีนี้ได้เป็นสมาชิก${memberType}แล้ว`
        });
      }
    }

    // ถ้าไม่พบในทุกตาราง แสดงว่าเป็นเลขที่ไม่ซ้ำ
    return NextResponse.json({ isUnique: true });
  } catch (error) {
    console.error('Error checking tax ID uniqueness:', error);
    return NextResponse.json(
      { 
        isUnique: false, 
        message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี กรุณาลองใหม่อีกครั้ง' 
      },
      { status: 500 }
    );
  }
}
