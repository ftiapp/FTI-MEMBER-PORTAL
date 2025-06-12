import { motion } from 'framer-motion';

export default function VerifyingState() {
  return (
    <motion.div 
      className="text-center"
      key="verifying"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        ยืนยันอีเมลใหม่
      </h2>

      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
      <p className="text-gray-600">กำลังยืนยันอีเมลใหม่ของคุณ...</p>
    </motion.div>
  );
}