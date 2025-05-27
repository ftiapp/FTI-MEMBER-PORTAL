import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

/**
 * Handle GET requests to retrieve TSIC codes for a member
 */
export async function GET(request) {
  try {
    // ไม่ต้องมีการยืนยันตัวตนสำหรับการดึงข้อมูล TSIC codes เนื่องจากเป็นข้อมูลที่ไม่มีความอ่อนไหว
    // อย่างไรก็ตาม เราจะพยายามดึงข้อมูลผู้ใช้จาก token ถ้ามี
    let userId = null;
    
    // พยายามดึงข้อมูลผู้ใช้จาก token ถ้ามี
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
        console.log('Got user ID from token:', userId);
      }
    } catch (error) {
      console.log('No valid token found, continuing without authentication');
      // ไม่ต้องทำอะไร เพราะเราจะอนุญาตให้ดึงข้อมูลโดยไม่ต้องมีการยืนยันตัวตน
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const memberCode = searchParams.get('member_code');
    const status = searchParams.get('status');
    
    // Validate required fields
    if (!memberCode) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุรหัสสมาชิก' },
        { status: 400 }
      );
    }

    // Build query based on parameters
    // เนื่องจากมีปัญหา collation ที่แตกต่างกัน เราจะไม่ใช้ JOIN แต่จะดึงข้อมูลจากตาราง member_tsic_codes เท่านั้น
    let sql = `
      SELECT * FROM member_tsic_codes
      WHERE member_code = ?
    `;
    
    const queryParams = [memberCode];
    
    // Add status filter if provided
    if (status !== null && status !== undefined) {
      sql += ' AND status = ?';
      queryParams.push(parseInt(status));
    }
    
    // Add order by
    sql += ' ORDER BY category_code, tsic_code';
    
    // Execute query to get TSIC codes
    const tsicCodes = await query(sql, queryParams);
    
    // สร้างรายการรหัส TSIC ที่ต้องการดึงข้อมูลคำอธิบาย
    const tsicCodesList = tsicCodes.map(code => code.tsic_code);
    
    // สร้างรายการรหัสหมวดหมู่ที่ต้องการดึงข้อมูลคำอธิบาย
    const categoryCodesList = tsicCodes.map(code => code.category_code).filter(Boolean);
    const uniqueCategoryCodes = [...new Set(categoryCodesList)];
    
    // ถ้ามีรหัส TSIC ให้ดึงข้อมูลคำอธิบายจากตาราง tsic_categories
    let descriptions = {};
    let categoryDescriptions = {};
    
    // 1. ดึงข้อมูลคำอธิบายรหัส TSIC
    if (tsicCodesList.length > 0) {
      try {
        // สร้าง placeholders สำหรับคำสั่ง SQL
        const placeholders = tsicCodesList.map(() => '?').join(',');
        
        // ดึงข้อมูลคำอธิบายจากตาราง tsic_categories
        const descSql = `
          SELECT tsic_code, description, description_EN 
          FROM tsic_categories 
          WHERE tsic_code IN (${placeholders})
        `;
        
        const descResults = await query(descSql, tsicCodesList);
        
        // สร้าง map ของรหัส TSIC และคำอธิบาย
        descResults.forEach(row => {
          descriptions[row.tsic_code] = {
            description: row.description,
            description_EN: row.description_EN
          };
        });
      } catch (error) {
        console.error('Error fetching TSIC descriptions:', error);
        // ไม่ต้องทำอะไร เพราะเราจะใช้ค่าเริ่มต้นสำหรับคำอธิบายที่ไม่พบ
      }
    }
    
    // 2. ดึงข้อมูลคำอธิบายหมวดหมู่
    if (uniqueCategoryCodes.length > 0) {
      try {
        // สร้าง placeholders สำหรับคำสั่ง SQL
        const catPlaceholders = uniqueCategoryCodes.map(() => '?').join(',');
        
        // ดึงข้อมูลคำอธิบายหมวดหมู่จากตาราง tsic_categories
        // ใช้การดึงข้อมูลแบบแยกเป็นหมวดหมู่ย่อยและหมวดหมู่ใหญ่
        const catSql = `
          SELECT DISTINCT category_code, 
                          MAX(description) as category_name, 
                          MAX(description_EN) as category_name_EN 
          FROM tsic_categories 
          WHERE category_code IN (${catPlaceholders})
          GROUP BY category_code
        `;
        
        console.log('Fetching category descriptions with SQL:', catSql);
        console.log('Category codes:', uniqueCategoryCodes);
        
        const catResults = await query(catSql, uniqueCategoryCodes);
        console.log('Category results:', catResults);
        
        // สร้าง map ของรหัสหมวดหมู่และคำอธิบาย
        catResults.forEach(row => {
          categoryDescriptions[row.category_code] = {
            name: row.category_name || `หมวดหมู่ ${row.category_code}`,
            name_EN: row.category_name_EN || `Category ${row.category_code}`
          };
        });
      } catch (error) {
        console.error('Error fetching category descriptions:', error);
        // ไม่ต้องทำอะไร เพราะเราจะใช้ค่าเริ่มต้นสำหรับคำอธิบายที่ไม่พบ
      }
    }
    
    // แปลงข้อมูลให้อยู่ในรูปแบบที่ง่ายต่อการใช้งาน
    const formattedCodes = tsicCodes.map(code => {
      // ดึงข้อมูลคำอธิบายจาก map ที่สร้างไว้
      const desc = descriptions[code.tsic_code] || {};
      // ดึงข้อมูลคำอธิบายหมวดหมู่
      const categoryDesc = categoryDescriptions[code.category_code] || {};
      
      return {
        id: code.id,
        tsic_code: code.tsic_code,
        category_code: code.category_code || '00',
        description: desc.description || `รหัส TSIC: ${code.tsic_code}`,
        description_EN: desc.description_EN || `TSIC Code: ${code.tsic_code}`,
        category_name: categoryDesc.name || `หมวดหมู่ ${code.category_code || '00'}`,
        category_name_EN: categoryDesc.name_EN || `Category ${code.category_code || '00'}`,
        status: code.status === 1 ? 'approved' : 'pending',
        created_at: code.created_at,
        updated_at: code.updated_at
      };
    });
    
    // ส่งข้อมูลกลับในรูปแบบที่ง่ายต่อการใช้งาน
    return NextResponse.json({
      success: true,
      data: formattedCodes,
      total: tsicCodes.length,
      categories: categoryDescriptions
    });
    
  } catch (error) {
    console.error('Error retrieving TSIC codes:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรหัส TSIC กรุณาลองใหม่อีกครั้ง',
        error: error.message
      },
      { status: 500 }
    );
  }
}
