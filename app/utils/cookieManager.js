'use client';

import Cookies from 'js-cookie';

/**
 * Cookie Manager - ระบบจัดการคุกกี้สำหรับเว็บไซต์
 * ใช้สำหรับบันทึกและอ่านค่าคุกกี้ต่างๆ ในระบบ
 */
// รายการคุกกี้ที่จำเป็นสำหรับการทำงานของระบบ (จะไม่ถูกลบแม้ผู้ใช้จะไม่ยอมรับคุกกี้)
const ESSENTIAL_COOKIES = [
  'token',           // JWT token สำหรับการยืนยันตัวตน
  'rememberMe',      // สถานะการจดจำรหัสผ่าน
  'userEmail',       // อีเมลผู้ใช้สำหรับ auto-fill
  'cookieConsent',   // การยอมรับคุกกี้
  'cookieConsentDate', // วันที่ยอมรับคุกกี้
  'cookiePreferences'  // การตั้งค่าคุกกี้
];

export const CookieManager = {
  /**
   * บันทึกการตั้งค่าคุกกี้
   * @param {Object} settings - ค่าการตั้งค่าคุกกี้
   * @param {boolean} settings.functionality - คุกกี้ช่วยเหลือในการทำงาน
   * @param {boolean} settings.performance - คุกกี้ประสิทธิภาพ
   * @param {boolean} settings.analytics - คุกกี้เพื่อการวิเคราะห์
   * @param {boolean} settings.marketing - คุกกี้เพื่อการโฆษณาและการตลาด
   * @param {string} consentType - ประเภทการยอมรับ ('all', 'custom', 'none')
   * @returns {boolean} สถานะการบันทึก
   */
  savePreferences: (settings, consentType = 'custom') => {
    try {
      const cookiePreferences = {
        essential: true, // จำเป็นเสมอ
        functionality: settings.functionality || false,
        performance: settings.performance || false,
        analytics: settings.analytics || false,
        marketing: settings.marketing || false
      };
      
      const consentDate = new Date().toISOString();
      
      // บันทึกลงใน cookie ด้วย expiration 365 วัน
      Cookies.set('cookieConsent', consentType, { expires: 365, sameSite: 'strict', path: '/' });
      Cookies.set('cookieConsentDate', consentDate, { expires: 365, sameSite: 'strict', path: '/' });
      Cookies.set('cookiePreferences', JSON.stringify(cookiePreferences), { expires: 365, sameSite: 'strict', path: '/' });
      
      // บันทึกลงใน window object สำหรับการใช้งานในปัจจุบัน
      if (typeof window !== 'undefined') {
        window.cookieConsent = consentType;
        window.cookieConsentDate = consentDate;
        window.COOKIE_PREFERENCES = cookiePreferences;
        window.cookiePreferences = JSON.stringify(cookiePreferences);
        
        // เรียก callback ถ้ามี (เช่น reload analytics, etc.)
        if (window.onCookieSettingsChange) {
          window.onCookieSettingsChange(cookiePreferences);
        }
        
        // บันทึกลงใน localStorage สำรอง
        try {
          localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
          localStorage.setItem('cookieConsent', consentType);
          localStorage.setItem('cookieConsentDate', consentDate);
        } catch (error) {
          console.error('Error saving cookie preferences to localStorage:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      return false;
    }
  },
  
  /**
   * อ่านการตั้งค่าคุกกี้
   * @returns {Object|null} การตั้งค่าคุกกี้หรือ null ถ้าไม่มี
   */
  getPreferences: () => {
    if (typeof window === 'undefined') return null;
    
    // ลองอ่านจาก cookie ก่อน
    const cookieValue = Cookies.get('cookiePreferences');
    if (cookieValue) {
      try {
        return JSON.parse(cookieValue);
      } catch (e) {
        console.error('Error parsing cookie preferences from cookies:', e);
      }
    }
    
    // ถ้าไม่มีใน cookie ลองอ่านจาก localStorage
    try {
      const localStorageValue = localStorage.getItem('cookiePreferences');
      if (localStorageValue) {
        const parsed = JSON.parse(localStorageValue);
        
        // บันทึกกลับลงใน cookie ด้วย
        Cookies.set('cookiePreferences', localStorageValue, { expires: 365, sameSite: 'strict', path: '/' });
        
        return parsed;
      }
    } catch (e) {
      console.error('Error reading cookie preferences from localStorage:', e);
    }
    
    // ถ้าไม่มีใน localStorage ลองอ่านจาก window object
    if (window.cookiePreferences) {
      try {
        return JSON.parse(window.cookiePreferences);
      } catch (e) {
        console.error('Error parsing window cookie preferences:', e);
      }
    }
    
    return null;
  },
  
  /**
   * ตรวจสอบว่าคุกกี้ประเภทใดได้รับการอนุญาต
   * @param {string} type - ประเภทของคุกกี้ ('essential', 'functionality', 'performance', 'analytics', 'marketing')
   * @returns {boolean} สถานะการอนุญาต
   */
  isAllowed: (type) => {
    if (type === 'essential') return true; // คุกกี้จำเป็นอนุญาตเสมอ
    
    const preferences = CookieManager.getPreferences();
    if (!preferences) return false;
    
    return preferences[type] === true;
  },
  
  /**
   * ตรวจสอบว่ามีการยอมรับคุกกี้แล้วหรือไม่
   * @returns {boolean} สถานะการยอมรับ
   */
  hasConsent: () => {
    if (typeof window === 'undefined') return false;
    
    const cookieConsent = Cookies.get('cookieConsent');
    if (cookieConsent) return true;
    
    try {
      const localStorageConsent = localStorage.getItem('cookieConsent');
      if (localStorageConsent) {
        // บันทึกกลับลงใน cookie ด้วย
        Cookies.set('cookieConsent', localStorageConsent, { expires: 365, sameSite: 'strict', path: '/' });
        return true;
      }
    } catch (e) {
      console.error('Error reading cookie consent from localStorage:', e);
    }
    
    return window.cookieConsent ? true : false;
  },
  
  /**
   * ลบการตั้งค่าคุกกี้ทั้งหมด ยกเว้นคุกกี้ที่จำเป็น
   * @returns {boolean} สถานะการลบ
   */
  clearAll: () => {
    try {
      // ลบคุกกี้ทั้งหมดยกเว้นคุกกี้ที่จำเป็น
      const allCookies = Cookies.get();
      for (const cookieName in allCookies) {
        // ตรวจสอบว่าคุกกี้นี้ไม่ใช่คุกกี้ที่จำเป็น
        if (!ESSENTIAL_COOKIES.includes(cookieName)) {
          Cookies.remove(cookieName, { path: '/' });
        }
      }
      
      // ลบข้อมูลใน localStorage ยกเว้นข้อมูลที่จำเป็น
      if (typeof window !== 'undefined') {
        // เก็บข้อมูลที่จำเป็นไว้ก่อน
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        
        // ลบข้อมูลคุกกี้ที่ไม่จำเป็น
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key !== 'rememberedEmail' && key !== 'user' && 
              !key.startsWith('token') && !key.startsWith('rememberMe')) {
            keysToRemove.push(key);
          }
        }
        
        // ลบข้อมูลที่ไม่จำเป็น
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // ลบข้อมูลใน window object ยกเว้นข้อมูลที่จำเป็น
        delete window.cookieConsent;
        delete window.cookieConsentDate;
        delete window.COOKIE_PREFERENCES;
        delete window.cookiePreferences;
        
        // เรียก callback ถ้ามี
        if (window.onCookieSettingsChange) {
          window.onCookieSettingsChange(null);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing cookie preferences:', error);
      return false;
    }
  }
};

export default CookieManager;
