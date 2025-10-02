"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaList, FaThLarge } from "react-icons/fa";
import SocialMediaManager from "./components/SocialMediaManager";
import SocialMediaList from "./components/SocialMediaList";
import SocialMediaGrid from "./components/SocialMediaGrid";
import SocialMediaGuide from "./components/SocialMediaGuide";
import LoadingState from "../Loadingstate";
import ErrorState from "../ErrorState";
import EmptyState from "../Emptystate";

/**
 * Social Media tab content for member detail page
 * @param {Object} props Component properties
 */
export default function SocialMediaTabContent(props) {
  const companyInfo = props.companyInfo;
  const memberType = props.memberType;
  const memberGroupCode = props.memberGroupCode;
  const typeCode = props.typeCode;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socialMediaData, setSocialMediaData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const memberCode = companyInfo?.MEMBER_CODE;

  useEffect(() => {
    if (!memberCode) return;

    const fetchSocialMedia = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/member/social-media/list?memberCode=${encodeURIComponent(memberCode)}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(`ไม่สามารถดึงข้อมูลโซเชียลมีเดียได้ (${response.status})`);
        }

        const data = await response.json();

        if (data.success) {
          setSocialMediaData(data.data || []);
        } else {
          setError(data.error || "ไม่พบข้อมูลโซเชียลมีเดีย");
        }
      } catch (err) {
        console.error("Error fetching social media data:", err);
        setError(err.message || "ไม่สามารถดึงข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetchSocialMedia();
  }, [memberCode]);

  const handleSocialMediaUpdate = (updatedData) => {
    setSocialMediaData(updatedData);
    setIsEditing(false);
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-600">ช่องทางโซเชียลมีเดีย</h2>

        <div className="flex items-center space-x-2">
          {socialMediaData.length > 0 && !isEditing && (
            <div className="flex bg-gray-200 rounded-md mr-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-l-md ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-700"}`}
                title="มุมมองแบบรายการ"
              >
                <FaList />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-r-md ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-700"}`}
                title="มุมมองแบบกริด"
              >
                <FaThLarge />
              </button>
            </div>
          )}

          {!isEditing && memberType === "000" && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {socialMediaData.length > 0 ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}
            </button>
          )}
        </div>
      </div>

      {/* Guide section */}
      <SocialMediaGuide />

      {/* Display or edit social media */}
      {isEditing ? (
        <SocialMediaManager
          memberCode={memberCode}
          existingData={socialMediaData}
          onUpdate={handleSocialMediaUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : socialMediaData.length > 0 ? (
        <div>
          {/* Conditional rendering based on view mode */}
          {viewMode === "list" ? (
            <SocialMediaList socialMediaList={socialMediaData} />
          ) : (
            <SocialMediaGrid socialMediaList={socialMediaData} />
          )}
        </div>
      ) : (
        <EmptyState message="ยังไม่มีข้อมูลโซเชียลมีเดีย กรุณาคลิกปุ่ม 'เพิ่มข้อมูล' เพื่อเพิ่มช่องทางโซเชียลมีเดีย" />
      )}
    </motion.div>
  );
}
