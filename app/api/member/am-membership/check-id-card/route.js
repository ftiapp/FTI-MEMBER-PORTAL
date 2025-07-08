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
    const { idCardNumber } = await request.json();
    
    if (!idCardNumber) {
      return new Response(JSON.stringify({ error: 'กรุณาระบุเลขบัตรประชาชน' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if the ID card number already exists in the database
    // with status pending (1) or approved (2)
    const [results] = await db.query(
      'SELECT id, status FROM AMmember_Info WHERE id_card_number = ? AND status IN (1, 2)',
      [idCardNumber]
    );

    if (results.length > 0) {
      const status = results[0].status === 1 ? 'pending' : 'approved';
      return new Response(JSON.stringify({ 
        exists: true, 
        status,
        message: `เลขบัตรประชาชนนี้${status === 'pending' ? 'มีคำขอสมัครที่รอการพิจารณาอยู่' : 'ได้รับการอนุมัติแล้ว'}` 
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
    console.error('Error checking ID card number:', error);
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
