"use client";

export default function ConfirmationDialog({
  selectedSubcategories,
  mainCategories,
  isLoading,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">ยืนยันการเลือกรหัส TSIC</h3>

        <div className="space-y-4 mb-6">
          {Object.entries(selectedSubcategories).map(([categoryCode, subcategories]) => {
            const category = mainCategories.find((c) => c.category_code === categoryCode);
            return (
              <div key={categoryCode} className="border-b pb-4 mb-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  {category?.category_name || categoryCode}
                  {language === "en" &&
                    category?.category_name_EN &&
                    ` (${category.category_name_EN})`}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {subcategories.map((sub, index) => (
                    <div key={index} className="border rounded p-3 bg-gray-50">
                      <div className="flex">
                        <span className="text-blue-600 font-medium mr-2">{sub.tsic_code}</span>
                        <div className="whitespace-normal">
                          <div className="text-sm text-gray-700">{sub.description}</div>
                          {language === "en" && sub.description_EN && (
                            <div className="text-xs text-gray-500 mt-1">{sub.description_EN}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading.submit}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            กลับไปแก้ไข
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading.submit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading.submit ? "กำลังบันทึก..." : "ยืนยันการบันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
