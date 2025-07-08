'use client';

import { useState } from 'react';

/**
 * Component for displaying and editing business information
 */
export default function BusinessInfoSection({ businessInfo, businessCategories, products, onUpdate, readOnly }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    businessInfo: businessInfo || {},
    businessCategories: businessCategories || [],
    products: products || []
  });
  
  // Handle input change for business info
  const handleBusinessInfoChange = (field, value) => {
    setFormData({
      ...formData,
      businessInfo: {
        ...formData.businessInfo,
        [field]: value
      }
    });
  };
  
  // Handle input change for products
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      products: updatedProducts
    });
  };
  
  // Handle save changes
  const handleSave = () => {
    onUpdate(formData);
    setEditMode(false);
  };
  
  // Handle cancel edit
  const handleCancel = () => {
    setFormData({
      businessInfo: businessInfo || {},
      businessCategories: businessCategories || [],
      products: products || []
    });
    setEditMode(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">ข้อมูลธุรกิจและผลิตภัณฑ์</h2>
        
        {!readOnly && (
          <div className="print:hidden">
            {editMode ? (
              <div>
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm mr-2"
                >
                  บันทึก
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
              >
                แก้ไข
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Business Categories */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">ประเภทกิจการ</h3>
        
        {businessCategories && businessCategories.length > 0 ? (
          <div className="bg-gray-50 p-4 rounded-md">
            <ul className="list-disc list-inside">
              {businessCategories.map((category, index) => (
                <li key={index}>
                  {category.name_thai} ({category.name_english})
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
            ไม่ได้เลือกประเภทกิจการ
          </div>
        )}
      </div>
      
      {/* Other Business Category */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">ประเภทกิจการอื่นๆ</h3>
        
        {editMode ? (
          <textarea
            value={formData.businessInfo.business_category_other || ''}
            onChange={(e) => handleBusinessInfoChange('business_category_other', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="3"
          />
        ) : (
          <div className="bg-gray-50 p-4 rounded-md">
            {businessInfo && businessInfo.business_category_other ? (
              <p>{businessInfo.business_category_other}</p>
            ) : (
              <p className="text-center text-gray-500">ไม่มีข้อมูล</p>
            )}
          </div>
        )}
      </div>
      
      {/* Products */}
      <div>
        <h3 className="font-medium mb-2">ผลิตภัณฑ์/บริการ</h3>
        
        {products && products.length > 0 ? (
          <div className="space-y-4">
            {editMode ? (
              products.map((product, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <h4 className="font-medium mb-2">ผลิตภัณฑ์/บริการ {index + 1}</h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อผลิตภัณฑ์/บริการ (ไทย)
                      </label>
                      <input
                        type="text"
                        value={product.thai || ''}
                        onChange={(e) => handleProductChange(index, 'thai', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อผลิตภัณฑ์/บริการ (อังกฤษ)
                      </label>
                      <input
                        type="text"
                        value={product.english || ''}
                        onChange={(e) => handleProductChange(index, 'english', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left font-medium">ลำดับ</th>
                      <th className="text-left font-medium">ชื่อผลิตภัณฑ์/บริการ (ไทย)</th>
                      <th className="text-left font-medium">ชื่อผลิตภัณฑ์/บริการ (อังกฤษ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={index}>
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2">{product.thai}</td>
                        <td className="py-2">{product.english}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
            ไม่มีข้อมูลผลิตภัณฑ์/บริการ
          </div>
        )}
      </div>
    </div>
  );
}
