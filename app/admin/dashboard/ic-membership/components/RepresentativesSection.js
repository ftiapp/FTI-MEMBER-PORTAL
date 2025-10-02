"use client";

import { useState } from "react";

/**
 * Component for displaying and editing representatives information
 */
export default function RepresentativesSection({ representatives, onUpdate, readOnly }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(representatives || []);

  // Handle input change
  const handleChange = (index, field, value) => {
    const updatedData = [...formData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
    };
    setFormData(updatedData);
  };

  // Handle save changes
  const handleSave = () => {
    onUpdate(formData);
    setEditMode(false);
  };

  // Handle cancel edit
  const handleCancel = () => {
    setFormData(representatives);
    setEditMode(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">ข้อมูลผู้แทนใช้สิทธิ</h2>

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

      {formData && formData.length > 0 ? (
        <div className="space-y-6">
          {formData.map((representative, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <h3 className="font-medium mb-2">ผู้แทนคนที่ {index + 1}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editMode ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อ (ไทย)
                      </label>
                      <input
                        type="text"
                        value={representative.first_name_thai || ""}
                        onChange={(e) => handleChange(index, "first_name_thai", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        นามสกุล (ไทย)
                      </label>
                      <input
                        type="text"
                        value={representative.last_name_thai || ""}
                        onChange={(e) => handleChange(index, "last_name_thai", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อ (อังกฤษ)
                      </label>
                      <input
                        type="text"
                        value={representative.first_name_english || ""}
                        onChange={(e) => handleChange(index, "first_name_english", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        นามสกุล (อังกฤษ)
                      </label>
                      <input
                        type="text"
                        value={representative.last_name_english || ""}
                        onChange={(e) => handleChange(index, "last_name_english", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ตำแหน่ง (ไทย)
                      </label>
                      <input
                        type="text"
                        value={representative.position_thai || ""}
                        onChange={(e) => handleChange(index, "position_thai", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ตำแหน่ง (อังกฤษ)
                      </label>
                      <input
                        type="text"
                        value={representative.position_english || ""}
                        onChange={(e) => handleChange(index, "position_english", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                      <input
                        type="email"
                        value={representative.email || ""}
                        onChange={(e) => handleChange(index, "email", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        โทรศัพท์
                      </label>
                      <input
                        type="text"
                        value={representative.phone || ""}
                        onChange={(e) => handleChange(index, "phone", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="block text-sm font-medium text-gray-700">
                        ชื่อ-นามสกุล (ไทย)
                      </span>
                      <span>
                        {representative.first_name_thai} {representative.last_name_thai}
                      </span>
                    </div>

                    <div>
                      <span className="block text-sm font-medium text-gray-700">
                        ชื่อ-นามสกุล (อังกฤษ)
                      </span>
                      <span>
                        {representative.first_name_english} {representative.last_name_english}
                      </span>
                    </div>

                    <div>
                      <span className="block text-sm font-medium text-gray-700">ตำแหน่ง (ไทย)</span>
                      <span>{representative.position_thai}</span>
                    </div>

                    <div>
                      <span className="block text-sm font-medium text-gray-700">
                        ตำแหน่ง (อังกฤษ)
                      </span>
                      <span>{representative.position_english}</span>
                    </div>

                    <div>
                      <span className="block text-sm font-medium text-gray-700">อีเมล</span>
                      <span>{representative.email}</span>
                    </div>

                    <div>
                      <span className="block text-sm font-medium text-gray-700">โทรศัพท์</span>
                      <span>{representative.phone}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
          ไม่พบข้อมูลผู้แทนใช้สิทธิ
        </div>
      )}
    </div>
  );
}
