'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';
import SocialMediaIcon, { formatSocialMediaUrl, getPlatformName } from './SocialMediaIcon';

// Animation variants for list items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

export default function SocialMediaList({ socialMediaList }) {

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {socialMediaList.map((item, index) => {
        const formattedUrl = formatSocialMediaUrl(item.platform, item.url);
        
        return (
          <motion.div
            key={item.id || index}
            variants={itemVariants}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 flex items-center"
          >
            <SocialMediaIcon platform={item.platform} size="md" showBackground={true} />
            
            <div className="flex-1 min-w-0 ml-4">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {getPlatformName(item.platform)}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {item.display_name || item.url}
              </p>
            </div>
            
            <a
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-2 text-blue-600 hover:text-blue-800 transition-colors"
              title="เปิดลิงก์"
            >
              <FaExternalLinkAlt />
            </a>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
