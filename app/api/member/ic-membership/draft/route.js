import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fti_portal',
  port: process.env.DB_PORT || 3306,
};

// Create table if not exists
async function ensureTableExists() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS member_ic_drafts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        draft_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user (user_id)
      )
    `);
  } finally {
    await connection.end();
  }
}

// GET - Load draft
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // ใช้ idcard เป็น unique identifier สำหรับการโหลด draft
      const [rows] = await connection.execute(
        'SELECT draft_data FROM MemberRegist_IC_Draft WHERE status = 3 ORDER BY updated_at DESC LIMIT 1'
      );
      
      if (rows.length === 0) {
        return NextResponse.json({ draft: null });
      }
      
      return NextResponse.json({ 
        draft: JSON.parse(rows[0].draft_data) 
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error loading IC draft:', error);
    return NextResponse.json({ draft: null });
  }
}

// POST - Save draft
export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, currentStep = 1 } = body;
    
    // ใช้ idcard เป็น unique identifier สำหรับ IC
    const idCard = formData?.idCardNumber || formData?.idcard;
    
    if (!idCard) {
      return NextResponse.json({ 
        success: false, 
        message: 'เลขบัตรประชาชนจำเป็นสำหรับการบันทึก draft' 
      }, { status: 400 });
    }

    if (!formData) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // ใช้ MemberRegist_IC_Draft ตามระบบเดียวกัน
      await connection.execute(`
        INSERT INTO MemberRegist_IC_Draft (user_id, draft_data, current_step, status, idcard, created_at, updated_at)
        VALUES (?, ?, ?, 3, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        draft_data = VALUES(draft_data),
        current_step = VALUES(current_step),
        updated_at = NOW()
      `, ['current_user', JSON.stringify(formData), currentStep, idCard]);
      
      return NextResponse.json({ 
        success: true, 
        message: 'บันทึก draft สำเร็จ',
        taxId: idCard 
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error saving IC draft:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

// DELETE - Delete draft
export async function DELETE() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // ลบ draft โดยใช้ status = 3
      await connection.execute(
        'DELETE FROM MemberRegist_IC_Draft WHERE status = 3'
      );
      
      return NextResponse.json({ success: true });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error deleting IC draft:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
