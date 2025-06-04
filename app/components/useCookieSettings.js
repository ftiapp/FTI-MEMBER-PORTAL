'use client';

import { useState, useEffect } from 'react';
import CookieManager from '../utils/cookieManager';

/**
 * Custom hook สำหรับจัดการ Cookie Settings
 * ใช้ CookieManager utility เพื่อจัดการคุกกี้ทั้งหมด
 */
export default function useCookieSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [cookieAccepted, setCookieAccepted] = useState(false);
  
  // โหลดสถานะการยอมรับคุกกี้เมื่อ component mount
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Check if cookie consent has been given using CookieManager
    setCookieAccepted(CookieManager.hasConsent());
  }, []);
  
  /**
   * เปิดหน้าต่างตั้งค่าคุกกี้
   */
  const openCookieSettings = () => {
    setIsOpen(true);
  };
  
  /**
   * ปิดหน้าต่างตั้งค่าคุกกี้
   */
  const closeCookieSettings = () => {
    setIsOpen(false);
  };
  
  /**
   * บันทึกการตั้งค่าคุกกี้
   * @param {Object} settings - การตั้งค่าคุกกี้
   */
  const saveSettings = (settings) => {
    // Save cookie preferences using CookieManager
    CookieManager.savePreferences(settings, 'custom');
    
    // Close the settings modal
    closeCookieSettings();
  };
  
  /**
   * ตรวจสอบว่ามีการยอมรับคุกกี้แล้วหรือไม่
   * @returns {boolean} สถานะการยอมรับ
   */
  const checkCookieAcceptance = () => {
    // Check if cookie consent has been given using CookieManager
    if (typeof window === 'undefined') return false;
    return CookieManager.hasConsent();
  };
  
  /**
   * ตรวจสอบว่าคุกกี้ประเภทใดได้รับการอนุญาต
   * @param {string} type - ประเภทของคุกกี้
   * @returns {boolean} สถานะการอนุญาต
   */
  const isCookieAllowed = (type) => {
    return CookieManager.isAllowed(type);
  };
  
  /**
   * ดึงการตั้งค่าคุกกี้ทั้งหมด
   * @returns {Object|null} การตั้งค่าคุกกี้หรือ null ถ้าไม่มี
   */
  const getCookiePreferences = () => {
    return CookieManager.getPreferences();
  };
  
  return {
    isOpen,
    openCookieSettings,
    closeCookieSettings,
    saveSettings,
    cookieAccepted,
    checkCookieAcceptance,
    isCookieAllowed,
    getCookiePreferences
  };
}