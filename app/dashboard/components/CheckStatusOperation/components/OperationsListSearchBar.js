import React, { useState } from 'react';

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
  statusOptions
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
          placeholder="ค้นหาด้วยหัวข้อ/ชื่อสมาชิก/ข้อความ"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ช่วงวันที่</label>
        <input
          type="date"
          className="border border-gray-300 rounded-md px-2 py-1 mr-1"
          value={dateRange[0]}
          onChange={e => setDateRange([e.target.value, dateRange[1]])}
        />
        <span className="mx-1">-</span>
        <input
          type="date"
          className="border border-gray-300 rounded-md px-2 py-1"
          value={dateRange[1]}
          onChange={e => setDateRange([dateRange[0], e.target.value])}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">กรองสถานะ</label>
        <select
          className="border border-gray-300 rounded-md px-2 py-2 w-36"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          {statusOptions.map(opt => (
            <option value={opt.value} key={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">กรองประเภท</label>
        <select
          className="border border-gray-300 rounded-md px-2 py-2 w-44"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          {operationTypeOptions.map(opt => (
            <option value={opt.value} key={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
