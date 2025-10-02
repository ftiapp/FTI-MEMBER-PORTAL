import { NextResponse } from "next/server";
import * as db from "../../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { user_id, event_type, session_id } = body;
    const ip_address = req.headers.get("x-forwarded-for") || req.ip || "";
    const user_agent = req.headers.get("user-agent") || "";

    console.log("[log-login] BODY:", body);
    console.log("[log-login] ip_address:", ip_address, "user_agent:", user_agent);
    console.log("[log-login] typeof db:", typeof db, "typeof db.query:", typeof db.query);

    if (!user_id || !event_type) {
      console.log("[log-login] Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (event_type === "login") {
      console.log("[log-login] Logging LOGIN event");
      try {
        const result = await db.query(
          "INSERT INTO user_login_logs (user_id, event_type, ip_address, user_agent, session_id, login_time) VALUES (?, ?, ?, ?, ?, NOW())",
          [user_id, "login", ip_address, user_agent, session_id],
        );
        if (!result || (result.affectedRows !== undefined && result.affectedRows === 0)) {
          console.error("[log-login] Failed to insert login log", result);
          return NextResponse.json({ error: "Failed to log login event" }, { status: 500 });
        }
        console.log("[log-login] LOGIN event logged", result);
      } catch (err) {
        console.error("[log-login] DB ERROR:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    } else if (event_type === "logout" || event_type === "timeout") {
      console.log(`[log-login] Logging ${event_type.toUpperCase()} event`);
      await db.query(
        `UPDATE user_login_logs SET logout_time = NOW(), event_type = ? WHERE user_id = ? AND session_id = ? AND logout_time IS NULL`,
        [event_type, user_id, session_id],
      );
      console.log(`[log-login] ${event_type.toUpperCase()} event logged`);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[log-login] ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
