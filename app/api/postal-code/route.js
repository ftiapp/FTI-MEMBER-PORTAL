// app/api/postal-code/route.js
import { NextResponse } from 'next/server';
import rateLimiter from '../../lib/rate-limiter';

export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting: 30 requests per minute for postal code
    const rateCheck = rateLimiter.checkRateLimit(ip, 60000, 30);
    
    if (!rateCheck.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: 'คำขอมากเกินไป กรุณาลองใหม่ในอีกสักครู่'
      }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const subDistrict = searchParams.get('subDistrict');
    
    if (!subDistrict) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณาระบุตำบล/แขวง' 
      }, { status: 400 });
    }

    // Check cache
    const cacheKey = `postal_${subDistrict.toLowerCase()}`;
    const cached = rateLimiter.getCached(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached
      });
    }

    // เรียกใช้ API เหมือนเดิม
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const apiUrl = `${baseUrl}/api/thailand-address?query=${encodeURIComponent(subDistrict)}&type=subdistrict`;
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`ไม่สามารถดึงข้อมูลรหัสไปรษณีย์ได้: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      // Cache for 10 minutes
      rateLimiter.setCache(cacheKey, data.data, 600000);
      
      return NextResponse.json({
        success: true,
        data: data.data
      });
    } else {
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