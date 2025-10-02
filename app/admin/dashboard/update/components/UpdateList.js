// แสดงรายการสมาชิกที่ขออัปเดต พร้อมสถานะและรองรับการเลือก
"use client";
import { motion } from "framer-motion";

export default function UpdateList({ members, selectedId, onSelect }) {
  return (
    <div className="space-y-4">
      {members.map((member, idx) => (
        <motion.div
          key={member.id}
          className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedId === member.id ? "border-l-4 border-blue-500 bg-blue-50" : ""}`}
          onClick={() => onSelect(member)}
          whileHover={{ x: 3, backgroundColor: "#EBF5FF" }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.05 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-black">{member.company_name}</h3>
              <p className="text-sm text-black font-medium">{member.MEMBER_CODE}</p>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded-full font-medium ${member.status === "pending" ? "bg-yellow-100 text-yellow-800" : member.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {member.status === "pending"
                ? "รออนุมัติ"
                : member.status === "approved"
                  ? "อนุมัติแล้ว"
                  : "ปฏิเสธแล้ว"}
            </span>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <div className="text-xs text-black font-medium">
              {member.updated_at ? new Date(member.updated_at).toLocaleString("th-TH") : ""}
            </div>
            {(member.status === "approved" || member.status === "rejected") &&
              member.admin_name && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">ผู้ดำเนินการ:</span> {member.admin_name}
                </div>
              )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
