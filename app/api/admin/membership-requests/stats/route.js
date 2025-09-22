import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';

export async function GET() {
  try {
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const conn = await getConnection();
    try {
      // Build count queries per table
      const countByStatus = async (table, useIc = false) => {
        const [pending] = await conn.query(`SELECT COUNT(*) AS c FROM ${table} WHERE status = 0`);
        const [approved] = await conn.query(`SELECT COUNT(*) AS c FROM ${table} WHERE status = 1`);
        const [rejected] = await conn.query(`SELECT COUNT(*) AS c FROM ${table} WHERE status = 2`);
        return {
          pending: pending[0]?.c || 0,
          approved: approved[0]?.c || 0,
          rejected: rejected[0]?.c || 0,
        };
      };

      const oc = await countByStatus('MemberRegist_OC_Main');
      const ac = await countByStatus('MemberRegist_AC_Main');
      const am = await countByStatus('MemberRegist_AM_Main');
      const ic = await countByStatus('MemberRegist_IC_Main', true);

      const sum = (k) => (oc[k] + ac[k] + am[k] + ic[k]);

      const overall = {
        pending: sum('pending'),
        approved: sum('approved'),
        rejected: sum('rejected'),
      };
      const total = overall.pending + overall.approved + overall.rejected;

      return NextResponse.json({
        success: true,
        data: {
          overall: { ...overall, total },
          perType: {
            oc: { ...oc, total: oc.pending + oc.approved + oc.rejected },
            ac: { ...ac, total: ac.pending + ac.approved + ac.rejected },
            am: { ...am, total: am.pending + am.approved + am.rejected },
            ic: { ...ic, total: ic.pending + ic.approved + ic.rejected },
          }
        }
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Error fetching membership stats:', err);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงสถิติ' }, { status: 500 });
  }
}
