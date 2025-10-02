import { NextResponse } from "next/server";
import { getConnection } from "@/app/lib/db";
import { getUserFromSession } from "@/app/lib/userAuth";

export async function GET(request, { params }) {
  let connection;

  try {
    const { id } = await params;

    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = user.id;
    connection = await getConnection();

    // Fetch the specific rejected application
    const [rejectedApp] = await connection.execute(
      `
      SELECT 
        r.id,
        r.membership_type,
        r.membership_id,
        r.rejection_data,
        r.admin_note,
        r.created_at,
        r.is_active,
        CASE 
          WHEN r.membership_type = 'oc' THEN oc.company_name_th
          WHEN r.membership_type = 'ac' THEN ac.company_name_th  
          WHEN r.membership_type = 'am' THEN am.company_name_th
          WHEN r.membership_type = 'ic' THEN CONCAT(ic.first_name_th, ' ', ic.last_name_th)
        END as application_name,
        CASE 
          WHEN r.membership_type = 'oc' THEN oc.rejection_reason
          WHEN r.membership_type = 'ac' THEN ac.rejection_reason  
          WHEN r.membership_type = 'am' THEN am.rejection_reason
          WHEN r.membership_type = 'ic' THEN ic.rejection_reason
        END as rejection_reason
      FROM MemberRegist_Reject_DATA r
      LEFT JOIN MemberRegist_OC_Main oc ON r.membership_type = 'oc' AND r.membership_id = oc.id
      LEFT JOIN MemberRegist_AC_Main ac ON r.membership_type = 'ac' AND r.membership_id = ac.id
      LEFT JOIN MemberRegist_AM_Main am ON r.membership_type = 'am' AND r.membership_id = am.id
      LEFT JOIN MemberRegist_IC_Main ic ON r.membership_type = 'ic' AND r.membership_id = ic.id
      WHERE r.id = ? AND r.user_id = ? AND r.is_active = 1
    `,
      [id, userId],
    );

    if (!rejectedApp.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Rejected application not found or access denied",
        },
        { status: 404 },
      );
    }

    const app = rejectedApp[0];

    // Parse the rejection data
    let rejectionData = {};
    try {
      rejectionData = JSON.parse(app.rejection_data);
    } catch (error) {
      console.error("Error parsing rejection data:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid rejection data format",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: app.id,
        membershipType: app.membership_type,
        membershipId: app.membership_id,
        applicationName: app.application_name,
        rejectionReason: app.rejection_reason,
        adminNote: app.admin_note,
        createdAt: app.created_at,
        rejectionData: rejectionData,
      },
    });
  } catch (error) {
    console.error("Error fetching rejected application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch rejected application",
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}

// DELETE endpoint to cancel/remove a rejected application
export async function DELETE(request, { params }) {
  let connection;

  try {
    const { id } = await params;

    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const userId = user.id;
    connection = await getConnection();

    // Begin transaction
    await connection.beginTransaction();

    try {
      // Verify ownership and get rejection data
      const [rejectedApp] = await connection.execute(
        `
        SELECT membership_type, membership_id 
        FROM MemberRegist_Reject_DATA 
        WHERE id = ? AND user_id = ? AND is_active = 1
      `,
        [id, userId],
      );

      if (!rejectedApp.length) {
        throw new Error("Rejected application not found or access denied");
      }

      const { membership_type, membership_id } = rejectedApp[0];

      // Mark rejection data as inactive (cancelled)
      await connection.execute(
        `
        UPDATE MemberRegist_Reject_DATA 
        SET is_active = 0, updated_at = NOW() 
        WHERE id = ?
      `,
        [id],
      );

      // Update the main application status to cancelled (status = 3)
      const tableMap = {
        oc: "MemberRegist_OC_Main",
        am: "MemberRegist_AM_Main",
        ac: "MemberRegist_AC_Main",
        ic: "MemberRegist_IC_Main",
      };

      const mainTable = tableMap[membership_type];
      await connection.execute(
        `
        UPDATE ${mainTable} 
        SET status = 3 
        WHERE id = ?
      `,
        [membership_id],
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Application cancelled successfully",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error cancelling rejected application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to cancel application",
      },
      { status: 500 },
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {}
    }
  }
}
