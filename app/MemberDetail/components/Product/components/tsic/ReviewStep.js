'use client';

export default function ReviewStep({ 
  selectedMainCategories, 
  selectedSubcategories, 
  language,
  handleCancel,
  handleSubmit
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium text-gray-700 mb-3">
          {language === 'th' ? 'ข้อมูลที่เลือก' : 'Selected Information'}
        </h4>
        
        {selectedMainCategories.length === 0 ? (
          <p className="text-gray-500">
            {language === 'th' ? 'ไม่พบข้อมูลที่เลือก' : 'No selected data'}
          </p>
        ) : (
          <div className="space-y-4">
            {selectedMainCategories.map(category => (
              <div key={category.category_code} className="border-l-4 border-blue-500 pl-4 py-1">
                <h5 className="font-medium text-gray-800">
                  {language === 'th' ? category.category_name : (category.category_name_EN || category.category_name)}
                </h5>
                <ul className="mt-2 space-y-2">
                  {selectedSubcategories[category.category_code]?.map(sub => (
                    <li key={sub.tsic_code} className="text-sm text-gray-600 pl-3">
                      {language === 'th' ? sub.description : (sub.description_EN || sub.description)}
                    </li>
                  )) || (
                    <li className="text-sm text-gray-500 italic">
                      {language === 'th' ? 'ไม่พบหมวดหมู่ย่อย' : 'No subcategories selected'}
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {language === 'th' ? 'ย้อนกลับ' : 'Back'}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {language === 'th' ? 'ยืนยันการส่งข้อมูล' : 'Confirm Submission'}
        </button>
      </div>
    </div>
  );
}
