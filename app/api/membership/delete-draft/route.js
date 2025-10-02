import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { query } from "../../../lib/db";

export async function POST(request) {
  try {
    // Use session-based authentication instead of JWT
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { memberType, draftId } = await request.json();

    if (!memberType || !draftId) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่า draft เป็นของ user นี้จริงๆ
    const checkQuery = `SELECT id FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE id = ? AND user_id = ? AND status = 3`;
    const existingDraft = await query(checkQuery, [draftId, userId]);

    if (!existingDraft || existingDraft.length === 0) {
      return NextResponse.json(
        { success: false, message: "Draft not found or not authorized" },
        { status: 404 },
      );
    }

    // ลบ draft
    const deleteQuery = `DELETE FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE id = ? AND user_id = ?`;
    await query(deleteQuery, [draftId, userId]);

    return NextResponse.json({ success: true, message: "Draft deleted successfully" });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
