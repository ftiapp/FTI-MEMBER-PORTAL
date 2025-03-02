import { NextResponse } from 'next/server';
import { query } from '../../lib/db';

export async function GET() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    
    // Try to execute a simple query
    const result = await query('SELECT 1 as test');
    
    console.log('Database connection test result:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      result: result
    });
  } catch (error) {
    console.error('Database connection test error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
