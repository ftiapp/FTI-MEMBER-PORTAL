import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณาเข้าสู่ระบบ' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'completed') {
      // Count submitted applications
      let totalCount = 0;

      // Count IC Applications
      try {
        const icCountQuery = `
          SELECT COUNT(*) as count
          FROM MemberRegist_IC_Main m
          WHERE m.user_id = ? AND m.status IN (0, 1)
        `;
        const icResult = await query(icCountQuery, [userId]);
        totalCount += icResult[0]?.count || 0;
      } catch (error) {
        console.error('Error counting IC applications:', error);
      }

      // Count OC Applications
      try {
        const ocCountQuery = `
          SELECT COUNT(*) as count
          FROM MemberRegist_OC_Main m
          WHERE m.user_id = ? AND m.status IN (0, 1)
        `;
        const ocResult = await query(ocCountQuery, [userId]);
        totalCount += ocResult[0]?.count || 0;
      } catch (error) {
        console.error('Error counting OC applications:', error);
      }

      // Count AC Applications
      try {
        const acCountQuery = `
          SELECT COUNT(*) as count
          FROM MemberRegist_AC_Main m
          WHERE m.user_id = ? AND m.status IN (0, 1)
        `;
        const acResult = await query(acCountQuery, [userId]);
        totalCount += acResult[0]?.count || 0;
      } catch (error) {
        console.error('Error counting AC applications:', error);
      }

      // Count AM Applications
      try {
        const amCountQuery = `
          SELECT COUNT(*) as count
          FROM MemberRegist_AM_Main m
          WHERE m.user_id = ? AND m.status IN (0, 1)
        `;
        const amResult = await query(amCountQuery, [userId]);
        totalCount += amResult[0]?.count || 0;
      } catch (error) {
        console.error('Error counting AM applications:', error);
      }

      return NextResponse.json({
        success: true,
        count: totalCount
      });

    } else if (type === 'drafts') {
      // Count draft applications (this would need to be implemented based on your draft storage logic)
      return NextResponse.json({
        success: true,
        count: 0 // Placeholder - implement based on your draft storage
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid type parameter'
    }, { status: 400 });

  } catch (error) {
    console.error('Error counting applications:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    }, { status: 500 });
  }
}
