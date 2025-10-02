// Advanced Thai language processing utilities
export const THAI_LANGUAGE_UTILS = {
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

  /**
   * ฟังก์ชันทำความสะอาดและปรับแต่งข้อความภาษาไทย
   * @param {string} text - ข้อความที่ต้องการทำความสะอาด
   * @returns {string} ข้อความที่ทำความสะอาดแล้ว
   */
  normalize: function (text) {
    return text
      .toLowerCase()
      .replace(/[\u0E48-\u0E4B]/g, "") // ลบวรรณยุกต์
      .replace(/[\?\!\,\.\;\:\(\)\[\]\"\']/g, " ") // ลบเครื่องหมายวรรคตอน
      .replace(/\s+/g, " ") // รวม whitespace
      .trim();
  },

  /**
   * ฟังก์ชันแยกคำและกรอง stopwords
   * @param {string} text - ข้อความที่ต้องการแยกคำ
   * @returns {string[]} อาร์เรย์ของคำที่กรองแล้ว
   */
  tokenize: function (text) {
    const normalized = this.normalize(text);
    return normalized
      .split(/\s+/)
      .filter((word) => word.length > 1 && !this.stopwords.includes(word));
  },

  /**
   * ฟังก์ชันขยายคำด้วย synonyms
   * @param {string[]} words - อาร์เรย์ของคำ
   * @returns {string[]} อาร์เรย์ของคำที่ขยายด้วย synonyms
   */
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

  /**
   * ฟังก์ชันจำแนก intent
   * @param {string} text - ข้อความที่ต้องการจำแนก intent
   * @returns {Array<{intent: string, score: number}>} อาร์เรย์ของ intent และคะแนน
   */
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
