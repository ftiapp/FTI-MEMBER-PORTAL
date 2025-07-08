import { NextResponse } from 'next/server';

// Mock database function to simulate database operations
const mockDbQuery = async (query, ...params) => {
  console.log('Mock DB Query:', query, params);
  return { rows: [] };
};

export async function POST(request) {
  try {
    const { idCardNumber, memberType } = await request.json();

    // Validate input
    if (!idCardNumber || !memberType) {
      return NextResponse.json(
        { message: 'กรุณาระบุเลขบัตรประชาชนและประเภทสมาชิก' },
        { status: 400 }
      );
    }

    // Check if the ID card already exists in the database with status pending (0) or approved (1) in ANY member type
    // If status is 2 (rejected/cancelled), the ID card can be used again
    const result = await mockDbQuery(
      'SELECT id, status, (SELECT code FROM Regist_Membership_member_types WHERE id = Regist_Membership_members.member_type_id) as member_type_code FROM Regist_Membership_members WHERE id_card_number = $1 AND (status = 0 OR status = 1)',
      idCardNumber
    );

    if (result.rows.length > 0) {
      const member = result.rows[0];
      const existingMemberType = member.member_type_code;
      
      if (member.status === 0) {
        return NextResponse.json(
          { 
            message: `เลขบัตรประชาชนนี้มีคำขอสมัครสมาชิกประเภท ${existingMemberType} อยู่ระหว่างการพิจารณา กรุณารอให้เสร็จสิ้นก่อน`, 
            status: 'pending',
            existingMemberType
          },
          { status: 400 }
        );
      } else if (member.status === 1) {
        return NextResponse.json(
          { 
            message: `เลขบัตรประชาชนนี้ได้เป็นสมาชิกประเภท ${existingMemberType} แล้ว ไม่สามารถสมัครสมาชิกประเภทอื่นได้`, 
            status: 'approved',
            existingMemberType
          },
          { status: 400 }
        );
      }
    }

    // If ID card doesn't exist or has status other than 0 or 1
    return NextResponse.json({ message: 'สามารถสมัครสมาชิกได้', status: 'available' });
  } catch (error) {
    console.error('Error checking ID card:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' },
      { status: 500 }
    );
  }
}
