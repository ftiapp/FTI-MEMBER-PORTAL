import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taxId = searchParams.get('taxId');
    
    if (!taxId) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้ระบุเลขประจำตัวผู้เสียภาษี' },
        { status: 400 }
      );
    }

    // ค้นหาในตาราง OC, AC, AM, IC ตามลำดับ
    const membershipTypes = [
      { type: 'OC', table: 'MemberRegist_OC_Main' },
      { type: 'AC', table: 'MemberRegist_AC_Main' },
      { type: 'AM', table: 'MemberRegist_AM_Main' },
      { type: 'IC', table: 'MemberRegist_IC_Main' }
    ];

    for (const membership of membershipTypes) {
      try {
        const result = await query(
          `SELECT id FROM ${membership.table} WHERE tax_id = ? AND status = 1 LIMIT 1`,
          [taxId]
        );

        if (result && result.length > 0) {
          return NextResponse.json({
            success: true,
            data: {
              membershipType: membership.type,
              id: result[0].id,
              taxId: taxId
            }
          });
        }
      } catch (tableError) {
        console.error(`Error querying ${membership.table}:`, tableError);
        // ถ้าตารางไม่มีอยู่หรือเกิดข้อผิดพลาด ให้ข้ามไปตารางถัดไป
        continue;
      }
    }

    // ถ้าไม่พบในตารางไหนเลย
    return NextResponse.json({
      success: false,
      message: 'ไม่พบข้อมูลใบสมัครสมาชิกสำหรับเลขประจำตัวผู้เสียภาษีนี้'
    }, { status: 404 });

  } catch (error) {
    console.error('Error in find-by-tax-id API:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล' },
      { status: 500 }
    );
  }
}
