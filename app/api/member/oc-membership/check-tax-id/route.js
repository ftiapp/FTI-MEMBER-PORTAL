import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// Helper function to check tax ID in database
async function checkTaxIdInDatabase(taxId) {
  try {
    // Check in new table (MemberRegist_OC_Main)
    const newTableResult = await query(
      'SELECT status FROM MemberRegist_OC_Main WHERE tax_id = ? AND (status = 0 OR status = 1) LIMIT 1',
      [taxId]
    );

    if (newTableResult.length > 0) {
      return {
        exists: true,
        status: newTableResult[0].status,
        table: 'new'
      };
    }

    // Check in old table (OCmember_Info) - mapping old status to new status
    const oldTableResult = await query(
      'SELECT status FROM OCmember_Info WHERE company_reg_number = ? AND (status = 1 OR status = 2) LIMIT 1',
      [taxId]
    );

    if (oldTableResult.length > 0) {
      // Map old status to new status: 1 (old pending) -> 0 (new pending), 2 (old approved) -> 1 (new approved)
      const mappedStatus = oldTableResult[0].status === 1 ? 0 : 1;
      return {
        exists: true,
        status: mappedStatus,
        table: 'old'
      };
    }

    return {
      exists: false,
      status: null,
      table: null
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
function generateResponseMessage(taxId, status) {
  const messages = {
    0: `คำขอสมัครสมาชิกของท่านสำหรับเลขประจำตัวผู้เสียภาษี ${taxId} อยู่ระหว่างการพิจารณา`,
    1: `เลขประจำตัวผู้เสียภาษี ${taxId} นี้ได้เป็นสมาชิกแล้ว`,
    available: `เลขประจำตัวผู้เสียภาษี ${taxId} สามารถใช้สมัครสมาชิกได้`
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
        message: generateResponseMessage(taxId, 'available')
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
        message: generateResponseMessage(taxId, 'available')
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