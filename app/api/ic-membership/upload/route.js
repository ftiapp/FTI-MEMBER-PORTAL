import { NextResponse } from 'next/server';
import { checkUserSession } from '@/app/lib/auth';
import { query } from '@/app/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

/**
 * POST /api/ic-membership/upload
 * อัปโหลดไฟล์เอกสารประกอบการสมัคร IC Membership
 */
export async function POST(request) {
  try {
    // ตรวจสอบว่าผู้ใช้ login แล้วหรือไม่
    const cookieStore = cookies();
    const user = await checkUserSession(cookieStore);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // รับข้อมูลจาก FormData
    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('fileType');
    
    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่อัปโหลด' }, { status: 400 });
    }
    
    if (!fileType) {
      return NextResponse.json({ error: 'ไม่ระบุประเภทของไฟล์' }, { status: 400 });
    }
    
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileType}_${userId}_${uuidv4()}.${fileExtension}`;
    
    // กำหนด path สำหรับบันทึกไฟล์
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ic-membership');
    const filePath = path.join(uploadsDir, fileName);
    
    // แปลงไฟล์เป็น Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // บันทึกไฟล์ลงในระบบ
    await writeFile(filePath, buffer);
    
    // บันทึกข้อมูลไฟล์ลงในฐานข้อมูล
    const insertFileQuery = `
      INSERT INTO documents_Member (
        user_id, document_type, file_name, file_path, status
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await query(insertFileQuery, [
      userId,
      fileType,
      file.name,
      `/uploads/ic-membership/${fileName}`,
      'pending'
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'อัปโหลดไฟล์สำเร็จ',
      data: {
        id: result.insertId,
        fileName: file.name,
        filePath: `/uploads/ic-membership/${fileName}`,
        fileType
      }
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์', 
      details: error.message 
    }, { status: 500 });
  }
}
