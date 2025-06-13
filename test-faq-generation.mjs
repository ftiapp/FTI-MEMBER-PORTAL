// test-faq-generation.js - ไฟล์สำหรับทดสอบการสร้าง FAQ อัตโนมัติ
// ต้องรันด้วยคำสั่ง: node --experimental-json-modules test-faq-generation.mjs

// ใช้ dynamic import เพื่อโหลดโมดูล ES
(async () => {
  try {
    console.log('กำลังโหลดโมดูล...');
    const aiSystemManager = await import('./app/api/faq/aiSystemManager.js');
    const { initializeAISystem, scanProjectContent, generateFAQsFromContent } = aiSystemManager;
    
    console.log('เริ่มต้นระบบ AI...');
    await initializeAISystem();
    
    console.log('\n--- สแกนเนื้อหาโครงการ ---');
    const scanResult = await scanProjectContent('./app/api/faq');
    console.log('ผลลัพธ์การสแกน:', JSON.stringify(scanResult, null, 2));
    
    console.log('\n--- สร้าง FAQ อัตโนมัติ ---');
    const genResult = await generateFAQsFromContent();
    console.log('ผลลัพธ์การสร้าง FAQ:', JSON.stringify(genResult, null, 2));
    
    console.log('\nเสร็จสิ้นการทดสอบ');
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  }
})();
