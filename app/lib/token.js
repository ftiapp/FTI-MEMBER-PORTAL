import crypto from "crypto";
import { query } from "./db";
import bcrypt from "bcryptjs";

/**
 * Generate a random token for email verification or password reset
 * @returns {string} - Random token
 */
export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a verification token for a user
 * @param {number} userId - User ID
 * @returns {string} - Verification token
 */
export async function createVerificationToken(userId) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Token expires in 15 minutes

  // Store token in database
  await query(
    "INSERT INTO FTI_Portal_User_Verification_Tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt],
  );

  return token;
}

/**
 * Create a password reset token for a user
 * @param {number} userId - User ID
 * @returns {string} - Password reset token
 */
export async function createPasswordResetToken(userId) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Token expires in 15 minutes

  // Store token in database
  await query(
    "INSERT INTO FTI_Portal_User_Password_Reset_Tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt],
  );

  return token;
}

/**
 * Verify a token and activate the user account
 * @param {string} token - Verification token
 * @returns {Promise<boolean>} - True if verification successful, false otherwise
 */
export async function verifyToken(token) {
  try {
    // Find the token in the database
    const tokens = await query(
      "SELECT * FROM FTI_Portal_User_Verification_Tokens WHERE token = ? AND expires_at > NOW() AND used = 0",
      [token],
    );

    if (tokens.length === 0) {
      return false;
    }

    const verificationToken = tokens[0];

    // Mark the token as used
    await query("UPDATE FTI_Portal_User_Verification_Tokens SET used = 1 WHERE id = ?", [
      verificationToken.id,
    ]);

    // Update user status to verified
    await query("UPDATE FTI_Portal_User SET email_verified = 1 WHERE id = ?", [
      verificationToken.user_id,
    ]);

    return true;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
}

/**
 * Verify a password reset token
 * @param {string} token - Password reset token
 * @returns {Promise<Object|null>} - User ID if token is valid, null otherwise
 */
export async function verifyPasswordResetToken(token) {
  try {
    // Find the token in the database
    const tokens = await query(
      "SELECT * FROM FTI_Portal_User_Password_Reset_Tokens WHERE token = ? AND expires_at > NOW() AND used = 0",
      [token],
    );

    if (tokens.length === 0) {
      return null;
    }

    return {
      userId: tokens[0].user_id,
      tokenId: tokens[0].id,
    };
  } catch (error) {
    console.error("Error verifying password reset token:", error);
    return null;
  }
}

/**
 * Reset user password using token
 * @param {number} tokenId - Token ID
 * @param {number} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - True if password reset successful, false otherwise
 */
export async function resetPassword(tokenId, userId, newPassword) {
  try {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await query("UPDATE FTI_Portal_User SET password = ? WHERE id = ?", [hashedPassword, userId]);

    // Mark the token as used
    await query("UPDATE FTI_Portal_User_Password_Reset_Tokens SET used = 1 WHERE id = ?", [
      tokenId,
    ]);

    return true;
  } catch (error) {
    console.error("Error resetting password:", error);
    return false;
  }
}
