'use client';

export default function BusinessInfoSection({
  formData,
  errors,
  handleChange,
  handleCheckboxChange,
  businessCategories,
  isLoading
}) {
  const businessTypes = [
    { id: 'manufacturer', label: 'ผู้ผลิต' },
    { id: 'exporter', label: 'ผู้ส่งออก' },
    { id: 'importer', label: 'ผู้นำเข้า' },
    { id: 'wholesaler', label: 'ผู้ค้าส่ง' },
    { id: 'retailer', label: 'ผู้ค้าปลีก' },
    { id: 'service', label: 'ผู้ให้บริการ' },
    { id: 'other', label: 'อื่นๆ' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">ข้อมูลธุรกิจ</h2>
      
      {/* ประเภทธุรกิจ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ประเภทธุรกิจ <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-1">(เลือกได้มากกว่า 1)</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {businessTypes.map((type) => (
            <div key={type.id} className="flex items-start">
              <input
                type="checkbox"
                id={`business-type-${type.id}`}
                name="businessTypes"
                value={type.id}
                checked={formData.businessTypes.includes(type.id)}
                onChange={handleCheckboxChange}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`business-type-${type.id}`} className="ml-2 text-sm text-gray-700">
                {type.label}
              </label>
            </div>
          ))}
        </div>
        
        {errors.businessTypes && (
          <p className="mt-1 text-sm text-red-500">{errors.businessTypes}</p>
        )}
        
        {/* อื่นๆ โปรดระบุ */}
        {formData.businessTypes.includes('other') && (
          <div className="mt-3">
            <label htmlFor="businessTypeOther" className="block text-sm font-medium text-gray-700 mb-1">
              โปรดระบุประเภทธุรกิจอื่นๆ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="businessTypeOther"
              name="businessTypeOther"
              value={formData.businessTypeOther}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.businessTypeOther ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="ระบุประเภทธุรกิจอื่นๆ"
            />
            {errors.businessTypeOther && (
              <p className="mt-1 text-sm text-red-500">{errors.businessTypeOther}</p>
            )}
          </div>
        )}
      </div>
      
      {/* ประเภทกิจการ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ประเภทกิจการ
          <span className="text-xs text-gray-500 ml-1">(เลือกได้มากกว่า 1)</span>
        </label>
        
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {businessCategories.map((category) => (
              <div key={category.id} className="flex items-start">
                <input
                  type="checkbox"
                  id={`business-category-${category.id}`}
                  name="businessCategories"
                  value={category.id}
                  checked={formData.businessCategories.includes(category.id)}
                  onChange={handleCheckboxChange}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`business-category-${category.id}`} className="ml-2 text-sm text-gray-700">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* ผลิตภัณฑ์/บริการ (ภาษาไทย) */}
        <div>
          <label htmlFor="productsThai" className="block text-sm font-medium text-gray-700 mb-1">
            ผลิตภัณฑ์/บริการ (ภาษาไทย) <span className="text-red-500">*</span>
          </label>
          <textarea
            id="productsThai"
            name="productsThai"
            value={formData.productsThai}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border ${
              errors.productsThai ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="กรุณาระบุผลิตภัณฑ์หรือบริการของท่าน"
          ></textarea>
          {errors.productsThai && (
            <p className="mt-1 text-sm text-red-500">{errors.productsThai}</p>
          )}
        </div>
        
        {/* ผลิตภัณฑ์/บริการ (ภาษาอังกฤษ) */}
        <div>
          <label htmlFor="productsEnglish" className="block text-sm font-medium text-gray-700 mb-1">
            ผลิตภัณฑ์/บริการ (ภาษาอังกฤษ)
          </label>
          <textarea
            id="productsEnglish"
            name="productsEnglish"
            value={formData.productsEnglish}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Please specify your products or services"
          ></textarea>
        </div>
      </div>
    </div>
  );
}
