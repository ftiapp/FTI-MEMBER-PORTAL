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

    // Fetch province chapters from the database
    const [provinceChapters] = await db.query(
      'SELECT id, name_th, name_en FROM province_chapters ORDER BY name_th'
    );

    // Format the response
    const formattedChapters = provinceChapters.map(chapter => ({
      id: chapter.id,
      nameThai: chapter.name_th,
      nameEnglish: chapter.name_en
    }));

    return new Response(JSON.stringify(formattedChapters), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching province chapters:', error);
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสภาอุตสาหกรรมจังหวัด' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
