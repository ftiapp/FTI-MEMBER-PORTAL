"use client";

export default function SettingCard({ title, description, icon, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-200 rounded-lg p-3 mb-2 ${
        active ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-2 rounded-md ${active ? "bg-blue-100" : "bg-gray-100"}`}>
          <div className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-600"}`}>{icon}</div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${active ? "text-blue-900" : "text-gray-900"}`}>
            {title}
          </h3>
          <p className={`text-xs mt-1 ${active ? "text-blue-700" : "text-gray-600"}`}>
            {description}
          </p>
        </div>
      </div>

      {active && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
}
