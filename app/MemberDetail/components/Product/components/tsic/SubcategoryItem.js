"use client";

export default function SubcategoryItem({ subcategory, isSelected, onSelect, language }) {
  return (
    <div
      onClick={onSelect}
      className={`p-3 border rounded-md cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${
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
          <p className="font-medium text-gray-800 break-words">{subcategory.tsic_code}</p>
          <p className="text-sm text-gray-600 break-words">
            {language === "th"
              ? subcategory.description
              : subcategory.description_EN || subcategory.description}
          </p>
        </div>
      </div>
    </div>
  );
}
