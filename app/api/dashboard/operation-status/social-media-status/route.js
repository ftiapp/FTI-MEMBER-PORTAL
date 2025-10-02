import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { executeQuery, getConnection } from "@/app/lib/db";

/**
 * API endpoint to get social media update status for a user
 */
export async function GET(request) {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");

    // If no userId provided, try to get from JWT token
    if (!userId) {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            message: "ไม่พบข้อมูลผู้ใช้",
          },
          { status: 401 },
        );
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        console.error("Error verifying token:", error);
        return NextResponse.json(
          {
            success: false,
            message: "โทเคนไม่ถูกต้อง",
          },
          { status: 401 },
        );
      }
    }

    // ตรวจสอบว่า userId มีค่าและเป็นตัวเลข
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสผู้ใช้ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    // First, get member codes associated with this user
    const memberQuery = `
      SELECT MEMBER_CODE 
      FROM companies_Member 
      WHERE user_id = ?
    `;

    const connection = await getConnection();
    const memberResults = await executeQuery(connection, memberQuery, [userId]);

    // If no member codes found, return placeholder
    if (!memberResults || memberResults.length === 0) {
      return NextResponse.json({
        success: true,
        updates: [
          {
            id: Date.now(),
            title: "อัปเดตโซเชียลมีเดีย",
            description: "คุณยังไม่มีการอัปเดตโซเชียลมีเดีย",
            status: "none",
            created_at: new Date().toISOString(),
            type: "อัปเดตโซเชียลมีเดีย",
          },
        ],
      });
    }

    // Get member codes as array
    const memberCodes = memberResults.map((result) => result.MEMBER_CODE);

    // Use IN clause to get social media updates for these member codes
    const placeholders = memberCodes.map(() => "?").join(",");
    const socialMediaQuery = `
      SELECT sm.id, sm.member_code, sm.platform, sm.url, sm.display_name, sm.created_at, 
             c.COMPANY_NAME as company_name
      FROM member_social_media sm
      LEFT JOIN companies_Member c ON sm.member_code = c.MEMBER_CODE
      WHERE sm.member_code IN (${placeholders})
      ORDER BY sm.created_at DESC
    `;

    const socialMediaUpdates = await executeQuery(connection, socialMediaQuery, memberCodes);

    // Format the response
    if (socialMediaUpdates && socialMediaUpdates.length > 0) {
      // Group by created_at to show updates made in the same session
      const groupedUpdates = {};

      socialMediaUpdates.forEach((update) => {
        const date = new Date(update.created_at).toISOString().split("T")[0];
        if (!groupedUpdates[date]) {
          groupedUpdates[date] = {
            date: date,
            member_code: update.member_code,
            company_name: update.company_name,
            items: [],
            created_at: update.created_at,
          };
        }

        groupedUpdates[date].items.push({
          id: update.id,
          platform: update.platform,
          url: update.url,
          display_name: update.display_name,
        });
      });

      // Convert to array and format for display
      const formattedUpdates = Object.values(groupedUpdates).map((group) => ({
        id: Date.now() + Math.random(),
        title: "อัปเดตโซเชียลมีเดีย",
        description: `บริษัท: ${group.company_name || group.member_code} (${group.items.length} รายการ)`,
        status: "approved", // Social media updates are immediately approved
        created_at: group.created_at,
        type: "อัปเดตโซเชียลมีเดีย",
        member_code: group.member_code,
        company_name: group.company_name,
        items: group.items,
      }));

      return NextResponse.json({
        success: true,
        updates: formattedUpdates,
      });
    } else {
      // Return a placeholder if no social media updates found
      return NextResponse.json({
        success: true,
        updates: [
          {
            id: Date.now(),
            title: "อัปเดตโซเชียลมีเดีย",
            description: "คุณยังไม่มีการอัปเดตโซเชียลมีเดีย",
            status: "none",
            created_at: new Date().toISOString(),
            type: "อัปเดตโซเชียลมีเดีย",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error fetching social media status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถานะโซเชียลมีเดีย",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
