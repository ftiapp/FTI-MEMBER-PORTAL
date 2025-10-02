"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// ใช้ dynamic import เพื่อป้องกัน SSR error เนื่องจาก CookieConsent และ CookieSettingsButton ใช้ localStorage
const CookieConsent = dynamic(() => import("./CookieConsent"), {
  ssr: false,
});

const CookieSettingsButton = dynamic(() => import("./CookieSettingsButton"), {
  ssr: false,
});

export default function ClientLayout({ children }) {
  return (
    <>
      {children}
      <CookieConsent />
      <CookieSettingsButton />
    </>
  );
}
