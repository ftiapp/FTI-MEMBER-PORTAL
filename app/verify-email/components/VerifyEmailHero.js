// VerifyEmailHero.js
import { motion } from "framer-motion";

export default function VerifyEmailHero({ isMobile }) {
  return (
    <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
      {/* ลด decorative elements ในมือถือ */}
      {!isMobile && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
        </>
      )}

      {/* Email verification icon - ซ่อนในมือถือ */}
      {!isMobile && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
          <svg
            width="200"
            height="200"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H19C19.5304 5 20.0391 5.21071 20.4142 5.58579C20.7893 5.96086 21 6.46957 21 7V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">ยืนยันอีเมล</h1>
        <motion.div
          className="w-24 h-1 bg-white mx-auto mb-6"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />
        <p className="text-lg md:text-xl text-blue-100 text-center max-w-2xl mx-auto">
          ยืนยันอีเมลของคุณเพื่อเข้าใช้งานระบบ
        </p>
      </div>
    </div>
  );
}
