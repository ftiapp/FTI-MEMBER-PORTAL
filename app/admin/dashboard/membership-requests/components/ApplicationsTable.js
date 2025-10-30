import React from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "./common/StatusBadge";
import { formatThaiDate } from "../ีutils/formatters";
import { getMemberTypeInfo } from "../ีutils/dataTransformers";

const ApplicationsTable = ({ applications, sortOrder = "desc", onToggleDateSort }) => {
  const router = useRouter();

  const handleViewDetails = (type, id) => {
    router.push(`/admin/dashboard/membership-requests/${type}/${id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase whitespace-nowrap">
                การดำเนินการ
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase whitespace-nowrap">
                ประเภท
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase whitespace-nowrap">
                ชื่อ/บริษัท
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase whitespace-nowrap">
                เลขทะเบียน
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase whitespace-nowrap">
                ผู้สมัคร
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase select-none whitespace-nowrap">
                <button
                  type="button"
                  onClick={onToggleDateSort}
                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900"
                  title="จัดเรียงตามวันที่สมัคร"
                >
                  วันที่สมัคร
                  <span className="text-[10px]">{sortOrder === "asc" ? "▲" : "▼"}</span>
                </button>
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase whitespace-nowrap">
                สถานะ
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase whitespace-nowrap">
                อนุมัติโดย
              </th>
              <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase whitespace-nowrap">
                วันที่อนุมัติ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {applications.map((app, index) => {
              const memberType = getMemberTypeInfo(app.type);
              const isIC = app.type === "ic";

              // Debug: Log approved data for AM records
              if (app.type === 'am' && app.status === 1) {
                console.log('=== Frontend DEBUG: AM Record ===');
                console.log('App data:', JSON.stringify(app, null, 2));
                console.log('approvedByAdminName:', app.approvedByAdminName);
                console.log('mainApprovedBy:', app.mainApprovedBy);
              }

              return (
                <tr key={`${app.type}-${app.id}-${app.status}-${app.createdAt || app.id}-${index}`} className="hover:bg-blue-50">
                  <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(app.type, app.id)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {memberType.code}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div className="max-w-xs">
                      <div className="font-medium text-blue-900 truncate">
                        {isIC
                          ? `${app.firstNameTh || ""} ${app.lastNameTh || ""}`.trim()
                          : app.companyNameTh || "-"}
                      </div>
                      <div className="text-xs sm:text-sm text-blue-600 truncate">
                        {isIC
                          ? `${app.firstNameEn || ""} ${app.lastNameEn || ""}`.trim()
                          : app.companyNameEn || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-blue-800 font-mono">
                      {isIC ? app.idCard : app.taxId}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                    <div className="max-w-xs">
                      <div className="text-gray-900 truncate">{app.email}</div>
                      {app.phone && <div className="text-xs sm:text-sm text-gray-500">{app.phone}</div>}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-blue-800">{formatThaiDate(app.createdAt)}</div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-gray-900">
                      {app.approvedByAdminName ? (
                        <div className="text-xs text-gray-900">{app.approvedByAdminName}</div>
                      ) : (
                        "-"
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-gray-900">
                      {app.mainApprovedAt ? (
                        <div className="text-xs text-gray-900">{formatThaiDate(app.mainApprovedAt)}</div>
                      ) : (
                        "-"
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsTable;
