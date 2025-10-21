"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function LoadingOverlay({ isVisible, message = "กำลังโหลด...", inline = false }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isVisible) return null;
  if (!inline && (!mounted || typeof document === "undefined")) return null;

  const content = (
    <div className="relative pointer-events-auto flex flex-col items-center">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Rotating Logo */}
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

        {/* Loading Message */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-blue-800 font-semibold text-lg tracking-wide">{message}</p>

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

  // Inline mode: render directly in place
  if (inline) {
    return <div className="flex items-center justify-center py-12 px-4">{content}</div>;
  }

  // Fullscreen mode: render via portal
  const overlay = (
    <div
      className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      {content}
    </div>
  );

  return createPortal(overlay, document.body);
}
