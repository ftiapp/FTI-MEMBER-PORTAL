import React, { useState, useEffect } from "react";
import MultiSelectDropdown from "../common/MultiSelectDropdown";

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
  const [selectedIndustrialGroups, setSelectedIndustrialGroups] = useState([]);
  const [selectedProvincialChapters, setSelectedProvincialChapters] = useState([]);
  const [showIndustrialDropdown, setShowIndustrialDropdown] = useState(false);
  const [showProvincialDropdown, setShowProvincialDropdown] = useState(false);

  // Sync state when application prop changes (after successful update)
  useEffect(() => {
    if (!isEditing) {
      setEditData({
        industrialGroups: application?.industrialGroups || [],
        provincialChapters: application?.provincialChapters || [],
      });
    }
  }, [application, isEditing]);

  const hasIndustrialGroups = application?.industrialGroups?.length > 0;
  const hasProvincialChapters = application?.provincialChapters?.length > 0;
  const hasChapters = hasProvincialChapters;

  // Allow editing even if empty (to add new groups/chapters)
  // if (!hasIndustrialGroups && !hasProvincialChapters) return null;

  // Initialize selected items when editing starts
  useEffect(() => {
    if (isEditing) {
      // Transform application data to match dropdown format
      const igItems = (application?.industrialGroups || []).map(g => ({
        id: g.id || g.code,
        name: g.name || g.name_th || `รหัส: ${g.id}`,
        code: g.code || g.id
      }));
      const pcItems = (application?.provincialChapters || []).map(c => ({
        id: c.id || c.code,
        name: c.name || c.name_th || `รหัส: ${c.id}`,
        code: c.code || c.id
      }));
      
      setSelectedIndustrialGroups(igItems);
      setSelectedProvincialChapters(pcItems);
    }
  }, [isEditing, application]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      industrialGroups: application?.industrialGroups || [],
      provincialChapters: application?.provincialChapters || [],
    });
  };

  const handleSave = async () => {
    try {
      await onUpdate("industrialGroups", {
        industrialGroups: selectedIndustrialGroups,
        provincialChapters: selectedProvincialChapters,
      });
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
    setSelectedIndustrialGroups([]);
    setSelectedProvincialChapters([]);
  };

  const handleRemoveIndustrialGroup = (id) => {
    setSelectedIndustrialGroups(prev => prev.filter(item => item.id !== id));
  };

  const handleRemoveProvincialChapter = (id) => {
    setSelectedProvincialChapters(prev => prev.filter(item => item.id !== id));
  };

  // Transform API data to dropdown format (supports array or object maps)
  const igRaw = Array.isArray(industrialGroups)
    ? industrialGroups
    : industrialGroups && typeof industrialGroups === "object"
    ? Object.values(industrialGroups)
    : [];
  const pcRaw = Array.isArray(provincialChapters)
    ? provincialChapters
    : provincialChapters && typeof provincialChapters === "object"
    ? Object.values(provincialChapters)
    : [];

  // Debug: Log raw data
  console.log("IndustrialGroupsSection - Raw IG data:", igRaw);
  console.log("IndustrialGroupsSection - Raw PC data:", pcRaw);

  const industrialGroupOptions = igRaw.map((g) => ({
    id: g.MEMBER_GROUP_CODE || g.id || g.code,
    name: g.MEMBER_GROUP_NAME_TH || g.name_th || g.name || g.MEMBER_GROUP_NAME || "",
    code: g.MEMBER_GROUP_CODE || g.code || g.id,
  })).filter((o) => o.id && o.name);

  const provincialChapterOptions = pcRaw.map((c) => ({
    id: c.MEMBER_GROUP_CODE || c.id || c.code,
    name: c.MEMBER_GROUP_NAME_TH || c.name_th || c.name || c.MEMBER_GROUP_NAME || "",
    code: c.MEMBER_GROUP_CODE || c.code || c.id,
  })).filter((o) => o.id && o.name);

  // Debug: Log transformed options
  console.log("IndustrialGroupsSection - IG Options:", industrialGroupOptions);
  console.log("IndustrialGroupsSection - PC Options:", provincialChapterOptions);

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

      {isEditing ? (
        <div className="space-y-6">
          {/* Industrial Groups Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              กลุ่มอุตสาหกรรม
            </label>
            
            {/* Selected items are shown inside MultiSelectDropdown */}

            {/* Dropdown */}
            <MultiSelectDropdown
              options={industrialGroupOptions}
              selectedItems={selectedIndustrialGroups}
              onChange={setSelectedIndustrialGroups}
              placeholder="เลือกกลุ่มอุตสาหกรรม"
              label=""
            />
            
            {industrialGroupOptions.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ ไม่พบข้อมูลกลุ่มอุตสาหกรรม กรุณาตรวจสอบการโหลดข้อมูล
              </p>
            )}
          </div>

          {/* Provincial Chapters Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              สภาอุตสาหกรรมจังหวัด
            </label>
            
            {/* Selected items are shown inside MultiSelectDropdown */}

            {/* Dropdown */}
            <MultiSelectDropdown
              options={provincialChapterOptions}
              selectedItems={selectedProvincialChapters}
              onChange={setSelectedProvincialChapters}
              placeholder="เลือกสภาอุตสาหกรรมจังหวัด"
              label=""
            />
            
            {provincialChapterOptions.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ ไม่พบข้อมูลสภาอุตสาหกรรมจังหวัด กรุณาตรวจสอบการโหลดข้อมูล
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
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

          {!hasIndustrialGroups && !hasChapters && (
            <p className="text-gray-500 italic">ยังไม่ได้เลือกกลุ่มอุตสาหกรรมหรือสภาจังหวัด</p>
          )}
        </>
      )}
    </div>
  );
};

export default IndustrialGroupsSection;
