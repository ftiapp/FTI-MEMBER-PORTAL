"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const UserEmailHistory = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState({ emailChanges: [], emailLogs: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchEmailHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/FTI_Portal_User/email-history/${userId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch email history");
        }

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error("Error fetching email history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmailHistory();
  }, [userId]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy HH:mm:ss", { locale: th });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "รอการยืนยัน" },
      verified: { color: "bg-green-100 text-green-800", text: "ยืนยันแล้ว" },
      cancelled: { color: "bg-red-100 text-red-800", text: "ยกเลิก" },
      rejected: { color: "bg-red-100 text-red-800", text: "ปฏิเสธ" },
    };

    const statusInfo = statusMap[status] || { color: "bg-gray-100 text-gray-800", text: status };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) return <div className="text-center py-4">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="text-red-500 py-4">เกิดข้อผิดพลาด: {error}</div>;

  return (
    <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">ประวัติการเปลี่ยนอีเมล</h3>
      </div>

      {history.emailChanges.length === 0 ? (
        <div className="p-4 text-gray-500">ไม่พบประวัติการเปลี่ยนอีเมล</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  วันที่
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  อีเมลเดิม
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  อีเมลใหม่
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  สถานะ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ผู้ดำเนินการ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  หมายเหตุ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.emailChanges.map((change) => (
                <tr key={`change-${change.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(change.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {change.old_email || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {change.new_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getStatusBadge(change.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {change.admin_name || "ผู้ใช้"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {change.admin_note || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserEmailHistory;
