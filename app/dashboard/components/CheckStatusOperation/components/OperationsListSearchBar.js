import React, { useState, useEffect } from "react";

// Helper function to get filtered status options based on type
const getFilteredStatusOptions = (type, allOptions) => {
  if (!type) return allOptions;

  switch (type) {
    case "ติดต่อเจ้าหน้าที่":
      return allOptions.filter((opt) =>
        ["", "unread", "read", "replied", "none", "error"].includes(opt.value),
      );
    case "ยืนยันสมาชิกเดิม":
      return allOptions.filter((opt) =>
        ["", "pending", "approved", "rejected"].includes(opt.value),
      );
    default:
      return allOptions;
  }
};

export default function OperationsListSearchBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  dateRange,
  setDateRange,
  operationTypeOptions,
  statusOptions,
}) {
  // State for filtered status options based on selected type
  const [filteredStatusOptions, setFilteredStatusOptions] = useState(statusOptions);

  // Update filtered status options when type filter changes
  useEffect(() => {
    setFilteredStatusOptions(getFilteredStatusOptions(typeFilter, statusOptions));
  }, [typeFilter, statusOptions]);

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Search bar at the top */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-black mb-1">ค้นหา</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-400 text-black placeholder:text-gray-400"
          placeholder="ค้นหาด้วยหัวข้อ/ชื่อสมาชิก/ข้อความ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* Other filters below */}
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">ช่วงวันที่</label>
          <input
            type="date"
            className="border border-gray-300 rounded-md px-2 py-1 mr-1 text-black"
            value={dateRange[0]}
            onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
          />
          <span className="mx-1">-</span>
          <input
            type="date"
            className="border border-gray-300 rounded-md px-2 py-1 text-black"
            value={dateRange[1]}
            onChange={(e) => setDateRange([dateRange[0], e.target.value])}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">กรองประเภท</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-2 w-44 text-black"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              // Reset status filter when type changes
              setStatusFilter("");
            }}
          >
            <option value="">ทั้งหมด</option>
            {operationTypeOptions.map((opt) => (
              <option value={opt.value} key={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">กรองสถานะ</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-2 w-36 text-black"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            {filteredStatusOptions.map((opt) => (
              <option value={opt.value} key={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
