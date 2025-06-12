import { THAI_LANGUAGE_UTILS } from '../utils/thaiLanguageUtils.js';

/**
 * Enhanced greeting handler
 * @param {string} question - User's greeting message
 * @returns {object} Greeting response object
 */
export function handleGreeting(question) {
  const greetingResponses = [
    'สวัสดีครับ! มีอะไรให้ช่วยเหลือไหมครับ?',
    'สวัสดีค่ะ! ยินดีให้บริการค่ะ มีคำถามอะไรสอบถามได้เลยค่ะ',
    'สวัสดีครับ! พร้อมช่วยแก้ไขปัญหาและตอบคำถามของคุณ',
    'สวัสดีค่ะ! อยากทราบอะไรเกี่ยวกับการใช้งานบ้างคะ?'
  ];

  const response = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  
  return {
    question: 'สวัสดี',
    answer: response,
    suggestions: [
      'วิธีการสมัครสมาชิก',
      'วิธีการยืนยันตัวตน', 
      'วิธีการแก้ไขข้อมูลที่อยู่',
      'วิธีการติดต่อเจ้าหน้าที่',
      'ปัญหาการเข้าใช้งาน'
    ]
  };
}

/**
 * Check if a message is a greeting
 * @param {string} question - User's message
 * @returns {boolean} Whether the message is a greeting
 */
export function isGreeting(question) {
  if (!question) return false;
  
  // Check using Thai language utils
  const greetingIntents = THAI_LANGUAGE_UTILS.detectIntent(question);
  const hasGreetingIntent = greetingIntents.some(intent => intent.intent === 'greeting');
  
  // Additional check for short greetings
  const isShortGreeting = question.trim().length <= 10 && 
    ['สวัสดี', 'hello', 'hi', 'สวัสดีครับ', 'สวัสดีค่ะ', 'หวัดดี']
    .some(greeting => question.toLowerCase().includes(greeting.toLowerCase()));
  
  return hasGreetingIntent || isShortGreeting;
}

/**
 * Handle greeting suggestions from the initial greeting response
 * @param {string} suggestion - The suggestion clicked by user
 * @returns {string|null} SQL search pattern or null if not a known suggestion
 */
export function handleGreetingSuggestion(suggestion) {
  const suggestionMap = {
    'วิธีการสมัครสมาชิก': '%สมัครสมาชิก%',
    'วิธีการยืนยันตัวตน': '%ยืนยันตัวตน%',
    'วิธีการแก้ไขข้อมูลที่อยู่': '%แก้ไขข้อมูลที่อยู่%',
    'วิธีการติดต่อเจ้าหน้าที่': '%ติดต่อ%',
    'ปัญหาการเข้าใช้งาน': '%เข้าใช้%'
  };
  
  return suggestionMap[suggestion] || null;
}