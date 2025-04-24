import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { checkAdminSession } from '@/app/lib/auth';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/admin/run-migrations
 * 
 * Runs database migrations for the application.
 * This endpoint is for admin use only.
 * 
 * Returns:
 * - success: boolean
 * - message: string
 * - results: array of migration results
 */
export async function POST(request) {
  try {
    // Check admin session
    const admin = await checkAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    // Get migration files
    const migrationsDir = path.join(process.cwd(), 'app', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'));
    
    // Run migrations
    const results = [];
    
    for (const file of migrationFiles) {
      try {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Split SQL into individual statements
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            await query(statement);
          }
        }
        
        results.push({
          file,
          success: true,
          message: `Migration ${file} executed successfully`
        });
      } catch (error) {
        console.error(`Error executing migration ${file}:`, error);
        results.push({
          file,
          success: false,
          message: `Error executing migration ${file}: ${error.message}`
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migrations executed',
      results
    });
  } catch (error) {
    console.error('Error running migrations:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการรันไฟล์อัปเดตฐานข้อมูล' },
      { status: 500 }
    );
  }
}
