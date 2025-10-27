import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

/**
 * GET /api/member/rejections/[id]
 * Get detailed information about a specific rejection
 * Returns CURRENT data from main tables (not history snapshot)
 */
export async function GET(request, { params }) {
  let connection;

  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { id } = await params;
    connection = await getConnection();

    // Get rejection info
    const [rejections] = await connection.execute(
      `SELECT * FROM MemberRegist_Rejections WHERE id = ? AND user_id = ?`,
      [id, user.id]
    );

    if (!rejections.length) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลการปฏิเสธ" },
        { status: 404 }
      );
    }

    const rejection = rejections[0];
    const { membership_type, membership_id } = rejection;

    // Fetch CURRENT data from main tables
    const tableMap = {
      oc: "MemberRegist_OC_Main",
      ac: "MemberRegist_AC_Main",
      am: "MemberRegist_AM_Main",
      ic: "MemberRegist_IC_Main",
    };

    const [mainRecords] = await connection.execute(
      `SELECT * FROM ${tableMap[membership_type]} WHERE id = ? AND user_id = ?`,
      [membership_id, user.id]
    );

    if (!mainRecords.length) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลใบสมัคร" },
        { status: 404 }
      );
    }

    const main = mainRecords[0];

    // Fetch related data based on type
    let formData = { main };

    if (membership_type === 'oc' || membership_type === 'ac') {
      const [representatives] = await connection.execute(
        `SELECT * FROM MemberRegist_${membership_type.toUpperCase()}_Representatives WHERE main_id = ?`,
        [membership_id]
      );
      const [products] = await connection.execute(
        `SELECT * FROM MemberRegist_${membership_type.toUpperCase()}_Products WHERE main_id = ?`,
        [membership_id]
      );
      const [businessTypes] = await connection.execute(
        `SELECT * FROM MemberRegist_${membership_type.toUpperCase()}_BusinessTypes WHERE main_id = ?`,
        [membership_id]
      );
      const [businessTypeOther] = await connection.execute(
        `SELECT * FROM MemberRegist_${membership_type.toUpperCase()}_BusinessTypeOther WHERE main_id = ?`,
        [membership_id]
      );
      const [industryGroups] = await connection.execute(
        `SELECT * FROM MemberRegist_${membership_type.toUpperCase()}_IndustryGroups WHERE main_id = ?`,
        [membership_id]
      );
      const [provinceChapters] = await connection.execute(
        `SELECT * FROM MemberRegist_${membership_type.toUpperCase()}_ProvinceChapters WHERE main_id = ?`,
        [membership_id]
      );

      formData = {
        main,
        representatives: representatives || [],
        products: products || [],
        businessTypes: businessTypes || [],
        businessTypeOther: businessTypeOther.length > 0 ? businessTypeOther[0] : null,
        industryGroups: industryGroups || [],
        provinceChapters: provinceChapters || [],
      };
    } else if (membership_type === 'am') {
      const [representatives] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_Representatives WHERE main_id = ?`,
        [membership_id]
      );
      const [products] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_Products WHERE main_id = ?`,
        [membership_id]
      );
      const [businessTypes] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_BusinessTypes WHERE main_id = ?`,
        [membership_id]
      );
      const [businessTypeOther] = await connection.execute(
        `SELECT * FROM MemberRegist_AM_BusinessTypeOther WHERE main_id = ?`,
        [membership_id]
      );

      formData = {
        main,
        representatives: representatives || [],
        products: products || [],
        businessTypes: businessTypes || [],
        businessTypeOther: businessTypeOther.length > 0 ? businessTypeOther[0] : null,
      };
    } else if (membership_type === 'ic') {
      const [products] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_Products WHERE main_id = ?`,
        [membership_id]
      );
      const [businessTypes] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_BusinessTypes WHERE main_id = ?`,
        [membership_id]
      );
      const [businessTypeOther] = await connection.execute(
        `SELECT * FROM MemberRegist_IC_BusinessTypeOther WHERE main_id = ?`,
        [membership_id]
      );

      formData = {
        main,
        products: products || [],
        businessTypes: businessTypes || [],
        businessTypeOther: businessTypeOther.length > 0 ? businessTypeOther[0] : null,
      };
    }

    // Get conversation count
    const [convCount] = await connection.execute(
      `SELECT COUNT(*) as count FROM MemberRegist_Rejection_Conversations WHERE rejection_id = ?`,
      [id]
    );

    // Mark admin messages as read
    await connection.execute(
      `UPDATE MemberRegist_Rejection_Conversations 
       SET is_read = 1, read_at = NOW()
       WHERE rejection_id = ? AND sender_type = 'admin' AND is_read = 0`,
      [id]
    );

    await connection.execute(
      `UPDATE MemberRegist_Rejections SET unread_member_count = 0 WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        rejectionId: rejection.id,
        membershipType: membership_type,
        membershipId: membership_id,
        historySnapshotId: rejection.history_snapshot_id,
        applicationName: membership_type === 'ic' 
          ? `${main.first_name_th} ${main.last_name_th}`
          : main.company_name_th,
        status: main.status,
        rejectionStatus: rejection.status,
        rejectionReason: rejection.rejection_reason,
        resubmissionCount: rejection.resubmission_count,
        rejectedAt: rejection.rejected_at,
        conversationCount: convCount[0].count,
        formData,
      },
    });
  } catch (error) {
    console.error("Error fetching rejection details:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
