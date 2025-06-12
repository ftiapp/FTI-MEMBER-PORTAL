import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegistrationSuccess({ newEmail, email }) {
  return (
    <motion.div 
      className="text-center max-w-md mx-auto px-4"
      key="registration_success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Success Icon */}
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

      {/* Main Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        ลงทะเบียนสำเร็จขั้นตอนแรก
      </h2>

      {/* Warning Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <p className="text-yellow-800 font-medium text-sm">
          คุณยังไม่สามารถเข้าสู่ระบบได้จนกว่าจะยืนยันอีเมล
        </p>
      </div>

      {/* Email Confirmation Section */}
      <div className="mb-5">
        <p className="text-gray-600 mb-2">
          เราได้ส่งอีเมลยืนยันไปยัง: <span className="font-semibold text-gray-800">{newEmail || email}</span>
        </p>
        
        <p className="text-gray-600 text-sm mb-3">
          <span className="font-medium">ขั้นตอนต่อไป:</span> กรุณาตรวจสอบกล่องจดหมายและคลิกลิงก์ยืนยันเพื่อเปิดใช้งานบัญชี
        </p>
        
        <p className="text-gray-500 text-xs italic">
          หากไม่พบอีเมล กรุณาตรวจสอบใน Spam หรือ Junk mail
        </p>
      </div>
      
      {/* Contact Information */}
      <div className="border-t border-gray-200 pt-4 mb-5">
        <p className="text-gray-700 font-medium mb-2 text-sm">ติดต่อเรา</p>
        <div className="text-xs text-gray-600 space-y-1">
          <p>📞 1453 กด 2 | ✉️ member@fti.or.th</p>
          <p>จันทร์-ศุกร์: 08:30-17:30 น.</p>
        </div>
      </div>

      {/* Back to Login Button */}
      <Link 
        href="/login" 
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors"
      >
        กลับไปยังหน้าเข้าสู่ระบบ
      </Link>
    </motion.div>
  );
}