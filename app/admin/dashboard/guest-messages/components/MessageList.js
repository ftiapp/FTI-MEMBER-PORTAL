// app/admin/dashboard/guest-messages/components/MessageList.js

import MessageSearchFilter from "./MessageSearchFilter";
import MessageListItem from "./MessageListItem";

const MessageList = ({
  messages,
  loading,
  error,
  currentPage,
  totalPages,
  selectedMessage,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  setCurrentPage,
  onMessageClick,
  onSearch,
  onAddSampleData,
}) => {
  if (loading) {
    return (
      <div className="lg:col-span-1 bg-gray-100 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">รายการข้อความ</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1 bg-gray-100 rounded-lg shadow-md p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">รายการข้อความ</h2>

        <MessageSearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          setCurrentPage={setCurrentPage}
          onSearch={onSearch}
        />

        {error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">
            <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-black text-center">
            <p className="mb-4">ไม่พบข้อความติดต่อ</p>
            <button
              onClick={onAddSampleData}
              className="px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700"
            >
              เพิ่มข้อมูลตัวอย่าง
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {messages.map((message) => (
              <MessageListItem
                key={message.id}
                message={message}
                isSelected={selectedMessage?.id === message.id}
                onClick={onMessageClick}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <nav className="flex items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md mr-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              <span className="text-sm">
                หน้า {currentPage} จาก {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md ml-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
