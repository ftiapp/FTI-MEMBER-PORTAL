import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft, FaCheck } from "react-icons/fa";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const NotificationsHeader = ({ FTI_Portal_User_Notifications, markAllAsRead, startIndex, endIndex }) => {
  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 relative z-[100]"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="mr-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
          >
            <FaArrowLeft className="text-xl" />
            <span className="hidden sm:inline">กลับไปแดชบอร์ด</span>
          </Link>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
            การแจ้งเตือนทั้งหมด
          </h2>
        </div>
        {FTI_Portal_User_Notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
          >
            <FaCheck className="text-xs" />
            <span className="hidden sm:inline">อ่านทั้งหมดแล้ว</span>
            <span className="sm:hidden">อ่านแล้ว</span>
          </button>
        )}
      </div>

      {/* Pagination Info */}
      {FTI_Portal_User_Notifications.length > 0 && (
        <div className="text-sm text-gray-600">
          แสดงผล {startIndex + 1}-{Math.min(endIndex, FTI_Portal_User_Notifications.length)} จาก{" "}
          {FTI_Portal_User_Notifications.length} รายการ
        </div>
      )}
    </motion.div>
  );
};

export default NotificationsHeader;
