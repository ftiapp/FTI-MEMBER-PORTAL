"use client";

import { AnimatePresence, motion } from "framer-motion";
import SubcategoryItem from "./SubcategoryItem";
import Pagination from "./Pagination";

export default function SubcategoryStep({
  selectedMainCategories,
  filteredSubcategories,
  selectedSubcategories,
  currentPage,
  itemsPerPage,
  searchTerm,
  handleSearch,
  handlePageChange,
  handleSubcategoryChange,
  isLoading,
  language,
  getSelectedCount,
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="space-y-8">
          {selectedMainCategories.map((category) => {
            const currentPageForCategory = currentPage[category.category_code] || 1;
            const totalPages = Math.ceil(
              (filteredSubcategories[category.category_code]?.length || 0) / itemsPerPage,
            );
            const startIndex = (currentPageForCategory - 1) * itemsPerPage;
            const paginatedSubcategories =
              filteredSubcategories[category.category_code]?.slice(
                startIndex,
                startIndex + itemsPerPage,
              ) || [];

            return (
              <div key={category.category_code} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                  <h4 className="text-md font-medium text-gray-800">
                    {language === "th"
                      ? category.category_name
                      : category.category_name_EN || category.category_name}
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {getSelectedCount(category.category_code)}/5
                    </span>
                  </h4>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder={
                        language === "th" ? "ค้นหาหมวดหมู่ย่อย..." : "Search subcategories..."
                      }
                      className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e, category.category_code)}
                    />
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Display already selected subcategories at the top */}
                  {selectedSubcategories[category.category_code]?.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        {language === "th" ? "รหัส TSIC ที่เลือกแล้ว" : "Selected TSIC Codes"}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 bg-blue-50 p-3 rounded-md border border-blue-200">
                        {selectedSubcategories[category.category_code].map((subcategory) => (
                          <div
                            key={subcategory.tsic_code}
                            className="flex items-start p-2 rounded-md bg-white border border-blue-300 relative"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-5 h-5 rounded border flex items-center justify-center mr-3 border-blue-500 bg-blue-500">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                            <div className="min-w-0 flex-grow">
                              <p className="font-medium text-gray-800 break-words">
                                {subcategory.tsic_code}
                              </p>
                              <p className="text-sm text-gray-600 break-words">
                                {language === "th"
                                  ? subcategory.description
                                  : subcategory.description_EN || subcategory.description}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubcategoryChange(category.category_code, subcategory, false);
                              }}
                              className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-1 absolute top-2 right-2"
                              title={language === "th" ? "ลบรายการนี้" : "Remove this item"}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLoading.subcategories[category.category_code] ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : paginatedSubcategories.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        {paginatedSubcategories.map((subcategory) => {
                          const isSelected = selectedSubcategories[category.category_code]?.some(
                            (sc) => sc.tsic_code === subcategory.tsic_code,
                          );

                          return (
                            <SubcategoryItem
                              key={subcategory.tsic_code}
                              subcategory={subcategory}
                              isSelected={isSelected}
                              onSelect={() =>
                                handleSubcategoryChange(
                                  category.category_code,
                                  subcategory,
                                  !isSelected,
                                )
                              }
                              language={language}
                            />
                          );
                        })}
                      </div>

                      {totalPages > 1 && (
                        <Pagination
                          currentPage={currentPageForCategory}
                          totalPages={totalPages}
                          itemsPerPage={itemsPerPage}
                          totalItems={filteredSubcategories[category.category_code]?.length || 0}
                          startIndex={startIndex}
                          onPageChange={(page) => handlePageChange(page, category.category_code)}
                          language={language}
                        />
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      {language === "th" ? "ไม่พบข้อมูล" : "No data found"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
