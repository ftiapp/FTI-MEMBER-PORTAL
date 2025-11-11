import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch all operations status
    const operations = await fetchOperationStatus(userId);

    return NextResponse.json({ operations });
  } catch (error) {
    console.error("Error fetching operation status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function fetchOperationStatus(userId) {
  try {
    // Fetch all data in parallel with individual error handling
    const results = await Promise.allSettled([
      // Member verification status
      query(
        `SELECT id, user_id, MEMBER_CODE, company_name, company_type, Admin_Submit, reject_reason, created_at 
         FROM FTI_Original_Membership 
         WHERE user_id = ? 
         ORDER BY created_at DESC`,
        [userId],
      ),
      // Profile update requests
      query(
        `SELECT id, user_id, new_firstname, new_lastname, status, reject_reason, created_at 
         FROM FTI_Portal_User_Profile_Update_Requests 
         WHERE user_id = ? 
         ORDER BY created_at DESC`,
        [userId],
      ),
      // Contact messages
      query(
        `SELECT id, user_id, subject, message, status, created_at 
         FROM FTI_Portal_User_Contact_Messages 
         WHERE user_id = ? 
         ORDER BY created_at DESC`,
        [userId],
      ),
      // Address updates
      query(
        `SELECT id, user_id, member_code, status, request_date as created_at 
         FROM FTI_Original_Membership_Pending_Address_Updates 
         WHERE user_id = ? 
         ORDER BY request_date DESC`,
        [userId],
      ),
      // Product updates
      query(
        `SELECT id, user_id, member_code, status, created_at 
         FROM FTI_Original_Membership_Pending_Product_Updates 
         WHERE user_id = ? 
         ORDER BY created_at DESC`,
        [userId],
      ),
      // Social media updates from log
      query(
        `SELECT id, user_id, action, details, created_at 
         FROM FTI_Portal_User_Logs 
         WHERE user_id = ? AND action IN ('social_media_update', 'social_media_add', 'social_media_delete') 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [userId],
      ),
      // Logo updates from log
      query(
        `SELECT id, user_id, action, details, created_at 
         FROM FTI_Portal_User_Logs 
         WHERE user_id = ? AND action IN ('logo_add', 'logo_update', 'logo_delete') 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [userId],
      ),
      // TSIC updates (assuming same structure as Address/Product updates)
      query(
        `SELECT id, user_id, member_code, status, request_date as created_at 
         FROM FTI_Original_Membership_Pending_Tsic_Updates 
         WHERE user_id = ? 
         ORDER BY request_date DESC`,
        [userId],
      ),
    ]);

    // Extract successful results with fallback to empty arrays
    const [
      memberVerifications,
      profileUpdates,
      contactMessages,
      addressUpdates,
      productUpdates,
      socialMediaUpdates,
      logoUpdates,
      tsicUpdates,
    ] = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value || [];
      } else {
        console.error(`Query ${index} failed:`, result.reason);
        return [];
      }
    });

    // Transform all data types with safe checks
    const memberOperations = (memberVerifications || []).map((v) => ({
      id: `member-${v.id}`,
      type: "member_verification",
      title: `ยืนยันสมาชิกเดิม: ${v.company_name} (${v.MEMBER_CODE})`,
      description: `ประเภทบริษัท: ${v.company_type}`,
      status: v.Admin_Submit === 0 ? "pending" : v.Admin_Submit === 1 ? "approved" : "rejected",
      reason: v.reject_reason,
      created_at: v.created_at,
    }));

    const profileOperations = (profileUpdates || []).map((u) => ({
      id: `profile-${u.id}`,
      type: "profile_update",
      title: "แก้ไขข้อมูลส่วนตัว",
      description: `แก้ไขชื่อและนามสกุลเป็น ${u.new_firstname} ${u.new_lastname}`,
      status: u.status,
      reason: u.reject_reason,
      created_at: u.created_at,
    }));

    const contactOperations = (contactMessages || []).map((c) => ({
      id: `contact-${c.id}`,
      type: "contact_message",
      title: `ข้อความติดต่อ: ${c.subject || "ไม่มีหัวข้อ"}`,
      description: c.message?.substring(0, 100) + (c.message?.length > 100 ? "..." : ""),
      status: c.status === "replied" ? "approved" : c.status === "pending" ? "pending" : "rejected",
      created_at: c.created_at,
    }));

    const addressOperations = (addressUpdates || []).map((a) => ({
      id: `address-${a.id}`,
      type: "address_update",
      title: `แก้ไขที่อยู่ (${a.member_code || "N/A"})`,
      description: "คำขอแก้ไขที่อยู่",
      status: a.status || "pending",
      created_at: a.created_at,
    }));

    const productOperations = (productUpdates || []).map((p) => ({
      id: `product-${p.id}`,
      type: "product_update",
      title: `แก้ไขข้อมูลสินค้า (${p.member_code || "N/A"})`,
      description: "คำขอแก้ไขข้อมูลสินค้า",
      status: p.status || "pending",
      created_at: p.created_at,
    }));

    const socialOperations = (socialMediaUpdates || []).map((s) => {
      // Parse details JSON if available
      let detailsObj = {};
      try {
        detailsObj = s.details ? JSON.parse(s.details) : {};
      } catch (e) {
        // ignore parse errors
      }
      return {
        id: `social-${s.id}`,
        type: "social_media_update",
        title: `อัปเดตโซเชียลมีเดีย`,
        description:
          s.action === "social_media_add"
            ? "เพิ่มโซเชียลมีเดีย"
            : s.action === "social_media_delete"
              ? "ลบโซเชียลมีเดีย"
              : "แก้ไขโซเชียลมีเดีย",
        status: "approved",
        created_at: s.created_at,
      };
    });

    const logoOperations = (logoUpdates || []).map((l) => ({
      id: `logo-${l.id}`,
      type: "logo_update",
      title: `จัดการโลโก้`,
      description:
        l.action === "logo_add"
          ? "อัปโหลดโลโก้"
          : l.action === "logo_delete"
            ? "ลบโลโก้"
            : "แก้ไขโลโก้",
      status: "approved",
      created_at: l.created_at,
    }));

    const tsicOperations = (tsicUpdates || []).map((t) => ({
      id: `tsic-${t.id}`,
      type: "tsic_update",
      title: `แก้ไขรหัส TSIC (${t.member_code || "N/A"})`,
      description: "คำขอแก้ไขรหัส TSIC",
      status: t.status || "pending",
      created_at: t.created_at,
    }));

    // Combine all operations and sort by creation date (newest first)
    const allOperations = [
      ...memberOperations,
      ...profileOperations,
      ...contactOperations,
      ...addressOperations,
      ...productOperations,
      ...socialOperations,
      ...logoOperations,
      ...tsicOperations,
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return allOperations;
  } catch (error) {
    console.error("Error in fetchOperationStatus:", error);
    throw error;
  }
}
