import { getMemberTypeDescription, getMemberTypeColorClasses } from "./utils";

function ConnectedMembersTable({
  connected,
  connectedLoading,
  connectedError,
  search,
  onSearchChange,
  onSearchSubmit,
  pagination,
  onPrevPage,
  onNextPage,
}) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchSubmit(e.currentTarget.value);
          }}
          placeholder="ค้นหา: หมายเลขสมาชิก / ชื่อบริษัท / ชื่อผู้ใช้งาน / Email"
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => onSearchSubmit(search)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ค้นหา
        </button>
      </div>

      {connectedError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {connectedError}
        </div>
      )}

      {connectedLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หมายเลขสมาชิก
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อบริษัท
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ประเภท
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เลขประจำตัวผู้เสียภาษี
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้ใช้งาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เชื่อมต่อเมื่อ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {connected.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                connected.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {row.member_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{row.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMemberTypeColorClasses(
                          row.member_type,
                        )}`}
                      >
                        {getMemberTypeDescription(row.member_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.tax_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>
                        {row.firstname || row.lastname
                          ? `${row.firstname || ""} ${row.lastname || ""}`.trim()
                          : row.username || "-"}
                      </div>
                      {row.user_email && (
                        <div className="text-gray-500 text-xs">{row.user_email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.connected_at
                        ? new Date(row.connected_at).toLocaleString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            หน้า {pagination.page} / {pagination.totalPages} • ทั้งหมด {pagination.total} รายการ
          </div>
          <div className="space-x-2">
            <button
              disabled={pagination.page <= 1 || connectedLoading}
              onClick={onPrevPage}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ย้อนกลับ
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages || connectedLoading}
              onClick={onNextPage}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectedMembersTable;
