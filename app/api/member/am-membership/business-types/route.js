import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Define business types
    const businessTypes = [
      { id: 'manufacturer', name: 'ผู้ผลิต (Manufacturer)' },
      { id: 'distributor', name: 'ผู้จัดจำหน่าย (Distributor)' },
      { id: 'exporter', name: 'ผู้ส่งออก (Exporter)' },
      { id: 'importer', name: 'ผู้นำเข้า (Importer)' },
      { id: 'service_provider', name: 'ผู้ให้บริการ (Service Provider)' },
      { id: 'other', name: 'อื่นๆ (Other)' }
    ];

    return new Response(JSON.stringify({ businessTypes }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching business types:', error);
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทธุรกิจ' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
