import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '@/app/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { memberType, draftData, currentStep } = await request.json();

    if (!memberType || !draftData) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // ตรวจสอบว่ามี draft อยู่แล้วหรือไม่
    const checkQuery = `SELECT id FROM MemberRegist_${memberType.toUpperCase()}_Draft WHERE user_id = ? AND status = 3`;
    const existingDraft = await query(checkQuery, [userId]);

    let result;
    if (existingDraft && existingDraft.length > 0) {
      // อัปเดต draft ที่มีอยู่
      const updateQuery = `
        UPDATE MemberRegist_${memberType.toUpperCase()}_Draft 
        SET draft_data = ?, current_step = ?, updated_at = NOW()
        WHERE user_id = ? AND status = 3
      `;
      result = await query(updateQuery, [JSON.stringify(draftData), currentStep, userId]);
    } else {
      // สร้าง draft ใหม่
      const insertQuery = `
        INSERT INTO MemberRegist_${memberType.toUpperCase()}_Draft (user_id, draft_data, current_step, status)
        VALUES (?, ?, ?, 3)
      `;
      result = await query(insertQuery, [userId, JSON.stringify(draftData), currentStep]);
    }

    return NextResponse.json({ success: true, message: 'Draft saved successfully' });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
