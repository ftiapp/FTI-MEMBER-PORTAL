import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegistrationSuccess({ newEmail, email }) {
  return (
    <motion.div 
      className="text-center"
      key="registration_success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        ลงทะเบียนสำเร็จ!
      </h2>
      <p className="text-gray-600 mb-2">
        เราได้ส่งอีเมลยืนยันไปยัง <span className="font-semibold">{newEmail || email}</span>
      </p>
      <p className="text-gray-600 mb-6">
        กรุณาตรวจสอบกล่องจดหมายของคุณและคลิกที่ลิงก์ยืนยันเพื่อเปิดใช้งานบัญชีของคุณ
      </p>
      <Link 
        href="/login" 
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors"
      >
        กลับไปยังหน้าเข้าสู่ระบบ
      </Link>
    </motion.div>
  );
}