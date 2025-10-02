"use client";

import { useNavigation } from "@/app/contexts/NavigationContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingOverlay() {
  const { isLoading } = useNavigation();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center backdrop-blur-sm"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-blue-600 font-medium">กำลังโหลด...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
