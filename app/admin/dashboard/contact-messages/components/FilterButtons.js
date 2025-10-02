"use client";

import { motion } from "framer-motion";

export default function FilterButtons({ filter, setFilter }) {
  return (
    <motion.div
      className="flex space-x-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <button
        onClick={() => setFilter("all")}
        className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
          filter === "all"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-black border border-gray-300 hover:bg-gray-50 hover:shadow"
        }`}
      >
        ทั้งหมด
      </button>
      <button
        onClick={() => setFilter("unread")}
        className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
          filter === "unread"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-black border border-gray-300 hover:bg-gray-50 hover:shadow"
        }`}
      >
        ยังไม่อ่าน
      </button>
      <button
        onClick={() => setFilter("read")}
        className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
          filter === "read"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-black border border-gray-300 hover:bg-gray-50 hover:shadow"
        }`}
      >
        อ่านแล้ว
      </button>
      <button
        onClick={() => setFilter("replied")}
        className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
          filter === "replied"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-white text-black border border-gray-300 hover:bg-gray-50 hover:shadow"
        }`}
      >
        ตอบกลับแล้ว
      </button>
    </motion.div>
  );
}
