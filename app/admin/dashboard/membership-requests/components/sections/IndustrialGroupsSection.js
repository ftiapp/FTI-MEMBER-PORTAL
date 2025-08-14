import React from 'react';

const IndustrialGroupsSection = ({ application, industrialGroups = {}, provincialChapters = {} }) => {
  const hasGroups = application?.industrialGroups?.length > 0;
  const hasChapters = application?.provincialChapters?.length > 0;
  
  if (!hasGroups && !hasChapters) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด
      </h3>
      
      {hasGroups && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">กลุ่มอุตสาหกรรม</h4>
          <div className="space-y-3">
            {application.industrialGroups.map((group, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-lg font-medium text-gray-900">
                  {group.name || `รหัส: ${group.id}`}
                </p>
                {group.name && (
                  <p className="text-sm text-blue-600">รหัส: {group.id}</p>
                )}
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
                {chapter.name && (
                  <p className="text-sm text-blue-600">รหัส: {chapter.id}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrialGroupsSection;