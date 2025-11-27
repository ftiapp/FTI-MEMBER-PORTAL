import Link from "next/link";

export default function RecentSection({
  title,
  data,
  loading,
  filter,
  filterOptions,
  onFilterChange,
  linkHref,
  colorClass,
  renderItem,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClass} p-4`}>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      <div className="p-6">
        <div className="flex justify-end mb-4">
          <select
            className="text-sm rounded-md px-3 py-2 border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option === "pending"
                  ? "รอดำเนินการ"
                  : option === "approved"
                    ? "อนุมัติแล้ว"
                    : option === "rejected"
                      ? "ปฏิเสธ"
                      : option === "unread"
                        ? "ยังไม่อ่าน"
                        : option === "read"
                          ? "อ่านแล้ว"
                          : option === "replied"
                            ? "ตอบกลับแล้ว"
                            : "ทั้งหมด"}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <p className="text-gray-500">กำลังโหลด...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500">ไม่มีข้อมูล</p>
        ) : (
          <ul className="divide-y">{data.map(renderItem)}</ul>
        )}
        <div className="mt-4 text-right">
          <Link
            href={`${linkHref}?status=${filter}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            ดูทั้งหมด
          </Link>
        </div>
      </div>
    </div>
  );
}
