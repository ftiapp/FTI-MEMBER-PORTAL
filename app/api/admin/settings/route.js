// /api/admin/settings/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Default settings structure
const defaultSettings = {
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
  },
  notifications: {
    emailNotifications: true,
    adminAlerts: true,
    dailyDigest: false,
    notificationTypes: {
      newMembers: true,
      verificationRequests: true,
      profileUpdates: true,
      addressUpdates: true,
      productUpdates: true,
      contactMessages: true,
    },
  },
  system: {
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'error',
    cacheTimeout: 30,
    maxUploadSize: 5,
    allowedFileTypes: '.jpg,.jpeg,.png,.pdf,.doc,.docx',
  },
  api: {
    rateLimit: 100,
    apiTimeout: 30,
    enableExternalApi: false,
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 7,
    includeUploads: true,
  },
};

export async function GET() {
  try {
    // Verify admin permissions
    const adminLevel = await verifyAdminPermissions();
    if (adminLevel < 4) {
      return NextResponse.json(
        { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      );
    }
    
    // Load settings from database or file
    // For now, returning default settings
    const settings = await loadSettings();
    
    return NextResponse.json({
      success: true,
      settings: settings || defaultSettings
    });
    
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการโหลดการตั้งค่า' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Verify admin permissions
    const adminLevel = await verifyAdminPermissions();
    if (adminLevel < 4) {
      return NextResponse.json(
        { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      );
    }
    
    const { settings } = await request.json();
    
    if (!settings) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลการตั้งค่าไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    // Validate settings data
    const validationResult = validateSettings(settings);
    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, message: validationResult.message },
        { status: 400 }
      );
    }
    
    // Save settings to database or file
    const savedSettings = await saveSettings(settings);
    
    return NextResponse.json({
      success: true,
      settings: savedSettings,
      message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว'
    });
    
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' },
      { status: 500 }
    );
  }
}

// Helper functions
async function verifyAdminPermissions() {
  const cookieStore = cookies();
  const adminToken = cookieStore.get('admin_token');
  
  if (!adminToken) {
    throw new Error('ไม่พบ token ของแอดมิน');
  }
  
  try {
    // ดึงข้อมูลแอดมินจาก token
    const response = await fetch('http://localhost:3456/api/admin/check-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: adminToken.value }),
    });
    
    if (!response.ok) {
      throw new Error('ไม่สามารถตรวจสอบสิทธิ์แอดมินได้');
    }
    
    const data = await response.json();
    
    // ตรวจสอบระดับแอดมิน - ต้องเป็นระดับ 5 เท่านั้น
    if (!data.adminLevel || data.adminLevel < 5) {
      throw new Error('คุณไม่มีสิทธิ์เข้าถึงการตั้งค่าระบบ เฉพาะแอดมินระดับ 5 เท่านั้น');
    }
    
    return data.adminLevel;
  } catch (error) {
    console.error('Error verifying admin permissions:', error);
    throw new Error(error.message || 'ไม่สามารถตรวจสอบสิทธิ์แอดมินได้');
  }
}

async function loadSettings() {
  // Load settings from your database or configuration file
  // This is a placeholder - implement your actual logic
  return defaultSettings;
}

async function saveSettings(settings) {
  // Save settings to your database or configuration file
  // This is a placeholder - implement your actual logic
  console.log('Saving settings:', settings);
  return settings;
}

function validateSettings(settings) {
  // Validate settings structure and values
  if (settings.security) {
    if (settings.security.passwordPolicy?.minLength < 6) {
      return { valid: false, message: 'ความยาวรหัสผ่านขั้นต่ำต้องไม่น้อยกว่า 6 ตัวอักษร' };
    }
    
    if (settings.security.sessionTimeout < 15) {
      return { valid: false, message: 'เวลาหมดอายุของเซสชันต้องไม่น้อยกว่า 15 นาที' };
    }
    
    if (settings.security.maxLoginAttempts < 3 || settings.security.maxLoginAttempts > 10) {
      return { valid: false, message: 'จำนวนครั้งที่ล็อกอินผิดพลาดสูงสุดต้องอยู่ระหว่าง 3 ถึง 10 ครั้ง' };
    }
  }
  
  if (settings.system) {
    if (settings.system.maxUploadSize < 1 || settings.system.maxUploadSize > 100) {
      return { valid: false, message: 'ขนาดไฟล์สูงสุดต้องอยู่ระหว่าง 1 ถึง 100 MB' };
    }
  }
  
  if (settings.api) {
    if (settings.api.rateLimit < 10 || settings.api.rateLimit > 1000) {
      return { valid: false, message: 'จำนวนคำขอต่อนาทีต้องอยู่ระหว่าง 10 ถึง 1000' };
    }
  }
  
  return { valid: true };
}