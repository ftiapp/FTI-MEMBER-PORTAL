import { NextResponse } from 'next/server';
import { executeQueryWithoutTransaction } from '@/app/lib/db';

export async function GET() {
  try {
    const rows = await executeQueryWithoutTransaction(
      `SELECT id, type_code, type_name_th, type_name_en
       FROM MemberRegist_ContactPerson_TYPE
       WHERE is_active = 1
       ORDER BY id ASC`,
      []
    );

    return NextResponse.json({ success: true, data: rows || [] }, { status: 200 });
  } catch (error) {
    console.error('[API] contact-person-types GET error:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถดึงประเภทผู้ติดต่อได้' }, { status: 500 });
  }
}
