import React from "react";
import SearchBar from "./common/SearchBar";
import { MEMBER_TYPES } from "../ีutils/constants";

const ApplicationFilters = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-blue-100 mb-4 sm:mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          placeholder="ค้นหาด้วยชื่อ, อีเมล, เลขบัตรประชาชน..."
        />

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="flex-1 px-3 py-2 text-sm sm:text-base border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-blue-700"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="pending">รอพิจารณา</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="rejected">ปฏิเสธแล้ว</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="flex-1 px-3 py-2 text-sm sm:text-base border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-blue-700"
          >
            <option value="all">ทุกประเภท</option>
            {Object.entries(MEMBER_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.code} ({value.name})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFilters;
