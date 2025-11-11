"use client";

import { useState, useEffect } from "react";

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
      {/* Decorative elements */}
      {!isMobile && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
        </>
      )}

      {/* Membership icon */}
      {!isMobile && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
          <svg
            width="200"
            height="200"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1 10H23"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 16H8.01"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 16H12.01"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 16H16.01"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">ประเภทสมาชิก ส.อ.ท.</h1>
        <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
        <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
          เลือกประเภทสมาชิกที่เหมาะกับธุรกิจของคุณ
        </p>
      </div>
    </div>
  );
}