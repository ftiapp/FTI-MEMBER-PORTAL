// VerificationCard.js
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { EmailIcon, CheckIcon, ErrorIcon, LoadingIcon, SpinnerIcon } from "./VerificationIcons";
import CountdownTimer from "./CountdownTimer";
import ResendEmailForm from "./ResendEmailForm";
import { statusTransition } from "./animations";

export default function VerificationCard({
  verificationStatus,
  message,
  isSubmitting,
  onVerify,
  countdown,
  onResendSuccess,
}) {
  const renderStatus = () => {
    switch (verificationStatus) {
      case "ready":
        return (
          <motion.div className="space-y-6" key="ready" {...statusTransition}>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <EmailIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">ยืนยันอีเมลของคุณ</h3>
            <p className="text-gray-600">{message}</p>
            <div className="pt-4">
              <button
                onClick={onVerify}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <SpinnerIcon className="h-5 w-5 mr-2" />
                    กำลังยืนยัน...
                  </span>
                ) : (
                  "ยืนยันอีเมลของฉัน"
                )}
              </button>
            </div>
          </motion.div>
        );

      case "verifying":
        return (
          <motion.div className="space-y-6" key="verifying" {...statusTransition}>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <LoadingIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">กำลังยืนยันอีเมลของคุณ...</h3>
            <p className="text-gray-600">{message}</p>
          </motion.div>
        );

      case "success":
        return (
          <motion.div className="space-y-6" key="success" {...statusTransition}>
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800">ยืนยันอีเมลสำเร็จ!</h3>
            <p className="text-gray-600 text-lg">
              ขอบคุณที่ยืนยันอีเมลของคุณ คุณสามารถเข้าสู่ระบบได้แล้ว
            </p>

            {countdown > 0 && (
              <CountdownTimer
                initialCount={10}
                onComplete={() => (window.location.href = "/login")}
              />
            )}

            <div className="pt-4">
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition-colors text-lg"
              >
                ไปที่หน้าเข้าสู่ระบบทันที
              </Link>
            </div>
          </motion.div>
        );

      case "error":
        return (
          <motion.div className="space-y-6" key="error" {...statusTransition}>
            <div className="flex justify-center">
              <div className="bg-red-100 p-3 rounded-full">
                <ErrorIcon className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-600">{message}</p>
            <div className="pt-4 space-y-4">
              <p className="text-gray-600">หากคุณต้องการความช่วยเหลือ กรุณาติดต่อเจ้าหน้าที่</p>

              <ResendEmailForm onSuccess={onResendSuccess} />

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  ลงทะเบียนใหม่
                </Link>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <AnimatePresence mode="wait">{renderStatus()}</AnimatePresence>
    </motion.div>
  );
}
