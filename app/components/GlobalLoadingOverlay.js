"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// Create a context for the loading state
const LoadingContext = createContext({
  isLoading: false,
  setLoading: () => {},
  message: "",
  setMessage: () => {},
});

// Provider component
export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("กำลังดำเนินการ...");

  const setLoading = (loading, customMessage = "กำลังดำเนินการ...") => {
    setIsLoading(loading);
    setMessage(customMessage);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, message, setMessage }}>
      {children}
      <GlobalLoadingOverlay />
    </LoadingContext.Provider>
  );
}

// Hook to use the loading context
export function useLoading() {
  return useContext(LoadingContext);
}

// The actual overlay component
function GlobalLoadingOverlay() {
  const { isLoading, message } = useContext(LoadingContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock page scroll while loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  if (!mounted || typeof document === "undefined") return null;

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

  const overlay = (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          style={{ zIndex: 9999 }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}
