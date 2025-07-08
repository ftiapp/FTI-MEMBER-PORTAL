import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { jwtVerify } from 'jose';

// กำหนดค่า configuration สำหรับ Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * POST /api/ic-membership/cloudinary-upload
 * อัปโหลดไฟล์ไปยัง Cloudinary
 */
export async function POST(request) {
  try {
    // รับข้อมูลจาก FormData
    const formData = await request.formData();
    const userId = formData.get('userId') || '0'; // ใช้ userId = 0 สำหรับกรณีไม่มี userId
    const file = formData.get('file');
    const fileType = formData.get('fileType');
    
    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่อัปโหลด' }, { status: 400 });
    }
    
    if (!fileType) {
      return NextResponse.json({ error: 'ไม่ระบุประเภทของไฟล์' }, { status: 400 });
    }
    
    // แปลงไฟล์เป็น base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // กำหนด folder ใน Cloudinary
    const folder = `ic-membership/${userId}/${fileType}`;
    
    // อัปโหลดไฟล์ไปยัง Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(base64File, {
        folder: folder,
        resource_type: 'auto',
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    
    return NextResponse.json({
      success: true,
      message: 'อัปโหลดไฟล์สำเร็จ',
      data: {
        fileName: file.name,
        cloudinaryPath: result.secure_url,
        cloudinaryPublicId: result.public_id,
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
