import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/lib/db';

export async function POST(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const { companyRegNumber } = await request.json();
    
    if (!companyRegNumber) {
      return new Response(JSON.stringify({ error: 'กรุณาระบุเลขทะเบียนนิติบุคคล' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if the company registration number already exists in the database
    // with status pending (1) or approved (2)
    const [results] = await db.query(
      'SELECT id, status FROM ACmember_Info WHERE company_reg_number = ? AND status IN (1, 2)',
      [companyRegNumber]
    );

    if (results.length > 0) {
      const status = results[0].status === 1 ? 'pending' : 'approved';
      return new Response(JSON.stringify({ 
        exists: true, 
        status,
        message: `เลขทะเบียนนิติบุคคลนี้${status === 'pending' ? 'มีคำขอสมัครที่รอการพิจารณาอยู่' : 'ได้รับการอนุมัติแล้ว'}` 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ exists: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error checking company registration number:', error);
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการตรวจสอบเลขทะเบียนนิติบุคคล' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
