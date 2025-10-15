import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { executeQuery, getConnection } from "@/app/lib/db";

/**
 * API endpoint to get logo update status for a user
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
      FROM FTI_Original_Membership 
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
            title: "อัปเดตโลโก้บริษัท",
            description: "คุณยังไม่มีการอัปเดตโลโก้บริษัท",
            status: "none",
            created_at: new Date().toISOString(),
            type: "อัปเดตโลโก้บริษัท",
          },
        ],
      });
    }

    // Get member codes as array
    const memberCodes = memberResults.map((result) => result.MEMBER_CODE);

    // Use IN clause to get logo updates for these member codes
    const placeholders = memberCodes.map(() => "?").join(",");
    const logoQuery = `
      SELECT l.id, l.member_code, l.logo_url, l.display_mode, l.created_at, 
             c.COMPANY_NAME as company_name
      FROM FTI_Original_Membership_Company_Logos l
      LEFT JOIN FTI_Original_Membership c ON l.member_code = c.MEMBER_CODE
      WHERE l.member_code IN (${placeholders})
      ORDER BY l.created_at DESC
    `;

    const logoUpdates = await executeQuery(connection, logoQuery, memberCodes);

    // Format the response
    if (logoUpdates && logoUpdates.length > 0) {
      const formattedUpdates = logoUpdates.map((update) => ({
        id: update.id,
        title: "อัปเดตโลโก้บริษัท",
        description: `บริษัท: ${update.company_name || update.member_code}`,
        status: "approved", // Logo updates are immediately approved
        created_at: update.created_at,
        type: "อัปเดตโลโก้บริษัท",
        member_code: update.member_code,
        company_name: update.company_name,
        logo_url: update.logo_url,
        display_mode: update.display_mode,
      }));

      return NextResponse.json({
        success: true,
        updates: formattedUpdates,
      });
    } else {
      // Return a placeholder if no logo updates found
      return NextResponse.json({
        success: true,
        updates: [
          {
            id: Date.now(),
            title: "อัปเดตโลโก้บริษัท",
            description: "คุณยังไม่มีการอัปเดตโลโก้",
            status: "none",
            created_at: new Date().toISOString(),
            type: "อัปเดตโลโก้บริษัท",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error fetching logo status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลสถานะโลโก้",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
