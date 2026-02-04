export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

async function getJwt() {
  const mod = await import("jsonwebtoken");
  return mod.default || mod;
}

/**
 * API endpoint to verify if the current user owns or has access to a specific member
 * @param {Request} request - The request object
 * @returns {Promise<NextResponse>} - JSON response with ownership verification result
 */
export async function GET(request) {
  try {
    // Get member code from query parameters
    const { searchParams } = new URL(request.url);
    const memberCode = searchParams.get("memberCode");

    if (!memberCode) {
      return NextResponse.json(
        { success: false, message: "ไม่ได้ระบุรหัสสมาชิก" },
        { status: 400 },
      );
    }

    // Get token from cookies
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลการเข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    // Extract token from cookies
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});

    const token = cookies["token"];
    if (!token) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลการเข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    // Verify token
    const secret = process.env.JWT_SECRET || "your-secret-key";
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลการเข้าสู่ระบบไม่ถูกต้องหรือหมดอายุ" },
        { status: 401 },
      );
    }

    // Check if user is admin (admins have access to all members)
    if (decoded.isAdmin) {
      return NextResponse.json({
        success: true,
        isOwner: true,
        message: "แอดมินสามารถเข้าถึงข้อมูลสมาชิกทั้งหมดได้",
      });
    }

    // For regular FTI_Portal_User, check if they own the member
    const userId = decoded.userId;

    // First check in FTI_Original_Membership table
    const companiesResult = await query(
      `SELECT id FROM FTI_Original_Membership WHERE user_id = ? AND MEMBER_CODE = ?`,
      [userId, memberCode],
    );

    if (companiesResult.length > 0) {
      return NextResponse.json({
        success: true,
        isOwner: true,
        message: "ผู้ใช้มีสิทธิ์เข้าถึงข้อมูลสมาชิกนี้",
      });
    }

    // If we can't find the member in FTI_Original_Membership, deny access
    return NextResponse.json(
      {
        success: false,
        isOwner: false,
        message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลสมาชิกนี้",
      },
      { status: 403 },
    );
  } catch (error) {
    console.error("Error verifying ownership:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์", error: error.message },
      { status: 500 },
    );
  }
}
