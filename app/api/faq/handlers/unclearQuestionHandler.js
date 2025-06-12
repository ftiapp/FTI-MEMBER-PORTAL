/**
 * Enhanced unclear question handler
 * @param {string} question - User's unclear question
 * @param {Array} detectedIntents - Detected intents from the question
 * @returns {object} Response object for unclear questions
 */
export function handleUnclearQuestion(question, detectedIntents) {
    const clarificationQuestions = {
      'registration': 'คุณต้องการทราบเกี่ยวกับการสมัครสมาชิกใช่ไหมคะ? โปรดระบุให้ชัดเจนกว่านี้ เช่น "วิธีการสมัครสมาชิก" หรือ "เอกสารที่ต้องใช้ในการสมัคร"',
      'verification': 'คุณต้องการทราบเกี่ยวกับการยืนยันตัวตนใช่ไหมคะ? เช่น "วิธีการยืนยันตัวตน" หรือ "เอกสารสำหรับยืนยันสมาชิกเดิม"',
      'modification': 'คุณต้องการแก้ไขข้อมูลอะไรคะ? เช่น "แก้ไขที่อยู่" หรือ "เปลี่ยนอีเมล"',
      'contact': 'คุณต้องการติดต่อเจ้าหน้าที่ใช่ไหมคะ? หรือต้องการทราบช่องทางการติดต่อ?',
      'technical': 'คุณพบปัญหาการใช้งานหรือไม่คะ? โปรดอธิบายปัญหาให้ชัดเจนกว่านี้'
    };
  
    if (detectedIntents.length > 0) {
      const primaryIntent = detectedIntents[0].intent;
      if (clarificationQuestions[primaryIntent]) {
        return {
          question: question,
          answer: clarificationQuestions[primaryIntent],
          requiresClarification: true,
          suggestions: getClarificationSuggestions(primaryIntent)
        };
      }
    }
  
    return {
      question: question,
      answer: 'ขออพัยครับ ไม่ค่อยเข้าใจคำถามของคุณ กรุณาอธิบายให้ชัดเจนกว่านี้หรือเลือกจากหัวข้อที่แนะนำด้านล่างครับ',
      requiresClarification: true,
      suggestions: [
        'วิธีการสมัครสมาชิก',
        'วิธีการยืนยันตัวตน',
        'วิธีการแก้ไขข้อมูล',
        'ปัญหาการเข้าใช้งาน',
        'วิธีการติดต่อเจ้าหน้าที่'
      ]
    };
  }
  
  /**
   * Get clarification suggestions based on detected intent
   * @param {string} intent - Primary detected intent
   * @returns {string[]} Array of clarification suggestions
   */
  export function getClarificationSuggestions(intent) {
    const suggestions = {
      'registration': [
        'วิธีการสมัครสมาชิก',
        'เอกสารที่ต้องใช้ในการสมัคร',
        'ขั้นตอนการสมัครสมาชิก'
      ],
      'verification': [
        'วิธีการยืนยันตัวตน',
        'เอกสารสำหรับยืนยันสมาชิกเดิม',
        'ปัญหาการยืนยันตัวตน'
      ],
      'modification': [
        'วิธีการแก้ไขข้อมูลที่อยู่',
        'วิธีการเปลี่ยนอีเมล',
        'วิธีการแก้ไขข้อมูลบริษัท'
      ],
      'contact': [
        'วิธีการติดต่อเจ้าหน้าที่',
        'ช่องทางการติดต่อ',
        'เวลาทำการของเจ้าหน้าที่'
      ],
      'technical': [
        'ปัญหาการเข้าใช้งาน',
        'ปัญหาการล็อกอิน',
        'ปัญหาการอัปโหลดเอกสาร'
      ]
    };
  
    return suggestions[intent] || [
      'วิธีการสมัครสมาชิก',
      'วิธีการยืนยันตัวตน',
      'วิธีการติดต่อเจ้าหน้าที่'
    ];
  }
  
  /**
   * Handle specific topic questions that need clarification
   * @param {string} question - User's question
   * @returns {object|null} Response object or null if not a handled topic
   */
  export function handleSpecificTopics(question) {
    // Email related questions
    const emailKeywords = ['อีเมล', 'อีเมลล์', 'เมล', 'เมลล์', 'email', 'e-mail', 'mail'];
    if (emailKeywords.some(keyword => question.toLowerCase().includes(keyword.toLowerCase()))) {
      const hasSpecificEmailQuery = [
        'เปลี่ยนอีเมล', 'แก้ไขอีเมล', 'เข้าอีเมลไม่ได้', 'อีเมลเก่า', 'ลืมรหัสผ่านอีเมล'
      ].some(term => question.toLowerCase().includes(term.toLowerCase()));
      
      if (!hasSpecificEmailQuery) {
        return {
          question: 'อีเมล',
          answer: 'คุณต้องการทราบข้อมูลเกี่ยวกับอีเมลในเรื่องใด?',
          requiresFollowUp: true,
          followUpOptions: [
            'ติดต่อเจ้าหน้าที่ / ช่องทางติดต่อ',
            'ฉันจะแจ้งเปลี่ยนอีเมลได้อย่างไร?',
            'กรณีที่ต้องการเปลี่ยนอีเมลแต่เข้าอีเมลเก่าไม่ได้ต้องทำอย่างไร?'
          ]
        };
      }
    }
  
    // Document related questions
    if (question.toLowerCase().includes('เอกสาร')) {
      const hasSpecificDocumentType = [
        'ยืนยันสมาชิกเดิม', 'ยืนยันตัวตน', 'สมาชิกเดิม',
        'แก้ไขที่อยู่', 'เปลี่ยนที่อยู่', 'อัปเดตที่อยู่'
      ].some(term => question.toLowerCase().includes(term));
      
      if (!hasSpecificDocumentType) {
        return {
          question: 'เอกสาร',
          answer: 'เอกสารสำหรับอะไรคะ? โปรดระบุว่าต้องการทราบเกี่ยวกับเอกสารสำหรับการยืนยันสมาชิกเดิม หรือเอกสารสำหรับการแก้ไขที่อยู่',
          requiresFollowUp: true,
          followUpOptions: [
            'เอกสารสำหรับยืนยันสมาชิกเดิม',
            'เอกสารสำหรับการแก้ไขที่อยู่'
          ]
        };
      }
    }
  
    return null;
  }