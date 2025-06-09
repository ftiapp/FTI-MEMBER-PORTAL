import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/app/lib/db';
import { jwtVerify } from 'jose';

// สร้าง secret key สำหรับ JWT
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-for-admin-auth');

/**
 * ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
 * @param {Request} request - อ็อบเจ็คต์ Request จาก Next.js
 * @returns {Promise<boolean>} ตอนนี้ให้ใช้ได้ทุกคนโดยไม่ต้องล็อกอิน
 */
async function checkUserLoggedIn(request) {
  // อนุญาตให้ทุกคนใช้งานได้โดยไม่ต้องล็อกอิน
  return true;
}

// Rate limiting variables
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 20; // Maximum 20 requests per minute
const ipRequestCounts = new Map(); // Store IP addresses and their request counts

// Helper function to sanitize input to prevent SQL injection
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  // Remove SQL injection patterns
  return input
    .replace(/[\\"']/g, '')
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/UNION/gi, '')
    .replace(/SELECT/gi, '')
    .replace(/UPDATE/gi, '')
    .replace(/DELETE/gi, '')
    .replace(/DROP/gi, '')
    .replace(/INSERT/gi, '')
    .replace(/ALTER/gi, '')
    .replace(/CREATE/gi, '')
    .trim();
}

// Rate limiting middleware
async function checkRateLimit(request) {
  // Get client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  
  const now = Date.now();
  
  // Get current count for this IP
  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  const record = ipRequestCounts.get(ip);
  
  // Reset counter if window has passed
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return { allowed: true };
  }
  
  // Check if rate limit exceeded
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, resetTime: record.resetTime };
  }
  
  // Increment counter
  record.count++;
  return { allowed: true };
}

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now > record.resetTime) {
      ipRequestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ฟังก์ชันสำหรับการหาคำถามที่เกี่ยวข้องสำหรับแนะนำต่อ
async function findRelatedQuestions(currentCategory, currentId, allFaqs) {
  try {
    // หาคำถามในหมวดหมู่เดียวกัน
    const sameCategoryFaqs = allFaqs.filter(faq => 
      faq.category === currentCategory && faq.id !== currentId
    );
    
    // หากมีคำถามในหมวดหมู่เดียวกัน ให้สุ่มเลือกไม่เกิน 3 คำถาม
    if (sameCategoryFaqs.length > 0) {
      // สุ่มเรียงลำดับ
      const shuffled = [...sameCategoryFaqs].sort(() => 0.5 - Math.random());
      // เลือกไม่เกิน 3 คำถาม
      return shuffled.slice(0, Math.min(3, shuffled.length)).map(faq => faq.question);
    }
    
    // หากไม่มีคำถามในหมวดหมู่เดียวกัน ให้สุ่มเลือกจากทั้งหมด
    const otherFaqs = allFaqs.filter(faq => faq.id !== currentId);
    const shuffled = [...otherFaqs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(3, shuffled.length)).map(faq => faq.question);
  } catch (error) {
    console.error('Error finding related questions:', error);
    return [];
  }
}

// ฟังก์ชันสำหรับการค้นหาคำตอบโดยใช้ NLP อย่างง่าย
async function findAnswer(userQuestion) {
  try {
    // ดึงข้อมูล FAQ ทั้งหมดที่เปิดใช้งาน
    const faqs = await query({
      query: 'SELECT * FROM faqs WHERE is_active = TRUE',
      values: []
    });

    if (!faqs || faqs.length === 0) {
      return null;
    }

    // แปลงคำถามผู้ใช้เป็นตัวพิมพ์เล็ก
    const normalizedQuestion = userQuestion.toLowerCase();
    
    // แยกคำในคำถามผู้ใช้
    const words = normalizedQuestion.split(/\s+/);
    
    // คำนวณคะแนนความเกี่ยวข้องสำหรับแต่ละ FAQ
    const scores = faqs.map(faq => {
      let score = 0;
      
      // ตรวจสอบคำถาม
      const normalizedFaqQuestion = faq.question.toLowerCase();
      words.forEach(word => {
        if (word.length > 2 && normalizedFaqQuestion.includes(word)) {
          score += 2; // ให้น้ำหนักมากกว่าสำหรับคำที่พบในคำถาม
        }
      });
      
      // ตรวจสอบคีย์เวิร์ด
      const keywords = faq.keywords.toLowerCase().split(',');
      keywords.forEach(keyword => {
        if (normalizedQuestion.includes(keyword.trim())) {
          score += 3; // ให้น้ำหนักมากที่สุดสำหรับคีย์เวิร์ด
        }
      });
      
      return { faq, score };
    });
    
    // เรียงลำดับตามคะแนน
    scores.sort((a, b) => b.score - a.score);
    
    // กำหนดค่าความเชื่อมั่นขั้นต่ำ (threshold)
    const confidenceThreshold = 2;
    
    if (scores[0].score > confidenceThreshold) {
      // หาคำถามที่เกี่ยวข้องสำหรับแนะนำต่อ
      const suggestions = await findRelatedQuestions(
        scores[0].faq.category, 
        scores[0].faq.id,
        faqs
      );
      
      return {
        question: scores[0].faq.question,
        answer: scores[0].faq.answer,
        confidence: scores[0].score,
        id: scores[0].faq.id,
        category: scores[0].faq.category,
        suggestions: suggestions
      };
    }

    return null;
  } catch (error) {
    console.error('Error finding answer:', error);
    return null;
  }
}

// API endpoint สำหรับค้นหาคำตอบ
export async function POST(request) {
  try {
    // ตรวจสอบการล็อกอิน
    const isLoggedIn = await checkUserLoggedIn(request);
    if (!isLoggedIn) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณาล็อกอินเพื่อใช้งานแชทบอท' 
      }, { status: 401 });
    }
    
    // ตรวจสอบ rate limit
    const rateLimitCheck = await checkRateLimit(request);
    if (!rateLimitCheck.allowed) {
      const resetIn = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
      return NextResponse.json({ 
        success: false, 
        message: `คุณส่งคำขอมากเกินไป กรุณารอ ${resetIn} วินาที` 
      }, { 
        status: 429,
        headers: {
          'Retry-After': resetIn.toString(),
          'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitCheck.resetTime / 1000).toString()
        }
      });
    }
    
    const body = await request.json();
    let { question } = body;
    
    // ทำความสะอาดข้อมูลนำเข้าเพื่อป้องกัน SQL Injection
    question = sanitizeInput(question);

    if (!question || question.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณาระบุคำถามที่มีความยาวมากกว่า 1 ตัวอักษร' 
      }, { status: 400 });
    }

    // ตรวจสอบคำทักทาย
    const greetings = ['สวัสดี', 'hello', 'hi', 'สวัสดีครับ', 'สวัสดีค่ะ'];
    const normalizedQuestion = question.toLowerCase();
    
    if (greetings.some(greeting => normalizedQuestion.includes(greeting.toLowerCase()))) {
      return NextResponse.json({
        success: true,
        data: {
          question: 'สวัสดี',
          answer: 'สวัสดีครับ! มีอะไรให้ช่วยเหลือไหมครับ?',
          suggestions: [
            'วิธีการสมัครสมาชิก',
            'วิธีการยืนยันตัวตน',
            'วิธีการแก้ไขข้อมูลที่อยู่'
          ]
        }
      });
    }
    
    // ตรวจสอบคำถามเกี่ยวกับเอกสาร เพื่อถามคำถามเพิ่มเติม
    if (normalizedQuestion.includes('เอกสาร')) {
      // ตรวจสอบว่าคำถามมีความเฉพาะเจาะจงเกี่ยวกับประเภทเอกสารหรือไม่
      const hasSpecificDocumentType = [
        'ยืนยันสมาชิกเดิม', 'ยืนยันตัวตน', 'สมาชิกเดิม',
        'แก้ไขที่อยู่', 'เปลี่ยนที่อยู่', 'อัปเดตที่อยู่'
      ].some(term => normalizedQuestion.includes(term));
      
      // ถ้าไม่มีความเฉพาะเจาะจง ให้ถามคำถามเพิ่มเติม
      if (!hasSpecificDocumentType) {
        return NextResponse.json({
          success: true,
          data: {
            question: 'เอกสาร',
            answer: 'เอกสารสำหรับอะไรคะ? โปรดระบุว่าต้องการทราบเกี่ยวกับเอกสารสำหรับการยืนยันสมาชิกเดิม หรือเอกสารสำหรับการแก้ไขที่อยู่',
            requiresFollowUp: true,
            followUpOptions: [
              'เอกสารสำหรับยืนยันสมาชิกเดิม',
              'เอกสารสำหรับการแก้ไขที่อยู่'
            ]
          }
        });
      }
    }

    const answer = await findAnswer(question);

    if (answer) {
      return NextResponse.json({
        success: true,
        data: answer
      });
    } else {
      // ดึงคำถามแนะนำทั่วไปเมื่อไม่พบคำตอบ
      let generalSuggestions = [];
      
      try {
        const generalFaqs = await query({
          query: 'SELECT question FROM faqs WHERE is_active = TRUE ORDER BY RAND() LIMIT 3',
          values: []
        });
        
        if (generalFaqs && generalFaqs.length > 0) {
          generalSuggestions = generalFaqs.map(faq => faq.question);
        }
      } catch (error) {
        console.error('Error fetching suggested questions:', error);
        // ใช้คำถามแนะนำที่กำหนดไว้ล่วงหน้าหากไม่สามารถดึงจากฐานข้อมูลได้
      }
      
      // เพิ่มคำถามแนะนำที่กำหนดไว้ล่วงหน้าหากไม่มีคำถามจากฐานข้อมูล
      if (generalSuggestions.length === 0) {
        generalSuggestions = [
          'วิธีการสมัครสมาชิก',
          'วิธีการยืนยันตัวตน',
          'วิธีการแก้ไขข้อมูลที่อยู่'
        ];
      }
      
      return NextResponse.json({
        success: false,
        message: 'ไม่พบคำตอบสำหรับคำถามนี้',
        suggestContactForm: true,
        data: {
          suggestions: [
            ...generalSuggestions,
            'วิธีการติดต่อเจ้าหน้าที่'
          ]
        }
      });
    }
  } catch (error) {
    console.error('Error in FAQ API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการค้นหาคำตอบ' 
    }, { status: 500 });
  }
}

