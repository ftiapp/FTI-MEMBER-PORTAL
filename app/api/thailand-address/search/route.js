// app/api/thailand-address/search/route.js
import { NextResponse } from 'next/server';
import rateLimiter from '../../../lib/rate-limiter';

export async function GET(request) {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';

    // Rate limiting: 60 requests per minute per IP
    const rateCheck = rateLimiter.checkRateLimit(ip, 60000, 60);
    
    if (!rateCheck.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: 'คำขอมากเกินไป กรุณาลองใหม่ในอีกสักครู่',
        retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString()
        }
      });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'subdistrict';
    
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'กรุณาระบุคำค้นหาอย่างน้อย 2 ตัวอักษร'
      });
    }

    // Check cache first
    const cacheKey = `address_${type}_${query.toLowerCase()}`;
    const cached = rateLimiter.getCached(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // เรียกใช้ API thailand-address ที่มีอยู่แล้ว (เหมือนเดิม)
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const apiUrl = `${baseUrl}/api/thailand-address?query=${encodeURIComponent(query)}&type=${type}`;
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`ไม่สามารถดึงข้อมูลได้: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      // แปลงข้อมูลให้อยู่ในรูปแบบที่ SearchableDropdown ต้องการ
      const formattedData = data.data.map(item => {
        if (type === 'subdistrict') {
          return {
            id: item.subdistrict,
            text: item.subdistrict,
            subText: `${item.district}, ${item.province} ${item.postalCode}`,
            district: item.district,
            province: item.province,
            postalCode: item.postalCode
          };
        } else if (type === 'district') {
          return {
            id: item.district,
            text: item.district,
            subText: `${item.province}`,
            province: item.province
          };
        } else if (type === 'province') {
          return {
            id: item.province,
            text: item.province
          };
        }
      });
      
      // Cache the result (5 minutes)
      rateLimiter.setCache(cacheKey, formattedData, 300000);
      
      return NextResponse.json({
        success: true,
        data: formattedData
      });
    } else {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Error searching address data:', error);
    return NextResponse.json({ 
      success: false, 
      message: `เกิดข้อผิดพลาดในการค้นหาข้อมูล: ${error.message}` 
    }, { status: 500 });
  }
}