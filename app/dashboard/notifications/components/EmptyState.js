import { motion } from 'framer-motion';
import { FaBell } from 'react-icons/fa';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const EmptyState = () => {
  return (
    <motion.div 
      className="bg-white shadow-md rounded-lg p-8 text-center"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-center mb-4">
        <FaBell className="text-gray-400 text-5xl" />
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">ไม่มีการแจ้งเตือน</h2>
      <p className="text-gray-500">คุณไม่มีการแจ้งเตือนในขณะนี้</p>
    </motion.div>
  );
};

export default EmptyState;