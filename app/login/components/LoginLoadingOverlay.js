"use client";

import { motion } from "framer-motion";

export default function LoginLoadingOverlay({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ pointerEvents: "auto" }}
    >
      {/* Backdrop - freeze ทั้งหน้า */}
      <div className="absolute inset-0 bg-gray-900 opacity-75"></div>

      {/* Loading popup */}
      <motion.div
        className="relative z-[10000] bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col items-center">
          <style>{`
            .perspective-1000 {
              perspective: 1000px;
            }
            .preserve-3d {
              transform-style: preserve-3d;
            }
          `}</style>

          {/* 3D Cube Container */}
          <div className="perspective-1000 mb-6">
            <motion.div
              className="relative w-16 h-16 preserve-3d"
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
                className="absolute w-16 h-16 bg-white border border-blue-800 shadow-lg flex items-center justify-center"
                style={{
                  transform: "translateZ(32px)",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="w-8 h-8 bg-blue-800 rounded"></div>
              </div>

              {/* Back Face */}
              <div
                className="absolute w-16 h-16 bg-blue-800 border border-blue-900 shadow-lg flex items-center justify-center"
                style={{
                  transform: "translateZ(-32px) rotateY(180deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="w-8 h-8 bg-white rounded"></div>
              </div>

              {/* Right Face */}
              <div
                className="absolute w-16 h-16 bg-white border border-blue-800 shadow-lg flex items-center justify-center"
                style={{
                  transform: "rotateY(90deg) translateZ(32px)",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="w-8 h-8 bg-blue-800 rounded"></div>
              </div>

              {/* Left Face */}
              <div
                className="absolute w-16 h-16 bg-blue-800 border border-blue-900 shadow-lg flex items-center justify-center"
                style={{
                  transform: "rotateY(-90deg) translateZ(32px)",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="w-8 h-8 bg-white rounded"></div>
              </div>

              {/* Top Face */}
              <div
                className="absolute w-16 h-16 bg-white border border-blue-800 shadow-lg flex items-center justify-center"
                style={{
                  transform: "rotateX(90deg) translateZ(32px)",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="w-8 h-8 bg-blue-800 rounded"></div>
              </div>

              {/* Bottom Face */}
              <div
                className="absolute w-16 h-16 bg-blue-800 border border-blue-900 shadow-lg flex items-center justify-center"
                style={{
                  transform: "rotateX(-90deg) translateZ(32px)",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="w-8 h-8 bg-white rounded"></div>
              </div>
            </motion.div>
          </div>

          {/* Loading text */}
          <h3 className="text-xl font-bold text-gray-800 mb-2">กำลังเข้าสู่ระบบ</h3>
          <p className="text-gray-600 text-center">กรุณารอสักครู่...</p>

          {/* Progress dots animation */}
          <div className="flex space-x-2 mt-4">
            <motion.div
              className="w-2 h-2 bg-blue-800 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-blue-800 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div
              className="w-2 h-2 bg-blue-800 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
