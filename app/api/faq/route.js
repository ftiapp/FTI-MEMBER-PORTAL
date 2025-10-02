import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/app/lib/db";
import { jwtVerify } from "jose";

// สร้าง secret key สำหรับ JWT
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-for-admin-auth",
);

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

// Conversation context storage (in-memory for demo, should use Redis in production)
const conversationContexts = new Map();
const CONTEXT_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Advanced Thai language processing
const THAI_LANGUAGE_UTILS = {
  // ขยาย Thai stopwords ให้ครอบคลุมมากขึ้น
  stopwords: [
    "ที่",
    "และ",
    "ใน",
    "ของ",
    "ให้",
    "ได้",
    "ไป",
    "มา",
    "กับ",
    "จะ",
    "ไม่",
    "เป็น",
    "มี",
    "ว่า",
    "การ",
    "ค่ะ",
    "คะ",
    "ครับ",
    "นะ",
    "ค่ะ",
    "ขอ",
    "อยาก",
    "ต้องการ",
    "อยากทราบ",
    "รบกวน",
    "หรือ",
    "แล้ว",
    "ก็",
    "คือ",
    "เพื่อ",
    "เมื่อ",
    "ถ้า",
    "หาก",
    "แต่",
    "อีก",
    "นั้น",
    "นี้",
    "ซึ่ง",
    "ตัว",
    "อัน",
    "แห่ง",
    "ช่วย",
    "บอก",
    "ทำ",
    "ไร",
    "อะไร",
    "ยัง",
    "เลย",
    "แค่",
    "เพียง",
  ],

  // คำพ้อง (Synonyms) สำหรับเพิ่มความเข้าใจ
  synonyms: {
    สมัคร: ["ลงทะเบียน", "สมัครสมาชิก", "เข้าร่วม", "register"],
    ยืนยัน: ["ตรวจสอบ", "verify", "confirm", "อนุมัติ"],
    แก้ไข: ["เปลี่ยน", "ปรับ", "อัปเดต", "edit", "modify", "update"],
    ที่อยู่: ["address", "ลิงค์", "สถานที่"],
    อีเมล: ["อีเมลล์", "เมล", "เมลล์", "email", "e-mail", "mail"],
    รหัสผ่าน: ["พาสเวิร์ด", "password", "รหัส"],
    ติดต่อ: ["สอบถาม", "contact", "โทร", "call"],
    ปัญหา: ["บัค", "bug", "error", "ข้อผิดพลาด", "เสีย"],
    เข้าใช้: ["เข้าสู่ระบบ", "login", "log in", "เข้า"],
    ออก: ["ออกจากระบบ", "logout", "log out"],
    อัปโหลด: ["upload", "โหลด", "ส่ง"],
    ดาวน์โหลด: ["download", "โหลด", "ดาน"],
    บัญชี: ["account", "แอคเคาท์", "โปรไฟล์", "profile"],
  },

  // Intent categories สำหรับจำแนกประเภทคำถาม
  intents: {
    greeting: ["สวัสดี", "หวัดดี", "hello", "hi", "hey"],
    registration: ["สมัคร", "ลงทะเบียน", "register", "signup"],
    verification: ["ยืนยัน", "verify", "confirm", "อนุมัติ"],
    modification: ["แก้ไข", "เปลี่ยน", "ปรับ", "อัปเดต", "edit", "modify", "update"],
    access_problem: ["เข้าไม่ได้", "ลืม", "หาย", "forgot", "lost", "cannot access"],
    contact: ["ติดต่อ", "สอบถาม", "contact", "call", "help"],
    document: ["เอกสาร", "document", "file", "ใบ", "หนังสือ"],
    technical: ["ปัญหา", "บัค", "bug", "error", "ข้อผิดพลาด", "เสีย"],
    upload: ["อัปโหลด", "upload", "ส่ง", "โหลด"],
    account: ["บัญชี", "account", "แอคเคาท์", "โปรไฟล์", "profile"],
  },

  // ฟังก์ชันทำความสะอาดและปรับแต่งข้อความภาษาไทย
  normalize: function (text) {
    return text
      .toLowerCase()
      .replace(/[\u0E48-\u0E4B]/g, "") // ลบวรรณยุกต์
      .replace(/[\?\!\,\.\;\:\(\)\[\]\"\']/g, " ") // ลบเครื่องหมายวรรคตอน
      .replace(/\s+/g, " ") // รวม whitespace
      .trim();
  },

  // ฟังก์ชันแยกคำและกรอง stopwords
  tokenize: function (text) {
    const normalized = this.normalize(text);
    return normalized
      .split(/\s+/)
      .filter((word) => word.length > 1 && !this.stopwords.includes(word));
  },

  // ฟังก์ชันขยายคำด้วย synonyms
  expandWithSynonyms: function (words) {
    const expanded = new Set(words);

    words.forEach((word) => {
      Object.entries(this.synonyms).forEach(([key, synonymList]) => {
        if (synonymList.includes(word) || key === word) {
          expanded.add(key);
          synonymList.forEach((synonym) => expanded.add(synonym));
        }
      });
    });

    return Array.from(expanded);
  },

  // ฟังก์ชันจำแนก intent
  detectIntent: function (text) {
    const normalized = this.normalize(text);
    const detectedIntents = [];

    Object.entries(this.intents).forEach(([intent, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (normalized.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > 0) {
        detectedIntents.push({ intent, score });
      }
    });

    return detectedIntents.sort((a, b) => b.score - a.score);
  },
};

// Helper function to sanitize input to prevent SQL injection
function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  // Remove SQL injection patterns
  return input
    .replace(/[\\"']/g, "")
    .replace(/;/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .replace(/UNION/gi, "")
    .replace(/SELECT/gi, "")
    .replace(/UPDATE/gi, "")
    .replace(/DELETE/gi, "")
    .replace(/DROP/gi, "")
    .replace(/INSERT/gi, "")
    .replace(/ALTER/gi, "")
    .replace(/CREATE/gi, "")
    .trim();
}

// Rate limiting middleware
async function checkRateLimit(request) {
  // Get client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

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
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, record] of ipRequestCounts.entries()) {
      if (now > record.resetTime) {
        ipRequestCounts.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
);

// Conversation context management
function getConversationContext(sessionId) {
  const context = conversationContexts.get(sessionId);
  if (!context || Date.now() > context.expiry) {
    return null;
  }
  return context.data;
}

function setConversationContext(sessionId, data) {
  conversationContexts.set(sessionId, {
    data: data,
    expiry: Date.now() + CONTEXT_EXPIRY,
  });
}

// Clean up expired contexts
setInterval(
  () => {
    const now = Date.now();
    for (const [sessionId, context] of conversationContexts.entries()) {
      if (now > context.expiry) {
        conversationContexts.delete(sessionId);
      }
    }
  },
  5 * 60 * 1000,
);

// Enhanced function for finding related questions
async function findRelatedQuestions(currentCategory, currentId, allFaqs, userContext = null) {
  try {
    let candidates = [];

    // 1. หาคำถามในหมวดหมู่เดียวกัน
    const sameCategoryFaqs = allFaqs.filter(
      (faq) => faq.category === currentCategory && faq.id !== currentId,
    );

    // 2. หาคำถามที่เกี่ยวข้องกับ context ของผู้ใช้
    if (userContext && userContext.intents) {
      const intentRelatedFaqs = allFaqs.filter((faq) => {
        const faqIntents = THAI_LANGUAGE_UTILS.detectIntent(faq.question + " " + faq.keywords);
        return (
          userContext.intents.some((userIntent) =>
            faqIntents.some((faqIntent) => faqIntent.intent === userIntent.intent),
          ) && faq.id !== currentId
        );
      });
      candidates.push(...intentRelatedFaqs);
    }

    // 3. เพิ่มคำถามในหมวดหมู่เดียวกัน
    candidates.push(...sameCategoryFaqs);

    // 4. หากยังไม่เพียงพอ ให้เพิ่มคำถามยอดนิยม
    if (candidates.length < 3) {
      const otherFaqs = allFaqs.filter((faq) => faq.id !== currentId);
      candidates.push(...otherFaqs);
    }

    // ลบคำถามซ้ำ
    const uniqueCandidates = candidates.filter(
      (faq, index, self) => index === self.findIndex((f) => f.id === faq.id),
    );

    // สุ่มเรียงลำดับและเลือกไม่เกิน 3 คำถาม
    const shuffled = [...uniqueCandidates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(3, shuffled.length)).map((faq) => faq.question);
  } catch (error) {
    console.error("Error finding related questions:", error);
    return [];
  }
}

// Advanced answer finding with enhanced NLP
async function findAnswer(userQuestion, sessionId = null) {
  try {
    // ดึงข้อมูล FAQ ทั้งหมดที่เปิดใช้งาน
    const faqs = await query({
      query: "SELECT * FROM faqs WHERE is_active = TRUE",
      values: [],
    });

    if (!faqs || faqs.length === 0) {
      return null;
    }

    // Get conversation context
    const context = getConversationContext(sessionId);

    // Detect user intent
    const userIntents = THAI_LANGUAGE_UTILS.detectIntent(userQuestion);

    // Tokenize and expand user question
    const userTokens = THAI_LANGUAGE_UTILS.tokenize(userQuestion);
    const expandedTokens = THAI_LANGUAGE_UTILS.expandWithSynonyms(userTokens);

    // สร้าง n-grams จากคำถามผู้ใช้
    const ngrams = [];

    // 1-grams (คำเดี่ยว)
    expandedTokens.forEach((word) => ngrams.push(word));

    // 2-grams (คำคู่)
    for (let i = 0; i < expandedTokens.length - 1; i++) {
      ngrams.push(`${expandedTokens[i]} ${expandedTokens[i + 1]}`);
    }

    // 3-grams (คำสาม)
    for (let i = 0; i < expandedTokens.length - 2; i++) {
      ngrams.push(`${expandedTokens[i]} ${expandedTokens[i + 1]} ${expandedTokens[i + 2]}`);
    }

    // คำนวณคะแนนความเกี่ยวข้องสำหรับแต่ละ FAQ
    const scores = faqs.map((faq) => {
      const normalizedFaqQuestion = THAI_LANGUAGE_UTILS.normalize(faq.question);
      const normalizedFaqAnswer = THAI_LANGUAGE_UTILS.normalize(faq.answer);
      const keywords = faq.keywords
        .toLowerCase()
        .split(",")
        .map((k) => k.trim());

      let score = 0;

      // 1. Exact match - สูงสุด
      if (THAI_LANGUAGE_UTILS.normalize(userQuestion) === normalizedFaqQuestion) {
        score += 100;
      }

      // 2. Intent matching - สำคัญมาก
      const faqIntents = THAI_LANGUAGE_UTILS.detectIntent(faq.question + " " + faq.keywords);
      userIntents.forEach((userIntent) => {
        faqIntents.forEach((faqIntent) => {
          if (faqIntent.intent === userIntent.intent) {
            score += 15 * Math.min(userIntent.score, faqIntent.score);
          }
        });
      });

      // 3. N-gram matching
      ngrams.forEach((ngram) => {
        // ใน question
        if (normalizedFaqQuestion.includes(ngram)) {
          const wordCount = ngram.split(" ").length;
          score += wordCount * 4;
        }

        // ใน keywords (น้ำหนักสูงกว่า)
        if (keywords.some((keyword) => keyword.includes(ngram))) {
          const wordCount = ngram.split(" ").length;
          score += wordCount * 6;
        }

        // ใน answer (น้ำหนักต่ำกว่า)
        if (normalizedFaqAnswer.includes(ngram)) {
          const wordCount = ngram.split(" ").length;
          score += wordCount * 2;
        }
      });

      // 4. Context matching
      if (context && context.lastCategory && faq.category === context.lastCategory) {
        score += 10; // เพิ่มคะแนนหากอยู่ในหมวดหมู่เดิม
      }

      if (context && context.lastKeywords) {
        context.lastKeywords.forEach((contextKeyword) => {
          if (
            normalizedFaqQuestion.includes(contextKeyword) ||
            keywords.some((k) => k.includes(contextKeyword))
          ) {
            score += 8;
          }
        });
      }

      // 5. Advanced semantic matching
      const faqTokens = THAI_LANGUAGE_UTILS.tokenize(faq.question);
      const expandedFaqTokens = THAI_LANGUAGE_UTILS.expandWithSynonyms(faqTokens);

      // Jaccard similarity with expanded tokens
      const userSet = new Set(expandedTokens);
      const faqSet = new Set(expandedFaqTokens);
      const intersection = new Set([...userSet].filter((x) => faqSet.has(x)));
      const union = new Set([...userSet, ...faqSet]);

      if (union.size > 0) {
        const jaccardSimilarity = intersection.size / union.size;
        score += jaccardSimilarity * 15;
      }

      // 6. Special keyword patterns - เพิ่มเติมมากขึ้น
      const specialPatterns = {
        email_access_problem: {
          patterns: ["เข้าอีเมลเก่าไม่ได้", "เข้าถึงอีเมลเก่าไม่ได้", "ลืมรหัสผ่านอีเมล"],
          score: 20,
        },
        email_change: {
          patterns: ["เปลี่ยนอีเมล", "แก้ไขอีเมล", "อัปเดตอีเมล"],
          score: 15,
        },
        document_verification: {
          patterns: ["เอกสารยืนยัน", "เอกสารสมาชิกเดิม", "ยืนยันตัวตน"],
          score: 15,
        },
        address_update: {
          patterns: ["แก้ไขที่อยู่", "เปลี่ยนที่อยู่", "อัปเดตที่อยู่"],
          score: 15,
        },
        registration: {
          patterns: ["สมัครสมาชิก", "ลงทะเบียน", "การสมัคร"],
          score: 12,
        },
      };

      Object.values(specialPatterns).forEach((pattern) => {
        pattern.patterns.forEach((patternText) => {
          if (THAI_LANGUAGE_UTILS.normalize(userQuestion).includes(patternText)) {
            if (
              normalizedFaqQuestion.includes(patternText) ||
              keywords.some((k) => k.includes(patternText))
            ) {
              score += pattern.score;
            }
          }
        });
      });

      return { faq, score };
    });

    // เรียงลำดับตามคะแนน
    scores.sort((a, b) => b.score - a.score);

    console.log("Enhanced NLP Analysis:");
    console.log("User intents:", userIntents);
    console.log("Expanded tokens:", expandedTokens.slice(0, 10));
    console.log("Top 3 matches:");
    scores.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.faq.question} (Score: ${item.score})`);
    });

    // Dynamic threshold based on question complexity
    let confidenceThreshold = 8;
    if (expandedTokens.length <= 2) confidenceThreshold = 5;
    if (expandedTokens.length >= 5) confidenceThreshold = 12;
    if (userIntents.length > 0) confidenceThreshold -= 2;

    if (scores[0].score > confidenceThreshold) {
      // Update conversation context
      if (sessionId) {
        const newContext = {
          lastCategory: scores[0].faq.category,
          lastKeywords: THAI_LANGUAGE_UTILS.tokenize(userQuestion).slice(0, 5),
          intents: userIntents.slice(0, 3),
          timestamp: Date.now(),
        };
        setConversationContext(sessionId, newContext);
      }

      // หาคำถามที่เกี่ยวข้องสำหรับแนะนำต่อ
      const suggestions = await findRelatedQuestions(
        scores[0].faq.category,
        scores[0].faq.id,
        faqs,
        { intents: userIntents },
      );

      return {
        question: scores[0].faq.question,
        answer: scores[0].faq.answer,
        confidence: scores[0].score,
        id: scores[0].faq.id,
        category: scores[0].faq.category,
        suggestions: suggestions,
        detectedIntents: userIntents.map((i) => i.intent),
      };
    }

    return null;
  } catch (error) {
    console.error("Error finding answer:", error);
    return null;
  }
}

// Enhanced greeting handler
function handleGreeting(question) {
  const greetingResponses = [
    "สวัสดีครับ! มีอะไรให้ช่วยเหลือไหมครับ?",
    "สวัสดีค่ะ! ยินดีให้บริการค่ะ มีคำถามอะไรสอบถามได้เลยค่ะ",
    "สวัสดีครับ! พร้อมช่วยแก้ไขปัญหาและตอบคำถามของคุณ",
    "สวัสดีค่ะ! อยากทราบอะไรเกี่ยวกับการใช้งานบ้างคะ?",
  ];

  const response = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];

  return {
    question: "สวัสดี",
    answer: response,
    suggestions: [
      "วิธีการสมัครสมาชิก",
      "วิธีการยืนยันตัวตน",
      "วิธีการแก้ไขข้อมูลที่อยู่",
      "วิธีการติดต่อเจ้าหน้าที่",
      "ปัญหาการเข้าใช้งาน",
    ],
  };
}

// Enhanced unclear question handler
function handleUnclearQuestion(question, detectedIntents) {
  const clarificationQuestions = {
    registration:
      'คุณต้องการทราบเกี่ยวกับการสมัครสมาชิกใช่ไหมคะ? โปรดระบุให้ชัดเจนกว่านี้ เช่น "วิธีการสมัครสมาชิก" หรือ "เอกสารที่ต้องใช้ในการสมัคร"',
    verification:
      'คุณต้องการทราบเกี่ยวกับการยืนยันตัวตนใช่ไหมคะ? เช่น "วิธีการยืนยันตัวตน" หรือ "เอกสารสำหรับยืนยันสมาชิกเดิม"',
    modification: 'คุณต้องการแก้ไขข้อมูลอะไรคะ? เช่น "แก้ไขที่อยู่" หรือ "เปลี่ยนอีเมล"',
    contact: "คุณต้องการติดต่อเจ้าหน้าที่ใช่ไหมคะ? หรือต้องการทราบช่องทางการติดต่อ?",
    technical: "คุณพบปัญหาการใช้งานหรือไม่คะ? โปรดอธิบายปัญหาให้ชัดเจนกว่านี้",
  };

  if (detectedIntents.length > 0) {
    const primaryIntent = detectedIntents[0].intent;
    if (clarificationQuestions[primaryIntent]) {
      return {
        question: question,
        answer: clarificationQuestions[primaryIntent],
        requiresClarification: true,
        suggestions: getClarificationSuggestions(primaryIntent),
      };
    }
  }

  return {
    question: question,
    answer:
      "ขออพัยครับ ไม่ค่อยเข้าใจคำถามของคุณ กรุณาอธิบายให้ชัดเจนกว่านี้หรือเลือกจากหัวข้อที่แนะนำด้านล่างครับ",
    requiresClarification: true,
    suggestions: [
      "วิธีการสมัครสมาชิก",
      "วิธีการยืนยันตัวตน",
      "วิธีการแก้ไขข้อมูล",
      "ปัญหาการเข้าใช้งาน",
      "วิธีการติดต่อเจ้าหน้าที่",
    ],
  };
}

function getClarificationSuggestions(intent) {
  const suggestions = {
    registration: ["วิธีการสมัครสมาชิก", "เอกสารที่ต้องใช้ในการสมัคร", "ขั้นตอนการสมัครสมาชิก"],
    verification: ["วิธีการยืนยันตัวตน", "เอกสารสำหรับยืนยันสมาชิกเดิม", "ปัญหาการยืนยันตัวตน"],
    modification: ["วิธีการแก้ไขข้อมูลที่อยู่", "วิธีการเปลี่ยนอีเมล", "วิธีการแก้ไขข้อมูลบริษัท"],
    contact: ["วิธีการติดต่อเจ้าหน้าที่", "ช่องทางการติดต่อ", "เวลาทำการของเจ้าหน้าที่"],
    technical: ["ปัญหาการเข้าใช้งาน", "ปัญหาการล็อกอิน", "ปัญหาการอัปโหลดเอกสาร"],
  };

  return (
    suggestions[intent] || ["วิธีการสมัครสมาชิก", "วิธีการยืนยันตัวตน", "วิธีการติดต่อเจ้าหน้าที่"]
  );
}

// API endpoint สำหรับค้นหาคำตอบ
export async function POST(request) {
  try {
    // ตรวจสอบการล็อกอิน
    const isLoggedIn = await checkUserLoggedIn(request);
    if (!isLoggedIn) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาล็อกอินเพื่อใช้งานแชทบอท",
        },
        { status: 401 },
      );
    }

    // ตรวจสอบ rate limit
    const rateLimitCheck = await checkRateLimit(request);
    if (!rateLimitCheck.allowed) {
      const resetIn = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: `คุณส่งคำขอมากเกินไป กรุณารอ ${resetIn} วินาที`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": resetIn.toString(),
            "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
            "X-RateLimit-Reset": Math.ceil(rateLimitCheck.resetTime / 1000).toString(),
          },
        },
      );
    }

    const body = await request.json();
    let { question, sessionId } = body;

    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    }

    // ทำความสะอาดข้อมูลนำเข้าเพื่อป้องกัน SQL Injection
    question = sanitizeInput(question);

    if (!question || question.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุคำถามที่มีความยาวมากกว่า 1 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    // ตรวจสอบคำทักทาย - Enhanced
    const greetingIntents = THAI_LANGUAGE_UTILS.detectIntent(question);
    const isGreeting = greetingIntents.some((intent) => intent.intent === "greeting");

    if (
      isGreeting ||
      (question.trim().length <= 10 &&
        ["สวัสดี", "hello", "hi", "สวัสดีครับ", "สวัสดีค่ะ", "หวัดดี"].some((greeting) =>
          question.toLowerCase().includes(greeting.toLowerCase()),
        ))
    ) {
      return NextResponse.json({
        success: true,
        data: handleGreeting(question),
        sessionId: sessionId,
      });
    }

    // ตรวจสอบคำถามแนะนำจากการทักทาย (คงเดิม)
    const greetingSuggestions = [
      "วิธีการสมัครสมาชิก",
      "วิธีการยืนยันตัวตน",
      "วิธีการแก้ไขข้อมูลที่อยู่",
      "วิธีการติดต่อเจ้าหน้าที่",
      "ปัญหาการเข้าใช้งาน",
    ];

    if (greetingSuggestions.includes(question)) {
      try {
        let searchQuery = "";

        if (question === "วิธีการสมัครสมาชิก") {
          searchQuery = "%สมัครสมาชิก%";
        } else if (question === "วิธีการยืนยันตัวตน") {
          searchQuery = "%ยืนยันตัวตน%";
        } else if (question === "วิธีการแก้ไขข้อมูลที่อยู่") {
          searchQuery = "%แก้ไขข้อมูลที่อยู่%";
        } else if (question === "วิธีการติดต่อเจ้าหน้าที่") {
          searchQuery = "%ติดต่อ%";
        } else if (question === "ปัญหาการเข้าใช้งาน") {
          searchQuery = "%เข้าใช้%";
        }

        const faqResult = await query({
          query:
            "SELECT * FROM faqs WHERE (question LIKE ? OR keywords LIKE ?) AND is_active = TRUE LIMIT 1",
          values: [searchQuery, searchQuery],
        });

        if (faqResult && faqResult.length > 0) {
          return NextResponse.json({
            success: true,
            data: {
              question: faqResult[0].question,
              answer: faqResult[0].answer,
              id: faqResult[0].id,
              category: faqResult[0].category,
            },
            sessionId: sessionId,
          });
        }
      } catch (error) {
        console.error("Error finding FAQ for greeting suggestion:", error);
      }
    }

    // Enhanced email handling (คงเดิมแต่ปรับปรุง)
    const emailKeywords = ["อีเมล", "อีเมลล์", "เมล", "เมลล์", "email", "e-mail", "mail"];
    if (emailKeywords.some((keyword) => question.toLowerCase().includes(keyword.toLowerCase()))) {
      const hasSpecificEmailQuery = [
        "เปลี่ยนอีเมล",
        "แก้ไขอีเมล",
        "เข้าอีเมลไม่ได้",
        "อีเมลเก่า",
        "ลืมรหัสผ่านอีเมล",
      ].some((term) => question.toLowerCase().includes(term.toLowerCase()));

      // Handle specific email queries
      if (question === "แจ้งเปลี่ยนอีเมลด้วยตนเอง") {
        try {
          const emailChangeFaq = await query({
            query: "SELECT * FROM faqs WHERE question LIKE ? AND is_active = TRUE LIMIT 1",
            values: ["%เปลี่ยนอีเมล%ได้อย่างไร%"],
          });

          if (emailChangeFaq && emailChangeFaq.length > 0) {
            return NextResponse.json({
              success: true,
              data: {
                question: emailChangeFaq[0].question,
                answer: emailChangeFaq[0].answer,
                id: emailChangeFaq[0].id,
                category: emailChangeFaq[0].category,
              },
              sessionId: sessionId,
            });
          }
        } catch (error) {
          console.error("Error finding email change FAQ:", error);
        }
      }

      if (question === "กรณีที่ต้องการเปลี่ยนอีเมลแต่เข้าอีเมลเก่าไม่ได้ต้องทำอย่างไร?") {
        try {
          const emailAccessFaq = await query({
            query:
              "SELECT * FROM faqs WHERE (question LIKE ? OR keywords LIKE ?) AND is_active = TRUE LIMIT 1",
            values: ["%เข้าอีเมลเก่าไม่ได้%", "%เข้าอีเมลเก่าไม่ได้%"],
          });

          if (emailAccessFaq && emailAccessFaq.length > 0) {
            return NextResponse.json({
              success: true,
              data: {
                question: emailAccessFaq[0].question,
                answer: emailAccessFaq[0].answer,
                id: emailAccessFaq[0].id,
                category: emailAccessFaq[0].category,
              },
              sessionId: sessionId,
            });
          }
        } catch (error) {
          console.error("Error finding email access FAQ:", error);
        }
      }

      if (!hasSpecificEmailQuery) {
        return NextResponse.json({
          success: true,
          data: {
            question: "อีเมล",
            answer: "คุณต้องการทราบข้อมูลเกี่ยวกับอีเมลในเรื่องใด?",
            requiresFollowUp: true,
            followUpOptions: [
              "ติดต่อเจ้าหน้าที่ / ช่องทางติดต่อ",
              "ฉันจะแจ้งเปลี่ยนอีเมลได้อย่างไร?",
              "กรณีที่ต้องการเปลี่ยนอีเมลแต่เข้าอีเมลเก่าไม่ได้ต้องทำอย่างไร?",
            ],
          },
          sessionId: sessionId,
        });
      }
    }

    // Enhanced document handling (คงเดิมแต่ปรับปรุง)
    if (question.toLowerCase().includes("เอกสาร")) {
      const hasSpecificDocumentType = [
        "ยืนยันสมาชิกเดิม",
        "ยืนยันตัวตน",
        "สมาชิกเดิม",
        "แก้ไขที่อยู่",
        "เปลี่ยนที่อยู่",
        "อัปเดตที่อยู่",
      ].some((term) => question.toLowerCase().includes(term));

      if (!hasSpecificDocumentType) {
        return NextResponse.json({
          success: true,
          data: {
            question: "เอกสาร",
            answer:
              "เอกสารสำหรับอะไรคะ? โปรดระบุว่าต้องการทราบเกี่ยวกับเอกสารสำหรับการยืนยันสมาชิกเดิม หรือเอกสารสำหรับการแก้ไขที่อยู่",
            requiresFollowUp: true,
            followUpOptions: ["เอกสารสำหรับยืนยันสมาชิกเดิม", "เอกสารสำหรับการแก้ไขที่อยู่"],
          },
          sessionId: sessionId,
        });
      }
    }

    // Enhanced main answer finding
    const answer = await findAnswer(question, sessionId);

    if (answer) {
      return NextResponse.json({
        success: true,
        data: answer,
        sessionId: sessionId,
      });
    } else {
      // Detect intents for better unclear question handling
      const detectedIntents = THAI_LANGUAGE_UTILS.detectIntent(question);

      // If we can detect some intent, provide better clarification
      if (detectedIntents.length > 0) {
        const clarificationResponse = handleUnclearQuestion(question, detectedIntents);
        return NextResponse.json({
          success: false,
          message: "ไม่พบคำตอบสำหรับคำถามนี้",
          data: clarificationResponse,
          sessionId: sessionId,
        });
      }

      // ดึงคำถามแนะนำทั่วไปเมื่อไม่พบคำตอบ
      let generalSuggestions = [];

      try {
        const generalFaqs = await query({
          query: "SELECT question FROM faqs WHERE is_active = TRUE ORDER BY RAND() LIMIT 3",
          values: [],
        });

        if (generalFaqs && generalFaqs.length > 0) {
          generalSuggestions = generalFaqs.map((faq) => faq.question);
        }
      } catch (error) {
        console.error("Error fetching suggested questions:", error);
      }

      if (generalSuggestions.length === 0) {
        generalSuggestions = [
          "วิธีการสมัครสมาชิก",
          "วิธีการยืนยันตัวตน",
          "วิธีการแก้ไขข้อมูลที่อยู่",
        ];
      }

      return NextResponse.json({
        success: false,
        message: "ไม่พบคำตอบสำหรับคำถามนี้ กรุณาลองใช้คำถามที่ชัดเจนกว่านี้ หรือติดต่อเจ้าหน้าที่",
        suggestContactForm: true,
        data: {
          suggestions: [...generalSuggestions, "วิธีการติดต่อเจ้าหน้าที่"],
        },
        sessionId: sessionId,
      });
    }
  } catch (error) {
    console.error("Error in FAQ API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการค้นหาคำตอบ",
      },
      { status: 500 },
    );
  }
}

// API endpoint สำหรับดึงข้อมูล FAQ ทั้งหมด (สำหรับผู้ใช้ทั่วไป)
export async function GET(request) {
  try {
    // ตรวจสอบการล็อกอิน
    const isLoggedIn = await checkUserLoggedIn(request);
    if (!isLoggedIn) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาล็อกอินเพื่อใช้งานแชทบอท",
        },
        { status: 401 },
      );
    }

    // ตรวจสอบ rate limit
    const rateLimitCheck = await checkRateLimit(request);
    if (!rateLimitCheck.allowed) {
      const resetIn = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: `คุณส่งคำขอมากเกินไป กรุณารอ ${resetIn} วินาที`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": resetIn.toString(),
            "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
            "X-RateLimit-Reset": Math.ceil(rateLimitCheck.resetTime / 1000).toString(),
          },
        },
      );
    }

    const { searchParams } = new URL(request.url);
    let limit = searchParams.get("limit");

    // ทำความสะอาดข้อมูลนำเข้าเพื่อป้องกัน SQL Injection
    if (limit) {
      limit = parseInt(limit, 10);
      if (isNaN(limit) || limit <= 0) {
        limit = 10; // ค่าเริ่มต้น
      }
      // จำกัดขนาดสูงสุดเพื่อป้องกัน DOS
      limit = Math.min(limit, 50);
    }

    let query_sql = "SELECT id, question, answer, category FROM faqs WHERE is_active = TRUE";
    let values = [];

    // ถ้ามีการระบุจำนวนจำกัด
    if (limit) {
      // สุ่มคำถามที่จะแสดง
      query_sql += " ORDER BY RAND() LIMIT ?";
      values.push(parseInt(limit, 10));
    } else {
      // ถ้าไม่มีการระบุจำนวนจำกัด ให้เรียงตามหมวดหมู่
      query_sql += " ORDER BY category, id";
    }

    try {
      const faqs = await query({
        query: query_sql,
        values: values,
      });

      return NextResponse.json({
        success: true,
        data: faqs,
      });
    } catch (dbError) {
      console.error("Database error fetching FAQs:", dbError);

      // หากมีข้อผิดพลาดจากฐานข้อมูล ให้ส่งคำถามแนะนำเบื้องต้นกลับไป
      const defaultFaqs = [
        { id: 0, question: "วิธีการสมัครสมาชิก", answer: "", category: "การสมัครสมาชิก" },
        { id: 1, question: "วิธีการยืนยันตัวตน", answer: "", category: "บัญชีผู้ใช้" },
        { id: 2, question: "วิธีการแก้ไขข้อมูลที่อยู่", answer: "", category: "การแก้ไขข้อมูล" },
        { id: 3, question: "วิธีการเพิ่มสินค้าหรือบริการ", answer: "", category: "การแก้ไขข้อมูล" },
        { id: 4, question: "วิธีการอัปโหลดโลโก้บริษัท", answer: "", category: "การแก้ไขข้อมูล" },
        { id: 5, question: "วิธีการติดต่อเจ้าหน้าที่", answer: "", category: "การติดต่อ" },
        { id: 6, question: "ปัญหาการเข้าใช้งาน", answer: "", category: "ปัญหาทั่วไป" },
      ];

      // ถ้ามีการระบุจำนวนจำกัด ให้จำกัดตามที่ระบุ
      if (limit) {
        return NextResponse.json({
          success: true,
          data: defaultFaqs.slice(0, parseInt(limit, 10)),
          isDefault: true,
        });
      }

      return NextResponse.json({
        success: true,
        data: defaultFaqs,
        isDefault: true,
      });
    }
  } catch (error) {
    console.error("Error in FAQ GET API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูล FAQ",
      },
      { status: 500 },
    );
  }
}
