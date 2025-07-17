import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// Helper function to check tax ID in all member tables
async function checkTaxIdInAllTables(taxId) {
  // 1. OC
  const oc = await query(
    'SELECT status FROM MemberRegist_OC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1',
    [taxId]
  );
  if (oc.length > 0) return { exists: true, status: oc[0].status, memberType: 'OC' };

  // 2. AC
  const ac = await query(
    'SELECT status FROM MemberRegist_AC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1',
    [taxId]
  );
  if (ac.length > 0) return { exists: true, status: ac[0].status, memberType: 'AC' };

  // 3. AM
  const am = await query(
    'SELECT status FROM MemberRegist_AM_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1',
    [taxId]
  );
  if (am.length > 0) return { exists: true, status: am[0].status, memberType: 'AM' };

  return { exists: false };
}

function validateTaxId(taxId) {
  if (!taxId || typeof taxId !== 'string') return false;
  return /^\d{13}$/.test(taxId.replace(/[\s-]/g, ''));
}

function memberTypeThai(type) {
  return type === 'OC' ? 'สามัญ' : type === 'AC' ? 'สมทบ' : type === 'AM' ? 'สมาคม' : '';
}

export async function POST(request) {
  try {
    const { taxId } = await request.json();
    if (!validateTaxId(taxId)) {
      return NextResponse.json({ valid: false, message: 'รูปแบบเลขประจำตัวผู้เสียภาษีไม่ถูกต้อง' }, { status: 400 });
    }
    const result = await checkTaxIdInAllTables(taxId);
    if (result.exists) {
      return NextResponse.json({
        valid: false,
        message: `เลขประจำตัวผู้เสียภาษีนี้มีอยู่แล้วในประเภทสมาชิก${memberTypeThai(result.memberType)} (สถานะ: ${result.status === 0 ? 'รอตรวจสอบ' : 'อนุมัติ'})`
      }, { status: 409 });
    }
    return NextResponse.json({ valid: true, message: 'เลขประจำตัวผู้เสียภาษีนี้สามารถใช้สมัครสมาชิกได้' });
  } catch (err) {
    return NextResponse.json({ valid: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี' }, { status: 500 });
  }
}
