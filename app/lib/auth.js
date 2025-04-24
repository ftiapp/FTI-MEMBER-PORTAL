'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getAdminFromSession } from './adminAuth';

// Secret key for JWT verification (should match the one in adminAuth.js)
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-for-admin-auth');

/**
 * Check if the current request has a valid admin session
 * @returns {Promise<Object|null>} Admin object if authenticated, null otherwise
 */
export async function checkAdminSession() {
  try {
    // Use the existing getAdminFromSession function
    const admin = await getAdminFromSession();
    
    if (!admin) {
      return null;
    }
    
    return admin;
  } catch (error) {
    console.error('Error checking admin session:', error);
    return null;
  }
}

/**
 * Check if the current request has a valid user session
 * @returns {Promise<Object|null>} User object if authenticated, null otherwise
 */
export async function checkUserSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user_token')?.value;
    
    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, secretKey);
    return verified.payload;
  } catch (error) {
    console.error('Error verifying user token:', error);
    return null;
  }
}

/**
 * Get the current user ID from the session
 * @returns {Promise<number|null>} User ID if authenticated, null otherwise
 */
export async function getCurrentUserId() {
  const user = await checkUserSession();
  return user ? user.id : null;
}

/**
 * Check if the current user has admin privileges
 * @returns {Promise<boolean>} True if the user is an admin, false otherwise
 */
export async function isAdmin() {
  const admin = await checkAdminSession();
  return !!admin;
}

/**
 * Check if the current user is a super admin (admin_level = 5)
 * @returns {Promise<boolean>} True if the user is a super admin, false otherwise
 */
export async function isSuperAdmin() {
  const admin = await checkAdminSession();
  return admin ? admin.adminLevel === 5 : false;
}
