"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";

export default function TsicLoadingOverlay({ isVisible, message }) {
  if (!isVisible) return null;

  const content = (
    <div className="relative pointer-events-auto flex flex-col items-center">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Rotating Logo */}
        <div className="relative">
          <motion.div
            className="relative w-16 h-16"
            animate={{ rotateY: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <img
              src="/images/Logo_FTI.webp"
              alt="FTI Logo"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </motion.div>
          
          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
            animate={{
              x: [-100, 100],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeInOut",
            }}
            style={{
              clipPath: "polygon(20% 0%, 40% 0%, 60% 100%, 40% 100%)",
            }}
          />
        </div>

        {/* Loading Message */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-blue-800 font-semibold text-lg tracking-wide">
            {message || "กำลังส่งข้อมูล"}
          </p>

          {/* Animated dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-800"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );

  const overlay = (
    <div
      className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-none"
      style={{ zIndex: 200000 }}
    >
      {content}
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(overlay, document.body);
  }
  return overlay;
}
