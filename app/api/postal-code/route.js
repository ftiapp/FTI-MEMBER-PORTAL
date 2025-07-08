// app/api/postal-code/route.js
import { NextResponse } from 'next/server';

// API สำหรับดึงรหัสไปรษณีย์จากตำบล
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subDistrict = searchParams.get('subDistrict');
    
    if (!subDistrict) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณาระบุตำบล/แขวง' 
      }, { status: 400 });
    }

    // ใช้ API thailand-address ที่มีอยู่แล้วในระบบ
    // ใช้ URL แบบสัมบูรณ์เพื่อให้ทำงานได้ทั้งในโหมด development และ production
    // สร้าง URL แบบสัมบูรณ์จาก request.url
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const apiUrl = `${baseUrl}/api/thailand-address?query=${encodeURIComponent(subDistrict)}&type=subdistrict`;
    console.log(`Calling API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      // ใช้ next: { revalidate: 0 } เพื่อไม่ให้ Next.js cache การเรียก API
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      console.error(`API response not OK: ${response.status} ${response.statusText}`);
      throw new Error(`ไม่สามารถดึงข้อมูลรหัสไปรษณีย์ได้: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Thailand address API response:', data);
    
    if (data.success && data.data && data.data.length > 0) {
      return NextResponse.json({
        success: true,
        data: data.data
      });
    } else {
      console.log('No postal code data found for subdistrict:', subDistrict);
      return NextResponse.json({
        success: false,
        message: 'ไม่พบข้อมูลรหัสไปรษณีย์สำหรับตำบล/แขวงนี้'
      });
    }
  } catch (error) {
    console.error('Error fetching postal code:', error);
    return NextResponse.json({ 
      success: false, 
      message: `เกิดข้อผิดพลาดในการดึงข้อมูลรหัสไปรษณีย์: ${error.message}` 
    }, { status: 500 });
  }
}
