import React, { useState } from "react";

const IndustrialGroupsSection = ({
  application,
  industrialGroups,
  provincialChapters,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    industrialGroups: application?.industrialGroups || [],
    provincialChapters: application?.provincialChapters || [],
  });

  const hasIndustrialGroups = application?.industrialGroups?.length > 0;
  const hasProvincialChapters = application?.provincialChapters?.length > 0;
  const hasChapters = hasProvincialChapters;

  if (!hasIndustrialGroups && !hasProvincialChapters) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      industrialGroups: application?.industrialGroups || [],
      provincialChapters: application?.provincialChapters || [],
    });
  };

  const handleSave = async () => {
    try {
      await onUpdate("industrialGroups", editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating industrial groups:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      industrialGroups: application?.industrialGroups || [],
      provincialChapters: application?.provincialChapters || [],
    });
  };

  const getGroupName = (groupId) => {
    const group = industrialGroups?.find((g) => g.MEMBER_GROUP_CODE === groupId);
    return group ? group.MEMBER_GROUP_NAME_TH : `รหัส: ${groupId}`;
  };

  const getChapterName = (chapterId) => {
    const chapter = provincialChapters?.find((c) => c.MEMBER_GROUP_CODE === chapterId);
    return chapter ? chapter.MEMBER_GROUP_NAME_TH : `รหัส: ${chapterId}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-4">
        <h3 className="text-2xl font-bold text-blue-900">กลุ่มอุตสาหกรรมและสภาจังหวัด</h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="แก้ไขกลุ่มอุตสาหกรรมและสภาจังหวัด"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            แก้ไข
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              บันทึก
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              ยกเลิก
            </button>
          </div>
        )}
      </div>

      {hasIndustrialGroups && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">กลุ่มอุตสาหกรรม</h4>
          <div className="space-y-3">
            {application.industrialGroups.map((group, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-lg font-medium text-gray-900">
                  {group.name || `รหัส: ${group.id}`}
                </p>
                {group.name && <p className="text-sm text-blue-600">รหัส: {group.id}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasChapters && (
        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">สภาอุตสาหกรรมจังหวัด</h4>
          <div className="space-y-3">
            {application.provincialChapters.map((chapter, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-lg font-medium text-gray-900">
                  {chapter.name || `รหัส: ${chapter.id}`}
                </p>
                {chapter.name && <p className="text-sm text-blue-600">รหัส: {chapter.id}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrialGroupsSection;
