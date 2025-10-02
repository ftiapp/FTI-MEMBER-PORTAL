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

    // Fetch activities from all three tables
    const activities = await fetchUserActivities(userId);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function fetchUserActivities(userId) {
  try {
    // Fetch contact messages
    const contactMessages = await query(
      `SELECT id, user_id, subject, message, status, created_at 
       FROM contact_messages 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId],
    );

    // Fetch company member information
    const companyMembers = await query(
      `SELECT id, user_id, MEMBER_CODE, company_name, company_type, Admin_Submit, created_at 
       FROM companies_Member 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId],
    );

    // Fetch user logs
    const userLogs = await query(
      `SELECT id, user_id, action, details, created_at 
       FROM Member_portal_User_log 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 15`,
      [userId],
    );

    // Fetch profile update requests
    const profileUpdates = await query(
      `SELECT id, user_id, new_firstname, new_lastname, new_email, new_phone, 
              status, reject_reason, created_at, updated_at 
       FROM profile_update_requests 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId],
    );

    // Transform and combine the results
    const contactActivities = contactMessages.map((message) => ({
      ...message,
      type: "contact",
      action: "contact_message",
    }));

    const memberActivities = companyMembers.map((member) => ({
      ...member,
      type: "member",
      action: "member_verification",
    }));

    const profileActivities = profileUpdates.map((update) => ({
      ...update,
      type: "profile",
      action: "profile_update_request",
    }));

    const logActivities = userLogs.map((log) => ({
      ...log,
      type: "log",
    }));

    // Combine all activities and sort by creation date (newest first)
    const allActivities = [
      ...contactActivities,
      ...memberActivities,
      ...profileActivities,
      ...logActivities,
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Return the 20 most recent activities
    return allActivities.slice(0, 20);
  } catch (error) {
    console.error("Error in fetchUserActivities:", error);
    throw error;
  }
}