// API endpoint สำหรับดึงข้อมูล FAQ ทั้งหมด (สำหรับผู้ใช้ทั่วไป)
export async function GET(request) {
  try {
    // ตรวจสอบการล็อกอิน
    const isLoggedIn = await checkUserLoggedIn(request);
    if (!isLoggedIn) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณาล็อกอินเพื่อใช้งานแชทบอท' 
      }, { status: 401 });
    }
    
    // ตรวจสอบ rate limit
    const rateLimitCheck = await checkRateLimit(request);
    if (!rateLimitCheck.allowed) {
      const resetIn = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
      return NextResponse.json({ 
        success: false, 
        message: `คุณส่งคำขอมากเกินไป กรุณารอ ${resetIn} วินาที` 
      }, { 
        status: 429,
        headers: {
          'Retry-After': resetIn.toString(),
          'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitCheck.resetTime / 1000).toString()
        }
      });
    }
    
    const { searchParams } = new URL(request.url);
    let limit = searchParams.get('limit');
    
    // ทำความสะอาดข้อมูลนำเข้าเพื่อป้องกัน SQL Injection
    if (limit) {
      limit = parseInt(limit, 10);
      if (isNaN(limit) || limit <= 0) {
        limit = 10; // ค่าเริ่มต้น
      }
      // จำกัดขนาดสูงสุดเพื่อป้องกัน DOS
      limit = Math.min(limit, 50);
    }
    
    let query_sql = 'SELECT id, question, answer, category FROM faqs WHERE is_active = TRUE';
    let values = [];
    
    // ถ้ามีการระบุจำนวนจำกัด
    if (limit) {
      // สุ่มคำถามที่จะแสดง
      query_sql += ' ORDER BY RAND() LIMIT ?';
      values.push(parseInt(limit, 10));
    } else {
      // ถ้าไม่มีการระบุจำนวนจำกัด ให้เรียงตามหมวดหมู่
      query_sql += ' ORDER BY category, id';
    }

    try {
      const faqs = await query({
        query: query_sql,
        values: values
      });

      return NextResponse.json({
        success: true,
        data: faqs
      });
    } catch (dbError) {
      console.error('Database error fetching FAQs:', dbError);
      
      // หากมีข้อผิดพลาดจากฐานข้อมูล ให้ส่งคำถามแนะนำเบื้องต้นกลับไป
      const defaultFaqs = [
        { id: 0, question: 'วิธีการสมัครสมาชิก', answer: '', category: 'การสมัครสมาชิก' },
        { id: 1, question: 'วิธีการยืนยันตัวตน', answer: '', category: 'บัญชีผู้ใช้' },
        { id: 2, question: 'วิธีการแก้ไขข้อมูลที่อยู่', answer: '', category: 'การแก้ไขข้อมูล' },
        { id: 3, question: 'วิธีการเพิ่มสินค้าหรือบริการ', answer: '', category: 'การแก้ไขข้อมูล' },
        { id: 4, question: 'วิธีการอัปโหลดโลโก้บริษัท', answer: '', category: 'การแก้ไขข้อมูล' }
      ];
      
      // ถ้ามีการระบุจำนวนจำกัด ให้จำกัดตามที่ระบุ
      if (limit) {
        return NextResponse.json({
          success: true,
          data: defaultFaqs.slice(0, parseInt(limit, 10)),
          isDefault: true
        });
      }
      
      return NextResponse.json({
        success: true,
        data: defaultFaqs,
        isDefault: true
      });
    }
  } catch (error) {
    console.error('Error in FAQ GET API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล FAQ' 
    }, { status: 500 });
  }
}
