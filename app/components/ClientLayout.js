'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// ใช้ dynamic import เพื่อป้องกัน SSR error เนื่องจาก CookieConsent ใช้ localStorage
const CookieConsent = dynamic(() => import('./CookieConsent'), {
  ssr: false
});

export default function ClientLayout({ children }) {
  return (
    <>
      {children}
      <CookieConsent />
    </>
  );
}
