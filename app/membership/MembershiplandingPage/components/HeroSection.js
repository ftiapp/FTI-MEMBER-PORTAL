"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

  const heroFadeUp = {
    initial: {
      opacity: 0,
      y: 24,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-gray-50">
      {/* Decorative elements */}
      {!isMobile && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky-100 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
        </div>
      )}

      {/* Membership icon */}
      {!isMobile && (
        <div className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 opacity-15 lg:block">
          <svg
            width="200"
            height="200"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1 10H23"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 16H8.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 16H12.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 16H16.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center md:py-20">
        <motion.h1
          className="bg-gradient-to-br from-slate-900 from-30% to-slate-700 bg-clip-text py-4 text-4xl font-semibold leading-tight tracking-tight text-balance text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
          animate="animate"
          variants={heroFadeUp}
          initial="initial"
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.21, 0.47, 0.32, 0.98],
            type: "spring",
          }}
        >
          ประเภทสมาชิก ส.อ.ท.
        </motion.h1>
        <div className="mx-auto mb-6 mt-2 h-1 w-24 rounded-full bg-blue-600" />
        <motion.p
          className="max-w-2xl text-lg tracking-tight text-balance text-gray-600 md:text-xl"
          animate="animate"
          variants={heroFadeUp}
          initial="initial"
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.21, 0.47, 0.32, 0.98],
            type: "spring",
          }}
        >
          เลือกประเภทสมาชิกที่เหมาะกับธุรกิจของคุณ
        </motion.p>
      </div>
    </section>
  );
}
