'use client';

import { useState } from 'react';
import CookieSettings from './CookieSettings';
import CookieManager from '../utils/cookieManager';
import styles from './CookieSettingsButton.module.css';

/**
 * ปุ่มตั้งค่าคุกกี้ที่แสดงที่มุมขวาของหน้าเว็บ
 */
export default function CookieSettingsButton() {
  const [showSettings, setShowSettings] = useState(false);
  
  const openSettings = () => {
    setShowSettings(true);
  };
  
  const closeSettings = () => {
    setShowSettings(false);
  };
  
  const handleSaveSettings = (settings) => {
    // บันทึกการตั้งค่าคุกกี้
    CookieManager.savePreferences(settings, 'custom');
    closeSettings();
  };
  
  return (
    <>
      <button 
        className={styles.cookieButton}
        onClick={openSettings}
        aria-label="ตั้งค่าคุกกี้"
      >
        <span className={styles.cookieIcon}>🍪</span>
        <span className={styles.cookieText}>ตั้งค่าคุกกี้</span>
      </button>
      
      {showSettings && (
        <CookieSettings 
          onClose={closeSettings} 
          onSave={handleSaveSettings} 
        />
      )}
    </>
  );
}
