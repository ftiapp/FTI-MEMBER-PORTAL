import { formatThaiDate, getMemberTypeDescription, getMemberTypeColorClasses } from "./utils";

function PendingMembersTable({
  members,
  connecting,
  pendingSearch,
  onConnect,
  onSearchChange,
}) {
  return (
    <div className="p-6">
      {/* Pending search */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={pendingSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          placeholder="ค้นหา: ชื่อบริษัท / เลขภาษี / ผู้ใช้งาน / อีเมล"
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            /* client-side filter only */
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ค้นหา
        </button>
      </div>
      {members.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">ไม่มีรายการสมาชิกที่ต้องเชื่อมต่อ</div>
          <div className="text-gray-400 text-sm mt-2">
            สมาชิกทั้งหมดได้รับการเชื่อมต่อแล้ว
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ประเภท
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อบริษัท
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เลขประจำตัวผู้เสียภาษี
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้ใช้งาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อัปเดตล่าสุด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members
                .filter((m) => {
                  const q = pendingSearch.trim().toLowerCase();
                  if (!q) return true;
                  const values = [
                    m.company_name_th,
                    m.company_name_en,
                    m.tax_id,
                    m.firstname,
                    m.lastname,
                    m.username,
                    m.user_email,
                  ].map((v) => (v || "").toString().toLowerCase());
                  return values.some((v) => v.includes(q));
                })
                .map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMemberTypeColorClasses(
                          member.member_type
                        )}`}
                      >
                        {getMemberTypeDescription(member.member_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.company_name_th}
                      </div>
                      {member.company_name_en && (
                        <div className="text-sm text-gray-500">
                          {member.company_name_en}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.tax_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>
                        {member.firstname || member.lastname
                          ? `${member.firstname || ""} ${member.lastname || ""}`.trim()
                          : member.username || "-"}
                      </div>
                      {member.user_email && (
                        <div className="text-gray-500 text-xs">{member.user_email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatThaiDate(member.updated_at || member.approved_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onConnect(member)}
                        disabled={connecting[member.id]}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          connecting[member.id]
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        }`}
                      >
                        {connecting[member.id] ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            กำลังเชื่อมต่อ...
                          </>
                        ) : (
                          <>
                            <svg
                              className="-ml-1 mr-2 h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            เชื่อมต่อหมายเลขสมาชิก
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PendingMembersTable;
