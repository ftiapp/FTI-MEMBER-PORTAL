'use client';

import { motion } from 'framer-motion';

/**
 * Navigation tabs for the member detail page
 */
export default function MemberDetailTabs({ activeTab, setActiveTab, itemVariants }) {
  const tabVariants = {
    inactive: { color: "#6B7280", borderColor: "transparent" },
    active: { 
      color: "#1E40AF", 
      borderColor: "#1E40AF",
      transition: { duration: 0.2 }
    },
    hover: { scale: 1.05 }
  };

  return (
    <motion.div 
      className="border-b border-gray-200 bg-gray-50"
      variants={itemVariants}
    >
      <nav className="flex justify-center md:justify-start px-2">
        <motion.button
          onClick={() => setActiveTab('info')}
          className={`px-6 py-4 text-sm font-medium relative`}
          variants={tabVariants}
          animate={activeTab === 'info' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <span>ข้อมูลทั่วไป</span>
          {activeTab === 'info' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              layoutId="activeTab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.button>
        
        <motion.button
          onClick={() => setActiveTab('addresses')}
          className={`px-6 py-4 text-sm font-medium relative`}
          variants={tabVariants}
          animate={activeTab === 'addresses' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <span>ที่อยู่</span>
          {activeTab === 'addresses' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              layoutId="activeTab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.button>
        
        <motion.button
          onClick={() => setActiveTab('representatives')}
          className={`px-6 py-4 text-sm font-medium relative`}
          variants={tabVariants}
          animate={activeTab === 'representatives' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <span>ผู้แทน</span>
          {activeTab === 'representatives' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              layoutId="activeTab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.button>
        
        <motion.button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-4 text-sm font-medium relative`}
          variants={tabVariants}
          animate={activeTab === 'products' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <span>สินค้า/บริการ</span>
          {activeTab === 'products' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              layoutId="activeTab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.button>
      </nav>
    </motion.div>
  );
}