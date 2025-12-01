import ActionCounts from "../../components/ActionCounts";
import Alluser from "../../components/Alluser";
import Analytics from "../../components/Analytics";
import ChangePersonal from "../../components/ChangePersonal";
import ContactMessageStats from "../../components/ContactMessageStats";
import GuestContactMessageStats from "../../components/GuestContactMessageStats";
import RecentSection from "./RecentSection";
import MembershipSignupAnalytics from "./MembershipSignupAnalytics";
import OriginalMembershipAnalytics from "./OriginalMembershipAnalytics";
import OCIndustryProvinceAnalytics from "./OCIndustryProvinceAnalytics";
import CompanyLocationAnalytics from "./CompanyLocationAnalytics";

const MEMBER_TYPE_LABELS = {
  IC: "ทบ",
  OC: "สน",
  AM: "สส",
  AC: "ทน",
};

export default function MainContentSection({
  stats,
  filters,
  recentData,
  recentLoading,
  updateFilter,
  FILTER_OPTIONS,
  STATUS_STYLES,
  STATUS_LABELS,
  adminInfo,
}) {
  return (
    <div className="px-6 space-y-8">
      {/* Statistics Components */}
      <div className="grid grid-cols-1 gap-8">
        {/* Action Counts */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">สถิติการดำเนินการในระบบ</h2>
          </div>
          <ActionCounts title="สถิติการดำเนินการในระบบ" />
        </div>

        {/* User Statistics */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">สถิติผู้ใช้งานระบบ</h2>
          </div>
          <Alluser title="สถิติผู้ใช้งานระบบ" />
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Member Verification Analytics */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
            <h3 className="text-white font-semibold">ยืนยันตัวสมาชิกเดิม - บริษัท</h3>
          </div>
          <div className="p-6">
            <Analytics
              title="ยืนยันตัวสมาชิกเดิม - บริษัท"
              endpoint="/api/admin/member-verification-stats"
            />
          </div>
        </div>

        {/* Profile Update Stats */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
            <h3 className="text-white font-semibold">แจ้งเปลี่ยนข้อมูลส่วนตัว</h3>
          </div>
          <div className="p-6">
            <ChangePersonal
              title="แจ้งเปลี่ยนข้อมูลส่วนตัว"
              endpoint="/api/admin/profile_update_stat"
            />
          </div>
        </div>

        {/* Contact Message Stats */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4">
            <h3 className="text-white font-semibold">สถิติข้อความติดต่อ (สมาชิก)</h3>
          </div>
          <div className="p-6">
            <ContactMessageStats title="สถิติข้อความติดต่อ (สมาชิก)" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
            <h3 className="text-white font-semibold">สถิติข้อความติดต่อ (บุคคลทั่วไป)</h3>
          </div>
          <div className="p-6">
            <GuestContactMessageStats title="สถิติข้อความติดต่อ (บุคคลทั่วไป)" />
          </div>
        </div>
      </div>

      {/* Recent Sections */}
      <div className="mb-16">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7h18M3 12h18M3 17h18"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">รายการล่าสุด</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Membership Requests */}
          <RecentSection
            title="สมัครสมาชิกล่าสุด"
            data={recentData.memberships}
            loading={recentLoading.membership}
            filter={filters.membership}
            filterOptions={FILTER_OPTIONS.membership}
            onFilterChange={(value) => updateFilter("membership", value)}
            linkHref="/admin/dashboard/membership-requests"
            colorClass="from-blue-600 to-indigo-600"
            renderItem={(item) => (
              <li key={`${item.type}-${item.id}`} className="py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      [
                      {MEMBER_TYPE_LABELS[item.type?.toUpperCase?.() || item.type] ||
                        item.type?.toUpperCase?.() ||
                        item.type ||
                        "-"}
                      ] {item.companyNameTh || item.companyNameEn}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString("th-TH")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md ${STATUS_STYLES[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
              </li>
            )}
          />

          {/* Recent Member Messages */}
          <RecentSection
            title="ข้อความสมาชิกล่าสุด"
            data={recentData.memberMsgs}
            loading={recentLoading.memberMsg}
            filter={filters.memberMsg}
            filterOptions={FILTER_OPTIONS.messages}
            onFilterChange={(value) => updateFilter("memberMsg", value)}
            linkHref="/admin/dashboard/contact-messages"
            colorClass="from-orange-600 to-red-600"
            renderItem={(m) => (
              <li key={m.id} className="py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{m.subject || "(ไม่มีหัวเรื่อง)"}</p>
                    <p className="text-xs text-gray-500">
                      จาก {m.name || m.email || "-"} •{" "}
                      {new Date(m.created_at).toLocaleString("th-TH")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md ${STATUS_STYLES[m.status]}`}>
                    {m.status}
                  </span>
                </div>
              </li>
            )}
          />

          {/* Recent Guest Messages */}
          <RecentSection
            title="ข้อความบุคคลทั่วไปล่าสุด"
            data={recentData.guestMsgs}
            loading={recentLoading.guestMsg}
            filter={filters.guestMsg}
            filterOptions={FILTER_OPTIONS.messages}
            onFilterChange={(value) => updateFilter("guestMsg", value)}
            linkHref="/admin/dashboard/guest-messages"
            colorClass="from-purple-600 to-pink-600"
            renderItem={(g) => (
              <li key={g.id} className="py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{g.subject || "(ไม่มีหัวเรื่อง)"}</p>
                    <p className="text-xs text-gray-500">
                      จาก {g.name || g.email || "-"} •{" "}
                      {new Date(g.created_at).toLocaleString("th-TH")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md ${STATUS_STYLES[g.status]}`}>
                    {g.status}
                  </span>
                </div>
              </li>
            )}
          />
        </div>
      </div>

      {/* Membership analytics */}
      <MembershipSignupAnalytics />

      {/* Original Membership Verification analytics */}
      <OriginalMembershipAnalytics />

      {/* OC Industry / Province analytics */}
      <OCIndustryProvinceAnalytics />

      {/* Company location analytics */}
      <CompanyLocationAnalytics />

      {/* System Info */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center mr-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">ข้อมูลระบบ</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              ข้อมูลผู้ดูแลระบบ
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ชื่อผู้ใช้:</span>
                <span className="font-medium">{adminInfo?.username || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ชื่อ:</span>
                <span className="font-medium">{adminInfo?.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ระดับสิทธิ์:</span>
                <span className="font-medium text-purple-600">
                  {adminInfo?.adminLevel === 5 ? "ผู้ดูแลระบบสูงสุด" : "ผู้ดูแลระบบ"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">สิทธิ์การใช้งาน:</span>
                <span
                  className={`font-medium ${adminInfo?.canCreate ? "text-green-600" : "text-orange-600"}`}
                >
                  {adminInfo?.canCreate ? "สร้าง/แก้ไข" : "อ่านอย่างเดียว"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              สถานะระบบ
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">สถานะ:</span>
                <span className="flex items-center font-medium text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  ออนไลน์
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">เวอร์ชัน:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">อัพเดตล่าสุด:</span>
                <span className="font-medium">{new Date().toLocaleDateString("th-TH")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ฐานข้อมูล:</span>
                <span className="flex items-center font-medium text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  เชื่อมต่อแล้ว
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
