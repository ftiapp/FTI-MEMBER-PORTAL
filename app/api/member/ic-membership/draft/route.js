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
    await ensureTableExists();
    
    // For now, we'll use a fixed user ID - in real app, get from session
    const userId = 'current_user';
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(
        'SELECT draft_data FROM member_ic_drafts WHERE user_id = ?',
        [userId]
      );
      
      if (rows.length === 0) {
        return NextResponse.json({ draft: null });
      }
      
      const draft = JSON.parse(rows[0].draft_data);
      return NextResponse.json({ draft });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error loading IC draft:', error);
    return NextResponse.json(
      { error: 'Failed to load draft' },
      { status: 500 }
    );
  }
}

// POST - Save draft
export async function POST(request) {
  try {
    await ensureTableExists();
    
    const body = await request.json();
    const userId = 'current_user'; // In real app, get from session
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.execute(`
        INSERT INTO member_ic_drafts (user_id, draft_data)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE 
        draft_data = VALUES(draft_data),
        updated_at = CURRENT_TIMESTAMP
      `, [userId, JSON.stringify(body)]);
      
      return NextResponse.json({ success: true });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error saving IC draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

// DELETE - Delete draft
export async function DELETE() {
  try {
    await ensureTableExists();
    
    const userId = 'current_user'; // In real app, get from session
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.execute(
        'DELETE FROM member_ic_drafts WHERE user_id = ?',
        [userId]
      );
      
      return NextResponse.json({ success: true });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error deleting IC draft:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
