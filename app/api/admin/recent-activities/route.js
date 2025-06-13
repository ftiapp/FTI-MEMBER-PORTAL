import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { getAdminFromSession } from '../../../lib/adminAuth';

export async function GET(request) {
  try {
    // Check admin session
    const admin = await getAdminFromSession();
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5'); // แสดง 5 รายการต่อหน้า
    const offset = (page - 1) * limit;

    // Query to get total count of activities (excluding login and create_admin)
    const countResult = await query(
      `SELECT COUNT(*) as total FROM admin_actions_log 
       WHERE action_type NOT IN ('login', 'create_admin')`
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
        au.username as admin_name
      FROM 
        admin_actions_log aal
      LEFT JOIN 
        admin_users au ON aal.admin_id = au.id
      WHERE 
        aal.action_type NOT IN ('login', 'create_admin')
      ORDER BY 
        aal.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    );
    
    // ดึงข้อมูลผู้ใช้ทั้งหมดที่เกี่ยวข้องกับกิจกรรม
    const userIds = new Set();
    
    // วนลูปหา userId จาก description
    activities.forEach(activity => {
      try {
        const details = JSON.parse(activity.description);
        if (details && details.userId) {
          userIds.add(details.userId);
        }
      } catch (e) {
        // ไม่ใช่ JSON ไม่ต้องทำอะไร
      }
    });
    
    // ถ้ามี userId ให้ดึงข้อมูลผู้ใช้จากตาราง users
    let userMap = {};
    if (userIds.size > 0) {
      const userIdsArray = Array.from(userIds);
      const users = await query(
        `SELECT id, name, firstname, lastname, email FROM users WHERE id IN (${userIdsArray.map(() => '?').join(',')})`
        , userIdsArray
      );
      
      // สร้าง map ของผู้ใช้
      users.forEach(user => {
        userMap[user.id] = user;
      });
    }

    // Process the activities to make them more readable
    const processedActivities = activities.map(activity => {
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
        adminName: activity.admin_name || 'Unknown Admin',
        actionType: activity.action_type,
        targetId: activity.target_id,
        timestamp: activity.created_at,
        details: details,
        userId: userId
      };
      
      // ถ้ามี userId และมีข้อมูลผู้ใช้ใน userMap ให้เพิ่มข้อมูลผู้ใช้
      if (userId && userMap[userId]) {
        const user = userMap[userId];
        formattedActivity.user = {
          id: user.id,
          name: user.name,
          fullName: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
          email: user.email
        };
      }

      // Add readable description based on action type
      switch (activity.action_type) {
        case 'approve_member':
          formattedActivity.readableAction = `อนุมัติสมาชิก ${formattedActivity.user ? formattedActivity.user.name : `ID: ${activity.target_id}`}`;
          break;
        case 'reject_member':
          formattedActivity.readableAction = `ปฏิเสธสมาชิก ${formattedActivity.user ? formattedActivity.user.name : `ID: ${activity.target_id}`}`;
          break;
        case 'update_admin':
          formattedActivity.readableAction = `อัปเดตข้อมูลผู้ดูแลระบบ ID: ${activity.target_id}`;
          break;
        case 'contact_message_response':
          if (details.message_subject) {
            formattedActivity.readableAction = `ตอบกลับข้อความ: "${details.message_subject}" จาก ${details.user_email || 'ไม่ระบุอีเมล'}`;
          } else {
            formattedActivity.readableAction = `ตอบกลับข้อความ ID: ${activity.target_id}`;
          }
          break;
        case 'approve_profile_update':
          formattedActivity.readableAction = `อนุมัติการอัปเดตโปรไฟล์ของ ${formattedActivity.user ? formattedActivity.user.name : `ผู้ใช้ ID: ${details.userId || activity.target_id}`}`;
          break;
        case 'reject_profile_update':
          formattedActivity.readableAction = `ปฏิเสธการอัปเดตโปรไฟล์ของ ${formattedActivity.user ? formattedActivity.user.name : `ผู้ใช้ ID: ${details.userId || activity.target_id}`}`;
          break;
        default:
          formattedActivity.readableAction = `${activity.action_type} - ID: ${activity.target_id}`;
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
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent activities' },
      { status: 500 }
    );
  }
}
