import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getAdminFromSession } from "@/app/lib/adminAuth";

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";
let userCountStatCache = { data: null, expiresAt: 0 };

/**
 * GET /api/admin/UserCountStat
 *
 * Returns simplified statistics about FTI_Portal_User for dashboard display
 * Requires admin authentication
 */
export async function GET(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    if (isProd && userCountStatCache.data && userCountStatCache.expiresAt > Date.now()) {
      return NextResponse.json(userCountStatCache.data);
    }

    // Get total FTI_Portal_User
    const totalUsersQuery = `
      SELECT COUNT(*) as total FROM FTI_Portal_User
    `;
    const totalUsersResult = await query(totalUsersQuery);
    const totalUsers = parseInt(totalUsersResult[0]?.total) || 0;

    // Get FTI_Portal_User with email_verified = 1 (verified)
    const verifiedUsersQuery = `
      SELECT COUNT(*) as count
      FROM FTI_Portal_User
      WHERE email_verified = 1
    `;
    const verifiedUsersResult = await query(verifiedUsersQuery);
    const verifiedUsers = parseInt(verifiedUsersResult[0]?.count) || 0;

    // Get FTI_Portal_User with email_verified = 0 (not verified)
    const notVerifiedUsersQuery = `
      SELECT COUNT(*) as count
      FROM FTI_Portal_User
      WHERE email_verified = 0
    `;
    const notVerifiedUsersResult = await query(notVerifiedUsersQuery);
    const notVerifiedUsers = parseInt(notVerifiedUsersResult[0]?.count) || 0;

    // Get FTI_Portal_User by role
    const usersByRoleQuery = `
      SELECT role, COUNT(*) as count
      FROM FTI_Portal_User
      GROUP BY role
    `;
    const usersByRoleResult = await query(usersByRoleQuery);

    // Format role counts
    const roleCounts = {
      admin: 0,
      member: 0,
    };

    usersByRoleResult.forEach((item) => {
      if (item.role && roleCounts.hasOwnProperty(item.role)) {
        roleCounts[item.role] = parseInt(item.count) || 0;
      }
    });

    const responseBody = {
      success: true,
      counts: {
        total: totalUsers,
        verified: verifiedUsers,
        notVerified: notVerifiedUsers,
        roleCounts,
      },
    };

    if (isProd) {
      userCountStatCache = {
        data: responseBody,
        expiresAt: Date.now() + TWELVE_HOURS_MS,
      };
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("Error fetching user count statistics:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลจำนวนผู้ใช้งาน" },
      { status: 500 },
    );
  }
}
