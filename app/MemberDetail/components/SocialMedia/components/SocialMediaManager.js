"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import SocialMediaIcon, { getPlatformName } from "./SocialMediaIcon";
import LoadingOverlay from "../../LoadingOverlay";

const PLATFORM_OPTIONS = [
  { id: "facebook", name: "Facebook Page", placeholder: "https://facebook.com/yourpage" },
  { id: "line", name: "Line Official Account", placeholder: "@yourlineaccount" },
  { id: "youtube", name: "YouTube Channel", placeholder: "https://youtube.com/channel/..." },
  { id: "website", name: "Website/Homepage", placeholder: "https://yourwebsite.com" },
  { id: "instagram", name: "Instagram", placeholder: "https://instagram.com/youraccount" },
  { id: "tiktok", name: "TikTok", placeholder: "https://tiktok.com/@youraccount" },
  { id: "twitter", name: "Twitter/X", placeholder: "https://twitter.com/youraccount" },
  { id: "linkedin", name: "LinkedIn", placeholder: "https://linkedin.com/company/yourcompany" },
  { id: "shopee", name: "Shopee", placeholder: "https://shopee.co.th/yourshop" },
  { id: "lazada", name: "Lazada", placeholder: "https://lazada.co.th/shop/yourshop" },
  { id: "other", name: "อื่นๆ", placeholder: "https://..." },
];

export default function SocialMediaManager({ memberCode, existingData = [], onUpdate, onCancel }) {
  const [socialMediaItems, setSocialMediaItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize with existing data or empty array
  useEffect(() => {
    if (existingData && existingData.length > 0) {
      setSocialMediaItems(
        existingData.map((item) => ({
          id: item.id,
          platform: item.platform,
          url: item.url,
          display_name: item.display_name || "",
        })),
      );
    } else {
      // Start with one empty item if no existing data
      setSocialMediaItems([
        {
          id: null,
          platform: "",
          url: "",
          display_name: "",
        },
      ]);
    }
  }, [existingData]);

  const handleAddItem = () => {
    setSocialMediaItems([
      ...socialMediaItems,
      {
        id: null,
        platform: "",
        url: "",
        display_name: "",
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...socialMediaItems];
    newItems.splice(index, 1);
    setSocialMediaItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...socialMediaItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSocialMediaItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowLoadingOverlay(true);
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validate items
    const validItems = socialMediaItems.filter(
      (item) => item.platform && item.url && item.platform.trim() !== "" && item.url.trim() !== "",
    );

    if (validItems.length === 0) {
      setError("กรุณาระบุแพลตฟอร์มและ URL อย่างน้อย 1 รายการ");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/member/social-media/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          memberCode,
          socialMedia: validItems,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Call the onUpdate callback with the updated data
        onUpdate(data.data || validItems);
      } else {
        setShowLoadingOverlay(false);
        setError(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      console.error("Error saving social media data:", err);
      setShowLoadingOverlay(false);
      setError(err.message || "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get platform details by ID
  const getPlatformDetails = (platformId) => {
    return (
      PLATFORM_OPTIONS.find((p) => p.id === platformId) ||
      PLATFORM_OPTIONS.find((p) => p.name === platformId) ||
      null
    );
  };

  // Get platform name by ID
  const getPlatformDisplayName = (platformId) => {
    const platform = getPlatformDetails(platformId);
    return platform ? platform.name : getPlatformName(platformId);
  };

  // Lock scroll when loading overlay is shown
  useEffect(() => {
    if (showLoadingOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showLoadingOverlay]);

  return (
    <>
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        message="กำลังบันทึกข้อมูลโซเชียลมีเดีย"
      />
      <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">จัดการช่องทางโซเชียลมีเดีย</h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">บันทึกข้อมูลเรียบร้อยแล้ว</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {socialMediaItems.map((item, index) => {
          const platformDetails = getPlatformDetails(item.platform);

          return (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-gray-50"
            >
              <div className="w-full md:w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">แพลตฟอร์ม</label>
                <div className="flex items-center">
                  {item.platform && (
                    <div className="mr-2">
                      <SocialMediaIcon platform={item.platform} size="sm" />
                    </div>
                  )}
                  <select
                    value={item.platform}
                    onChange={(e) => handleItemChange(index, "platform", e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">เลือกแพลตฟอร์ม</option>
                    {PLATFORM_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL / Username
                </label>
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => handleItemChange(index, "url", e.target.value)}
                  placeholder={platformDetails?.placeholder || "https://..."}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อที่แสดง (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={item.display_name || ""}
                  onChange={(e) => handleItemChange(index, "display_name", e.target.value)}
                  placeholder="ชื่อที่แสดงบนหน้าเว็บ"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end mb-2 md:mb-0">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  title="ลบรายการนี้"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            <FaPlus className="mr-1" /> เพิ่มช่องทาง
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              <FaTimes className="mr-1" /> ยกเลิก
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังบันทึก...
                </span>
              ) : (
                <span className="flex items-center">
                  <FaSave className="mr-1" /> บันทึก
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
      </div>
    </>
  );
}
