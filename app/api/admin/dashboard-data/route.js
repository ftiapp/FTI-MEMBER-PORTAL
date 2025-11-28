import { getAdminFromSession } from "../../../lib/adminAuth";
import { query } from "../../../lib/db";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";

// Cache only the counts globally. Admin info will always be taken from the
// current session to avoid cross-user leakage when multiple admins use
// the system on the same server instance.
let dashboardCache = { counts: null, expiresAt: 0 };

export async function GET(request) {
  try {
    // Verify admin session (always using the current request's session)
    const admin = await getAdminFromSession();
    if (!admin) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let counts;

    // Try to serve counts from cache in production
    if (isProd && dashboardCache.counts && dashboardCache.expiresAt > Date.now()) {
      counts = dashboardCache.counts;
    } else {
      // Get all counts in a single database query using subqueries
      const countsQuery = `
        SELECT
          (SELECT COUNT(*) FROM FTI_Original_Membership WHERE Admin_Submit = 0) AS verifications_count,
          (SELECT COUNT(*) FROM FTI_Portal_User_Profile_Update_Requests WHERE status = 'pending') AS profile_updates_count,
          (SELECT COUNT(*) FROM FTI_Original_Membership_Pending_Address_Updates WHERE status = 'pending') AS address_updates_count,
          (SELECT COUNT(*) FROM FTI_Portal_Guest_Contact_Messages WHERE status = 'unread') AS guest_messages_count,
          (SELECT COUNT(*) FROM FTI_Original_Membership_Pending_Product_Updates WHERE status = 'pending') AS product_updates_count,
          (
            (SELECT COUNT(*) FROM MemberRegist_OC_Main WHERE status = 0) +
            (SELECT COUNT(*) FROM MemberRegist_AM_Main WHERE status = 0) +
            (SELECT COUNT(*) FROM MemberRegist_AC_Main WHERE status = 0) +
            (SELECT COUNT(*) FROM MemberRegist_IC_Main WHERE status = 0)
          ) AS membership_requests_count
      `;

      const [countsResult] = await query(countsQuery);

      counts = {
        verifications: countsResult.verifications_count || 0,
        profileUpdates: countsResult.profile_updates_count || 0,
        addressUpdates: countsResult.address_updates_count || 0,
        guestMessages: countsResult.guest_messages_count || 0,
        productUpdates: countsResult.product_updates_count || 0,
        membershipRequests: countsResult.membership_requests_count || 0,
      };

      if (isProd) {
        dashboardCache = {
          counts,
          expiresAt: Date.now() + ONE_DAY_MS,
        };
      }
    }

    const responseBody = {
      success: true,
      counts,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        adminLevel: admin.adminLevel || admin.admin_level || 0,
        canCreate: admin.canCreate,
        canUpdate: admin.canUpdate,
      },
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
