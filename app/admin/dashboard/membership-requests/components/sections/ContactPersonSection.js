import React, { useState } from 'react';

const ContactPersonSection = ({ application, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editData, setEditData] = useState({});
  
  // Handle both single contact person and array of contact persons
  const contactPersons = application?.contactPersons || [];
  
  if (contactPersons.length === 0 && !application?.contactPerson) return null;
  
  // If we have the old format (single contactPerson), convert it to array format
  if (contactPersons.length === 0 && application?.contactPerson) {
    contactPersons.push(application.contactPerson);
  }
  
  const handleEdit = (index) => {
    setIsEditing(true);
    setEditingIndex(index);
    setEditData({...contactPersons[index]});
  };

  const handleSave = async () => {
    try {
      // Create a copy of the contact persons array
      const updatedContactPersons = [...contactPersons];
      
      // Update the specific contact person being edited
      if (editingIndex >= 0 && editingIndex < updatedContactPersons.length) {
        updatedContactPersons[editingIndex] = editData;
      }
      
      // Send the entire updated array to the backend
      await onUpdate('contactPersons', updatedContactPersons);
      setIsEditing(false);
      setEditingIndex(-1);
    } catch (error) {
      console.error('Error updating contact person:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingIndex(-1);
    setEditData({});
  };

  const updateField = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
      <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-4">
        <h3 className="text-2xl font-bold text-blue-900">
          ข้อมูลผู้ติดต่อ ({contactPersons.length} คน)
        </h3>
      </div>
      
      {contactPersons.map((contact, index) => (
        <div key={index} className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-0">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-semibold text-blue-800">
              ผู้ติดต่อ #{index + 1} - {contact.typeContactName || 'ไม่ระบุประเภท'}
            </h4>
            {!isEditing || editingIndex !== index ? (
              <button
                onClick={() => handleEdit(index)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="แก้ไขข้อมูลผู้ติดต่อ"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                แก้ไข
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  บันทึก
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  ยกเลิก
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (ไทย)</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={editData.firstNameTh || ''}
                  onChange={(e) => updateField('firstNameTh', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ชื่อ (ไทย)"
                />
              ) : (
                <p className="text-lg text-gray-900">{contact.firstNameTh || '-'}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (ไทย)</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={editData.lastNameTh || ''}
                  onChange={(e) => updateField('lastNameTh', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="นามสกุล (ไทย)"
                />
              ) : (
                <p className="text-lg text-gray-900">{contact.lastNameTh || '-'}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ชื่อ (อังกฤษ)</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={editData.firstNameEn || ''}
                  onChange={(e) => updateField('firstNameEn', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ชื่อ (อังกฤษ)"
                />
              ) : (
                <p className="text-lg text-gray-900">{contact.firstNameEn || '-'}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">นามสกุล (อังกฤษ)</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={editData.lastNameEn || ''}
                  onChange={(e) => updateField('lastNameEn', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="นามสกุล (อังกฤษ)"
                />
              ) : (
                <p className="text-lg text-gray-900">{contact.lastNameEn || '-'}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ตำแหน่ง</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={editData.position || ''}
                  onChange={(e) => updateField('position', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ตำแหน่ง"
                />
              ) : (
                <p className="text-lg text-gray-900">{contact.position || '-'}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">อีเมล</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="อีเมล"
                />
              ) : (
                <p className="text-lg text-gray-900">{contact.email || '-'}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">เบอร์โทรศัพท์</p>
              {isEditing && editingIndex === index ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editData.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เบอร์โทรศัพท์"
                  />
                  <input
                    type="text"
                    value={editData.phoneExtension || ''}
                    onChange={(e) => updateField('phoneExtension', e.target.value)}
                    className="w-24 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ต่อ"
                  />
                </div>
              ) : (
                <p className="text-lg text-gray-900">
                  {contact.phone || '-'}
                  {contact.phoneExtension && ` ต่อ ${contact.phoneExtension}`}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">ประเภทผู้ติดต่อ</p>
              {isEditing && editingIndex === index ? (
                <input
                  type="text"
                  value={editData.typeContactName || ''}
                  onChange={(e) => updateField('typeContactName', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ประเภทผู้ติดต่อ"
                />
              ) : (
                <p className="text-lg text-gray-900">{contact.typeContactName || '-'}</p>
              )}
            </div>
            {contact.typeContactOtherDetail && (
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">รายละเอียดเพิ่มเติม</p>
                {isEditing && editingIndex === index ? (
                  <textarea
                    value={editData.typeContactOtherDetail || ''}
                    onChange={(e) => updateField('typeContactOtherDetail', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="รายละเอียดเพิ่มเติม"
                    rows="3"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{contact.typeContactOtherDetail || '-'}</p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactPersonSection;