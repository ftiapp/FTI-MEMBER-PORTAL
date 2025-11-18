import React, { useEffect, useState } from "react";

function MobileBenefitCard({ benefit, membership }) {
  const hasAccess =
    membership === "ordinary"
      ? benefit.ordinary
      : membership === "associate"
        ? benefit.associate
        : benefit.supporting;

  return (
    <div
      className={`p-3 rounded-lg border ${hasAccess ? "border-green-200 bg-white" : "border-gray-200 bg-gray-50"}`}
    >
      <div className="flex items-start space-x-3">
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            hasAccess ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
          }`}
        >
          {hasAccess ? "✓" : "×"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-900 leading-relaxed">
            <span className="font-medium text-blue-600">#{benefit.id}</span> {benefit.title}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BenefitsComparisonSection({
  benefits,
  membershipTypes,
  activeTab,
  onChangeTab,
}) {
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(benefits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBenefits = showAllBenefits
    ? benefits.slice(startIndex, endIndex)
    : benefits.slice(0, 10);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const goToPage = (page) => setCurrentPage(page);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="bg-gray-50 p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              เปรียบเทียบสิทธิประโยชน์
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              ตรวจสอบสิทธิประโยชน์ทั้งหมด {benefits.length} รายการ
            </p>
          </div>
          <button
            onClick={() => {
              setShowAllBenefits(!showAllBenefits);
              if (!showAllBenefits) {
                setCurrentPage(1);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {showAllBenefits ? "แสดงบางส่วน" : "แสดงทั้งหมด"}
          </button>
        </div>
      </div>

      {isMobile ? (
        <div>
          <div className="border-b bg-gray-50 overflow-x-auto">
            <div className="flex">
              {membershipTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onChangeTab(type.id)}
                  className={`flex-1 min-w-max px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === type.id
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-gray-600"
                  }`}
                >
                  {type.title.split("-")[1] || type.title}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 space-y-2">
            {currentBenefits.map((benefit) => (
              <MobileBenefitCard
                key={benefit.id}
                benefit={benefit}
                membership={activeTab}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                  สิทธิประโยชน์
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-blue-600 w-32">
                  สน
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-purple-600 w-32">
                  สส
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-green-600 w-32">
                  ทน
                </th>
                <th className="py-3 px-4 text-center text-sm font-medium text-amber-600 w-32">
                  ทบ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBenefits.map((benefit) => (
                <tr key={benefit.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <span className="text-blue-600 font-medium mr-2">{benefit.id}.</span>
                    {benefit.title}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {benefit.ordinary ? (
                      <span className="text-blue-600 text-lg">✓</span>
                    ) : (
                      <span className="text-gray-300 text-lg">
                        
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {benefit.associate ? (
                      <span className="text-purple-600 text-lg">✓</span>
                    ) : (
                      <span className="text-gray-300 text-lg">
                        
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {benefit.supporting ? (
                      <span className="text-green-600 text-lg">✓</span>
                    ) : (
                      <span className="text-gray-300 text-lg">
                        
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {benefit.supporting ? (
                      <span className="text-amber-600 text-lg">✓</span>
                    ) : (
                      <span className="text-gray-300 text-lg">
                        
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAllBenefits && totalPages > 1 && (
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs text-gray-600">
              หน้า {currentPage} จาก {totalPages}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400"
                    : "bg-white text-gray-700 border hover:bg-gray-50"
                }`}
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1.5 rounded text-xs font-medium ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400"
                    : "bg-white text-gray-700 border hover:bg-gray-50"
                }`}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      {!showAllBenefits && benefits.length > 10 && (
        <div className="bg-gray-50 p-4 text-center border-t">
          <p className="text-xs text-gray-600">
            แสดง 10 จาก {benefits.length} รายการ
            <button
              onClick={() => {
                setShowAllBenefits(true);
                setCurrentPage(1);
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              ดูเพิ่มเติม
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
