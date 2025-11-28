import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
const membershipLocationCache = new Map();

// GET /api/admin/membership-requests/location
// Returns membership signup counts by company province with optional filters
export async function GET(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const memberTypeParam = (searchParams.get("memberType") || "all").toUpperCase();

    const year = Number(yearParam) || now.getFullYear();
    const month = Math.min(Math.max(Number(monthParam) || now.getMonth() + 1, 1), 12);
    const memberType = ["IC", "OC", "AM", "AC"].includes(memberTypeParam) ? memberTypeParam : "ALL";

    const cacheKey = JSON.stringify({ year, month, memberType });
    if (isProd && membershipLocationCache.has(cacheKey)) {
      const cached = membershipLocationCache.get(cacheKey);
      if (cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.payload);
      }
      membershipLocationCache.delete(cacheKey);
    }

    // We use address_type = '2' (ที่อยู่จัดส่งเอกสาร/ที่อยู่หลักบริษัท) for province
    let queryText;
    let params;

    if (memberType === "OC") {
      queryText =
        `SELECT a.province AS name, COUNT(*) AS count
         FROM MemberRegist_OC_Address a
         JOIN MemberRegist_OC_Main m ON a.main_id = m.id
         WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY a.province
         ORDER BY count DESC, a.province ASC`;
      params = [year, month];
    } else if (memberType === "AC") {
      queryText =
        `SELECT a.province AS name, COUNT(*) AS count
         FROM MemberRegist_AC_Address a
         JOIN MemberRegist_AC_Main m ON a.main_id = m.id
         WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY a.province
         ORDER BY count DESC, a.province ASC`;
      params = [year, month];
    } else if (memberType === "AM") {
      queryText =
        `SELECT a.province AS name, COUNT(*) AS count
         FROM MemberRegist_AM_Address a
         JOIN MemberRegist_AM_Main m ON a.main_id = m.id
         WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY a.province
         ORDER BY count DESC, a.province ASC`;
      params = [year, month];
    } else if (memberType === "IC") {
      queryText =
        `SELECT a.province AS name, COUNT(*) AS count
         FROM MemberRegist_IC_Address a
         JOIN MemberRegist_IC_Main m ON a.main_id = m.id
         WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
         GROUP BY a.province
         ORDER BY count DESC, a.province ASC`;
      params = [year, month];
    } else {
      queryText =
        `SELECT province AS name, SUM(cnt) AS count
         FROM (
           SELECT a.province, COUNT(*) AS cnt
           FROM MemberRegist_OC_Address a
           JOIN MemberRegist_OC_Main m ON a.main_id = m.id
           WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
           GROUP BY a.province
           UNION ALL
           SELECT a.province, COUNT(*) AS cnt
           FROM MemberRegist_AC_Address a
           JOIN MemberRegist_AC_Main m ON a.main_id = m.id
           WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
           GROUP BY a.province
           UNION ALL
           SELECT a.province, COUNT(*) AS cnt
           FROM MemberRegist_AM_Address a
           JOIN MemberRegist_AM_Main m ON a.main_id = m.id
           WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
           GROUP BY a.province
           UNION ALL
           SELECT a.province, COUNT(*) AS cnt
           FROM MemberRegist_IC_Address a
           JOIN MemberRegist_IC_Main m ON a.main_id = m.id
           WHERE a.address_type = '2' AND YEAR(m.created_at) = ? AND MONTH(m.created_at) = ?
           GROUP BY a.province
         ) AS combined
         GROUP BY province
         ORDER BY count DESC, province ASC`;
      params = [year, month, year, month, year, month, year, month];
    }

    const rows = await query(queryText, params);

    const byProvince = rows.map((r) => ({ name: r.name || "ไม่ระบุ", count: Number(r.count) || 0 }));
    const total = byProvince.reduce((sum, r) => sum + (r.count || 0), 0);

    const responseBody = {
      success: true,
      data: {
        year,
        month,
        memberType: memberType === "ALL" ? "all" : memberType,
        total,
        byProvince,
      },
    };

    if (isProd) {
      membershipLocationCache.set(cacheKey, {
        payload: responseBody,
        expiresAt: Date.now() + TWELVE_HOURS_MS,
      });
    }

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("Error fetching membership location stats:", err);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงสถิติการสมัครสมาชิกตามจังหวัด" },
      { status: 500 },
    );
  }
}
