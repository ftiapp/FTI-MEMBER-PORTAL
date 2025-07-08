// app/api/thailand-address/search/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'subdistrict'; // subdistrict, district, province
    
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        success: true, 
        data: [],
        message: 'กรุณาระบุคำค้นหาอย่างน้อย 2 ตัวอักษร'
      });
    }

    // เรียกใช้ API thailand-address ที่มีอยู่แล้ว
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
