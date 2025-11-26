import AdminInfoCard from "./AdminInfoCard";
import StatCard from "./StatCard";

export default function HeaderAndStatsSection({ stats, adminInfo }) {
  return (
    <div className="px-6 pt-6 pb-8">
      <div className="mb-8">
        <AdminInfoCard adminInfo={adminInfo} />
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          สรุปภาพรวมระบบ FTI-Portal Management
        </h1>
        <p className="text-gray-600">แดชบอร์ดการจัดการระบบและสถิติการใช้งาน</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="จำนวนผู้ใช้ทั้งหมด"
          value={stats.totalUsers}
          color="from-blue-500 to-blue-600"
          href="/admin/dashboard/verify?status=0"
          totalUsers={stats.totalUsers}
          icon={
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />

        <StatCard
          title="รอการอนุมัติแก้ไข"
          value={stats.pendingUpdates}
          color="from-emerald-500 to-green-600"
          href="/admin/dashboard/update"
          subtitle="pending"
          totalUsers={stats.totalUsers}
          icon={
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          }
        />

        <StatCard
          title="ผู้ใช้ที่ยืนยันอีเมลแล้ว"
          value={stats.verifiedUsers}
          color="from-purple-500 to-purple-600"
          totalUsers={stats.totalUsers}
          icon={
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />

        <StatCard
          title="ผู้ใช้ที่ยังไม่ยืนยันอีเมล"
          value={stats.notVerifiedUsers}
          color="from-orange-500 to-red-500"
          totalUsers={stats.totalUsers}
          icon={
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}
