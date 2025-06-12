import { query } from '@/app/lib/db';
import { THAI_LANGUAGE_UTILS } from '../utils/thaiLanguageUtils.js';
import { getConversationContext, updateContextWithFaq } from '../utils/contextManager.js';

/**
 * Enhanced function for finding related questions
 * @param {string} currentCategory - Current FAQ category
 * @param {number} currentId - Current FAQ ID
 * @param {Array} allFaqs - All FAQ data
 * @param {object} userContext - User context with intents
 * @returns {Promise<string[]>} Array of related question suggestions
 */
export async function findRelatedQuestions(currentCategory, currentId, allFaqs, userContext = null) {
  try {
    let candidates = [];

    // 1. หาคำถามในหมวดหมู่เดียวกัน
    const sameCategoryFaqs = allFaqs.filter(faq => 
      faq.category === currentCategory && faq.id !== currentId
    );

    // 2. หาคำถามที่เกี่ยวข้องกับ context ของผู้ใช้
    if (userContext && userContext.intents) {
      const intentRelatedFaqs = allFaqs.filter(faq => {
        const faqIntents = THAI_LANGUAGE_UTILS.detectIntent(faq.question + ' ' + faq.keywords);
        return userContext.intents.some(userIntent => 
          faqIntents.some(faqIntent => faqIntent.intent === userIntent.intent)
        ) && faq.id !== currentId;
      });
      candidates.push(...intentRelatedFaqs);
    }

    // 3. เพิ่มคำถามในหมวดหมู่เดียวกัน
    candidates.push(...sameCategoryFaqs);

    // 4. หากยังไม่เพียงพอ ให้เพิ่มคำถามยอดนิยม
    if (candidates.length < 3) {
      const otherFaqs = allFaqs.filter(faq => faq.id !== currentId);
      candidates.push(...otherFaqs);
    }

    // ลบคำถามซ้ำ
    const uniqueCandidates = candidates.filter((faq, index, self) => 
      index === self.findIndex(f => f.id === faq.id)
    );

    // สุ่มเรียงลำดับและเลือกไม่เกิน 3 คำถาม
    const shuffled = [...uniqueCandidates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(3, shuffled.length)).map(faq => faq.question);
  } catch (error) {
    console.error('Error finding related questions:', error);
    return [];
  }
}

/**
 * Calculate semantic similarity score between FAQ and user question
 * @param {object} faq - FAQ object
 * @param {string[]} expandedTokens - User's expanded tokens
 * @param {string[]} ngrams - User's n-grams
 * @param {Array} userIntents - User's detected intents
 * @param {object} context - Conversation context
 * @returns {number} Similarity score
 */
