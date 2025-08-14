import React from 'react';

const IndustrialGroupsSection = ({ application }) => {
  if (!application) return null;

  const hasGroupsData = (application.industrialGroups && application.industrialGroups.length > 0) || 
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
            {application.industrialGroups.map((group, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-lg font-medium text-gray-900">
                  {group.industry_group_name || group.name || `รหัส: ${group.industry_group_id || group.id}`}
                </p>
                <p className="text-sm text-blue-600">รหัส: {group.industry_group_id || group.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {application.provincialChapters && application.provincialChapters.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold mb-4 text-gray-800">สภาอุตสาหกรรมจังหวัด</h4>
          <div className="space-y-3">
            {application.provincialChapters.map((chapter, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-lg font-medium text-gray-900">
                  {chapter.province_chapter_name || chapter.name || `รหัส: ${chapter.province_chapter_id || chapter.id}`}
                </p>
                <p className="text-sm text-blue-600">รหัส: {chapter.province_chapter_id || chapter.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrialGroupsSection;
