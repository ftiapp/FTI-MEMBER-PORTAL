import { getConnection } from "./db";

/**
 * ดึงประวัติ comments ทั้งหมดของใบสมัคร
 */
export async function getApplicationComments(membershipType, membershipId) {
  const connection = await getConnection();

  try {
    const [comments] = await connection.execute(
      `
      SELECT 
        c.*,
        u.name as user_name,
        u.email as user_email,
        a.username as admin_username,
        a.name as admin_name
      FROM MemberRegist_Comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN admin_users a ON c.admin_id = a.id
      WHERE c.membership_type = ? AND c.membership_id = ?
      ORDER BY c.created_at ASC
    `,
      [membershipType, membershipId],
    );

    return comments;
  } finally {
    connection.release();
  }
}

/**
 * เพิ่ม comment ในตาราง MemberRegist_Comments
 */
export async function addComment(
  connection,
  membershipType,
  membershipId,
  userId,
  adminId,
  commentType,
  commentText,
  rejectionReason = null,
  dataChanges = null,
) {
  await connection.execute(
    `
    INSERT INTO MemberRegist_Comments (
      membership_type, membership_id, user_id, admin_id, comment_type, 
      comment_text, rejection_reason, data_changes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      membershipType,
      membershipId,
      userId,
      adminId,
      commentType,
      commentText,
      rejectionReason,
      dataChanges ? JSON.stringify(dataChanges) : null,
    ],
  );
}
