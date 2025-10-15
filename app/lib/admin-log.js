import { query } from "./db";

/**
 * Logs an admin action to the FTI_Portal_Admin_Actions_Logs table
 *
 * @param {Object} params - Log parameters
 * @param {number} params.adminId - ID of the admin performing the action
 * @param {string} params.actionType - Type of action performed
 * @param {number} params.targetId - ID of the target entity
 * @param {string} params.description - Description of the action
 * @param {string} params.ipAddress - IP address of the admin
 * @param {string} params.userAgent - User agent of the admin's browser
 * @returns {Promise<Object>} - The inserted log entry
 */
export async function logAdminAction({
  adminId,
  actionType,
  targetId,
  description,
  ipAddress,
  userAgent,
}) {
  try {
    const insertQuery = `
      INSERT INTO FTI_Portal_Admin_Actions_Logs (
        admin_id,
        action_type,
        target_id,
        description,
        ip_address,
        user_agent,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const result = await query(insertQuery, [
      adminId,
      actionType,
      targetId,
      description,
      ipAddress,
      userAgent,
    ]);

    return {
      id: result.insertId,
      adminId,
      actionType,
      targetId,
      description,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error logging admin action:", error);
    throw error;
  }
}
