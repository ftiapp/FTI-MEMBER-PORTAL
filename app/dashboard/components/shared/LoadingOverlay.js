"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function LoadingOverlay({ 
  isVisible, 
  message = "กำลังโหลด...", 
  inline = false
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isVisible) return null;
  if (!inline && (!mounted || typeof document === "undefined")) return null;

  const content = (
    <div className="relative pointer-events-auto flex flex-col items-center">
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>

      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* 3D Cube Container */}
        <div className="perspective-1000">
          <motion.div
            className="relative w-12 h-12 preserve-3d"
            animate={{ rotateX: 360, rotateY: 360 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Front Face */}
            <div
              className="absolute w-12 h-12 bg-white border border-blue-800 shadow-lg flex items-center justify-center"
              style={{
                transform: "translateZ(24px)",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="w-6 h-6 bg-blue-800 rounded"></div>
            </div>

            {/* Back Face */}
            <div
              className="absolute w-12 h-12 bg-blue-800 border border-blue-900 shadow-lg flex items-center justify-center"
              style={{
                transform: "translateZ(-24px) rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="w-6 h-6 bg-white rounded"></div>
            </div>

            {/* Right Face */}
            <div
              className="absolute w-12 h-12 bg-white border border-blue-800 shadow-lg flex items-center justify-center"
              style={{
                transform: "rotateY(90deg) translateZ(24px)",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="w-6 h-6 bg-blue-800 rounded"></div>
            </div>

            {/* Left Face */}
            <div
              className="absolute w-12 h-12 bg-blue-800 border border-blue-900 shadow-lg flex items-center justify-center"
              style={{
                transform: "rotateY(-90deg) translateZ(24px)",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="w-6 h-6 bg-white rounded"></div>
            </div>

            {/* Top Face */}
            <div
              className="absolute w-12 h-12 bg-white border border-blue-800 shadow-lg flex items-center justify-center"
              style={{
                transform: "rotateX(90deg) translateZ(24px)",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="w-6 h-6 bg-blue-800 rounded"></div>
            </div>

            {/* Bottom Face */}
            <div
              className="absolute w-12 h-12 bg-blue-800 border border-blue-900 shadow-lg flex items-center justify-center"
              style={{
                transform: "rotateX(-90deg) translateZ(24px)",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="w-6 h-6 bg-white rounded"></div>
            </div>
          </motion.div>
        </div>

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
    return (
      <div className="flex items-center justify-center py-12 px-4">
        {content}
      </div>
    );
  }

  // Fullscreen mode: render via portal
  const overlay = (
    <div
      className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-none"
      style={{ zIndex: 2147483647 }}
    >
      {content}
    </div>
  );

  return createPortal(overlay, document.body);
}