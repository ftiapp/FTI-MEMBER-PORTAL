import { motion } from "framer-motion";
import { FaBell, FaCheckCircle } from "react-icons/fa";
import {
  formatDate,
  formatNotificationMessage,
  getNotificationStatus,
  getNotificationTypeText,
  handleNotificationClick,
} from "../utils/notificationHelpers";

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

const NotificationItem = ({ notification, markAsRead }) => {
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "member_verification":
        return <FaCheckCircle className="text-green-500" />;
      case "contact_reply":
        return <FaBell className="text-blue-500" />;
      case "address_update":
        return <FaBell className="text-orange-500" />;
      case "profile_update":
        return <FaBell className="text-purple-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      className={`bg-white shadow-sm rounded-lg p-4 border-l-4 ${
        notification.read_at ? "border-gray-300" : "border-blue-500"
      }`}
    >
      <div className="flex items-start">
        <div className="mr-4 mt-1">{getNotificationIcon(notification.type)}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-500">
                  {getNotificationTypeText(notification.type)}
                </span>
                {getNotificationStatus(notification.message)}
              </div>
              <h3 className="font-medium text-gray-900">
                {formatNotificationMessage(notification.message)}
              </h3>
            </div>
            <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>
          </div>

          {notification.link && (
            <div className="mt-2">
              <button
                onClick={() => handleNotificationClick(notification)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ดูรายละเอียด
              </button>
            </div>
          )}

          {!notification.read_at && (
            <div className="mt-2 text-right">
              <button
                onClick={() => markAsRead(notification.id)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                ทำเครื่องหมายว่าอ่านแล้ว
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
