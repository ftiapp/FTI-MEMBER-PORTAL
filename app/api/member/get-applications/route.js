import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { executeQueryWithoutTransaction } from '@/app/lib/db';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'draft' or 'completed'

    let applications = [];

    // Get completed applications for all member types
    const memberTypes = ['OC', 'IC', 'AM', 'AC'];
    const memberTypeMap = {
      'OC': 'สน',
      'IC': 'ทบ',
      'AM': 'สส',
      'AC': 'ทน'
    };

    for (const memberType of memberTypes) {
      try {
        const query = `
          SELECT 
            id,
            user_id,
            '${memberType}' as member_type,
            companyname as company_name,
            companyname_eng as company_name_eng,
            tax_id,
            member_code,
            status,
            created_at,
            updated_at,
            '${memberTypeMap[memberType]}' as member_type_th
          FROM MemberRegist_${memberType}_Main
          WHERE user_id = ? AND status IN (0, 1)
          ORDER BY created_at DESC
        `;
        
        const results = await executeQueryWithoutTransaction(query, [userId]);
        console.log(`Found ${results.length} ${memberType} applications for user ${userId}`);
        applications = applications.concat(results);
      } catch (error) {
        console.warn(`Could not fetch ${memberType} applications:`, error.message);
      }
    }

    return NextResponse.json({ 
      applications: applications || [],
      count: applications.length
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      details: error.message
    }, { status: 500 });
  }
}
