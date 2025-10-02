import React from "react";

const IndustrialGroupsSection = ({ application }) => {
  if (!application) return null;

  const hasGroupsData =
    (application.industrialGroups && application.industrialGroups.length > 0) ||
    (application.provincialChapters && application.provincialChapters.length > 0);

  if (!hasGroupsData) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด
      </h3>

      {application.industrialGroups && application.industrialGroups.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">กลุ่มอุตสาหกรรม</h4>
          <div className="space-y-3">
            {application.industrialGroups.map((group, index) => {
              const name =
                group.industry_group_name ||
                group.industryGroupName ||
                group.MEMBER_GROUP_NAME ||
                group.name_th ||
                group.name ||
                null;
              const id =
                group.industry_group_id ||
                group.id ||
                group.MEMBER_GROUP_CODE ||
                group.code ||
                group;
              return (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-lg font-medium text-gray-900">{name || `รหัส: ${id}`}</p>
                  <p className="text-sm text-blue-600">รหัส: {id}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {application.provincialChapters && application.provincialChapters.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">สภาอุตสาหกรรมจังหวัด</h4>
          <div className="space-y-3">
            {application.provincialChapters.map((chapter, index) => {
              const name =
                chapter.province_chapter_name ||
                chapter.provinceChapterName ||
                chapter.MEMBER_GROUP_NAME ||
                chapter.name_th ||
                chapter.name ||
                null;
              const id =
                chapter.province_chapter_id ||
                chapter.id ||
                chapter.MEMBER_GROUP_CODE ||
                chapter.code ||
                chapter;
              return (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-lg font-medium text-gray-900">{name || `รหัส: ${id}`}</p>
                  <p className="text-sm text-blue-600">รหัส: {id}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrialGroupsSection;
