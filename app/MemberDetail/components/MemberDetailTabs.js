'use client';

import { motion } from 'framer-motion';
import { FaIdCard, FaMapMarkerAlt, FaUsers, FaBoxes, FaLayerGroup, FaShareAlt, FaImage } from 'react-icons/fa';

/**
 * Navigation tabs for the member detail page
 */
export default function MemberDetailTabs({ activeTab, setActiveTab, itemVariants, showMembershipTab = false }) {
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
      <nav className="flex flex-wrap justify-center md:justify-start px-2">
        <motion.button
          onClick={() => setActiveTab('info')}
          className={`px-6 py-4 text-sm font-medium relative flex items-center`}
          variants={tabVariants}
          animate={activeTab === 'info' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <FaIdCard className="mr-1" />
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
          className={`px-6 py-4 text-sm font-medium relative flex items-center`}
          variants={tabVariants}
          animate={activeTab === 'addresses' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <FaMapMarkerAlt className="mr-1" />
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
          className={`px-6 py-4 text-sm font-medium relative flex items-center`}
          variants={tabVariants}
          animate={activeTab === 'representatives' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <FaUsers className="mr-1" />
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
          className={`px-6 py-4 text-sm font-medium relative flex items-center`}
          variants={tabVariants}
          animate={activeTab === 'products' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <FaBoxes className="mr-1" />
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

        <motion.button
          onClick={() => setActiveTab('social-media')}
          className={`px-6 py-4 text-sm font-medium relative flex items-center`}
          variants={tabVariants}
          animate={activeTab === 'social-media' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <FaShareAlt className="mr-1" />
          <span>โซเชียลมีเดีย</span>
          {activeTab === 'social-media' && (
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
          onClick={() => setActiveTab('logo')}
          className={`px-6 py-4 text-sm font-medium relative flex items-center`}
          variants={tabVariants}
          animate={activeTab === 'logo' ? 'active' : 'inactive'}
          whileHover="hover"
        >
          <FaImage className="mr-1" />
          <span>โลโก้/ตราสัญลักษณ์</span>
          {activeTab === 'logo' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              layoutId="activeTab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.button>
        
        {showMembershipTab && (
          <motion.button
            onClick={() => setActiveTab('memberships')}
            className={`px-6 py-4 text-sm font-medium relative flex items-center`}
            variants={tabVariants}
            animate={activeTab === 'memberships' ? 'active' : 'inactive'}
            whileHover="hover"
          >
            <FaLayerGroup className="mr-1" />
            <span>ประเภทสมาชิก</span>
            {activeTab === 'memberships' && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                layoutId="activeTab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        )}
      </nav>
    </motion.div>
  );
}