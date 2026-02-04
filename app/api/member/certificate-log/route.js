export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import { getUserFromSession } from "@/app/lib/userAuth";
import { query } from "@/app/lib/db";

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

export async function POST(request) {
  try {
    // Get user from session
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const { memberCode, actionType, language } = await request.json();

    if (!memberCode || !actionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if there's an existing record for this combination
    const existingLogs = await query(
      `SELECT id, count FROM certificate_logs_count 
       WHERE user_id = ? AND member_code = ? AND action_type = ? AND language = ?`,
      [userId, memberCode, actionType, language || "thai"],
    );

    if (existingLogs.length > 0) {
      // Update existing record by incrementing the count
      const newCount = existingLogs[0].count + 1;
      await query(
        `UPDATE certificate_logs_count 
         SET count = ?, last_updated_at = NOW() 
         WHERE id = ?`,
        [newCount, existingLogs[0].id],
      );
      console.log(
        `Certificate action count updated: User ${userId} ${actionType}ed ${language} certificate for member ${memberCode} (count: ${newCount})`,
      );
    } else {
      // Create new record with count = 1
      await query(
        `INSERT INTO certificate_logs_count (user_id, member_code, action_type, language, count, first_created_at, last_updated_at) 
         VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
        [userId, memberCode, actionType, language || "thai"],
      );
      console.log(
        `New certificate action logged: User ${userId} ${actionType}ed ${language} certificate for member ${memberCode} (count: 1)`,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging certificate action:", error);
    // Return success even if logging fails to not disrupt user experience
    return NextResponse.json({ success: false, error: error.message });
  }
}
