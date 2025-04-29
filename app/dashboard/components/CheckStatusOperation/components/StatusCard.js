import React from 'react';
import { motion } from 'framer-motion';
import { formatDate } from './utils';
import { useRouter } from 'next/navigation';

const StatusCard = ({ 
  icon, 
  title, 
  description, 
  statusText, 
  statusClass, 
  date, 
  errorMessage,
  children,
  id,
  type,
  message_content
}) => {
  const router = useRouter();
  
  // Handle click on contact message cards
  const handleCardClick = () => {
    if (type === 'ติดต่อเจ้าหน้าที่' && id) {
      console.log(`Clicked on contact message with ID: ${id}`);
      
      // First update the URL with the contact tab and messageId parameters
      router.push(`/dashboard?tab=contact&messageId=${id}`, undefined, { shallow: true });
      
      // Then dispatch a custom event to notify the Dashboard component
      setTimeout(() => {
        const event = new CustomEvent('contactMessageClicked', { detail: { messageId: id } });
        window.dispatchEvent(event);
      }, 100); // Small delay to ensure URL is updated first
    }
  };

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.3
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      backgroundColor: type === 'ติดต่อเจ้าหน้าที่' ? "rgba(219, 234, 254, 0.5)" : "white",
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { delay: 0.1, duration: 0.3 }
    }
  };

  const textVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.2, duration: 0.3 }
    }
  };

  const statusVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { delay: 0.3, duration: 0.3 }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className={`border rounded-lg p-4 ${type === 'ติดต่อเจ้าหน้าที่' ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      <div className="flex items-start space-x-4">
        <motion.div 
          className="flex-shrink-0 bg-gray-100 rounded-lg p-3 text-center min-w-[60px]"
          variants={iconVariants}
        >
          {icon}
        </motion.div>
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <motion.h4 
              className="font-semibold text-gray-900"
              variants={textVariants}
            >
              {title}
            </motion.h4>
            <motion.span 
              className={`px-3 py-1 text-xs rounded-full ${statusClass} font-medium shadow-sm`}
              variants={statusVariants}
              whileHover="hover"
            >
              {statusText}
            </motion.span>
          </div>
          <motion.p 
            className="text-sm text-gray-700 mt-2 font-medium"
            variants={textVariants}
          >
            {description}
            {errorMessage && (
              <motion.span 
                className="block mt-2 text-red-600 p-2 bg-red-50 rounded border border-red-200"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <strong>เหตุผลที่ปฏิเสธ:</strong> {errorMessage}
              </motion.span>
            )}
          </motion.p>
          <motion.div 
            className="mt-3 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            {formatDate(date)}
          </motion.div>
          {children && (
            <motion.div 
              className="mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatusCard;