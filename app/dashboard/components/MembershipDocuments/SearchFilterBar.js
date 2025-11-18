"use client";

export default function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  membershipTypeFilter,
  setMembershipTypeFilter,
}) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="ค้นหาตามชื่อบริษัทหรือเลขทะเบียน"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="sm:w-48 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          <select
            value={membershipTypeFilter}
            onChange={(e) => setMembershipTypeFilter(e.target.value)}
            className="block w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
          >
            <option value="all">ประเภทสมาชิก: ทั้งหมด</option>
            <option value="OC">สามัญ-โรงงาน (สน)</option>
            <option value="AM">สามัญ-สมาคมการค้า (สส)</option>
            <option value="AC">สมทบ-นิติบุคคล (ทน)</option>
            <option value="IC">สมทบ-บุคคลธรรมดา (ทบ)</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
