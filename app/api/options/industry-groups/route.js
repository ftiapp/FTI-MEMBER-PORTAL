import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/app/lib/db';

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

    // Fetch industry groups from the database
    const [industryGroups] = await db.query(
      'SELECT id, name_th, name_en FROM industry_groups ORDER BY name_th'
    );

    // Format the response
    const formattedGroups = industryGroups.map(group => ({
      id: group.id,
      nameThai: group.name_th,
      nameEnglish: group.name_en
    }));

    return new Response(JSON.stringify(formattedGroups), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching industry groups:', error);
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่มอุตสาหกรรม' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
