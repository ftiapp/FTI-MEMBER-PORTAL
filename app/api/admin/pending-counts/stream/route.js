import { getAdminFromSession } from "../../../../lib/adminAuth";
import { query } from "../../../../lib/db";

export async function GET(request) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { signal } = request;

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        const send = (obj) => {
          const chunk = `data: ${JSON.stringify(obj)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        };

        const countsQuery = `
          SELECT
            (SELECT COUNT(*) FROM companies_Member WHERE Admin_Submit = 0) AS verifications_count,
            (SELECT COUNT(*) FROM profile_update_requests WHERE status = 'pending') AS profile_updates_count,
            (SELECT COUNT(*) FROM pending_address_updates WHERE status = 'pending') AS address_updates_count,
            (SELECT COUNT(*) FROM guest_contact_messages WHERE status = 'unread') AS guest_messages_count,
            (SELECT COUNT(*) FROM pending_product_updates WHERE status = 'pending') AS product_updates_count,
            (
              (SELECT COUNT(*) FROM MemberRegist_OC_Main WHERE status = 0) +
              (SELECT COUNT(*) FROM MemberRegist_AM_Main WHERE status = 0) +
              (SELECT COUNT(*) FROM MemberRegist_AC_Main WHERE status = 0) +
              (SELECT COUNT(*) FROM MemberRegist_IC_Main WHERE status = 0)
            ) AS membership_requests_count
        `;

        let intervalId = null;

        const tick = async () => {
          try {
            const [countsResult] = await query(countsQuery);
            const payload = {
              success: true,
              counts: {
                verifications: countsResult.verifications_count || 0,
                profileUpdates: countsResult.profile_updates_count || 0,
                addressUpdates: countsResult.address_updates_count || 0,
                guestMessages: countsResult.guest_messages_count || 0,
                productUpdates: countsResult.product_updates_count || 0,
                membershipRequests: countsResult.membership_requests_count || 0,
              },
            };
            send(payload);
          } catch (err) {
            send({ success: false, error: "stream_query_error" });
          }
        };

        // send initial payload immediately
        tick();
        // then every 15 seconds
        intervalId = setInterval(tick, 15000);

        if (signal) {
          signal.addEventListener("abort", () => {
            clearInterval(intervalId);
            controller.close();
          });
        }
      },
      cancel() {},
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
