"use client";

import { motion } from "framer-motion";

export default function MainCategoryStep({
  mainCategories,
  selectedMainCategories,
  handleMainCategoryChange,
  isLoading,
  language,
}) {
  // Sort categories to show selected ones at the top
  const sortedCategories = [...mainCategories].sort((a, b) => {
    const aSelected = selectedMainCategories.some((c) => c.category_code === a.category_code);
    const bSelected = selectedMainCategories.some((c) => c.category_code === b.category_code);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.category_code.localeCompare(b.category_code);
  });

  return (
    <div className="space-y-4">
      {isLoading.main ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sortedCategories.map((category) => {
            const isSelected = selectedMainCategories.some(
              (c) => c.category_code === category.category_code,
            );
            return (
              <div
                key={category.category_code}
                onClick={() => handleMainCategoryChange(category)}
                className={`p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                        isSelected ? "border-blue-500 bg-blue-500" : "border-gray-400"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 break-words">
                      {category.category_code}
                    </p>
                    <p className="text-sm text-gray-600 break-words">
                      {language === "th"
                        ? category.category_name
                        : category.category_name_EN || category.category_name}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
