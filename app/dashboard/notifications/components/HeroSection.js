import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
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
    <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24 z-[50]">
      {/* Decorative elements - ซ่อนในมือถือ */}
      {!isMobile && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
        </>
      )}

      {/* Notification icon - ซ่อนในมือถือ */}
      {!isMobile && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">การแจ้งเตือนทั้งหมด</h1>
        <motion.div
          className="w-24 h-1 bg-white mx-auto mb-6"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />
        <p className="text-lg md:text-xl text-center max-w-3xl mx-auto text-blue-100">
          ดูและจัดการการแจ้งเตือนทั้งหมดของคุณในระบบ FTI Portal
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
