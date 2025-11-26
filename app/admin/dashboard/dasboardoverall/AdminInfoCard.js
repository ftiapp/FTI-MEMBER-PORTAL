export default function AdminInfoCard({ adminInfo }) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 text-white shadow-2xl">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl font-bold">
          {adminInfo?.name?.charAt(0) || adminInfo?.username?.charAt(0) || "A"}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">
            ยินดีต้อนรับ, {adminInfo?.name || adminInfo?.username || "ผู้ดูแลระบบ"}
          </h2>
          <p className="text-purple-300 text-sm">
            {adminInfo?.adminLevel === 5 ? "ผู้ดูแลระบบสูงสุด" : "ผู้ดูแลระบบ"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-purple-300 text-sm mb-1">สิทธิ์การใช้งาน</p>
          <p className="font-semibold">{adminInfo?.canCreate ? "สร้าง/แก้ไข" : "อ่านอย่างเดียว"}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-purple-300 text-sm mb-1">สถานะระบบ</p>
          <p className="font-semibold text-green-400 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            ออนไลน์
          </p>
        </div>
      </div>
    </div>
  );
}
