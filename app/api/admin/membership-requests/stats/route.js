import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { checkAdminSession } from "@/app/lib/auth";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
// เปิด cache เสมอใน production และสามารถเปิดใน dev ได้ผ่าน env: NEXT_PUBLIC_ENABLE_STATS_CACHE=1
const isProd = process.env.NODE_ENV === "production";
const enableCache = isProd || process.env.NEXT_PUBLIC_ENABLE_STATS_CACHE === "1";
let membershipStatsCache = { data: null, expiresAt: 0 };

export async function GET() {
  try {
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    if (enableCache && membershipStatsCache.data && membershipStatsCache.expiresAt > Date.now()) {
      return NextResponse.json(membershipStatsCache.data);
    }

    const conn = await getConnection();
    try {
      // Build count queries per table (including resubmitted = status 4)
      const countByStatus = async (table, useIc = false) => {
        const [pending] = await conn.query(`SELECT COUNT(*) AS c FROM ${table} WHERE status = 0`);
        const [approved] = await conn.query(`SELECT COUNT(*) AS c FROM ${table} WHERE status = 1`);
        const [rejected] = await conn.query(`SELECT COUNT(*) AS c FROM ${table} WHERE status = 2`);
        const [resubmitted] = await conn.query(
          `SELECT COUNT(*) AS c FROM ${table} WHERE status = 4`,
        );
        return {
          pending: pending[0]?.c || 0,
          approved: approved[0]?.c || 0,
          rejected: rejected[0]?.c || 0,
          resubmitted: resubmitted[0]?.c || 0,
        };
      };

      const oc = await countByStatus("MemberRegist_OC_Main");
      const ac = await countByStatus("MemberRegist_AC_Main");
      const am = await countByStatus("MemberRegist_AM_Main");
      const ic = await countByStatus("MemberRegist_IC_Main", true);

      const sum = (k) => oc[k] + ac[k] + am[k] + ic[k];

      const overall = {
        pending: sum("pending"),
        approved: sum("approved"),
        rejected: sum("rejected"),
        resubmitted: sum("resubmitted"),
      };
      const total =
        overall.pending + overall.approved + overall.rejected + overall.resubmitted;

      const responseBody = {
        success: true,
        data: {
          overall: { ...overall, total },
          perType: {
            oc: {
              ...oc,
              total: oc.pending + oc.approved + oc.rejected + oc.resubmitted,
            },
            ac: {
              ...ac,
              total: ac.pending + ac.approved + ac.rejected + ac.resubmitted,
            },
            am: {
              ...am,
              total: am.pending + am.approved + am.rejected + am.resubmitted,
            },
            ic: {
              ...ic,
              total: ic.pending + ic.approved + ic.rejected + ic.resubmitted,
            },
          },
        },
      };

      if (enableCache) {
        const ttl = FIVE_MINUTES_MS;
        membershipStatsCache = {
          data: responseBody,
          expiresAt: Date.now() + ttl,
        };
      }

      return NextResponse.json(responseBody);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("Error fetching membership stats:", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงสถิติ" },
      { status: 500 },
    );
  }
}
