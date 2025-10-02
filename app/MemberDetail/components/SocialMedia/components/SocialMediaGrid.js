"use client";

import { motion } from "framer-motion";
import SocialMediaIcon, { formatSocialMediaUrl } from "./SocialMediaIcon";

/**
 * SocialMediaGrid displays social media links in a grid layout with icons
 *
 * @param {Object} props Component properties
 * @param {Array} props.socialMediaList List of social media items
 * @returns {JSX.Element} The social media grid component
 */
export default function SocialMediaGrid({ socialMediaList }) {
  // Filter social media by platform type
  const getPlatformsByType = () => {
    const basic = ["facebook", "line", "youtube", "website"];
    const additional = ["instagram", "tiktok", "twitter", "linkedin", "shopee", "lazada"];

    return {
      basic: socialMediaList.filter((item) => basic.includes(item.platform)),
      additional: socialMediaList.filter((item) => additional.includes(item.platform)),
      other: socialMediaList.filter(
        (item) => !basic.includes(item.platform) && !additional.includes(item.platform),
      ),
    };
  };

  const platforms = getPlatformsByType();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
  };

  // Render a section of platforms
  const renderPlatformSection = (title, items) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">{title}</h3>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {items.map((item, index) => {
            const url = formatSocialMediaUrl(item.platform, item.url);

            return (
              <motion.a
                key={item.id || `${item.platform}-${index}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                variants={itemVariants}
                whileHover="hover"
              >
                <SocialMediaIcon platform={item.platform} size="lg" interactive={true} />
                <span className="mt-2 text-sm font-medium text-center text-gray-700 truncate w-full">
                  {item.display_name || item.platform}
                </span>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderPlatformSection("ช่องทางหลัก", platforms.basic)}
      {renderPlatformSection("ช่องทางเพิ่มเติม", platforms.additional)}
      {renderPlatformSection("อื่นๆ", platforms.other)}
    </div>
  );
}
