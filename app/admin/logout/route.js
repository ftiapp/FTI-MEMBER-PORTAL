import { NextResponse } from 'next/server';
import { adminLogout, getAdminFromSession, logAdminAction } from '@/app/lib/adminAuth';

export async function GET(request) {
  try {
    // Get admin info for logging
    const admin = await getAdminFromSession();
    
    if (admin) {
      // Log admin logout
      await logAdminAction(
        admin.id,
        'login',
        null,
        'Admin logout',
        request
      );
    }
    
    // Clear admin session
    await adminLogout();
    
    // Redirect to login page
    return NextResponse.redirect(new URL('/admin', request.url));
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/admin', request.url));
  }
}
