'use client';

import { useState } from 'react';

/**
 * Component for displaying and editing address information
 */
export default function AddressSection({ address, onUpdate, readOnly }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(address || {});
  
  // Handle input change
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle save changes
  const handleSave = () => {
    onUpdate(formData);
    setEditMode(false);
  };
  
  // Handle cancel edit
  const handleCancel = () => {
    setFormData(address);
    setEditMode(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">ที่อยู่จัดส่งเอกสาร</h2>
        
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
      
      {address ? (
        <div>
          <h3 className="font-medium mb-2">ที่อยู่ภาษาไทย</h3>
          
          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ที่อยู่
                </label>
                <textarea
                  value={formData.address_thai || ''}
                  onChange={(e) => handleChange('address_thai', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แขวง/ตำบล
                </label>
                <input
                  type="text"
                  value={formData.subdistrict_thai || ''}
                  onChange={(e) => handleChange('subdistrict_thai', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เขต/อำเภอ
                </label>
                <input
                  type="text"
                  value={formData.district_thai || ''}
                  onChange={(e) => handleChange('district_thai', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จังหวัด
                </label>
                <input
                  type="text"
                  value={formData.province_thai || ''}
                  onChange={(e) => handleChange('province_thai', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสไปรษณีย์
                </label>
                <input
                  type="text"
                  value={formData.postal_code || ''}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p>{address.address_thai}</p>
              <p>
                แขวง/ตำบล {address.subdistrict_thai} เขต/อำเภอ {address.district_thai}
              </p>
              <p>
                จังหวัด {address.province_thai} รหัสไปรษณีย์ {address.postal_code}
              </p>
            </div>
          )}
          
          <h3 className="font-medium mb-2">ที่อยู่ภาษาอังกฤษ</h3>
          
          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ที่อยู่
                </label>
                <textarea
                  value={formData.address_english || ''}
                  onChange={(e) => handleChange('address_english', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แขวง/ตำบล
                </label>
                <input
                  type="text"
                  value={formData.subdistrict_english || ''}
                  onChange={(e) => handleChange('subdistrict_english', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เขต/อำเภอ
                </label>
                <input
                  type="text"
                  value={formData.district_english || ''}
                  onChange={(e) => handleChange('district_english', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จังหวัด
                </label>
                <input
                  type="text"
                  value={formData.province_english || ''}
                  onChange={(e) => handleChange('province_english', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md">
              <p>{address.address_english}</p>
              <p>
                Sub-district: {address.subdistrict_english}, District: {address.district_english}
              </p>
              <p>
                Province: {address.province_english}, Postal Code: {address.postal_code}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
          ไม่พบข้อมูลที่อยู่
        </div>
      )}
    </div>
  );
}
