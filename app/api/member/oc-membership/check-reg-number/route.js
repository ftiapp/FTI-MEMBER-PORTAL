import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/app/lib/db';

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

    // Validate company registration number
    if (!companyRegNumber || companyRegNumber.length !== 13) {
      return new Response(JSON.stringify({ error: 'เลขทะเบียนนิติบุคคลไม่ถูกต้อง' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if company registration number exists in the database
    const existingApplication = await db.query(
      `SELECT status FROM OCmember_Info WHERE company_reg_number = ? LIMIT 1`,
      [companyRegNumber]
    );

    if (existingApplication.length > 0) {
      const status = existingApplication[0].status;
      
      if (status === 1) { // Pending
        return new Response(JSON.stringify({ 
          exists: true, 
          message: 'เลขทะเบียนนิติบุคคลนี้มีการสมัครที่อยู่ระหว่างการพิจารณา' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (status === 2) { // Approved
        return new Response(JSON.stringify({ 
          exists: true, 
          message: 'เลขทะเบียนนิติบุคคลนี้เป็นสมาชิกอยู่แล้ว' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else { // Rejected or other status
        return new Response(JSON.stringify({ 
          exists: false, 
          message: 'สามารถสมัครได้' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // If not found, return success
    return new Response(JSON.stringify({ 
      exists: false, 
      message: 'สามารถสมัครได้' 
    }), {
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
