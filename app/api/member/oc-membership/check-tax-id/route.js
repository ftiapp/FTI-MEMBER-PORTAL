import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// Helper function to check tax ID in database (ตรวจสอบทั้ง OC, AC และ AM)
async function checkTaxIdInDatabase(taxId) {
  try {
    // 1. ตรวจสอบในตาราง OC (MemberRegist_OC_Main)
    const ocResult = await query(
      'SELECT status FROM MemberRegist_OC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1',
      [taxId]
    );
    if (ocResult.length > 0) {
      return { exists: true, status: ocResult[0].status, memberType: 'OC' };
    }

    // 2. ตรวจสอบในตาราง AC (MemberRegist_AC_Main)
    const acResult = await query(
      'SELECT status FROM MemberRegist_AC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1',
      [taxId]
    );
    if (acResult.length > 0) {
      return { exists: true, status: acResult[0].status, memberType: 'AC' };
    }

    // 3. ตรวจสอบในตาราง AM (MemberRegist_AM_Main)
    const amResult = await query(
      'SELECT status FROM MemberRegist_AM_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1',
      [taxId]
    );
    if (amResult.length > 0) {
      return { exists: true, status: amResult[0].status, memberType: 'AM' };
    }

    return {
      exists: false,
      status: null,
      memberType: null
    };

  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Helper function to validate tax ID format
function validateTaxId(taxId) {
  if (!taxId || typeof taxId !== 'string') {
    return false;
  }
  
  // Remove any spaces or dashes
  const cleanTaxId = taxId.replace(/[\s-]/g, '');
  
  // Check if it's exactly 13 digits
  return /^\d{13}$/.test(cleanTaxId);
}

// Helper function to generate response messages
function generateResponseMessage(taxId, status, memberType) {
  const memberTypeThai = {
    'OC': 'สมาชิกสามัญ (โรงงาน)',
    'AC': 'สมาชิกสมทบ (นิติบุคคล)',
    'AM': 'สมาชิกสามัญ (สมาคมการค้า)'
  };

  const messages = {
    0: `เลขประจำตัวผู้เสียภาษีนี้ได้ยื่นสมัครเป็น ${memberTypeThai[memberType]} แล้ว และกำลังรอการอนุมัติ`,
    1: `เลขประจำตัวผู้เสียภาษีนี้เป็น ${memberTypeThai[memberType]} แล้ว`,
    available: `เลขประจำตัวผู้เสียภาษีนี้สามารถใช้ได้`
  };
  
  return messages[status] || messages.available;
}

// GET handler for checking tax ID availability
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const taxId = searchParams.get('taxId');

  if (!taxId) {
    return NextResponse.json(
      { 
        valid: false,
        error: 'กรุณาระบุเลขประจำตัวผู้เสียภาษี' 
      }, 
      { status: 400 }
    );
  }

  // Validate tax ID format
  if (!validateTaxId(taxId)) {
    return NextResponse.json(
      { 
        valid: false,
        error: 'เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง' 
      },
      { status: 400 }
    );
  }

  try {
    const result = await checkTaxIdInDatabase(taxId);
    
    if (result.exists) {
      return NextResponse.json(
        { 
          valid: false,
          exists: true,
          status: result.status,
          message: generateResponseMessage(taxId, result.status)
        }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        valid: true,
        exists: false,
        message: generateResponseMessage(taxId, 'available', null)
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error checking Tax ID:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' 
      }, 
      { status: 500 }
    );
  }
}

// POST handler for checking tax ID availability
export async function POST(request) {
  try {
    const data = await request.json();
    const { taxId } = data;

    console.log(`Checking TAX_ID: ${taxId}`);

    // Validate tax ID format
    if (!validateTaxId(taxId)) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง' 
        },
        { status: 400 }
      );
    }

    const result = await checkTaxIdInDatabase(taxId);
    
    console.log('Database check result:', result);

    if (result.exists) {
      return NextResponse.json(
        { 
          valid: false,
          exists: true,
          status: result.status,
          message: generateResponseMessage(taxId, result.status)
        }, 
        { status: 409 }
      );
    }

    // Tax ID is available for registration
    return NextResponse.json(
      { 
        valid: true,
        exists: false,
        message: generateResponseMessage(taxId, 'available', null)
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error checking tax ID:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี กรุณาลองใหม่อีกครั้ง' 
      },
      { status: 500 }
    );
  }
}