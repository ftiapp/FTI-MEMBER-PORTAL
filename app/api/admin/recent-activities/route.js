import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { getAdminFromSession } from "../../../lib/adminAuth";

export async function GET(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json({ success: false, error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5"); // แสดง 5 รายการต่อหน้า
    const offset = (page - 1) * limit;

    // Query to get total count of activities (excluding login)
    const countResult = await query(
      `SELECT COUNT(*) as total FROM FTI_Portal_Admin_Actions_Logs 
       WHERE action_type NOT IN ('login')`,
    );
    const totalActivities = countResult[0].total;
    const totalPages = Math.ceil(totalActivities / limit);

    // Query to get activities with pagination
    const activities = await query(
      `SELECT 
        aal.id, 
        aal.admin_id, 
        aal.action_type, 
        aal.target_id, 
        aal.description, 
        aal.created_at,
        au.username as admin_name,
        target_admin.username as target_admin_name
      FROM 
        FTI_Portal_Admin_Actions_Logs aal
      LEFT JOIN 
        FTI_Portal_Admin_Users au ON aal.admin_id = au.id
      LEFT JOIN
        FTI_Portal_Admin_Users target_admin ON aal.target_id = target_admin.id AND aal.action_type IN ('create_admin', 'update_admin')
      WHERE 
        aal.action_type NOT IN ('login')
      ORDER BY 
        aal.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
    );

    // ดึงข้อมูลผู้ใช้ทั้งหมดที่เกี่ยวข้องกับกิจกรรม
    const userIds = new Set();

    // วนลูปหา userId จาก description
    activities.forEach((activity) => {
      try {
        const details = JSON.parse(activity.description);
        if (details && details.userId) {
          userIds.add(details.userId);
        }
      } catch (e) {
        // ไม่ใช่ JSON ไม่ต้องทำอะไร
      }
    });

    // ถ้ามี userId ให้ดึงข้อมูลผู้ใช้จากตาราง FTI_Portal_User
    let userMap = {};
    if (userIds.size > 0) {
      const userIdsArray = Array.from(userIds);
      const FTI_Portal_User = await query(
        `SELECT id, name, firstname, lastname, email, phone FROM FTI_Portal_User WHERE id IN (${userIdsArray.map(() => "?").join(",")})`,
        userIdsArray,
      );

      // สร้าง map ของผู้ใช้
      FTI_Portal_User.forEach((user) => {
        userMap[user.id] = user;
      });
    }

    // Process the activities to make them more readable
    const processedActivities = activities.map((activity) => {
      let readableDescription = activity.description;
      let details = {};
      let userId = null;

      try {
        // Try to parse the description as JSON
        details = JSON.parse(activity.description);
        if (details && details.userId) {
          userId = details.userId;
        }
      } catch (e) {
        // Not JSON, use as is
      }

      // Format based on action type
      let formattedActivity = {
        id: activity.id,
        adminId: activity.admin_id,
        adminName: activity.admin_name || "Unknown Admin",
        actionType: activity.action_type,
        targetId: activity.target_id,
        timestamp: activity.created_at,
        details: details,
        userId: userId,
      };

      // ถ้ามี userId และมีข้อมูลผู้ใช้ใน userMap ให้เพิ่มข้อมูลผู้ใช้
      if (userId && userMap[userId]) {
        const user = userMap[userId];
        formattedActivity.user = {
          id: user.id,
          name: user.name,
          fullName: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
          email: user.email,
          phone: user.phone,
        };
      }

      // Add readable description based on action type
      switch (activity.action_type) {
        case "approve_member":
          formattedActivity.readableAction = `อนุมัติสมาชิก ${formattedActivity.user ? `${formattedActivity.user.fullName} (${formattedActivity.user.email || "-"}, ${formattedActivity.user.phone || "-"})` : `ID: ${activity.target_id}`}`;
          break;
        case "reject_member":
          formattedActivity.readableAction = `ปฏิเสธสมาชิก ${formattedActivity.user ? `${formattedActivity.user.fullName} (${formattedActivity.user.email || "-"}, ${formattedActivity.user.phone || "-"})` : `ID: ${activity.target_id}`}`;
          break;
        case "create_admin":
          formattedActivity.readableAction = `สร้างผู้ดูแลระบบใหม่ ${activity.target_admin_name || `ID: ${activity.target_id}`}`;
          break;
        case "update_admin":
          if (activity.description && activity.description.includes("Reset Super Admin password")) {
            formattedActivity.readableAction = `รีเซ็ตรหัสผ่าน Super Admin`;
          } else if (activity.description && activity.description.includes("Activated")) {
            formattedActivity.readableAction = `เปิดใช้งานผู้ดูแลระบบ ${activity.target_admin_name || `ID: ${activity.target_id}`}`;
          } else if (activity.description && activity.description.includes("Deactivated")) {
            formattedActivity.readableAction = `ปิดใช้งานผู้ดูแลระบบ ${activity.target_admin_name || `ID: ${activity.target_id}`}`;
          } else {
            formattedActivity.readableAction = `อัปเดตข้อมูลผู้ดูแลระบบ ${activity.target_admin_name || `ID: ${activity.target_id}`}`;
          }
          break;
        case "contact_message_response":
          if (details.message_subject) {
            formattedActivity.readableAction = `ตอบกลับข้อความ: "${details.message_subject}" จาก ${details.user_email || "ไม่ระบุอีเมล"}`;
          } else {
            formattedActivity.readableAction = `ตอบกลับข้อความ ID: ${activity.target_id}`;
          }
          break;
        case "approve_profile_update":
          formattedActivity.readableAction = `อนุมัติการอัปเดตโปรไฟล์ของ ${formattedActivity.user ? `${formattedActivity.user.fullName} (${formattedActivity.user.email || "-"}, ${formattedActivity.user.phone || "-"})` : `ผู้ใช้ ID: ${details.userId || activity.target_id}`}`;
          break;
        case "reject_profile_update":
          formattedActivity.readableAction = `ปฏิเสธการอัปเดตโปรไฟล์ของ ${formattedActivity.user ? `${formattedActivity.user.fullName} (${formattedActivity.user.email || "-"}, ${formattedActivity.user.phone || "-"})` : `ผู้ใช้ ID: ${details.userId || activity.target_id}`}`;
          break;
        default:
          // ถ้าเป็นกรณีอื่นๆ ที่มี userId
          if (formattedActivity.user) {
            formattedActivity.readableAction = `${activity.action_type} - ${formattedActivity.user.fullName} (${formattedActivity.user.email || "-"}, ${formattedActivity.user.phone || "-"})`;
          } else {
            formattedActivity.readableAction = `${activity.action_type} - ID: ${activity.target_id}`;
          }
      }

      return formattedActivity;
    });

    return NextResponse.json({
      success: true,
      activities: processedActivities,
      pagination: {
        totalItems: totalActivities,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recent activities" },
      { status: 500 },
    );
  }
}
