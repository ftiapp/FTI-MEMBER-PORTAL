import React from "react";

export default function DocumentRequirementsSection({
  documentRequirements,
  activeTab,
  onChangeTab,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
          เอกสารประกอบการรับสมัครสมาชิก
        </h2>
        <p className="text-xs sm:text-sm opacity-90">
          เอกสารที่จำเป็นสำหรับการสมัครสมาชิกประเภทต่างๆ
        </p>
      </div>

      <div className="border-b bg-gray-50 overflow-x-auto">
        <div className="flex min-w-max">
          {Object.entries(documentRequirements).map(([key, requirement]) => (
            <button
              key={key}
              onClick={() => onChangeTab(key)}
              className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300"
              }`}
            >
              {requirement.title.split(" - ")[1] || requirement.title}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {Object.entries(documentRequirements).map(([key, requirement]) => (
          <div key={key} className={`${activeTab === key ? "block" : "hidden"}`}>
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {requirement.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {requirement.description}
              </p>
            </div>

            {requirement.categories && (
              <div className="space-y-4">
                {requirement.categories.map((category, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 bg-blue-50 p-3 sm:p-4 rounded-r-lg"
                  >
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                      {category.title}: {category.subtitle}
                    </h4>
                    <ul className="space-y-2">
                      {category.requirements.map((req, idx) => (
                        <li
                          key={idx}
                          className="text-xs sm:text-sm text-gray-700 leading-relaxed flex items-start"
                        >
                          <span className="text-blue-600 mr-2 font-bold">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {requirement.documents && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  เอกสารประกอบ
                </h4>
                <ul className="space-y-2">
                  {requirement.documents.map((doc, index) => (
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
                      <span className="leading-relaxed">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium text-yellow-800 text-sm">หมายเหตุ</span>
              </div>
              <p className="text-yellow-700 mt-1 text-xs sm:text-sm leading-relaxed">
                เอกสารทั้งหมด ให้รับรองสำเนาถูกต้อง หากไม่ครบถ้วนเจ้าหน้าที่อาจขอเอกสารเพิ่มเติม
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
