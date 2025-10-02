"use client";

import {
  FaFacebook,
  FaLine,
  FaYoutube,
  FaGlobe,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaShoppingBag,
  FaQuestion,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

// Platform configuration with icons, colors, and background colors
const PLATFORM_CONFIG = {
  facebook: {
    icon: FaFacebook,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverBgColor: "hover:bg-blue-100",
    name: "Facebook Page",
  },
  line: {
    icon: FaLine,
    color: "text-green-500",
    bgColor: "bg-green-50",
    hoverBgColor: "hover:bg-green-100",
    name: "Line Official Account",
  },
  youtube: {
    icon: FaYoutube,
    color: "text-red-600",
    bgColor: "bg-red-50",
    hoverBgColor: "hover:bg-red-100",
    name: "YouTube Channel",
  },
  website: {
    icon: FaGlobe,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    hoverBgColor: "hover:bg-blue-100",
    name: "Website/Homepage",
  },
  instagram: {
    icon: FaInstagram,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    hoverBgColor: "hover:bg-pink-100",
    name: "Instagram",
  },
  tiktok: {
    icon: FaTiktok,
    color: "text-black",
    bgColor: "bg-gray-50",
    hoverBgColor: "hover:bg-gray-100",
    name: "TikTok",
  },
  twitter: {
    icon: FaXTwitter,
    color: "text-black",
    bgColor: "bg-gray-50",
    hoverBgColor: "hover:bg-gray-100",
    name: "X (formerly Twitter)",
  },
  linkedin: {
    icon: FaLinkedin,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    hoverBgColor: "hover:bg-blue-100",
    name: "LinkedIn",
  },
  shopee: {
    icon: FaShoppingBag,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    hoverBgColor: "hover:bg-orange-100",
    name: "Shopee",
  },
  lazada: {
    icon: FaShoppingBag,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    hoverBgColor: "hover:bg-blue-100",
    name: "Lazada",
  },
  other: {
    icon: FaGlobe,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    hoverBgColor: "hover:bg-gray-100",
    name: "อื่นๆ",
  },
};

/**
 * SocialMediaIcon component displays the appropriate icon for each social media platform
 *
 * @param {Object} props Component properties
 * @param {string} props.platform The platform identifier (e.g., 'facebook', 'line')
 * @param {string} props.size The size of the icon ('sm', 'md', 'lg')
 * @param {boolean} props.showBackground Whether to show the background color
 * @param {boolean} props.interactive Whether the icon should have hover effects
 * @returns {JSX.Element} The social media icon
 */
export default function SocialMediaIcon({
  platform,
  size = "md",
  showBackground = true,
  interactive = false,
}) {
  // Get the platform configuration or use the default (other)
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.other;
  const Icon = config.icon;

  // Determine icon size based on the size prop
  const sizeClass =
    {
      sm: "text-lg",
      md: "text-2xl",
      lg: "text-3xl",
      xl: "text-4xl",
    }[size] || "text-2xl";

  // Determine container size based on the size prop
  const containerSize =
    {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
      xl: "w-16 h-16",
    }[size] || "w-10 h-10";

  // Determine classes based on props
  const iconClasses = `${config.color} ${sizeClass}`;
  const containerClasses = `
    flex items-center justify-center
    ${containerSize}
    ${showBackground ? `${config.bgColor} rounded-full` : ""}
    ${interactive ? `${config.hoverBgColor} cursor-pointer transition-colors duration-200` : ""}
  `;

  return (
    <div className={containerClasses} title={config.name}>
      <Icon className={iconClasses} />
    </div>
  );
}

/**
 * Get platform name from platform ID
 *
 * @param {string} platform The platform identifier
 * @returns {string} The platform display name
 */
export function getPlatformName(platform) {
  return PLATFORM_CONFIG[platform]?.name || platform;
}

/**
 * Format URL for display and linking
 *
 * @param {string} platform The platform identifier
 * @param {string} url The URL or username
 * @returns {string} The formatted URL
 */
export function formatSocialMediaUrl(platform, url) {
  if (!url) return "";

  // For Line, handle @ format
  if (platform === "line" && url.startsWith("@")) {
    return `https://line.me/ti/p/${url.substring(1)}`;
  }

  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }

  return url;
}
