import React from "react";

export default function MembershipCardsSection({
  membershipTypes,
  colorClasses,
  onMembershipClick,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {membershipTypes.map((membership) => (
        <div
          key={membership.id}
          className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-400 transition-all duration-300"
        >
          <div className={`${colorClasses[membership.color].bg} text-white p-4 sm:p-5`}>
            <h3 className="text-base sm:text-lg font-bold mb-1">{membership.title}</h3>
            <p className="text-xs sm:text-sm opacity-90 leading-tight">{membership.subtitle}</p>
          </div>
          <div className="p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-lg sm:text-xl font-bold text-gray-900">{membership.price}</p>
              {membership.priceNote && (
                <p className="text-xs text-gray-500">{membership.priceNote}</p>
              )}
            </div>
            <ul className="space-y-2 mb-4">
              {membership.features.map((feature, index) => (
                <li key={index} className="flex items-start text-xs sm:text-sm text-gray-700">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="leading-tight">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={(e) => {
                e.preventDefault();
                onMembershipClick(membership.link);
              }}
              className={`w-full ${colorClasses[membership.color].bg} text-white py-2.5 rounded-lg ${colorClasses[membership.color].hover} transition-colors text-sm sm:text-base font-medium`}
            >
              สมัครสมาชิก
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
