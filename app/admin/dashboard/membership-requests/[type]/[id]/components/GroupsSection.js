import React from "react";

const GroupsSection = ({
  industrialGroupIds,
  provincialChapterIds,
  industrialGroups,
  provincialChapters,
}) => {
  if (
    (!industrialGroupIds || industrialGroupIds.length === 0) &&
    (!provincialChapterIds || provincialChapterIds.length === 0)
  ) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">
        กลุ่มอุตสาหกรรมและสภาอุตสาหกรรมจังหวัด
      </h3>

      {/* กลุ่มอุตสาหกรรม */}
      {industrialGroupIds && industrialGroupIds.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-700">กลุ่มอุตสาหกรรม</h4>
          <div className="space-y-2">
            {industrialGroupIds.map((group, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    {industrialGroups[group.id || group] || `รหัส: ${group.id || group}`}
                  </span>
                  {industrialGroups[group.id || group] && (
                    <span className="text-xs text-gray-500 ml-2">(รหัส: {group.id || group})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* สภาอุตสาหกรรมจังหวัด */}
      {provincialChapterIds && provincialChapterIds.length > 0 && (
        <div>
          <h4 className="text-lg font-medium mb-3 text-gray-700">สภาอุตสาหกรรมจังหวัด</h4>
          <div className="space-y-2">
            {provincialChapterIds.map((chapter, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    {provincialChapters[chapter.id || chapter] || `รหัส: ${chapter.id || chapter}`}
                  </span>
                  {provincialChapters[chapter.id || chapter] && (
                    <span className="text-xs text-gray-500 ml-2">
                      (รหัส: {chapter.id || chapter})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsSection;
