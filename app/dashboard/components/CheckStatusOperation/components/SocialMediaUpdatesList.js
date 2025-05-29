import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusCard from './StatusCard';
import EmptyState from './EmptyState';
import { getSocialMediaStatusIcon, getSocialMediaStatusText, getSocialMediaStatusClass } from './socialMediaStatusUtils';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const SocialMediaUpdatesList = ({ socialMediaUpdates }) => {
  if (!socialMediaUpdates || socialMediaUpdates.length === 0) {
    return <EmptyState message="ไม่พบการอัปเดตโซเชียลมีเดีย" />;
  }

  return (
    <div className="mb-8">
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h4 className="text-lg font-semibold text-blue-700 border-b border-gray-200 pb-2">
          การอัปเดตโซเชียลมีเดีย
        </h4>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {socialMediaUpdates.map((operation, index) => (
          <motion.div
            key={`social-${operation.id}-${index}`}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className="mb-4"
            whileHover={{ 
              scale: 1.02, 
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              transition: { type: "spring", stiffness: 400, damping: 17 }
            }}
          >
            <StatusCard
              icon={getSocialMediaStatusIcon(operation.status)}
              title={operation.title}
              description={operation.description}
              statusText={getSocialMediaStatusText(operation.status)}
              statusClass={getSocialMediaStatusClass(operation.status)}
              date={new Date(operation.created_at).toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              details={operation}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SocialMediaUpdatesList;
