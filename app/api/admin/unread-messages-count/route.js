import { query } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/session';

export async function GET(request) {
  try {
    // Check admin session
    const session = await getServerSession();
    if (!session || !session.admin) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }

    // Count unread messages
    const result = await query(
      'SELECT COUNT(*) as count FROM contact_messages WHERE status = "unread"'
    );

    return NextResponse.json({ count: result[0].count });
  } catch (error) {
    console.error('Error counting unread messages:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการนับข้อความที่ยังไม่อ่าน' },
      { status: 500 }
    );
  }
}
