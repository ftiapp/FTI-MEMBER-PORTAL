import { motion } from "framer-motion";
import NotificationItem from "./NotificationItem";
import PaginationControls from "./PaginationControls";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const NotificationList = ({
  notifications,
  currentPage,
  totalPages,
  handlePageChange,
  markAsRead,
}) => {
  return (
    <>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            markAsRead={markAsRead}
          />
        ))}
      </motion.div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </>
  );
};

export default NotificationList;
