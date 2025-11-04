import Link from "next/link";
import { menuIcons } from "./MenuIcons.js";

export default function MenuItem({ item, isActive, onClick }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        relative px-3 py-2 rounded-lg font-medium transition-all duration-300 group flex items-center gap-1.5
        ${
          isActive
            ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md"
            : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
        }
      `}
    >
      {menuIcons[item.name]}
      <span className="relative z-10 text-sm">{item.name}</span>
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      )}
    </Link>
  );
}
