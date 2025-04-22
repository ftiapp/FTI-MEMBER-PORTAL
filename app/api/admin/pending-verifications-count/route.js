import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getAdminFromSession } from '@/app/lib/adminAuth';

export async function GET(request) {
  try {
    // Verify admin session
    const admin = await getAdminFromSession();
    
    if (!admin) {
      return NextResponse.json({ success: false, message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }
    
    // Query to count pending verifications (Admin_Submit = 0)
    const results = await query(
      `SELECT COUNT(*) as count FROM companies_Member WHERE Admin_Submit = 0`
    );
    
    // The query function returns results directly, not wrapped in an array
    const count = results[0]?.count || 0;
    
    return NextResponse.json({ 
      success: true, 
      count: count
    });
    
  } catch (error) {
    console.error('Error fetching pending verification count:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลจำนวนรอการอนุมัติ' },
      { status: 500 }
    );
  }
}
