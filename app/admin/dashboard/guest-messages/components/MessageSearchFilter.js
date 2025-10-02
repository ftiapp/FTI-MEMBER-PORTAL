// app/admin/dashboard/guest-messages/components/MessageSearchFilter.js

import { useState } from "react";

const MessageSearchFilter = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  setCurrentPage,
  onSearch,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(localSearchTerm);
    setCurrentPage(1);
    onSearch();
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSearch} className="flex mb-2">
        <input
          type="text"
          placeholder="ค้นหาโดยชื่อ, อีเมล, หรือหัวข้อ"
          className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
        >
          ค้นหา
        </button>
      </form>

      <select
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filterStatus}
        onChange={(e) => handleFilterChange(e.target.value)}
      >
        <option value="all">ทั้งหมด</option>
        <option value="unread">ยังไม่อ่าน</option>
        <option value="read">อ่านแล้ว</option>
        <option value="replied">ตอบกลับแล้ว</option>
        <option value="closed">ปิดการติดต่อ</option>
      </select>
    </div>
  );
};

export default MessageSearchFilter;
