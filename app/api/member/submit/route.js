import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { mssqlQuery } from '@/app/lib/mssql';
import { PDFDocument } from 'pdf-lib';

// Force Node.js runtime (sharp/Buffer/Cloudinary are not supported on Edge)
export const runtime = 'nodejs';
// Prevent caching/dedupe; this route handles uploads and external I/O
export const dynamic = 'force-dynamic';

async function compressPdfBuffer(buffer) {
  try {
    const inputPdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const outputPdf = await PDFDocument.create();

    const pageIndices = inputPdf.getPageIndices();
    const copiedPages = await outputPdf.copyPages(inputPdf, pageIndices);
    copiedPages.forEach((page) => {
      outputPdf.addPage(page);
    });

    const title = inputPdf.getTitle();
    if (title) outputPdf.setTitle(title);
    const author = inputPdf.getAuthor();
    if (author) outputPdf.setAuthor(author);
    const subject = inputPdf.getSubject();
    if (subject) outputPdf.setSubject(subject);
    const keywords = inputPdf.getKeywords();
    if (keywords) outputPdf.setKeywords(keywords);
    const creator = inputPdf.getCreator();
    if (creator) outputPdf.setCreator(creator);
    const producer = inputPdf.getProducer();
    if (producer) outputPdf.setProducer(producer);
    const creationDate = inputPdf.getCreationDate();
    if (creationDate) outputPdf.setCreationDate(creationDate);
    const modificationDate = inputPdf.getModificationDate();
    if (modificationDate) outputPdf.setModificationDate(modificationDate);

    const compressedBytes = await outputPdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    return Buffer.from(compressedBytes);
  } catch (error) {
    console.warn('[member/submit] PDF compression failed, using original buffer', error);
    return buffer;
  }
}

