import { NextResponse } from 'next/server';
import { mssqlQuery } from '@/app/lib/mssql';
import { getAdminFromSession } from '@/app/lib/adminAuth';

export async function GET(request) {
  try {
    // ตรวจสอบ session ของ admin
    const admin = await getAdminFromSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }

    // รับ MEMBER_CODE จาก query parameter
    const { searchParams } = new URL(request.url);
    const memberCode = searchParams.get('code');

    if (!memberCode) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุรหัสสมาชิก' },
        { status: 400 }
      );
    }

    // ตรวจสอบข้อมูลจาก MSSQL
    const result = await mssqlQuery(`
      SELECT 
        [REGIST_CODE],
        [MEMBER_CODE],
        [MEMBER_TYPE_CODE],
        [MEMBER_STATUS_CODE],
        [COMP_PERSON_CODE],
        [TAX_ID],
        [COMPANY_NAME],
        [COMP_PERSON_NAME_EN],
        [ProductDesc_TH],
        [ProductDesc_EN]
      FROM [FTI].[dbo].[BI_MEMBER]
      WHERE [MEMBER_CODE] = @param0
    `, [memberCode]);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลสมาชิกในระบบ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error checking member code:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสสมาชิก' },
      { status: 500 }
    );
  }
}
