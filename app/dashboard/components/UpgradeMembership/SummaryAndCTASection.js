import React from "react";

export default function SummaryAndCTASection({
  membershipTypes,
  benefits,
  colorClasses,
  onContactClick,
}) {
  return (
    <>
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {membershipTypes.map((type) => {
          const count = benefits.filter((b) =>
            type.id === "ordinary"
              ? b.ordinary
              : type.id === "associate"
                ? b.associate
                : b.supporting,
          ).length;

          return (
            <div
              key={type.id}
              className="bg-white rounded-lg border-2 border-gray-200 p-4 text-center hover:border-blue-300 transition-colors"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses[type.color].light} mb-3`}
              >
                <span className={`text-2xl font-bold ${colorClasses[type.color].text}`}>
                  {count}
                </span>
              </div>
              <h3 className="text-xs font-medium text-gray-600 mb-1">{type.title}</h3>
              <p className="text-xs text-gray-500">จาก {benefits.length} สิทธิ</p>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 sm:p-8 lg:p-10 text-white text-center shadow-xl">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 leading-tight">
          เลือกระดับสมาชิกที่เหมาะสมกับองค์กรของคุณและเริ่มต้นรับสิทธิประโยชน์วันนี้
        </h3>
        <button
          onClick={onContactClick}
          className="bg-white text-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
        >
          ปรึกษาเพิ่มเติม
        </button>
      </div>
    </>
  );
}
