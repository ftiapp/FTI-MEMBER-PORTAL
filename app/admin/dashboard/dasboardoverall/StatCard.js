import Link from "next/link";

export default function StatCard({ title, value, icon, color, href, subtitle, totalUsers }) {
  return (
    <Link
      href={href || "#"}
      className={`group relative overflow-hidden bg-gradient-to-br ${color} rounded-2xl p-6 shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">{icon}</div>
          <div className="text-white/80 text-sm font-medium">
            {subtitle && `+${Math.floor(Math.random() * 20)}% จากเดือนที่แล้ว`}
          </div>
        </div>
        <div className="text-white">
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-2">{value.toLocaleString()}</p>
          <div className="w-full bg-white/20 rounded-full h-1">
            <div
              className="bg-white h-1 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(100, (value / Math.max(totalUsers || 100, 100)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
