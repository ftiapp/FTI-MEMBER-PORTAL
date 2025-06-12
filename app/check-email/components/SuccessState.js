import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SuccessState() {
  return (
    <motion.div 
      className="text-center"
      key="success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center mb-4">
        <motion.svg
          className="w-16 h-16 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </motion.svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        ตั้งรหัสผ่านใหม่สำเร็จ!
      </h3>
      <p className="text-gray-600 mb-4">
        คุณสามารถเข้าสู่ระบบด้วยอีเมลใหม่และรหัสผ่านใหม่ได้ทันที
      </p>
      <p className="text-gray-500 mb-4">
        กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
      </p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
        >
          เข้าสู่ระบบทันที
        </Link>
      </motion.div>
    </motion.div>
  );
}