export async function POST(request) {
  try {
    const startedAt = Date.now();
    const requestId = `${startedAt}-${Math.random().toString(36).slice(2, 8)}`;
    const log = (phase, extra = {}) => {
      console.log('[member/submit]', { requestId, phase, t: Date.now() - startedAt, ...extra });
    };
    log('start');
    const formData = await request.formData();
    // Extract form data
    const userId = formData.get('userId');
    const memberNumber = formData.get('memberNumber');
    const compPersonCode = formData.get('compPersonCode');
    const registCode = formData.get('registCode');
    let memberDate = formData.get('memberDate'); // optional: YYYY-MM-DD
    const memberType = formData.get('memberType');
    const companyName = formData.get('companyName');
    const companyType = formData.get('companyType');
    const registrationNumber = formData.get('registrationNumber');
    const taxId = formData.get('taxId');
    const address = formData.get('address');
    const province = formData.get('province');
    const postalCode = formData.get('postalCode');
    const phone = formData.get('phone');
    const website = formData.get('website');
    const documentType = formData.get('documentType');
    const documentFile = formData.get('documentFile');
    
    // Normalize MEMBER_CODE to avoid whitespace issues (after extraction)
    const trimmedMemberNumber = (memberNumber || '').trim();
    log('extracted_form', { userId, memberNumber: trimmedMemberNumber, memberType, hasFile: !!documentFile });
    
    // Validate required fields
    if (!userId || !memberNumber || !memberType || !companyName || !taxId || !documentFile) {
      log('validation_failed');
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Quick environment sanity checks (helps diagnose 503 due to misconfig)
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary env not configured');
      return NextResponse.json(
        { success: false, message: 'การตั้งค่าอัปโหลดเอกสารไม่สมบูรณ์' },
        { status: 500 }
      );
    }
    log('env_checked');
    // Check if MEMBER_CODE is already used by another user (only check pending or approved records)
    const existingMemberOtherUser = await query(
      `SELECT * FROM companies_Member WHERE MEMBER_CODE = ? AND user_id != ? AND (Admin_Submit = 0 OR Admin_Submit = 1)`,
      [trimmedMemberNumber, userId]
    );
    
    if (existingMemberOtherUser.length > 0) {
      log('duplicate_other_user');
      return NextResponse.json(
        { success: false, message: 'รหัสสมาชิกนี้ถูกใช้งานโดยผู้ใช้อื่นแล้ว ไม่สามารถใช้ยืนยันตัวตนได้' },
        { status: 400 }
      );
    }
    
    // Check if current user has already submitted this MEMBER_CODE (only check pending or approved records)
    const existingMemberSameUser = await query(
      `SELECT * FROM companies_Member WHERE MEMBER_CODE = ? AND user_id = ? AND (Admin_Submit = 0 OR Admin_Submit = 1)`,
      [trimmedMemberNumber, userId]
    );
    
    if (existingMemberSameUser.length > 0) {
      log('duplicate_same_user');
      return NextResponse.json(
        { success: false, message: 'คุณได้ยืนยันตัวตนด้วยรหัสสมาชิกนี้ไปแล้ว กรุณาใช้รหัสสมาชิกอื่น' },
        { status: 400 }
      );
    }
    
    // Upload document to Cloudinary
    let fileBuffer = Buffer.from(await documentFile.arrayBuffer());
    let fileName = documentFile.name || 'document.pdf';
    const originalSizeBytes = fileBuffer.length;
    const fileMimeType = (documentFile.type || '').toLowerCase();

    if (fileMimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      log('pdf_compress_start', { fileName, originalSizeMB: (originalSizeBytes / (1024 * 1024)).toFixed(2) });
      const compressedBuffer = await compressPdfBuffer(fileBuffer);
      if (compressedBuffer.length < fileBuffer.length) {
        log('pdf_compress_success', {
          beforeBytes: fileBuffer.length,
          afterBytes: compressedBuffer.length,
          savedMB: ((fileBuffer.length - compressedBuffer.length) / (1024 * 1024)).toFixed(2),
        });
        fileBuffer = compressedBuffer;
      } else {
        log('pdf_compress_no_gain', {
          beforeBytes: fileBuffer.length,
          afterBytes: compressedBuffer.length,
        });
      }
    }

    const fileSizeBytes = fileBuffer.length;
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    
    // Log detailed file information
    log('before_upload', { 
      fileName,
      fileSize: fileSizeBytes,
      fileSizeMB: fileSizeMB.toFixed(2) + 'MB',
      fileType: documentFile.type || 'unknown'
    });
    
    // Validate file size early
    if (fileSizeMB > 5) {
      log('file_too_large_rejected', { fileSizeMB });
      return NextResponse.json(
        { success: false, message: `ไฟล์มีขนาดใหญ่เกินไป (${fileSizeMB.toFixed(2)}MB) กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 5MB` },
        { status: 400 }
      );
    }
    // Enhanced retry for Cloudinary upload with better error handling
    const uploadWithRetry = async (buf, name, maxRetry = 3) => {
      let attempt = 0;
      let lastErr;
      
      const sizeBytes = Buffer.isBuffer(buf) ? buf.length : buf.byteLength;
      const fileSizeInMB = sizeBytes / (1024 * 1024);
      log('file_size_check', { fileSizeInMB, name });
      
      if (fileSizeInMB > 5) {
        log('file_too_large', { fileSizeInMB, name });
        throw new Error(`ไฟล์มีขนาดใหญ่เกินไป (${fileSizeInMB.toFixed(2)}MB > 5MB)`);
      }
      
      while (attempt <= maxRetry) {
        attempt++;
        try {
          // Log attempt start time for tracking
          const attemptStartTime = Date.now();
          log('upload_attempt_start', { attempt, maxRetry, name });
          
          const res = await uploadToCloudinary(Buffer.isBuffer(buf) ? buf : Buffer.from(buf), name);
          
          // Log attempt duration
          const attemptDuration = Date.now() - attemptStartTime;
          log('upload_attempt_complete', { attempt, duration: attemptDuration });
          
          if (res?.success) return res;
          
          lastErr = new Error(res?.error || 'Upload failed');
          log('upload_failed', { attempt, error: res?.error, duration: attemptDuration });
        } catch (e) {
          lastErr = e;
          log('upload_exception', { 
            attempt, 
            message: e?.message,
            code: e?.code,
            name: e?.name
          });
        }
        
        if (attempt <= maxRetry) {
          // Exponential backoff with jitter
          const baseDelay = 1000; // 1 second base
          const maxDelay = 10000; // Max 10 seconds
          const expBackoff = Math.min(baseDelay * Math.pow(2, attempt-1), maxDelay);
          const jitter = Math.random() * 1000; // Add up to 1 second of jitter
          const delay = expBackoff + jitter;
          
          log('retry_delay', { attempt, delay, nextAttemptIn: new Date(Date.now() + delay).toISOString() });
          await new Promise(r => setTimeout(r, delay));
        }
      }
      
      throw lastErr;
    };

    const uploadResult = await uploadWithRetry(fileBuffer, fileName);
    log('after_upload', { url: uploadResult?.url });

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, message: 'ไม่สามารถอัปโหลดเอกสารได้ กรุณาลองใหม่อีกครั้ง' },
        { status: 500 }
      );
    }
    
    // Try to fetch MEMBER_DATE from MSSQL if not provided
    if (!memberDate && compPersonCode && registCode) {
      try {
        log('before_mssql_query');
        const sql = `SELECT [MEMBER_DATE] FROM [FTI].[dbo].[MB_MEMBER] WHERE COMP_PERSON_CODE = @param0 AND REGIST_CODE = @param1`;
        const mres = await mssqlQuery(sql, [compPersonCode, registCode]);
        const rec = mres && Array.isArray(mres) ? mres[0] : null;
        if (rec && rec.MEMBER_DATE) {
          // Normalize to YYYY-MM-DD
          const d = new Date(rec.MEMBER_DATE);
          if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            memberDate = `${yyyy}-${mm}-${dd}`;
          }
        }
        log('after_mssql_query', { memberDate });
      } catch (err) {
        console.error('Failed to fetch MEMBER_DATE from MSSQL:', err);
      }
    }

    // Save company information to database
    log('before_mysql_insert_company');
    const companyResult = await query(
      `INSERT INTO companies_Member 
       (user_id, MEMBER_CODE, COMP_PERSON_CODE, REGIST_CODE, MEMBER_DATE, company_name, company_type, tax_id, Admin_Submit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [userId, trimmedMemberNumber, compPersonCode, registCode, memberDate || null, companyName, memberType, taxId]
    );
    log('after_mysql_insert_company', { insertId: companyResult.insertId });
    
    // Save document information to database
    log('before_mysql_insert_document');
    await query(
      `INSERT INTO documents_Member 
       (user_id, MEMBER_CODE, document_type, file_name, file_path, status, Admin_Submit) 
       VALUES (?, ?, ?, ?, ?, 'pending', 0)`,
      [userId, trimmedMemberNumber, documentType || 'other', fileName, uploadResult.url]
    );
    log('after_mysql_insert_document');
    
    // Log the activity
    try {
      log('before_user_log');
      await query(
        `INSERT INTO Member_portal_User_log 
         (user_id, action, details, ip_address, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          'member_verification',
          JSON.stringify({
            action: 'MEMBER_INFO_SUBMITTED',
            companyName,
            documentType: documentType || 'other',
            timestamp: new Date().toISOString()
          }),
          request.headers.get('x-forwarded-for') || '',
          request.headers.get('user-agent') || ''
        ]
      );
      log('after_user_log');
    } catch (logErr) {
      // Do not block the main flow if logging fails (e.g., FK constraint or missing user)
      console.warn('Member verification: failed to write user log', logErr);
    }
    
    log('success');
    return NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลสำเร็จ',
      companyId: companyResult.insertId
    });
  } catch (error) {
    console.error('Error submitting member info:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    );
  }
}

