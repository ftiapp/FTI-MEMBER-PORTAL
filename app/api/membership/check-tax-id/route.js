import { NextResponse } from 'next/server';
import * as db from '@/app/lib/db';

export async function POST(request) {
  try {
    const { taxId, memberType } = await request.json();

    // Validate input
    if (!taxId || !memberType) {
      return NextResponse.json(
        { message: 'กรุณาระบุเลขประจำตัวผู้เสียภาษีและประเภทสมาชิก' },
        { status: 400 }
      );
    }

    // Check if the tax ID already exists in the database with status pending (0) or approved (1) in ANY member type
    // If status is 2 (rejected/cancelled), the tax ID can be used again
    const sql = `
      SELECT m.id, m.status, mt.type_code as member_type_code
      FROM Membership_members m
      JOIN Membership_member_types mt ON m.member_type_id = mt.id
      WHERE m.identification_number = ? 
      AND m.identification_type = 'TAX_ID'
      AND (m.status = 0 OR m.status = 1)
    `;
    
    const result = await db.query(sql, [taxId]);

    if (result.length > 0) {
      const member = result[0];
      const existingMemberType = member.member_type_code;
      
      if (member.status === 0) {
        return NextResponse.json(
          { 
            message: `เลขประจำตัวผู้เสียภาษีนี้มีคำขอสมัครสมาชิกประเภท ${existingMemberType} อยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน`, 
            status: 'pending',
            existingMemberType
          },
          { status: 400 }
        );
      } else if (member.status === 1) {
        return NextResponse.json(
          { 
            message: `เลขประจำตัวผู้เสียภาษีนี้ได้เป็นสมาชิกประเภท ${existingMemberType} แล้ว ไม่สามารถสมัครสมาชิกประเภทอื่นได้`, 
            status: 'approved',
            existingMemberType 
          },
          { status: 400 }
        );
      }
    }

    // If tax ID is available
    return NextResponse.json({ message: 'เลขประจำตัวผู้เสียภาษีสามารถใช้สมัครสมาชิกได้', status: 'available' });
  } catch (error) {
    console.error('Error checking tax ID:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี' },
      { status: 500 }
    );
  }
}
