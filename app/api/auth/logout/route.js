import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Get the hostname from request headers to set domain correctly
    const host = request.headers.get('host') || '';
    const domain = host.includes('localhost') ? undefined : host.split(':')[0];
    
    // Create a response
    const response = NextResponse.json({ 
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });
    
    // Clear all auth-related cookies
    response.cookies.set({
      name: 'token',
      value: '',
      expires: new Date(0),
      path: '/',
      domain
    });
    
    response.cookies.set({
      name: 'rememberMe',
      value: '',
      expires: new Date(0),
      path: '/',
      domain
    });
    
    response.cookies.set({
      name: 'userEmail',
      value: '',
      expires: new Date(0),
      path: '/',
      domain
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
      { status: 500 }
    );
  }
}