function calculateSimilarityScore(faq, expandedTokens, ngrams, userIntents, context) {
  const normalizedFaqQuestion = THAI_LANGUAGE_UTILS.normalize(faq.question);
  const normalizedFaqAnswer = THAI_LANGUAGE_UTILS.normalize(faq.answer);
  const keywords = faq.keywords.toLowerCase().split(',').map(k => k.trim());
  
  let score = 0;
  
  // 1. Exact match - สูงสุด
  const normalizedUserQuestion = expandedTokens.join(' ');
  if (normalizedUserQuestion === normalizedFaqQuestion) {
    score += 100;
  }
  
  // 2. Intent matching - สำคัญมาก
  const faqIntents = THAI_LANGUAGE_UTILS.detectIntent(faq.question + ' ' + faq.keywords);
  userIntents.forEach(userIntent => {
    faqIntents.forEach(faqIntent => {
      if (faqIntent.intent === userIntent.intent) {
        score += 15 * Math.min(userIntent.score, faqIntent.score);
      }
    });
  });
  
  // 3. N-gram matching
  ngrams.forEach(ngram => {
    // ใน question
    if (normalizedFaqQuestion.includes(ngram)) {
      const wordCount = ngram.split(' ').length;
      score += wordCount * 4;
    }
    
    // ใน keywords (น้ำหนักสูงกว่า)
    if (keywords.some(keyword => keyword.includes(ngram))) {
      const wordCount = ngram.split(' ').length;
      score += wordCount * 6;
    }
    
    // ใน answer (น้ำหนักต่ำกว่า)
    if (normalizedFaqAnswer.includes(ngram)) {
      const wordCount = ngram.split(' ').length;
      score += wordCount * 2;
    }
  });
  
  // 4. Context matching
  if (context && context.lastCategory && faq.category === context.lastCategory) {
    score += 10; // เพิ่มคะแนนหากอยู่ในหมวดหมู่เดิม
  }
  
  if (context && context.lastKeywords) {
    context.lastKeywords.forEach(contextKeyword => {
      if (normalizedFaqQuestion.includes(contextKeyword) || 
          keywords.some(k => k.includes(contextKeyword))) {
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
  const intersection = new Set([...userSet].filter(x => faqSet.has(x)));
  const union = new Set([...userSet, ...faqSet]);
  
  if (union.size > 0) {
    const jaccardSimilarity = intersection.size / union.size;
    score += jaccardSimilarity * 15;
  }
  
  return score;
}

/**
 * Apply special keyword patterns to boost scores
 * @param {string} userQuestion - User's normalized question
 * @param {object} faq - FAQ object
 * @returns {number} Additional score from special patterns
 */
function applySpecialPatterns(userQuestion, faq) {
  const normalizedFaqQuestion = THAI_LANGUAGE_UTILS.normalize(faq.question);
  const keywords = faq.keywords.toLowerCase().split(',').map(k => k.trim());
  
  const specialPatterns = {
    'email_access_problem': {
      patterns: ['เข้าอีเมลเก่าไม่ได้', 'เข้าถึงอีเมลเก่าไม่ได้', 'ลืมรหัสผ่านอีเมล'],
      score: 20
    },
    'email_change': {
      patterns: ['เปลี่ยนอีเมล', 'แก้ไขอีเมล', 'อัปเดตอีเมล'],
      score: 15
    },
    'document_verification': {
      patterns: ['เอกสารยืนยัน', 'เอกสารสมาชิกเดิม', 'ยืนยันตัวตน'],
      score: 15
    },
    'address_update': {
      patterns: ['แก้ไขที่อยู่', 'เปลี่ยนที่อยู่', 'อัปเดตที่อยู่'],
      score: 15
    },
    'registration': {
      patterns: ['สมัครสมาชิก', 'ลงทะเบียน', 'การสมัคร'],
      score: 12
    }
  };
  
  let bonusScore = 0;
  
  Object.values(specialPatterns).forEach(pattern => {
    pattern.patterns.forEach(patternText => {
      if (userQuestion.includes(patternText)) {
        if (normalizedFaqQuestion.includes(patternText) || 
            keywords.some(k => k.includes(patternText))) {
          bonusScore += pattern.score;
        }
      }
    });
  });
  
  return bonusScore;
}

/**
 * Advanced answer finding with enhanced NLP
 * @param {string} userQuestion - User's question
 * @param {string} sessionId - Session ID for context
 * @param {boolean} returnMultipleChoices - Whether to return multiple choices or single best answer
 * @returns {Promise<object|null>} Answer object or null if not found
 */
export async function findAnswer(userQuestion, sessionId = null, returnMultipleChoices = false) {
  try {
    // ดึงข้อมูล FAQ ทั้งหมดที่เปิดใช้งาน
    const faqs = await query({
      query: 'SELECT * FROM faqs WHERE is_active = TRUE',
      values: []
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
    expandedTokens.forEach(word => ngrams.push(word));
    
    // 2-grams (คำคู่)
    for (let i = 0; i < expandedTokens.length - 1; i++) {
      ngrams.push(`${expandedTokens[i]} ${expandedTokens[i + 1]}`);
    }
    
    // 3-grams (คำสาม)
    for (let i = 0; i < expandedTokens.length - 2; i++) {
      ngrams.push(`${expandedTokens[i]} ${expandedTokens[i + 1]} ${expandedTokens[i + 2]}`);
    }

    // คำนวณคะแนนความเกี่ยวข้องสำหรับแต่ละ FAQ
    const scores = faqs.map(faq => {
      let score = calculateSimilarityScore(faq, expandedTokens, ngrams, userIntents, context);
      
      // Apply special patterns
      const normalizedUserQuestion = THAI_LANGUAGE_UTILS.normalize(userQuestion);
      score += applySpecialPatterns(normalizedUserQuestion, faq);
      
      return { faq, score };
    });
    
    // เรียงลำดับตามคะแนน
    scores.sort((a, b) => b.score - a.score);
    
    console.log('Enhanced NLP Analysis:');
    console.log('User intents:', userIntents);
    console.log('Expanded tokens:', expandedTokens.slice(0, 10));
    console.log('Top 3 matches:');
    scores.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.faq.question} (Score: ${item.score})`);
    });
    
    // Dynamic threshold based on question complexity
    let confidenceThreshold = 8;
    if (expandedTokens.length <= 2) confidenceThreshold = 5;
    if (expandedTokens.length >= 5) confidenceThreshold = 12;
    if (userIntents.length > 0) confidenceThreshold -= 2;
    
    // If returnMultipleChoices is true, return all relevant choices
    if (returnMultipleChoices) {
      const relevantChoices = scores.filter(item => item.score > 0);
      
      if (relevantChoices.length > 0) {
        return {
          type: 'multiple_choices',
          choices: relevantChoices,
          userQuestion: userQuestion,
          detectedIntents: userIntents.map(i => i.intent),
          expandedTokens: expandedTokens
        };
      }
      return null;
    }
    
    // Original single answer logic
    if (scores[0].score > confidenceThreshold) {
      // Update conversation context
      if (sessionId) {
        updateContextWithFaq(sessionId, scores[0].faq, userTokens, userIntents);
      }
      
      // หาคำถามที่เกี่ยวข้องสำหรับแนะนำต่อ
      const suggestions = await findRelatedQuestions(
        scores[0].faq.category, 
        scores[0].faq.id,
        faqs,
        { intents: userIntents }
      );
      
      return {
        question: scores[0].faq.question,
        answer: scores[0].faq.answer,
        confidence: scores[0].score,
        id: scores[0].faq.id,
        category: scores[0].faq.category,
        suggestions: suggestions,
        detectedIntents: userIntents.map(i => i.intent)
      };
    }

    return null;
  } catch (error) {
    console.error('Error finding answer:', error);
    return null;
  }
}

/**
 * Handle specific email questions
 * @param {string} question - User's question
 * @returns {Promise<object|null>} Answer object or null
 */
export async function handleSpecificEmailQuestions(question) {
  try {
    if (question === 'แจ้งเปลี่ยนอีเมลด้วยตนเอง') {
      const emailChangeFaq = await query({
        query: 'SELECT * FROM faqs WHERE question LIKE ? AND is_active = TRUE LIMIT 1',
        values: ['%เปลี่ยนอีเมล%ได้อย่างไร%']
      });
      
      if (emailChangeFaq && emailChangeFaq.length > 0) {
        return {
          question: emailChangeFaq[0].question,
          answer: emailChangeFaq[0].answer,
          id: emailChangeFaq[0].id,
          category: emailChangeFaq[0].category
        };
      }
    }
    
    if (question === 'กรณีที่ต้องการเปลี่ยนอีเมลแต่เข้าอีเมลเก่าไม่ได้ต้องทำอย่างไร?') {
      const emailAccessFaq = await query({
        query: 'SELECT * FROM faqs WHERE (question LIKE ? OR keywords LIKE ?) AND is_active = TRUE LIMIT 1',
        values: ['%เข้าอีเมลเก่าไม่ได้%', '%เข้าอีเมลเก่าไม่ได้%']
      });
      
      if (emailAccessFaq && emailAccessFaq.length > 0) {
        return {
          question: emailAccessFaq[0].question,
          answer: emailAccessFaq[0].answer,
          id: emailAccessFaq[0].id,
          category: emailAccessFaq[0].category
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error handling specific email questions:', error);
    return null;
  }
}