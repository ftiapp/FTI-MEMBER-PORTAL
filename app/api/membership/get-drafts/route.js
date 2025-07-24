import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { query } from '@/app/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const memberType = searchParams.get('type');

    let drafts = [];
    const memberTypes = memberType ? [memberType] : ['oc', 'ic', 'am', 'ac'];

    for (const type of memberTypes) {
      const queryDrafts = `
        SELECT id, draft_data, current_step, created_at, updated_at
        FROM MemberRegist_${type.toUpperCase()}_Draft 
        WHERE user_id = ? AND status = 3
        ORDER BY updated_at DESC
      `;
      
      const result = await query(queryDrafts, [userId]);
      
      if (result && result.length > 0) {
        result.forEach(draft => {
          try {
            let draftData = draft.draft_data;
            // Handle both string and object formats
            if (typeof draft.draft_data === 'string') {
              draftData = JSON.parse(draft.draft_data);
            }
            drafts.push({
              id: draft.id,
              type: type.toLowerCase(),
              memberType: type,
              draftData,
              currentStep: draft.current_step,
              createdAt: draft.created_at,
              updatedAt: draft.updated_at,
              companyName: draftData.companyName || draftData.company_name || 'ไม่มีชื่อบริษัท',
              lastUpdated: draft.updated_at
            });
          } catch (e) {
            console.error('Error parsing draft data:', e);
          }
        });
      }
    }

    return NextResponse.json({ success: true, drafts });

  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
